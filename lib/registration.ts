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
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const existingUsers = this.getAllUsers()
    
    // Check for duplicate email/phone
    if (data.email && existingUsers.some(u => u.email === data.email)) {
      throw new Error('Email already registered')
    }
    if (data.phone && existingUsers.some(u => u.phone === data.phone)) {
      throw new Error('Phone number already registered')
    }

    const user: User = {
      id: this.generateId(),
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: data.role,
      status: 'pending_kyc',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      location: data.location,
      farmName: data.farmName,
      companyName: data.companyName,
      warehouseName: data.warehouseName,
      vehicleType: data.vehicleType
    }

    // Store user
    console.log('Creating user:', user)
    console.log('Existing users before:', existingUsers)
    
    localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user))
    existingUsers.push(user)
    localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(existingUsers))
    
    console.log('Users after creation:', this.getAllUsers())

    // Create profile
    await this.createProfile(user.id)

    return user
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
  authenticateUser(email: string, password: string): User | null {
    const users = this.getAllUsers()
    
    // First, try to find user with password field
    let user = users.find(u => 
      (u.email === email || u.phone === email) && u.password === password
    )
    
    if (user) {
      // Set current user session
      this.setCurrentUser(user)
      return user
    }
    
    // If no user found, check if there's a user without password field (migration case)
    const userWithoutPassword = users.find(u => 
      (u.email === email || u.phone === email) && !u.password
    )
    
    if (userWithoutPassword) {
      // Migrate user to include password
      const migratedUser = { ...userWithoutPassword, password }
      this.updateUser(migratedUser)
      this.setCurrentUser(migratedUser)
      return migratedUser
    }
    
        
    return null
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
