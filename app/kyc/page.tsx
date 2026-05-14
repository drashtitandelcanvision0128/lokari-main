'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/common/Button'
import { getCurrentUser } from '@/lib/auth'

// KYC Status Types
type KYCStatus = 'not_started' | 'submitted' | 'under_review' | 'verified' | 'rejected'

// KYC Data Interface
interface KYCData {
  aadhaarNumber: string
  otp: string
  documentUrl: string
  status: KYCStatus
  submittedAt?: string
  verifiedAt?: string
  rejectionReason?: string
}

export default function KYCVerificationPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [kycData, setKycData] = useState<KYCData>({
    aadhaarNumber: '',
    otp: '',
    documentUrl: '',
    status: 'not_started'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [documentUploaded, setDocumentUploaded] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
    setCurrentUser(user)

    // Development bypass - Check if user is already verified
    if (process.env.NODE_ENV === 'development') {
      const devBypass = localStorage.getItem(`dev_kyc_bypass_${user.id}`)
      if (devBypass === 'true') {
        setKycData({
          aadhaarNumber: '000000000000',
          otp: '000000',
          documentUrl: '/mock-document.pdf',
          status: 'verified'
        })
        return
      }
    }

    // Check if user already has KYC status
    // In real app, this would come from backend
    const existingKYC = localStorage.getItem(`kyc_${user.id}`)
    if (existingKYC) {
      const parsed: KYCData = JSON.parse(existingKYC)
setKycData(parsed)
      if (parsed.status === 'verified') {
        // Redirect back to the original destination or dashboard
        const returnUrl = localStorage.getItem('kyc_return_url')
        if (returnUrl) {
          localStorage.removeItem('kyc_return_url')
          router.push(returnUrl)
        } else {
          router.push('/dashboard')
        }
      } else if (parsed.status === 'submitted' || parsed.status === 'under_review') {
        setCurrentStep(4) // Show status page
      }
    }
  }, [router])

  // Step validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!kycData.aadhaarNumber) {
          newErrors.aadhaar = 'AADHAR number is required'
        } else if (!/^\d{12}$/.test(kycData.aadhaarNumber)) {
          newErrors.aadhaar = 'AADHAR number must be 12 digits'
        }
        break
      case 2:
        if (!kycData.otp) {
          newErrors.otp = 'OTP is required'
        } else if (!/^\d{6}$/.test(kycData.otp)) {
          newErrors.otp = 'OTP must be 6 digits'
        }
        break
      case 3:
        if (!documentUploaded) {
          newErrors.document = 'Document upload is required'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle AADHAR submission and OTP send
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(1)) return

    setIsLoading(true)
    try {
      // Simulate API call to UIDAI
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In real app, this would call UIDAI API
      console.log('Sending OTP to AADHAR:', kycData.aadhaarNumber)
      
      setOtpSent(true)
      setCurrentStep(2)
    } catch (error) {
      setErrors({ aadhaar: 'Failed to send OTP. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle OTP verification
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(2)) return

    setIsLoading(true)
    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // In real app, this would verify OTP with UIDAI
      console.log('Verifying OTP:', kycData.otp)
      
      setCurrentStep(3)
    } catch (error) {
      setErrors({ otp: 'Invalid OTP. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle document upload
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In real app, this would upload to cloud storage
      const mockDocumentUrl = `https://storage.example.com/documents/${currentUser.id}_${Date.now()}.pdf`
      setKycData(prev => ({ ...prev, documentUrl: mockDocumentUrl }))
      setDocumentUploaded(true)
      
      console.log('Document uploaded:', file.name)
    } catch (error) {
      setErrors({ document: 'Failed to upload document. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle final KYC submission
  const handleSubmitKYC = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(3)) return

    setIsLoading(true)
    try {
      // Simulate KYC submission
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const submittedData: KYCData = {
        ...kycData,
        status: 'submitted',
        submittedAt: new Date().toISOString()
      }
      
      // In real app, this would call backend API
      console.log('Submitting KYC:', submittedData)
      
      // Store in localStorage (in real app, this would be in database)
      localStorage.setItem(`kyc_${currentUser.id}`, JSON.stringify(submittedData))
      setKycData(submittedData)
      
      setCurrentStep(4)
    } catch (error) {
      setErrors({ submit: 'Failed to submit KYC. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  // Get status color and text
  const getStatusInfo = (status: KYCStatus) => {
    switch (status) {
      case 'not_started':
        return { color: 'gray', text: 'Not Started', icon: 'clock' }
      case 'submitted':
        return { color: 'blue', text: 'Submitted', icon: 'paper-plane' }
      case 'under_review':
        return { color: 'yellow', text: 'Under Review', icon: 'search' }
      case 'verified':
        return { color: 'green', text: 'Verified', icon: 'check-circle' }
      case 'rejected':
        return { color: 'red', text: 'Rejected', icon: 'times-circle' }
      default:
        return { color: 'gray', text: 'Unknown', icon: 'question' }
    }
  }

  // If already verified, redirect to dashboard
  if (kycData.status === 'verified') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-4">KYC Already Verified</h2>
          <p className="text-gray-600 mb-6">Your KYC verification is complete. You have full access to all features.</p>
          <Button onClick={() => router.push('/dashboard')} className="w-full">
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">KYC Verification</h1>
          <p className="text-lg text-gray-600">
            Complete your identity verification to access all commercial features
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => {
              const isActive = currentStep >= step
              const statusInfo = getStatusInfo(kycData.status)
              
              return (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-[#0b5d68] text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {step === 4 ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    ) : (
                      step
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-[#0b5d68]' : 'text-gray-400'
                  }`}>
                    {step === 1 && 'AADHAR'}
                    {step === 2 && 'OTP'}
                    {step === 3 && 'Document'}
                    {step === 4 && 'Status'}
                  </span>
                  {step < 4 && (
                    <div className={`w-16 h-1 mx-4 ${
                      currentStep > step ? 'bg-[#0b5d68]' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Step 1: AADHAR Number */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Enter AADHAR Number</h2>
              <form onSubmit={handleSendOTP} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AADHAR Number
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    value={kycData.aadhaarNumber}
                    onChange={(e) => setKycData(prev => ({ ...prev, aadhaarNumber: e.target.value.replace(/\D/g, '') }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2]"
                    placeholder="Enter 12-digit AADHAR number"
                  />
                  {errors.aadhaar && (
                    <p className="mt-2 text-sm text-red-600">{errors.aadhaar}</p>
                  )}
                </div>
                
                <div className="bg-[#f0f9fa] border-[#e0f2f5] text-[#0b5d68] rounded-lg p-4">
                  <p className="text-sm text-[#0b5d68]">
                    <strong>Note:</strong> OTP will be sent to the mobile number linked with your AADHAR.
                    Make sure you have access to that number.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#0b5d68] hover:bg-[#1a6b70] text-white py-3 rounded-lg font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </form>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Verify OTP</h2>
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter 6-digit OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={kycData.otp}
                    onChange={(e) => setKycData(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '') }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] text-center text-2xl tracking-widest"
                    placeholder="000000"
                  />
                  {errors.otp && (
                    <p className="mt-2 text-sm text-red-600">{errors.otp}</p>
                  )}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    OTP sent to mobile number ending with ****{kycData.aadhaarNumber.slice(-4)}
                  </p>
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-[#0b5d68] hover:bg-[#1a6b70] text-white py-3 rounded-lg font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Document Upload */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Upload Document</h2>
              <form onSubmit={handleSubmitKYC} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Identity Document
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <div className="mb-4">
                      <label className="cursor-pointer">
                        <span className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                          Choose File
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleDocumentUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-sm text-gray-600">
                      PDF, JPG, or PNG (Max. 5MB)
                    </p>
                  </div>
                  {documentUploaded && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">Document uploaded successfully</p>
                    </div>
                  )}
                  {errors.document && (
                    <p className="mt-2 text-sm text-red-600">{errors.document}</p>
                  )}
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Accepted Documents:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li> AadHAR Card</li>
                    <li> PAN Card</li>
                    <li> Passport</li>
                    <li> Driver's License</li>
                    <li> Voter ID Card</li>
                  </ul>
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-[#0b5d68] hover:bg-[#1a6b70] text-white py-3 rounded-lg font-semibold"
                    disabled={isLoading || !documentUploaded}
                  >
                    {isLoading ? 'Submitting...' : 'Submit KYC'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Step 4: Status */}
          
          {currentStep === 4 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-[#f0f9fa] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-[#0b5d68]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 100 4h2a2 2 0 100 4h2a1 1 0 100 2 2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd"/>
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">KYC Submitted</h2>
              
              <div className="mb-6">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  kycData.status === 'submitted' ? 'bg-[#f0f9fa] text-[#0b5d68]' :
                  kycData.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                  (kycData.status as KYCStatus) === 'verified' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {getStatusInfo(kycData.status).text}
                </div>
              </div>

              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Your KYC verification has been submitted and is currently under review. 
                You will be notified once the verification is complete.
              </p>

              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">What happens next?</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-[#f0f9fa] rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-[#0b5d68] text-xs font-bold">1</span>
                    </div>
                    <p className="text-sm text-gray-600">Our team will review your documents</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-[#f0f9fa] rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-[#0b5d68] text-xs font-bold">2</span>
                    </div>
                    <p className="text-sm text-gray-600">Verification typically takes 1-2 business days</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-[#f0f9fa] rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-[#0b5d68] text-xs font-bold">3</span>
                    </div>
                    <p className="text-sm text-gray-600">You'll receive email notification upon completion</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={() => {
                    // Temporary bypass for development/testing
                    if (process.env.NODE_ENV === 'development') {
                      // Set bypass flag
                      localStorage.setItem(`dev_kyc_bypass_${currentUser.id}`, 'true')
                      
                      // Set KYC as verified in localStorage
                      const bypassKycData = {
                        aadhaarNumber: '000000000000',
                        otp: '000000',
                        documentUrl: '/mock-document.pdf',
                        status: 'verified' as KYCStatus,
                        submittedAt: new Date().toISOString(),
                        verifiedAt: new Date().toISOString()
                      }
                      localStorage.setItem(`kyc_${currentUser.id}`, JSON.stringify(bypassKycData))
                      
                      const returnUrl = localStorage.getItem('kyc_return_url')
                      if (returnUrl) {
                        localStorage.removeItem('kyc_return_url')
                        router.push(returnUrl)
                      } else {
                        router.push('/dashboard')
                      }
                    } else {
                      // Normal flow for production
                      const returnUrl = localStorage.getItem('kyc_return_url')
                      if (returnUrl) {
                        localStorage.removeItem('kyc_return_url')
                        router.push(returnUrl)
                      } else {
                        router.push('/dashboard')
                      }
                    }
                  }}
                  className="flex-1 bg-[#0b5d68] hover:bg-[#1a6b70] text-white py-3 rounded-lg font-semibold"
                >
                  Continue
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Check Status
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
