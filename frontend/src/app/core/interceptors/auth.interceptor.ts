import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Get token from service
  const token = authService.getToken();

  console.log('Auth Interceptor: Processing request to', request.url);
  console.log('Auth Interceptor: Token exists?', !!token);

  if (token) {
    console.log('Auth Interceptor: Adding Authorization header with token');
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  } else {
    console.log(
      'Auth Interceptor: No token available, skipping Authorization header'
    );
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error(
        'Auth Interceptor: Request error:',
        error.status,
        error.message
      );

      // Only redirect to login if we're not already on the login or signup page
      if (
        error.status === 401 &&
        !router.url.includes('/login') &&
        !router.url.includes('/signup')
      ) {
        console.log('Auth Interceptor: Unauthorized error (401), logging out');
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
