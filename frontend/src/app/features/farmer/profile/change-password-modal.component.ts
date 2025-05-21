import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-change-password-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="modal-container">
      <div class="modal-backdrop" (click)="close.emit()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Change Password</h2>
            <button class="close-button" (click)="close.emit()">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <form
            [formGroup]="passwordForm"
            (ngSubmit)="onSubmit()"
            class="password-form"
          >
            <div class="form-group">
              <label for="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                formControlName="currentPassword"
                class="form-control"
                [class.error]="hasError('currentPassword')"
              />
              <span class="error-message" *ngIf="hasError('currentPassword')">
                Current password is required
              </span>
            </div>

            <div class="form-group">
              <label for="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                formControlName="newPassword"
                class="form-control"
                [class.error]="hasError('newPassword')"
              />
              <span
                class="error-message"
                *ngIf="passwordForm.get('newPassword')?.errors?.['required']"
              >
                New password is required
              </span>
              <span
                class="error-message"
                *ngIf="passwordForm.get('newPassword')?.errors?.['minlength']"
              >
                Password must be at least 8 characters
              </span>
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                formControlName="confirmPassword"
                class="form-control"
                [class.error]="hasError('confirmPassword')"
              />
              <span
                class="error-message"
                *ngIf="passwordForm.get('confirmPassword')?.errors?.['required']"
              >
                Please confirm your password
              </span>
              <span
                class="error-message"
                *ngIf="passwordForm.get('confirmPassword')?.errors?.['mismatch']"
              >
                Passwords do not match
              </span>
            </div>

            <div class="form-group error-container">
              <span class="server-error" *ngIf="serverError">{{
                serverError
              }}</span>
            </div>

            <div class="form-actions">
              <button
                type="button"
                class="cancel-button"
                (click)="close.emit()"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="submit-button"
                [disabled]="passwordForm.invalid || isSubmitting"
              >
                {{ isSubmitting ? 'Updating...' : 'Update Password' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1000;
      }

      .modal-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .modal-content {
        background: white;
        border-radius: 8px;
        width: 100%;
        max-width: 500px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        overflow: hidden;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #e1e1e1;
      }

      .modal-header h2 {
        margin: 0;
        color: #333;
        font-size: 20px;
      }

      .close-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
      }

      .close-button:hover {
        color: #333;
      }

      .password-form {
        padding: 24px;
      }

      .form-group {
        margin-bottom: 20px;
      }

      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #333;
      }

      .form-control {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
        transition: border-color 0.2s;
      }

      .form-control:focus {
        border-color: #4a7c59;
        outline: none;
      }

      .form-control.error {
        border-color: #e53935;
      }

      .error-message {
        color: #e53935;
        font-size: 14px;
        margin-top: 4px;
        display: block;
      }

      .server-error {
        color: #e53935;
        font-size: 14px;
        font-weight: 500;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 24px;
      }

      .cancel-button {
        padding: 10px 16px;
        background: none;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .cancel-button:hover {
        background-color: #f5f5f5;
      }

      .submit-button {
        padding: 10px 24px;
        background-color: #4a7c59;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .submit-button:hover:not([disabled]) {
        background-color: #3d6649;
      }

      .submit-button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .error-container {
        min-height: 20px;
      }
    `,
  ],
})
export class ChangePasswordModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() passwordChanged = new EventEmitter<boolean>();

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private toastService = inject(ToastService);

  serverError: string | null = null;
  isSubmitting = false;

  passwordForm = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordMatchValidator }
  );

  passwordMatchValidator(formGroup: any) {
    const newPassword = formGroup.get('newPassword').value;
    const confirmPassword = formGroup.get('confirmPassword').value;

    if (newPassword !== confirmPassword) {
      formGroup.get('confirmPassword').setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      return null;
    }
  }

  hasError(controlName: string): boolean {
    const control = this.passwordForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onSubmit(): void {
    if (this.passwordForm.valid) {
      this.isSubmitting = true;
      this.serverError = null;

      const { currentPassword, newPassword } = this.passwordForm.value;

      this.userService
        .changePassword(currentPassword!, newPassword!)
        .subscribe({
          next: (success) => {
            this.isSubmitting = false;

            if (success) {
              this.passwordChanged.emit(true);
              this.toastService.success('Password changed successfully');
              this.resetForm();
              this.close.emit();
            } else {
              this.serverError = 'Failed to update password. Please try again.';
              this.passwordChanged.emit(false);
            }
          },
          error: (error) => {
            this.isSubmitting = false;

            if (error.status === 401) {
              this.serverError = 'Current password is incorrect';
              this.toastService.error('Current password is incorrect');
            } else if (error.status === 400) {
              this.serverError = 'New password does not meet requirements';
              this.toastService.error(
                'New password does not meet requirements'
              );
            } else {
              this.serverError = 'Failed to update password. Please try again.';
              this.toastService.error(
                'Failed to update password. Please try again.'
              );
            }

            this.passwordChanged.emit(false);
          },
        });
    }
  }

  private resetForm(): void {
    this.passwordForm.reset({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  }
}
