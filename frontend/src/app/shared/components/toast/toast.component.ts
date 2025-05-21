import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toasts$ | async; track toast.id) {
      <div
        class="toast"
        [class.toast-success]="toast.type === 'success'"
        [class.toast-error]="toast.type === 'error'"
        [class.toast-info]="toast.type === 'info'"
        (click)="removeToast(toast.id)"
      >
        <div class="toast-icon">
          @if (toast.type === 'success') {
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
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          } @else if (toast.type === 'error') {
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
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          } @else {
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
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          }
        </div>
        <div class="toast-message">{{ toast.message }}</div>
        <button
          class="toast-close"
          (click)="removeToast(toast.id); $event.stopPropagation()"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
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
      }
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1050;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 350px;
      }

      .toast {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        animation: slideIn 0.3s ease-out;
        min-width: 300px;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      .toast-success {
        background-color: #e7f5e9;
        border-left: 4px solid #4caf50;
        color: #1b5e20;
      }

      .toast-error {
        background-color: #feeceb;
        border-left: 4px solid #f44336;
        color: #b71c1c;
      }

      .toast-info {
        background-color: #e3f2fd;
        border-left: 4px solid #2196f3;
        color: #0d47a1;
      }

      .toast-icon {
        margin-right: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .toast-message {
        flex: 1;
        font-size: 15px;
        font-weight: 500;
      }

      .toast-close {
        background: none;
        border: none;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        margin-left: 8px;
        opacity: 0.6;
        color: inherit;
      }

      .toast-close:hover {
        opacity: 1;
      }
    `,
  ],
})
export class ToastComponent implements OnInit {
  private toastService = inject(ToastService);
  toasts$: Observable<Toast[]> = this.toastService.toasts$;

  ngOnInit(): void {}

  removeToast(id: number): void {
    this.toastService.remove(id);
  }
}
