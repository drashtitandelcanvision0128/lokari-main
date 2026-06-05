// Registration and KYC simulation utilities

export interface User {
  id: string
  fullName: string
  email?: string
  phone?: string
  password: string
  role: 'farmer' | 'trader' | 'warehouse' | 'transporter'
  status: 'pending_kyc' | 'active' | 'suspended'
  avatar?: string
  createdAt: string
  updatedAt: string
  location?: string
  farmName?: string
  companyName?: string
  warehouseName?: string
  vehicleType?: string
}

export interface UserProfile {
  userId: string
  kycStatus: 'not_started' | 'submitted' | 'under_review' | 'verified' | 'rejected'
  verificationLevel: 'basic' | 'advanced'
  kycSubmittedAt?: string
  kycReviewedAt?: string
  kycRejectionReason?: string
  createdAt: string
  updatedAt: string
}

export interface RegistrationData {
  fullName: string
  email?: string
  phone?: string
  password: string
  role: 'farmer' | 'trader' | 'warehouse' | 'transporter'
  termsAccepted: boolean
  location?: string
  farmName?: string
  companyName?: string
  warehouseName?: string
  vehicleType?: string
}

export interface KYCData {
  aadhaarNumber: string
  documentType: string
  documentFile?: File
  addressProof?: File
  additionalDocuments?: Record<string, File>
}

class RegistrationService {
  private readonly STORAGE_KEYS = {
    USER: 'currentUser',
    PROFILE: 'userProfile',
    USERS: 'allUsers'
  }

  // User Management
  async createUser(data: RegistrationData): Promise<User> {
    try {
      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || resData.message || 'Registration failed');
      }

      const user: User = resData.data.user;

      // Store in localStorage
      localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));
      
      // Keep existing array updated for compatibility
      const existingUsers = this.getAllUsers();
      const userIndex = existingUsers.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        existingUsers[userIndex] = user;
      } else {
        existingUsers.push(user);
      }
      localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(existingUsers));

      // Create user profile in localStorage for client-side state compatibility
      const profile: UserProfile = {
        userId: user.id,
        kycStatus: 'not_started',
        verificationLevel: 'basic',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      localStorage.setItem(this.STORAGE_KEYS.PROFILE, JSON.stringify(profile));

      return user;
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  }

  async activateUser(userId: string): Promise<void> {
    const user = this.getCurrentUser()
    if (user && user.id === userId) {
      user.status = 'active'
      user.updatedAt = new Date().toISOString()
      localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user))

      // Update in users array
      const allUsers = this.getAllUsers()
      const userIndex = allUsers.findIndex(u => u.id === userId)
      if (userIndex !== -1) {
        allUsers[userIndex] = user
        localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(allUsers))
      }
    }
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.STORAGE_KEYS.USER)
    return userStr ? JSON.parse(userStr) : null
  }

  setCurrentUser(user: User): void {
    localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user))
  }

  updateUser(user: User): void {
    // Update current user if it matches
    const currentUser = this.getCurrentUser()
    if (currentUser && currentUser.id === user.id) {
      localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user))
    }

    // Update in users array
    const allUsers = this.getAllUsers()
    const userIndex = allUsers.findIndex(u => u.id === user.id)
    if (userIndex !== -1) {
      allUsers[userIndex] = user
      localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(allUsers))
    }
  }

  getAllUsers(): User[] {
    const usersData = localStorage.getItem(this.STORAGE_KEYS.USERS)
    console.log('getAllUsers - storage key:', this.STORAGE_KEYS.USERS)
    console.log('getAllUsers - raw data:', usersData)
    console.log('getAllUsers - parsed data:', usersData ? JSON.parse(usersData) : [])
    return usersData ? JSON.parse(usersData) : []
  }

  // Profile Management
  async createProfile(userId: string): Promise<UserProfile> {
    const profile: UserProfile = {
      userId,
      kycStatus: 'not_started',
      verificationLevel: 'basic',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    localStorage.setItem(this.STORAGE_KEYS.PROFILE, JSON.stringify(profile))
    return profile
  }

  getUserProfile(): UserProfile | null {
    const profileData = localStorage.getItem(this.STORAGE_KEYS.PROFILE)
    return profileData ? JSON.parse(profileData) : null
  }

  async updateKYCStatus(
    status: UserProfile['kycStatus'],
    rejectionReason?: string
  ): Promise<void> {
    const profile = this.getUserProfile()
    if (!profile) return

    profile.kycStatus = status
    profile.updatedAt = new Date().toISOString()

    if (status === 'submitted' && !profile.kycSubmittedAt) {
      profile.kycSubmittedAt = new Date().toISOString()
    } else if (status === 'under_review' || status === 'verified' || status === 'rejected') {
      profile.kycReviewedAt = new Date().toISOString()
      if (rejectionReason) {
        profile.kycRejectionReason = rejectionReason
      }
    }

    localStorage.setItem(this.STORAGE_KEYS.PROFILE, JSON.stringify(profile))
  }

  // OTP Simulation
  async sendOTP(contact: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Store OTP session for demo purposes
    const otpSession = {
      contact,
      generatedAt: new Date().toISOString(),
      attempts: 0
    }
    localStorage.setItem('otpSession', JSON.stringify(otpSession))
  }

  async verifyOTP(otp: string): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock OTP verification - accept 123456 or random success
    const isValid = otp === '123456' || Math.random() > 0.1

    if (isValid) {
      localStorage.removeItem('otpSession')
    }

    return isValid
  }

  // KYC Document Simulation
  async submitKYC(data: KYCData): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    await this.updateKYCStatus('submitted')

    // Simulate review process
    setTimeout(async () => {
      const reviewResult = Math.random()
      if (reviewResult > 0.8) {
        // 20% chance of rejection
        await this.updateKYCStatus('rejected', 'Document quality is poor')
      } else if (reviewResult > 0.3) {
        // 50% chance of approval
        await this.updateKYCStatus('verified')
      } else {
        // 30% chance of under review
        await this.updateKYCStatus('under_review')
      }
    }, 3000)
  }

  // Validation Utilities
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
    return phoneRegex.test(phone)
  }

  validateAadhaar(aadhaar: string): boolean {
    return /^\d{12}$/.test(aadhaar)
  }

  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Authenticate user with email and password
  async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const resData = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          return null;
        }
        throw new Error(resData.error || resData.message || 'Login failed');
      }

      const user: User = resData.data.user;

      // Store current user session
      this.setCurrentUser(user);
      
      // Store in users array for compatibility
      const existingUsers = this.getAllUsers();
      const idx = existingUsers.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        existingUsers[idx] = user;
      } else {
        existingUsers.push(user);
      }
      localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(existingUsers));

      // Update/Create user profile in localStorage for client-side state compatibility
      const profile: UserProfile = {
        userId: user.id,
        kycStatus: user.status === 'active' ? 'verified' : 'not_started',
        verificationLevel: 'basic',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      localStorage.setItem(this.STORAGE_KEYS.PROFILE, JSON.stringify(profile));

      return user;
    } catch (error) {
      console.error('Error during authentication:', error);
      throw error;
    }
  }

  // Get dashboard URL based on user role
  getDashboardUrl(role: string): string {
    const dashboardMap: Record<string, string> = {
      farmer: '/farmer-dashboard',
      trader: '/trader-dashboard',
      warehouse: '/warehouse-dashboard',
      transporter: '/transporter-dashboard',
      admin: '/admin'
    }
    return dashboardMap[role] || '/dashboard'
  }

  // Utility to generate random IDs
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  // Clear all data (for testing)
  clearAllData(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    localStorage.removeItem('otpSession')
  }
}

// Export singleton instance
export const registrationService = new RegistrationService()

// Types are already exported above
