import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NotificationService,
  Notification,
  NotificationType,
} from '../../../core/services/notification.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate(
          '200ms ease-out',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ transform: 'translateY(-20px)', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class NotificationComponent implements OnInit {
  private notificationService = inject(NotificationService);

  // Using computed signal to reactively get notifications
  notifications = computed(() => {
    const notifs = this.notificationService.notifications();
    console.log('Current notifications:', notifs);
    return notifs;
  });

  ngOnInit() {
    console.log('Notification component initialized');
  }

  getIconName(type: NotificationType): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  }

  dismiss(id: number): void {
    console.log('Dismissing notification:', id);
    this.notificationService.dismiss(id);
  }
}
