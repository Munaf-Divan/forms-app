import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private lastId = 0;
  private defaultDuration = 5000; // 5 seconds

  // Using signals for reactive state management
  notifications = signal<Notification[]>([]);

  show(
    message: string,
    type: NotificationType = 'info',
    duration?: number
  ): void {
    const id = this.getNextId();
    const notification: Notification = {
      id,
      type,
      message,
      duration: duration || this.defaultDuration,
    };

    // Add notification to the array
    this.notifications.update((notifications) => [
      ...notifications,
      notification,
    ]);

    // Auto dismiss after duration
    setTimeout(() => {
      this.dismiss(id);
    }, notification.duration);
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  dismiss(id: number): void {
    this.notifications.update((notifications) =>
      notifications.filter((notification) => notification.id !== id)
    );
  }

  dismissAll(): void {
    this.notifications.set([]);
  }

  private getNextId(): number {
    return ++this.lastId;
  }
}
