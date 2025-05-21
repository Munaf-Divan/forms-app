import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface UserProfile {
  id?: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  photoUrl?: string;
  role?: 'farmer' | 'consumer';
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/users`;

  // Mock data for development
  private mockProfile: UserProfile = {
    id: '1',
    fullName: 'Ramesh Solanki',
    phoneNumber: '9106407964',
    email: 'munaf@aubergine.co',
    photoUrl: '',
    role: 'farmer',
  };

  // Set to false to use the real API
  private useMockData = false;

  /**
   * Get the current user profile
   */
  getUserProfile(): Observable<UserProfile> {
    if (this.useMockData) {
      return of(this.mockProfile);
    }

    return this.http.get<ApiResponse<UserProfile>>(`${this.baseUrl}/me`).pipe(
      map((response) => {
        const profile = response.data;

        // Add base API URL to photoUrl if it exists and is a relative path
        if (profile.photoUrl) {
          profile.photoUrl = this.getPhotoUrlWithCacheBusting(
            profile.id || '',
            profile.photoUrl
          );
          console.log(profile.photoUrl);
        }

        return profile;
      }),
      catchError((error) => {
        console.error('Error fetching user profile:', error);
        return of({} as UserProfile);
      })
    );
  }

  /**
   * Update the user profile
   */
  updateUserProfile(profile: UserProfile): Observable<UserProfile> {
    if (this.useMockData) {
      this.mockProfile = { ...this.mockProfile, ...profile };
      return of(this.mockProfile);
    }

    // Create request body with only the required fields
    const updateData = {
      fullName: profile.fullName,
      phoneNumber: profile.phoneNumber,
      email: profile.email,
    };

    return this.http
      .put<ApiResponse<UserProfile>>(`${this.baseUrl}/profile`, updateData)
      .pipe(
        map((response) => {
          const updatedProfile = response.data;

          // Add cache busting to photoUrl if it exists
          if (updatedProfile.photoUrl) {
            updatedProfile.photoUrl = this.getPhotoUrlWithCacheBusting(
              updatedProfile.id || '',
              updatedProfile.photoUrl
            );
          }

          return updatedProfile;
        }),
        catchError((error) => {
          console.error('Error updating user profile:', error);
          return of({} as UserProfile);
        })
      );
  }

  /**
   * Upload a profile photo
   */
  uploadProfilePhoto(file: File): Observable<string> {
    if (this.useMockData) {
      // Create a mock file URL for development
      const mockUrl = URL.createObjectURL(file);
      this.mockProfile.photoUrl = mockUrl;
      return of(mockUrl);
    }

    const formData = new FormData();
    formData.append('photo', file);

    return this.http
      .post<ApiResponse<{ photoUrl: string; fullPhotoUrl: string }>>(
        `${this.baseUrl}/upload-photo`,
        formData
      )
      .pipe(
        map((response) => {
          const { photoUrl, fullPhotoUrl } = response.data;

          // For uploaded photos, use fullPhotoUrl if available
          if (fullPhotoUrl) {
            return fullPhotoUrl;
          }

          // If only photoUrl is available, ensure it's a full path
          if (photoUrl) {
            // If it's already a full URL, return it
            if (photoUrl.startsWith('http')) {
              return photoUrl;
            }

            // If it's a relative path, prepend the API base URL
            const normalizedPath = photoUrl.startsWith('/')
              ? photoUrl
              : `/${photoUrl}`;

            return `${
              environment.apiUrl
            }${normalizedPath}?v=${new Date().getTime()}`;
          }

          return '';
        }),
        catchError((error) => {
          console.error('Error uploading profile photo:', error);
          return of('');
        })
      );
  }

  /**
   * Get photo URL with cache busting
   */
  getProfilePhotoUrl(userId: string): string {
    if (!userId) return '';
    const timestamp = new Date().getTime(); // Use timestamp for cache busting
    return `${environment.apiUrl}/users/photo/${userId}?v=${timestamp}`;
  }

  /**
   * Add cache busting to an existing photo URL
   */
  private getPhotoUrlWithCacheBusting(
    userId: string,
    photoUrl: string
  ): string {
    console.log('Processing photo URL:', photoUrl);

    // Handle null or empty URLs
    if (!photoUrl || photoUrl.trim() === '') {
      console.log('Empty photoUrl, using default profile endpoint');
      return userId ? this.getProfilePhotoUrl(userId) : '';
    }

    // If photoUrl is already a full URL, return it with cache busting
    if (photoUrl.startsWith('http')) {
      console.log('Full URL detected');
      // Add cache busting parameter
      const separator = photoUrl.includes('?') ? '&' : '?';
      const timestamp = new Date().getTime();
      return `${photoUrl}${separator}v=${timestamp}`;
    }

    // Create timestamp for cache busting
    const timestamp = new Date().getTime();

    // If it's a path like /uploads/xxx.jpg or uploads/xxx.jpg
    if (photoUrl.includes('/uploads/') || photoUrl.startsWith('uploads/')) {
      console.log('Upload path detected');
      // Ensure the path starts with a slash
      const normalizedPath = photoUrl.startsWith('/')
        ? photoUrl
        : `/${photoUrl}`;

      return `${environment.apiUrl}${normalizedPath}?v=${timestamp}`;
    }

    // If it's a user ID or an API endpoint like /photo/:id
    if (photoUrl.includes('/photo/') || photoUrl.match(/^[a-f0-9]{24}$/i)) {
      console.log('Photo endpoint or MongoDB ID detected');
      // If it looks like a MongoDB ID (24 hex characters)
      if (photoUrl.match(/^[a-f0-9]{24}$/i)) {
        console.log('MongoDB ID format detected');
        return `${environment.apiUrl}/users/photo/${photoUrl}?v=${timestamp}`;
      }

      // If it's already a path like /photo/123
      const normalizedPath = photoUrl.startsWith('/')
        ? photoUrl
        : `/${photoUrl}`;

      console.log('Using normalized path:', normalizedPath);
      return `${environment.apiUrl}${normalizedPath}?v=${timestamp}`;
    }

    // For any other relative path, assume it's a direct path
    if (!photoUrl.startsWith('/')) {
      photoUrl = `/${photoUrl}`;
    }
    console.log('Using direct path with API URL');
    return `${environment.apiUrl}${photoUrl}?v=${timestamp}`;
  }

  /**
   * Change the user's password
   */
  changePassword(
    currentPassword: string,
    newPassword: string
  ): Observable<boolean> {
    if (this.useMockData) {
      // Mock successful password change
      return of(true);
    }

    return this.http
      .post<ApiResponse<any>>(`${this.baseUrl}/change-password`, {
        currentPassword,
        newPassword,
      })
      .pipe(
        map((response) => response.success),
        catchError((error) => {
          console.error('Error changing password:', error);
          return of(false);
        })
      );
  }
}
