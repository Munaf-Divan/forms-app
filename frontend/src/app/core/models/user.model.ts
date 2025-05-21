export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  fullName: string;
  userType: string;
  phoneNumber: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  data: {
    token: string;
    user: UserProfile;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  role: 'farmer' | 'consumer';
}
