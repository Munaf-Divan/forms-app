import {
  Component,
  inject,
  signal,
  OnDestroy,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

// Define UserType enum
enum UserType {
  Consumer = 'consumer',
  Farmer = 'farmer',
}

function passwordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password?.pristine || confirmPassword?.pristine) {
    return null;
  }

  return password && confirmPassword && password.value !== confirmPassword.value
    ? { passwordMismatch: true }
    : null;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private isBrowser: boolean;

  // Expose UserType enum to the template
  userTypes = UserType;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  signupForm: FormGroup = this.fb.group(
    {
      fullName: ['', [Validators.required]],
      userType: [UserType.Consumer, [Validators.required]],
      phoneNumber: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator }
  );

  isLoading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  errorMessage = signal<string | null>(null);
  isDropdownOpen = false;

  togglePasswordVisibility(): void {
    this.showPassword.update((show) => !show);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((show) => !show);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;

    if (!this.isBrowser) return;

    if (this.isDropdownOpen) {
      setTimeout(() => {
        document.addEventListener('click', this.closeDropdownOnClickOutside);
      });
    } else {
      document.removeEventListener('click', this.closeDropdownOnClickOutside);
    }
  }

  closeDropdownOnClickOutside = (event: MouseEvent): void => {
    if (!this.isBrowser) return;

    const customSelect = document.querySelector('.custom-select');
    if (customSelect && !customSelect.contains(event.target as Node)) {
      this.isDropdownOpen = false;
      document.removeEventListener('click', this.closeDropdownOnClickOutside);
    }
  };

  selectOption(value: string): void {
    this.signupForm.get('userType')?.setValue(value);
    this.isDropdownOpen = false;
    document.removeEventListener('click', this.closeDropdownOnClickOutside);
  }

  getUserTypeLabel(): string {
    const userType = this.signupForm.get('userType')?.value;
    if (userType === UserType.Farmer) {
      return 'Local Farmer';
    }
    return 'Food Enthusiast';
  }

  async onSubmit(): Promise<void> {
    if (this.signupForm.invalid) {
      this.notificationService.error(
        'Please fix the errors in the form before submitting.'
      );
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const formData = this.signupForm.value;
      const { confirmPassword, ...signupData } = formData;
      const response = await this.authService.signup(signupData);
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      this.notificationService.success(
        'Account created successfully! Please log in.'
      );
      await this.router.navigate(['/login']);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : 'An error occurred during signup';
      this.errorMessage.set(errorMsg);
      this.notificationService.error(errorMsg);
    } finally {
      this.isLoading.set(false);
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      document.removeEventListener('click', this.closeDropdownOnClickOutside);
    }
  }
}
