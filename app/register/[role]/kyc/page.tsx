'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { registrationService, type KYCData } from '@/lib/registration';
import ProgressIndicator from '@/components/common/ProgressIndicator';
import TransitionWrapper from '@/components/common/TransitionWrapper';

interface LocalKYCData {
  aadhaarNumber: string;
  documentType: string;
  documentFile: File | null;
  addressProof: File | null;
  additionalDocuments?: Record<string, File>;
}

interface KYCStatus {
  status: 'not_started' | 'submitted' | 'under_review' | 'verified' | 'rejected';
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

const kycConfig = {
  farmer: {
    requiredDocuments: ['aadhaar', 'pan', 'address_proof'],
    description: 'Complete KYC to start selling your produce',
  },
  trader: {
    requiredDocuments: ['aadhaar', 'pan', 'gst', 'address_proof'],
    description: 'Complete KYC to access trading features',
  },
  warehouse: {
    requiredDocuments: ['aadhaar', 'pan', 'gst', 'warehouse_license', 'address_proof'],
    description: 'Complete KYC to manage warehouse operations',
  },
  transporter: {
    requiredDocuments: ['aadhaar', 'pan', 'gst', 'vehicle_registration', 'address_proof'],
    description: 'Complete KYC to start transport operations',
  },
};

export default function KYCPage() {
  const router = useRouter();
  const params = useParams();
  const role = params.role as string;

  const [kycData, setKycData] = useState<LocalKYCData>({
    aadhaarNumber: '',
    documentType: 'aadhaar',
    documentFile: null,
    addressProof: null,
  });

  const [kycStatus, setKycStatus] = useState<KYCStatus>({
    status: 'not_started',
  });

  const [showOTP, setShowOTP] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const config = kycConfig[role as keyof typeof kycConfig];

  useEffect(() => {
    if (!config) {
      router.push('/register');
      return;
    }

    const pending = registrationService.getPendingRegistration();
    const user = registrationService.getCurrentUser();
    if (!pending && !user) {
      router.push(`/register/${role}`);
      return;
    }

    const profile = registrationService.getUserProfile();
    if (profile) {
      setKycStatus({
        status: profile.kycStatus,
        submittedAt: profile.kycSubmittedAt,
        reviewedAt: profile.kycReviewedAt,
        rejectionReason: profile.kycRejectionReason,
      });
    }
  }, [role, config, router]);

  const ensureRegistered = async () => {
    const existing = registrationService.getCurrentUser();
    if (existing) return existing;
    return registrationService.completePendingRegistration();
  };

  const goToDashboard = (userRole: string) => {
    window.location.href = registrationService.getDashboardUrl(userRole);
  };

  const validateAadhaar = (aadhaar: string): boolean => {
    return /^\d{12}$/.test(aadhaar);
  };

  const handleAadhaarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registrationService.validateAadhaar(kycData.aadhaarNumber)) {
      setErrors({ aadhaar: 'Please enter a valid 12-digit Aadhaar number' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate Aadhaar OTP generation using registration service
      await registrationService.sendOTP(kycData.aadhaarNumber);
      setShowOTP(true);
    } catch (error) {
      setErrors({ general: 'Failed to generate OTP. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAadhaarOTPVerify = async () => {
    if (otpValue.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP' });
      return;
    }

    setIsLoading(true);

    try {
      // Verify OTP using registration service
      const isValid = await registrationService.verifyOTP(otpValue);

      if (isValid) {
        setShowOTP(false);
        setOtpValue('');
      } else {
        setErrors({ otp: 'Invalid OTP. Please try again.' });
      }
    } catch (error) {
      setErrors({ otp: 'OTP verification failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    documentType: string,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setErrors({ [documentType]: 'File size must be less than 5MB' });
        return;
      }

      setKycData((prev) => ({
        ...prev,
        [documentType]: file,
      }));
      setErrors((prev) => ({ ...prev, [documentType]: '' }));
    }
  };

  const handleKYCSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (!kycData.aadhaarNumber) {
      newErrors.aadhaar = 'Aadhaar verification is required';
    }

    const requiredDocs = config.requiredDocuments;
    for (const doc of requiredDocs) {
      if (!kycData[doc as keyof LocalKYCData] && doc !== 'aadhaar') {
        newErrors[doc] = `${doc.replace('_', ' ').toUpperCase()} document is required`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      await ensureRegistered();

      const kycSubmissionData: KYCData = {
        aadhaarNumber: kycData.aadhaarNumber,
        documentType: kycData.documentType,
        documentFile: kycData.documentFile || undefined,
        addressProof: kycData.addressProof || undefined,
      };
      await registrationService.submitKYC(kycSubmissionData);

      const newStatus = {
        status: 'submitted' as const,
        submittedAt: new Date().toISOString(),
      };

      setKycStatus(newStatus);

      // Simulate review process after 3 seconds
      setTimeout(async () => {
        const profile = registrationService.getUserProfile();
        if (profile) {
          setKycStatus({
            status: profile.kycStatus,
            submittedAt: profile.kycSubmittedAt,
            reviewedAt: profile.kycReviewedAt,
            rejectionReason: profile.kycRejectionReason,
          });
        }
      }, 3000);
    } catch (error) {
      setErrors({ general: 'KYC submission failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipForNow = async () => {
    setIsLoading(true);
    setErrors({});
    try {
      const user = await ensureRegistered();
      goToDashboard(user.role);
    } catch (error) {
      setErrors({
        general:
          error instanceof Error ? error.message : 'Could not complete registration.',
      });
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'text-[#666666]';
      case 'submitted':
        return 'text-[#e89151]';
      case 'under_review':
        return 'text-[#2eb5c2]';
      case 'verified':
        return 'text-[#0b5d68]';
      case 'rejected':
        return 'text-[#d55b39]';
      default:
        return 'text-[#666666]';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'bg-[#f0f0f0]';
      case 'submitted':
        return 'bg-[#ffe8e0]';
      case 'under_review':
        return 'bg-[#a5dce4]';
      case 'verified':
        return 'bg-[#c1e8ed]';
      case 'rejected':
        return 'bg-[#ffdad6]';
      default:
        return 'bg-[#f0f0f0]';
    }
  };

  if (!config) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#fcf9f5] flex items-center justify-center px-8">
      <div className="max-w-2xl w-full">
        {/* Progress Indicator */}
        <div className="mb-8">
          <ProgressIndicator
            currentStep={3}
            totalSteps={3}
            steps={[
              { label: 'Role', status: 'completed' },
              { label: 'Details', status: 'completed' },
              { label: 'KYC', status: 'active' },
            ]}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#e0e0e0] p-8">
          <div className="text-center mb-6">
            <h1 className="font-headline text-2xl font-bold text-[#0b5d68] mb-2">
              KYC Verification
            </h1>
            <p className="text-[#666666] text-sm">{config.description}</p>
          </div>

          {/* KYC Status */}
          <div className={`mb-6 p-4 rounded-lg ${getStatusBg(kycStatus.status)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span
                  className={`material-symbols-outlined ${getStatusColor(kycStatus.status)} mr-2`}
                >
                  {kycStatus.status === 'verified'
                    ? 'verified'
                    : kycStatus.status === 'under_review'
                      ? 'pending'
                      : kycStatus.status === 'submitted'
                        ? 'upload'
                        : kycStatus.status === 'rejected'
                          ? 'error'
                          : 'hourglass_empty'}
                </span>
                <div>
                  <p className={`font-medium ${getStatusColor(kycStatus.status)}`}>
                    Status: {kycStatus.status.replace('_', ' ').toUpperCase()}
                  </p>
                  {kycStatus.submittedAt && (
                    <p className="text-xs text-[#666666]">
                      Submitted: {new Date(kycStatus.submittedAt).toLocaleString()}
                    </p>
                  )}
                  {kycStatus.reviewedAt && (
                    <p className="text-xs text-[#666666]">
                      Reviewed: {new Date(kycStatus.reviewedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {kycStatus.rejectionReason && (
              <div className="mt-2 p-2 bg-white rounded text-sm text-[#d55b39]">
                Reason: {kycStatus.rejectionReason}
              </div>
            )}
          </div>

          {kycStatus.status === 'not_started' && (
            <TransitionWrapper show={true} animation="slideUp">
              <div className="space-y-6">
                {/* Aadhaar Verification */}
                <div className="border border-[#e0e0e0] rounded-lg p-4">
                  <h3 className="font-medium text-[#0b5d68] mb-3">Aadhaar Verification</h3>

                  {!showOTP ? (
                    <form onSubmit={handleAadhaarSubmit} className="space-y-3">
                      <Input
                        label="Aadhaar Number"
                        value={kycData.aadhaarNumber}
                        onChange={(e) =>
                          setKycData({
                            ...kycData,
                            aadhaarNumber: e.target.value.replace(/\D/g, ''),
                          })
                        }
                        error={errors.aadhaar}
                        placeholder="Enter 12-digit Aadhaar number"
                        maxLength={12}
                        required
                      />
                      <Button type="submit" variant="primary" size="md" disabled={isLoading}>
                        {isLoading ? 'Generating OTP...' : 'Generate OTP'}
                      </Button>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-[#666666]">
                        OTP sent to your registered mobile number
                      </p>
                      <Input
                        label="Enter OTP"
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                        error={errors.otp}
                        placeholder="Enter 6-digit OTP (use 123456 for demo)"
                        maxLength={6}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleAadhaarOTPVerify}
                          variant="primary"
                          size="md"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Verifying...' : 'Verify OTP'}
                        </Button>
                        <Button onClick={() => setShowOTP(false)} variant="outline" size="md">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Document Upload */}
                <div className="border border-[#e0e0e0] rounded-lg p-4">
                  <h3 className="font-medium text-[#0b5d68] mb-3">Document Upload</h3>

                  <div className="space-y-3">
                    {config.requiredDocuments.map(
                      (doc) =>
                        doc !== 'aadhaar' && (
                          <div key={doc}>
                            <label className="block text-sm font-medium text-[#0b5d68] mb-1">
                              {doc.replace('_', ' ').toUpperCase()} Document
                            </label>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleDocumentUpload(e, doc)}
                              className="block w-full text-sm text-[#666666] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#0b5d68] file:text-white hover:file:bg-[#094851]"
                            />
                            {kycData[doc as keyof LocalKYCData] &&
                              typeof kycData[doc as keyof LocalKYCData] !== 'string' && (
                                <p className="text-xs text-[#0b5d68] mt-1">
                                  ✓ {(kycData[doc as keyof LocalKYCData] as File)?.name}
                                </p>
                              )}
                            {errors[doc] && (
                              <p className="text-xs text-[#d55b39] mt-1">{errors[doc]}</p>
                            )}
                          </div>
                        ),
                    )}
                  </div>
                </div>

                {errors.general && (
                  <div className="bg-[#ffdad6] border border-[#d55b39] text-[#690005] px-4 py-3 rounded-lg text-sm">
                    {errors.general}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={handleKYCSubmit}
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Submitting...' : 'Submit KYC'}
                  </Button>
                  <Button onClick={handleSkipForNow} variant="outline" size="lg">
                    Skip for Now
                  </Button>
                </div>
              </div>
            </TransitionWrapper>
          )}

          {(kycStatus.status === 'submitted' || kycStatus.status === 'under_review') && (
            <TransitionWrapper show={true} animation="fadeIn">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-[#a5dce4] rounded-full flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[#0b5d68] text-2xl">pending</span>
                </div>
                <p className="text-[#666666]">
                  {kycStatus.status === 'submitted'
                    ? 'Your KYC documents have been submitted and are under review.'
                    : 'Your KYC verification is currently under review.'}
                </p>
                <p className="text-sm text-[#666666]">
                  This usually takes 1-2 business days. You'll be notified once approved.
                </p>
                <Button onClick={handleSkipForNow} variant="primary" size="lg">
                  Continue to Dashboard
                </Button>
              </div>
            </TransitionWrapper>
          )}

          {kycStatus.status === 'verified' && (
            <TransitionWrapper show={true} animation="scaleIn">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-[#c1e8ed] rounded-full flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[#0b5d68] text-2xl">
                    verified
                  </span>
                </div>
                <p className="text-[#0b5d68] font-medium">KYC Verification Complete!</p>
                <p className="text-[#666666]">
                  Your account has been verified. You now have full access to all features.
                </p>
                <Button onClick={handleSkipForNow} variant="primary" size="lg">
                  Go to Dashboard
                </Button>
              </div>
            </TransitionWrapper>
          )}

          {kycStatus.status === 'rejected' && (
            <TransitionWrapper show={true} animation="slideIn">
              <div className="space-y-4">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-[#ffdad6] rounded-full flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-[#d55b39] text-2xl">error</span>
                  </div>
                  <p className="text-[#d55b39] font-medium">KYC Verification Failed</p>
                  <p className="text-[#666666]">
                    {kycStatus.rejectionReason ||
                      'Your KYC verification was rejected. Please review and resubmit.'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setKycStatus({ status: 'not_started' });
                      setKycData({
                        aadhaarNumber: '',
                        documentType: 'aadhaar',
                        documentFile: null,
                        addressProof: null,
                      });
                    }}
                    variant="primary"
                    size="lg"
                    className="flex-1"
                  >
                    Resubmit Documents
                  </Button>
                  <Button onClick={handleSkipForNow} variant="outline" size="lg">
                    Skip for Now
                  </Button>
                </div>
              </div>
            </TransitionWrapper>
          )}
        </div>
      </div>
    </div>
  );
}
