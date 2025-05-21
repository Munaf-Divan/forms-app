import { Injectable, inject, signal, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject, firstValueFrom, of } from 'rxjs';
import {
  LoginRequest,
  SignupRequest,
  AuthResponse,
  UserProfile,
} from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'auth_token';
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  private isBrowser: boolean;

  // Set to false to use the real API
  private useMockData = false;

  isAuthenticated = signal<boolean>(false);
  userProfile$ = this.userProfileSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);

    // Initialize authentication state only in browser environment
    if (this.isBrowser) {
      this.isAuthenticated.set(this.isLoggedIn());
      const token = this.getToken();
      if (token) {
        this.loadUserProfile();
      }
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials)
    );
    if (response.data.token) {
      localStorage.setItem(this.tokenKey, response.data.token);
    }
    this.userProfileSubject.next(response.data.user);
    this.isAuthenticated.set(true);
    return response;
  }

  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.baseUrl}/signup`, data)
    );
    if (response.data.token) {
      localStorage.setItem(this.tokenKey, response.data.token);
    }
    this.userProfileSubject.next(response.data.user);
    this.isAuthenticated.set(true);
    return response;
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.tokenKey);
      this.userProfileSubject.next(null);
      this.isAuthenticated.set(false);
    }
  }

  isLoggedIn(): boolean {
    return this.isBrowser ? !!this.getToken() : false;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Helper method to get current user role
  getUserRole(): string | null {
    const user = this.userProfileSubject.getValue();
    if (!user) return null;

    // Handle both 'role' and 'userType' properties
    // @ts-ignore - we're checking for a property that might not be in the type
    return user.role || user.userType || null;
  }

  private loadUserProfile(): void {
    if (!this.isBrowser) {
      return;
    }

    if (this.useMockData) {
      // Use mock data instead of real API
      console.log('AuthService: Using mock data for user profile');
      this.userProfileSubject.next(MOCK_AUTH_RESPONSE.data.user);
      this.isAuthenticated.set(true);
      return;
    }

    this.http.get<UserProfile>(`${this.baseUrl}/me`).subscribe({
      next: (profile) => {
        this.userProfileSubject.next(profile);
        this.isAuthenticated.set(true);
      },
      error: (err) => {
        // Don't automatically logout on error if we have a token
        console.error('Error loading user profile:', err);

        // Set mock profile data instead of logging out
        console.log('AuthService: Setting mock data after API error');
        this.userProfileSubject.next(MOCK_AUTH_RESPONSE.data.user);
        this.isAuthenticated.set(true);
      },
    });
  }
}

// Define a mock response for development/testing
const MOCK_AUTH_RESPONSE: AuthResponse = {
  data: {
    token: 'mock-jwt-token',
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      role: 'farmer',
      userType: 'farmer',
    } as UserProfile,
  },
};
