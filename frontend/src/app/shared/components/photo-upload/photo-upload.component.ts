import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="photo-upload-container">
      <div class="photo-preview-container">
        <div
          class="photo-preview"
          [class.has-image]="
            previewUrl !== null || (photoUrl !== null && !photoError)
          "
        >
          <img
            *ngIf="previewUrl"
            [src]="previewUrl"
            alt="Profile Photo Preview"
            class="preview-image"
          />
          <div *ngIf="!previewUrl" class="photo-placeholder">
            <ng-container
              *ngIf="photoUrl && !photoError; else placeholderInitials"
            >
              <div *ngIf="debugMode" class="debug-info">
                URL: {{ photoUrl }}
              </div>
              <img
                [src]="photoUrl"
                alt="Current Profile Photo"
                class="current-photo"
                (error)="handlePhotoError($event)"
                (load)="handlePhotoLoad()"
              />
              <div *ngIf="isLoadingPhoto" class="loading-overlay">
                <div class="spinner"></div>
              </div>
            </ng-container>
            <ng-template #placeholderInitials>
              <div class="initials-avatar">
                {{ getInitials(fullName || '') }}
              </div>
            </ng-template>
          </div>
        </div>
      </div>

      <div class="upload-actions">
        <button
          class="choose-photo-button"
          [class.disabled]="isUploading"
          (click)="triggerFileInput()"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          Choose Photo
        </button>

        <input
          #fileInput
          type="file"
          accept="image/*"
          (change)="onFileSelected($event)"
          style="display: none;"
          [disabled]="isUploading"
        />

        <p class="upload-hint">
          Recommended: Square image, at least 300x300 pixels, max 5MB
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .photo-upload-container {
        background-color: white;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        width: 100%;
      }

      .photo-preview-container {
        display: flex;
        justify-content: center;
        margin-bottom: 1.5rem;
      }

      .photo-preview {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        background-color: #e1e7ef;
      }

      .preview-image,
      .current-photo {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .photo-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 5;
      }

      .initials-avatar {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.5rem;
        font-weight: 600;
        color: #4a7c59;
        background-color: #e1e7ef;
      }

      .debug-info {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        font-size: 9px;
        padding: 2px;
        word-break: break-all;
        z-index: 10;
      }

      .upload-actions {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .choose-photo-button {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.8rem 1.5rem;
        border: none;
        border-radius: 4px;
        background-color: #f1f8f3;
        color: #4a7c59;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        width: 100%;
        max-width: 500px;
        justify-content: center;
      }

      .choose-photo-button:hover {
        background-color: #e3f0e6;
      }

      .choose-photo-button.disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .upload-button {
        display: inline-flex;
        justify-content: center;
        padding: 0.8rem 1.5rem;
        border: none;
        border-radius: 4px;
        background-color: #4a7c59;
        color: white;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
        width: 100%;
        max-width: 500px;
      }

      .upload-button:hover:not(.disabled) {
        background-color: #3d6649;
      }

      .upload-button.disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .cancel-button {
        display: inline-flex;
        justify-content: center;
        padding: 0.8rem 1.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        background-color: white;
        color: #333;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
        width: 100%;
        max-width: 500px;
      }

      .cancel-button:hover {
        background-color: #f5f5f5;
      }

      .upload-hint {
        font-size: 0.85rem;
        color: #666;
        margin: 0.5rem 0 0;
        text-align: center;
      }

      .spinner {
        width: 30px;
        height: 30px;
        border: 3px solid rgba(74, 124, 89, 0.3);
        border-radius: 50%;
        border-top-color: #4a7c59;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class PhotoUploadComponent implements OnChanges, OnInit {
  private toastService = inject(ToastService);
  private http = inject(HttpClient);

  @Input() photoUrl: string | null = null;
  @Input() fullName: string = '';
  @Input() isUploading: boolean = false;
  @Input() debugMode: boolean = true; // Set to false in production

  @Output() upload = new EventEmitter<File>();

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  photoError: boolean = false;
  isLoadingPhoto: boolean = false;

  ngOnInit(): void {
    // Check photo URL when component initializes
    if (this.photoUrl) {
      this.checkPhotoUrl(this.photoUrl);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // When photoUrl changes, reset the error state
    if (changes['photoUrl']) {
      this.photoError = false;

      if (changes['photoUrl'].currentValue) {
        console.log('Photo URL changed:', changes['photoUrl'].currentValue);
        this.checkPhotoUrl(changes['photoUrl'].currentValue);
      } else {
        // If photoUrl is null or empty, show initials
        this.photoError = true;
      }
    }
  }

  /**
   * Check if the photoUrl is a GET API endpoint and needs special handling
   */
  private checkPhotoUrl(url: string): void {
    console.log('Checking photo URL:', url);

    // If URL is empty or null, show initials
    if (!url) {
      this.photoError = true;
      return;
    }

    // Try to load the image directly first
    this.isLoadingPhoto = true;

    // Create a test image to see if the URL loads correctly
    const testImg = new Image();
    testImg.onload = () => {
      console.log('Image loaded successfully');
      this.isLoadingPhoto = false;
      this.photoError = false;
    };

    testImg.onerror = () => {
      console.warn('Direct image load failed, trying with HEAD request');

      // If direct loading fails, try with HEAD request
      if (
        (url.includes('/photo/') || url.includes('/api/')) &&
        !url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
      ) {
        // Make a HEAD request to check if the endpoint returns an image
        this.http.head(url, { observe: 'response' }).subscribe({
          next: (response) => {
            const contentType = response.headers.get('content-type');
            this.isLoadingPhoto = false;

            // If not an image content type, trigger the error handler
            if (!contentType || !contentType.startsWith('image/')) {
              console.warn('Not an image content type:', contentType);
              this.handlePhotoError();
            } else {
              console.log('Content type is image:', contentType);
              this.photoError = false;
            }
          },
          error: (err) => {
            console.error('HEAD request failed:', err);
            this.isLoadingPhoto = false;
            this.handlePhotoError();
          },
        });
      } else {
        console.warn('URL does not appear to be an API endpoint');
        this.isLoadingPhoto = false;
        this.handlePhotoError();
      }
    };

    // Start loading the image
    testImg.src = url;
  }

  handlePhotoLoad(): void {
    console.log('Photo loaded successfully in component');
    this.isLoadingPhoto = false;
    this.photoError = false;
  }

  triggerFileInput() {
    if (this.isUploading) return;

    // Get the file input element
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toastService.error(
          'File size exceeds 5MB. Please choose a smaller image.'
        );
        return;
      }

      // Check file type
      if (!file.type.match('image.*')) {
        this.toastService.error('Only image files are allowed.');
        return;
      }

      this.selectedFile = file;

      // Generate preview first
      this.generatePreview(file);

      // Upload directly after selecting
      this.uploadPhoto();
    }
  }

  generatePreview(file: File): void {
    const reader = new FileReader();

    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };

    reader.onerror = () => {
      this.toastService.error('Failed to read file. Please try again.');
      this.cancelUpload();
    };

    reader.readAsDataURL(file);
  }

  uploadPhoto(): void {
    if (this.selectedFile) {
      this.upload.emit(this.selectedFile);
    }
  }

  cancelUpload(): void {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  handlePhotoError(event?: any): void {
    if (event) {
      console.warn('Photo error event:', event);
    }
    console.warn('Profile photo failed to load, using initials as fallback');
    this.photoError = true;
    this.isLoadingPhoto = false;
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }
}
