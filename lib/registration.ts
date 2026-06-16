// Registration and KYC simulation utilities

import { apiUrl } from '@/lib/api';
import { loginWithCredentials } from './auth/api';
import { sendEmailOtp, verifyEmailOtp, type OtpPurpose } from './auth/otp';
import { persistUserSession, getDashboardUrl as roleDashboardUrl } from './auth/session';

export interface User {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  password?: string;
  role: 'farmer' | 'trader' | 'warehouse' | 'transporter' | 'admin';
  status: 'pending_kyc' | 'active' | 'suspended';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  location?: string;
  farmName?: string;
  companyName?: string;
  warehouseName?: string;
  vehicleType?: string;
}

export interface UserProfile {
  userId: string;
  kycStatus: 'not_started' | 'submitted' | 'under_review' | 'verified' | 'rejected';
  verificationLevel: 'basic' | 'advanced';
  kycSubmittedAt?: string;
  kycReviewedAt?: string;
  kycRejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationData {
  fullName: string;
  email?: string;
  phone?: string;
  password: string;
  role: 'farmer' | 'trader' | 'warehouse' | 'transporter';
  termsAccepted: boolean;
  otp?: string;
  location?: string;
  farmName?: string;
  companyName?: string;
  warehouseName?: string;
  vehicleType?: string;
  capacity?: string;
  businessType?: string;
}

export type PendingRegistration = RegistrationData & {
  emailVerified: true;
};

const PENDING_REGISTRATION_KEY = 'pendingRegistration';

export interface KYCData {
  aadhaarNumber: string;
  documentType: string;
  documentFile?: File;
  addressProof?: File;
  additionalDocuments?: Record<string, File>;
}

class RegistrationService {
  private readonly STORAGE_KEYS = {
    USER: 'currentUser',
    PROFILE: 'userProfile',
  };

  private get apiUrl(): string {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  }

  // User Management
  savePendingRegistration(data: PendingRegistration): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PENDING_REGISTRATION_KEY, JSON.stringify(data));
  }

  getPendingRegistration(): PendingRegistration | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(PENDING_REGISTRATION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  clearPendingRegistration(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(PENDING_REGISTRATION_KEY);
  }

  /** Finish signup after OTP + KYC (or skip). Uses prior OTP verification on the server. */
  async completePendingRegistration(): Promise<User> {
    const pending = this.getPendingRegistration();
    if (!pending) {
      throw new Error('No pending registration. Please start again.');
    }
    const { emailVerified: _verified, otp: _otp, ...payload } = pending;
    const user = await this.createUser(payload);
    this.clearPendingRegistration();
    await this.createProfile(user.id);
    return user;
  }

  async createUser(data: RegistrationData): Promise<User> {
    try {
      const body: Record<string, unknown> = { ...data };
      if (!data.otp?.trim()) {
        delete body.otp;
      }

      const response = await fetch(apiUrl('/auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      let resData: { error?: string; message?: string; data?: { user: User; token: string } } = {};
      try {
        resData = await response.json();
      } catch {
        throw new Error(`Cannot reach API at ${apiUrl('/auth/register')}. Is the backend running?`);
      }

      if (!response.ok) {
        throw new Error(resData.error || resData.message || 'Registration failed');
      }

      const user: User = resData.data!.user;
      const token: string = resData.data!.token;
      if (token) {
        persistUserSession(user, token);
      } else {
        localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));
      }

      return user;
    } catch (error) {
      console.error('Error during registration:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error(
          `Cannot reach API at ${apiUrl('/auth/register')}. Start backend: cd backend && npm run dev`,
        );
      }
      throw error;
    }
  }

  async activateUser(userId: string): Promise<void> {
    const user = this.getCurrentUser();
    if (user && user.id === userId) {
      user.status = 'active';
      user.updatedAt = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));

      // // Update in users array
      // const allUsers = this.getAllUsers()
      // const userIndex = allUsers.findIndex(u => u.id === userId)
      // if (userIndex !== -1) {
      //   allUsers[userIndex] = user
      //   localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(allUsers))
      // }
    }
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  setCurrentUser(user: User): void {
    localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));
  }

  updateUser(user: User): void {
    // Update current user if it matches
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === user.id) {
      localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));
    }

    // // Update in users array
    // const allUsers = this.getAllUsers()
    // const userIndex = allUsers.findIndex(u => u.id === user.id)
    // if (userIndex !== -1) {
    //   allUsers[userIndex] = user
    //   localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(allUsers))
    // }
  }

  // getAllUsers(): User[] {
  //   const usersData = localStorage.getItem(this.STORAGE_KEYS.USERS)
  //   console.log('getAllUsers - storage key:', this.STORAGE_KEYS.USERS)
  //   console.log('getAllUsers - raw data:', usersData)
  //   console.log('getAllUsers - parsed data:', usersData ? JSON.parse(usersData) : [])
  //   return usersData ? JSON.parse(usersData) : []
  // }

  // Profile Management
  async createProfile(userId: string): Promise<UserProfile> {
    const profile: UserProfile = {
      userId,
      kycStatus: 'not_started',
      verificationLevel: 'basic',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(this.STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    return profile;
  }

  getUserProfile(): UserProfile | null {
    const profileData = localStorage.getItem(this.STORAGE_KEYS.PROFILE);
    return profileData ? JSON.parse(profileData) : null;
  }

  async updateKYCStatus(status: UserProfile['kycStatus'], rejectionReason?: string): Promise<void> {
    const profile = this.getUserProfile();
    if (!profile) return;

    profile.kycStatus = status;
    profile.updatedAt = new Date().toISOString();

    if (status === 'submitted' && !profile.kycSubmittedAt) {
      profile.kycSubmittedAt = new Date().toISOString();
    } else if (status === 'under_review' || status === 'verified' || status === 'rejected') {
      profile.kycReviewedAt = new Date().toISOString();
      if (rejectionReason) {
        profile.kycRejectionReason = rejectionReason;
      }
    }

    localStorage.setItem(this.STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }

  // Email OTP (via backend + Redis)
  async sendOTP(email: string, purpose: OtpPurpose = 'register'): Promise<void> {
    if (!email?.includes('@')) {
      throw new Error('A valid email address is required for verification');
    }

    await sendEmailOtp(email, purpose);

    localStorage.setItem(
      'otpSession',
      JSON.stringify({
        email: email.trim().toLowerCase(),
        purpose,
        generatedAt: new Date().toISOString(),
      }),
    );
  }

  async verifyOTP(otp: string, email?: string, purpose: OtpPurpose = 'register'): Promise<boolean> {
    const sessionRaw = localStorage.getItem('otpSession');
    const session = sessionRaw ? JSON.parse(sessionRaw) : null;
    const targetEmail = email?.trim() || session?.email;

    if (!targetEmail) {
      throw new Error('Email is required for OTP verification');
    }

    await verifyEmailOtp(targetEmail, otp, purpose);
    localStorage.removeItem('otpSession');
    return true;
  }

  // KYC Document Simulation
  async submitKYC(data: KYCData): Promise<void> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await this.updateKYCStatus('submitted');

    // Simulate review process
    setTimeout(async () => {
      const reviewResult = Math.random();
      if (reviewResult > 0.8) {
        // 20% chance of rejection
        await this.updateKYCStatus('rejected', 'Document quality is poor');
      } else if (reviewResult > 0.3) {
        // 50% chance of approval
        await this.updateKYCStatus('verified');
      } else {
        // 30% chance of under review
        await this.updateKYCStatus('under_review');
      }
    }, 3000);
  }

  // Validation Utilities
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  validateAadhaar(aadhaar: string): boolean {
    return /^\d{12}$/.test(aadhaar);
  }

  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Authenticate user with email/phone and password via API
  async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      const { user, token } = await loginWithCredentials({ email, password });
      persistUserSession(user, token);
      return user;
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid email or password') {
        return null;
      }
      console.error('Error during authentication:', error);
      throw error;
    }
  }

  getDashboardUrl(role: string): string {
    return roleDashboardUrl(role);
  }

  // Utility to generate random IDs
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Clear all data (for testing)
  clearAllData(): void {
    Object.values(this.STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    localStorage.removeItem('otpSession');
    localStorage.removeItem(PENDING_REGISTRATION_KEY);
  }
}

// Export singleton instance
export const registrationService = new RegistrationService();

// Types are already exported above
