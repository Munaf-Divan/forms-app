import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toasts = new BehaviorSubject<Toast[]>([]);
  private lastId = 0;

  toasts$: Observable<Toast[]> = this.toasts.asObservable();

  /**
   * Show a success toast notification
   */
  success(message: string, duration: number = 5000): void {
    this.show(message, 'success', duration);
  }

  /**
   * Show an error toast notification
   */
  error(message: string, duration: number = 5000): void {
    this.show(message, 'error', duration);
  }

  /**
   * Show an info toast notification
   */
  info(message: string, duration: number = 5000): void {
    this.show(message, 'info', duration);
  }

  /**
   * Remove a toast notification by id
   */
  remove(id: number): void {
    const currentToasts = this.toasts.getValue();
    this.toasts.next(currentToasts.filter((toast) => toast.id !== id));
  }

  /**
   * Remove all toast notifications
   */
  clear(): void {
    this.toasts.next([]);
  }

  /**
   * Display a toast notification
   */
  private show(
    message: string,
    type: 'success' | 'error' | 'info',
    duration: number
  ): void {
    const id = ++this.lastId;
    const toast: Toast = { id, message, type };
    const currentToasts = this.toasts.getValue();

    this.toasts.next([...currentToasts, toast]);

    // Auto-remove the toast after specified duration
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }
}
