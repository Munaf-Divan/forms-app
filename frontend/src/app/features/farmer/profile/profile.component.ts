import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserService, UserProfile } from '../../../core/services/user.service';
import { Router } from '@angular/router';
import { ChangePasswordModalComponent } from './change-password-modal.component';
import { ToastService } from '../../../core/services/toast.service';
import { PhotoUploadComponent } from '../../../shared/components/photo-upload/photo-upload.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ChangePasswordModalComponent,
    PhotoUploadComponent,
  ],
  template: `
    <div class="profile-settings-container">
      <div class="profile-header">
        <div>
          <h1>Profile Settings</h1>
          <p class="subtitle">Manage your account preferences and settings</p>
        </div>
        <button class="logout-button" (click)="logout()">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Logout
        </button>
      </div>

      <div class="card profile-photo-card">
        <h2>Profile Photo</h2>
        <app-photo-upload
          [photoUrl]="userProfile?.photoUrl || null"
          [fullName]="userProfile?.fullName || ''"
          [isUploading]="isUploadingPhoto"
          (upload)="handlePhotoUpload($event)"
        ></app-photo-upload>
      </div>

      <div class="card personal-details-card">
        <div class="section-header">
          <h2>Personal Details</h2>
          <button
            class="edit-button"
            (click)="toggleEditMode()"
            *ngIf="!isEditMode"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
              ></path>
              <path
                d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
              ></path>
            </svg>
          </button>
        </div>

        <div *ngIf="!isEditMode" class="details-view">
          <div class="detail-row">
            <span class="detail-label">Full Name:</span>
            <span class="detail-value">{{ userProfile?.fullName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Phone Number:</span>
            <span class="detail-value">{{ userProfile?.phoneNumber }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Email Address:</span>
            <span class="detail-value">{{ userProfile?.email }}</span>
          </div>
        </div>

        <form
          *ngIf="isEditMode"
          [formGroup]="profileForm"
          (ngSubmit)="saveProfile()"
          class="edit-form"
        >
          <div class="form-group">
            <label for="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              formControlName="fullName"
              class="form-control"
            />
          </div>
          <div class="form-group">
            <label for="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              formControlName="phoneNumber"
              class="form-control"
            />
          </div>
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="form-control"
            />
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-button" (click)="cancelEdit()">
              Cancel
            </button>
            <button
              type="submit"
              class="save-button"
              [disabled]="
                profileForm.invalid || profileForm.pristine || isSubmitting
              "
            >
              {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>

      <div class="card security-card">
        <h2>Security</h2>
        <div class="security-content">
          <button
            class="change-password-button"
            (click)="showChangePasswordModal = true"
          >
            Change Password
          </button>
        </div>
      </div>
    </div>

    <app-change-password-modal
      *ngIf="showChangePasswordModal"
      (close)="closeChangePasswordModal()"
      (passwordChanged)="onPasswordChanged($event)"
    >
    </app-change-password-modal>
  `,
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  isEditMode = false;
  isSubmitting = false;
  isUploadingPhoto = false;
  showChangePasswordModal = false;
  userProfile: UserProfile | null = null;

  profileForm = this.fb.group({
    fullName: ['', [Validators.required]],
    phoneNumber: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.userService.getUserProfile().subscribe({
      next: (profile) => {
        console.log('Profile loaded:', profile);
        console.log('Photo URL from API:', profile.photoUrl);

        this.userProfile = profile;
        // Initialize form with profile data
        this.profileForm.reset({
          fullName: profile.fullName,
          phoneNumber: profile.phoneNumber,
          email: profile.email,
        });
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.toastService.error(
          'Failed to load profile. Please try again later.'
        );
      },
    });
  }

  toggleEditMode(): void {
    this.isEditMode = true;
    if (this.userProfile) {
      this.profileForm.setValue({
        fullName: this.userProfile.fullName,
        phoneNumber: this.userProfile.phoneNumber,
        email: this.userProfile.email,
      });
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    if (this.userProfile) {
      this.profileForm.reset({
        fullName: this.userProfile.fullName,
        phoneNumber: this.userProfile.phoneNumber,
        email: this.userProfile.email,
      });
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid && this.userProfile) {
      this.isSubmitting = true;

      const updatedProfile: UserProfile = {
        ...this.userProfile,
        ...(this.profileForm.value as any),
      };

      this.userService.updateUserProfile(updatedProfile).subscribe({
        next: (result) => {
          this.userProfile = result;
          this.isEditMode = false;
          this.isSubmitting = false;
          this.toastService.success('Profile updated successfully');
        },
        error: (error) => {
          this.isSubmitting = false;
          this.toastService.error(
            'Failed to update profile. Please try again.'
          );
          console.error('Error updating profile:', error);
        },
      });
    }
  }

  handlePhotoUpload(file: File): void {
    this.isUploadingPhoto = true;
    console.log('Uploading photo file:', file.name, file.size, file.type);

    this.userService.uploadProfilePhoto(file).subscribe({
      next: (photoUrl) => {
        this.isUploadingPhoto = false;
        console.log('Photo upload successful. URL:', photoUrl);

        if (photoUrl && this.userProfile) {
          this.userProfile = {
            ...this.userProfile,
            photoUrl,
          };
          this.toastService.success('Profile photo updated successfully');
        } else {
          console.error('Photo upload failed: No URL returned');
          this.toastService.error(
            'Failed to update profile photo. Please try again.'
          );
        }
      },
      error: (error) => {
        this.isUploadingPhoto = false;
        console.error('Error uploading photo:', error);
        this.toastService.error('Failed to upload photo. Please try again.');
      },
    });
  }

  onPasswordChanged(success: boolean): void {
    // No additional action needed as toast is shown from modal
  }

  closeChangePasswordModal(): void {
    this.showChangePasswordModal = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
