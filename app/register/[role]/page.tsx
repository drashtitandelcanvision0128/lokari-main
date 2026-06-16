'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import OtpInput from '@/components/common/OtpInput'
import { registrationService, type RegistrationData } from '@/lib/registration'
import ProgressIndicator from '@/components/common/ProgressIndicator'
import TransitionWrapper from '@/components/common/TransitionWrapper'
import { useGuestGuard } from '@/lib/authGuard'

interface FormData {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  termsAccepted: boolean
  // Farmer specific
  farmName?: string
  farmLocation?: string
  // Trader specific
  companyName?: string
  businessType?: string
  // Warehouse specific
  warehouseName?: string
  warehouseLocation?: string
  capacity?: string
  // Transporter specific
  vehicleType?: string
  serviceArea?: string
}

interface FormErrors {
  fullName?: string
  email?: string
  phone?: string
  password?: string
  confirmPassword?: string
  termsAccepted?: string
  general?: string
}

const roleConfig = {
  farmer: {
    title: 'Farmer / Producer Registration',
    description: 'Join our marketplace to sell your produce directly to buyers',
    fields: ['fullName', 'email', 'phone', 'password', 'confirmPassword', 'farmName', 'farmLocation']
  },
  trader: {
    title: 'Trader / Buyer Registration',
    description: 'Access real-time market insights and procure from verified sources',
    fields: ['fullName', 'email', 'phone', 'password', 'confirmPassword', 'companyName', 'businessType']
  },
  warehouse: {
    title: 'Warehouse Owner Registration',
    description: 'Manage space availability and digitize warehouse receipts',
    fields: ['fullName', 'email', 'phone', 'password', 'confirmPassword', 'warehouseName', 'warehouseLocation', 'capacity']
  },
  transporter: {
    title: 'Logistics Provider Registration',
    description: 'Optimize routes and secure cargo from our vast network',
    fields: ['fullName', 'email', 'phone', 'password', 'confirmPassword', 'vehicleType', 'serviceArea']
  }
}

export default function RegisterRolePage() {
  const router = useRouter()
  const params = useParams()
  const role = params.role as string
  const canRender = useGuestGuard()

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
    farmName: '',
    farmLocation: '',
    companyName: '',
    businessType: '',
    warehouseName: '',
    warehouseLocation: '',
    capacity: '',
    vehicleType: '',
    serviceArea: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [otpValue, setOtpValue] = useState('')
  const [otpSentTo, setOtpSentTo] = useState('')

  const config = roleConfig[role as keyof typeof roleConfig]

  useEffect(() => {
    if (!config) {
      router.push('/register')
    }
  }, [role, config, router])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required for account verification'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (formData.phone.trim() && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      // Send OTP first — account is created only after verification
      await registrationService.sendOTP(formData.email.trim(), 'register')
      setOtpSentTo(formData.email.trim())
      setShowOTP(true)
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Failed to send OTP. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPVerify = async () => {
    if (otpValue.length !== 6) {
      setErrors({ general: 'Please enter a valid 6-digit OTP' })
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      await registrationService.verifyOTP(otpValue, formData.email.trim(), 'register')

      registrationService.savePendingRegistration({
        fullName: formData.fullName,
        email: formData.email.trim(),
        phone: formData.phone || undefined,
        password: formData.password,
        role: role as 'farmer' | 'trader' | 'warehouse' | 'transporter',
        termsAccepted: formData.termsAccepted,
        emailVerified: true,
        location:
          role === 'farmer'
            ? formData.farmLocation
            : role === 'warehouse'
              ? formData.warehouseLocation
              : role === 'transporter'
                ? formData.serviceArea
                : undefined,
        farmName: formData.farmName,
        companyName: formData.companyName,
        warehouseName: formData.warehouseName,
        vehicleType: formData.vehicleType,
        capacity: formData.capacity,
        businessType: formData.businessType,
      })

      router.push(`/register/${role}/kyc`)
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Invalid OTP. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!formData.email.trim()) return
    setIsLoading(true)
    setErrors({})
    try {
      await registrationService.sendOTP(formData.email.trim(), 'register')
      setOtpValue('')
      setErrors({ general: 'A new OTP has been sent to your email.' })
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to resend OTP',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!config || !canRender) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#f9f9f7]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0b5d68] to-[#2eb5c2] py-8 pt-24">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">warehouse</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {config.title}
            </h1>

            <p className="text-white/90">
              {config.description}
            </p>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div className="max-w-2xl mx-auto px-8 py-12">
        {/* Progress Indicator */}
        <div className="mb-8">
          <ProgressIndicator
            currentStep={2}
            totalSteps={3}
            steps={[
              { label: 'Role', status: 'completed' },
              { label: 'Details', status: 'active' },
              { label: 'KYC', status: 'pending' }
            ]}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10">
          <div className="text-center mb-6">
            <div className="lg:hidden w-16 h-16 bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-3xl text-white">warehouse</span>
            </div>
            <h1 className="font-headline text-2xl font-bold text-[#0b5d68] mb-2">
              {config.title}
            </h1>
            <p className="text-gray-600 text-sm">
              {config.description}
            </p>
          </div>

          <TransitionWrapper show={!showOTP} animation="slideIn">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                error={errors.fullName}
                placeholder="Enter your full name"
                required
              />

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#0b5d68]">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[#2eb5c2] text-lg">email</span>
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] transition-all"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#0b5d68]">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[#2eb5c2] text-lg">phone</span>
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] transition-all"
                    placeholder="Enter your phone number"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-600 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#0b5d68]">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[#2eb5c2] text-lg">lock</span>
                  </div>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] transition-all"
                    placeholder="Create a strong password"
                    required
                  />
                </div>
                {errors.password && (
                  <p className="text-red-600 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#0b5d68]">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[#2eb5c2] text-lg">lock</span>
                  </div>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] transition-all"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Role-specific fields */}
              {role === 'farmer' && (
                <>
                  <Input
                    label="Farm Name"
                    value={formData.farmName || ''}
                    onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                    placeholder="Enter your farm name"
                    required
                  />
                  <Input
                    label="Farm Location"
                    value={formData.farmLocation || ''}
                    onChange={(e) => setFormData({ ...formData, farmLocation: e.target.value })}
                    placeholder="Enter your farm location"
                    required
                  />
                </>
              )}

              {role === 'trader' && (
                <>
                  <Input
                    label="Company Name"
                    value={formData.companyName || ''}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Enter your company name"
                    required
                  />
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#0b5d68]">
                      Business Type
                    </label>
                    <select
                      value={formData.businessType || ''}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                      className="block w-full px-3 py-2 border border-[#e0e0e0] rounded-lg shadow-sm placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#0b5d68] focus:border-[#0b5d68] sm:text-sm"
                      required
                    >
                      <option value="">Select business type</option>
                      <option value="individual">Individual Trader</option>
                      <option value="partnership">Partnership</option>
                      <option value="corporation">Corporation</option>
                      <option value="cooperative">Cooperative</option>
                    </select>
                  </div>
                </>
              )}

              {role === 'warehouse' && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[#0b5d68]">
                      Warehouse Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-[#2eb5c2] text-lg">warehouse</span>
                      </div>
                      <input
                        value={formData.warehouseName || ''}
                        onChange={(e) => setFormData({ ...formData, warehouseName: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] transition-all"
                        placeholder="Enter warehouse name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[#0b5d68]">
                      Warehouse Location
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-[#2eb5c2] text-lg">location_on</span>
                      </div>
                      <input
                        value={formData.warehouseLocation || ''}
                        onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] transition-all"
                        placeholder="Enter warehouse location"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[#0b5d68]">
                      Storage Capacity
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-[#2eb5c2] text-lg">inventory</span>
                      </div>
                      <input
                        value={formData.capacity || ''}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] transition-all"
                        placeholder="e.g., 1000 tons"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {role === 'transporter' && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#0b5d68]">
                      Vehicle Type
                    </label>
                    <select
                      value={formData.vehicleType || ''}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                      className="block w-full px-3 py-2 border border-[#e0e0e0] rounded-lg shadow-sm placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#0b5d68] focus:border-[#0b5d68] sm:text-sm"
                      required
                    >
                      <option value="">Select vehicle type</option>
                      <option value="truck">Truck</option>
                      <option value="refrigerated_truck">Refrigerated Truck</option>
                      <option value="flatbed">Flatbed</option>
                      <option value="container">Container Truck</option>
                      <option value="van">Van</option>
                    </select>
                  </div>
                  <Input
                    label="Service Area"
                    value={formData.serviceArea || ''}
                    onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                    placeholder="e.g., Nairobi to Mombasa"
                    required
                  />
                </>
              )}

              <div className="flex items-start bg-[#f0f9fa] rounded-xl p-4">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                  className="mt-0.5 h-5 w-5 text-[#0b5d68] focus:ring-[#2eb5c2] border-[#2eb5c2] rounded"
                />
                <label htmlFor="terms" className="ml-3 text-sm text-gray-700 leading-relaxed">
                  I accept the{' '}
                  <Link href="/terms" className="text-[#2eb5c2] font-semibold hover:text-[#0b5d68] transition-colors">
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-[#2eb5c2] font-semibold hover:text-[#0b5d68] transition-colors">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.termsAccepted && (
                <p className="text-red-600 text-xs mt-1">{errors.termsAccepted}</p>
              )}

              {/* Mock CAPTCHA */}
              <div className="bg-[#f5f5f5] p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#666666]">Security Check</span>
                  <span className="text-xs bg-[#0b5d68] text-white px-2 py-1 rounded">
                    CAPTCHA
                  </span>
                </div>
                <p className="text-xs text-[#666666] mt-1">
                  (Mock CAPTCHA - always verified in demo)
                </p>
              </div>

              {errors.general && (
                <div className="bg-[#ffdad6] border border-[#d55b39] text-[#690005] px-4 py-3 rounded-lg text-sm">
                  {errors.general}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#e89151] to-[#d55b39] hover:from-[#d67a3a] hover:to-[#c54a28] text-white px-6 py-4 rounded-xl font-headline font-bold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                    Sending OTP...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Send OTP
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </span>
                )}
              </Button>
            </form>
          </TransitionWrapper>
          <TransitionWrapper show={showOTP} animation="slideIn">
            <div className="space-y-4">
              <div className="mb-4">
                <ProgressIndicator
                  currentStep={2}
                  totalSteps={3}
                  steps={[
                    { label: 'Role', status: 'completed' },
                    { label: 'Verify', status: 'active' },
                    { label: 'KYC', status: 'pending' },
                  ]}
                />
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#a5dce4] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[#0b5d68] text-2xl">
                    mark_email_unread
                  </span>
                </div>
                <h3 className="font-headline text-lg font-bold text-[#0b5d68] mb-2">
                  Verify Your Account
                </h3>
                <p className="text-[#666666] text-sm">
                  We've sent a 6-digit OTP to {otpSentTo}
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#0b5d68] text-center">
                  Enter OTP
                </label>
                <OtpInput
                  value={otpValue}
                  onChange={setOtpValue}
                  disabled={isLoading}
                />
                <p className="text-xs text-[#666666] text-center">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              {errors.general && (
                <div className="bg-[#ffdad6] border border-[#d55b39] text-[#690005] px-4 py-3 rounded-lg text-sm">
                  {errors.general}
                </div>
              )}

              <Button
                onClick={handleOTPVerify}
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Continue to KYC'}
              </Button>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  className="text-sm text-[#0b5d68] hover:underline disabled:opacity-50"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                >
                  Resend OTP
                </button>
                <div>
                  <button
                    type="button"
                    className="text-sm text-[#666666] hover:underline"
                    onClick={() => setShowOTP(false)}
                  >
                    Back to Registration
                  </button>
                </div>
              </div>
            </div>
          </TransitionWrapper>

          <div className="text-center mt-6 pt-6 border-t border-[#e0e0e0]">
            <p className="text-sm text-[#666666]">
              Already have an account?{' '}
              <Link href="/login" className="text-[#0b5d68] font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
