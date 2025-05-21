import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterModule,
  RouterLink,
  Router,
  NavigationEnd,
} from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-farmer-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  templateUrl: './farmer-sidebar.component.html',
  styleUrls: ['./farmer-sidebar.component.scss'],
})
export class FarmerSidebarComponent implements OnInit {
  navigationItems = [
    {
      label: 'Home',
      icon: 'home',
      route: '/dashboard/farmer',
    },
    {
      label: 'Orders',
      icon: 'shopping_cart',
      route: '/dashboard/farmer/orders',
    },
    {
      label: 'Catalog',
      icon: 'format_list_bulleted',
      route: '/dashboard/farmer/catalog',
    },
    {
      label: 'Messages',
      icon: 'chat_bubble_outline',
      route: '/dashboard/farmer/messages',
    },
    {
      label: 'Profile',
      icon: 'person_outline',
      route: '/dashboard/farmer/profile',
    },
  ];

  currentPath: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    // Set initial route
    this.currentPath = this.router.url;

    // Listen for route changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentPath = event.url;
      });
  }

  isItemActive(item: any): boolean {
    // For Home item, only active when on main farmer dashboard path
    if (item.icon === 'home') {
      return (
        this.currentPath === '/dashboard/farmer' ||
        this.currentPath === '/dashboard/farmer/'
      );
    }

    // For other items, check if the current path includes their route
    return this.currentPath.includes(item.route);
  }
}
