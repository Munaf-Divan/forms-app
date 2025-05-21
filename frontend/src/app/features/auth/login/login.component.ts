import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  isLoading = signal(false);
  showPassword = signal(false);
  errorMessage = signal<string | null>(null);

  togglePasswordVisibility(): void {
    this.showPassword.update((show) => !show);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return `${
        fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
      } is required`;
    }
    if (field.errors['email']) {
      return 'Please enter a valid email address';
    }
    if (field.errors['minlength']) {
      return 'Password must be at least 8 characters long';
    }

    return 'Invalid input';
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.notificationService.error(
        'Please fix the errors in the form before submitting.'
      );
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const credentials = this.loginForm.value;
      const response = await this.authService.login(credentials);
      console.log('Login response:', response);
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }

      // Check if there's a returnUrl query parameter
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';

      // Redirect based on returnUrl or user role
      if (returnUrl) {
        await this.router.navigateByUrl(returnUrl);
      } else {
        // Get role or userType from the response
        const user = response.data.user;
        // @ts-ignore - checking for property that might not be in the type
        const userRole = user.role || user.userType;
        console.log('User role from response:', userRole);

        if (userRole === 'farmer') {
          await this.router.navigate(['/dashboard/farmer']);
        } else if (userRole === 'consumer') {
          await this.router.navigate(['/dashboard/consumer']);
        } else {
          // Default fallback
          console.log('No specific role found, redirecting to main dashboard');
          await this.router.navigate(['/dashboard']);
        }
      }

      this.notificationService.success(
        'Login successful! Welcome back to Farmly.'
      );
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : 'Login failed. Please check your credentials.';
      this.errorMessage.set(errorMsg);
      this.notificationService.error(errorMsg);
    } finally {
      this.isLoading.set(false);
    }
  }
}
