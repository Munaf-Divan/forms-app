import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Store the attempted URL for redirecting
  const currentUrl = state.url;
  router.navigate(['/login'], { queryParams: { returnUrl: currentUrl } });
  return false;
};

// Guard for login/signup pages - redirects to dashboard if already logged in
export const authPageGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // If user is logged in, redirect to appropriate dashboard
  if (authService.isLoggedIn()) {
    // Get user role and redirect accordingly
    const userRole = authService.getUserRole();

    if (userRole === 'farmer') {
      router.navigate(['/dashboard/farmer']);
    } else if (userRole === 'consumer') {
      router.navigate(['/dashboard/consumer']);
    } else {
      // Default fallback
      router.navigate(['/dashboard']);
    }
    return false;
  }

  // Allow access to login/signup page if not logged in
  return true;
};
