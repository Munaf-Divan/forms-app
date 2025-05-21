import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent {
  private notificationService = inject(NotificationService);

  // Testimonials data
  testimonials = [
    {
      name: 'Michael Davis',
      title: 'Organic Farmer',
      quote:
        '"Farmly has transformed how I sell my produce. I\'ve been able to connect with customers who truly appreciate my growing practices, and my profits have increased significantly."',
    },
    {
      name: 'Sarah Johnson',
      title: 'Homemaker',
      quote:
        '"I love knowing exactly where my food comes from. The produce is always fresh and I\'ve discovered so many local varieties that I never saw at the supermarket."',
    },
    {
      name: 'Jamie Wong',
      title: 'Restaurant Owner',
      quote:
        '"As a restaurant owner, having direct access to local farmers has improved the quality of our dishes and our customers love knowing where their food comes from."',
    },
  ];

  shopNow(): void {
    this.notificationService.info(
      'Shopping feature coming soon! Stay tuned for our marketplace launch.'
    );
  }

  joinAsFarmer(): void {
    this.notificationService.info(
      "Farmer registration opening soon! We'll notify you when applications are open."
    );
  }
}
