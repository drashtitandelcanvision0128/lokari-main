'use client';

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/common/Button';
import OtpInput from '@/components/common/OtpInput';
import RegistrationFormField, {
  RegistrationFormSection,
  registrationInputClass,
  registrationSelectClass,
  formatIndianPhone,
  normalizeIndianPhoneInput,
  getIndianPhoneValidationError,
} from '@/components/forms/RegistrationFormField';
import { registrationService, type RegistrationData } from '@/lib/registration';
import ProgressIndicator from '@/components/common/ProgressIndicator';
import TransitionWrapper from '@/components/common/TransitionWrapper';
import { useGuestGuard } from '@/lib/authGuard';
import GuestPageShell from '@/components/layout/GuestPageShell';

const FIELD_SIZE = 'lg' as const;

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  termsAccepted?: string;
  general?: string;
}

const roleConfig = {
  farmer: {
    title: 'Farmer / Producer Registration',
    description: 'Join our marketplace to sell your produce directly to buyers',
    fields: [
      'fullName',
      'email',
      'phone',
      'password',
      'confirmPassword',
      'farmName',
      'farmLocation',
    ],
  },
  trader: {
    title: 'Trader / Buyer Registration',
    description: 'Access real-time market insights and procure from verified sources',
    fields: [
      'fullName',
      'email',
      'phone',
      'password',
      'confirmPassword',
      'companyName',
      'businessType',
    ],
  },
  warehouse: {
    title: 'Warehouse Owner Registration',
    description: 'Manage space availability and digitize warehouse receipts',
    fields: [
      'fullName',
      'email',
      'phone',
      'password',
      'confirmPassword',
      'warehouseName',
      'warehouseLocation',
      'capacity',
    ],
  },
  transporter: {
    title: 'Logistics Provider Registration',
    description: 'Optimize routes and secure cargo from our vast network',
    fields: [
      'fullName',
      'email',
      'phone',
      'password',
      'confirmPassword',
      'vehicleType',
      'serviceArea',
    ],
  },
};

const roleIcons: Record<string, string> = {
  farmer: 'agriculture',
  trader: 'monitoring',
  warehouse: 'warehouse',
  transporter: 'local_shipping',
};

const roleSectionTitles: Record<string, string> = {
  farmer: 'Farm Details',
  trader: 'Business Details',
  warehouse: 'Warehouse Details',
  transporter: 'Fleet Details',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

type ValidatableField = Exclude<keyof FormErrors, 'general'>;

function getFieldError(
  field: ValidatableField,
  data: FormData,
  userRole: string,
): string | undefined {
  switch (field) {
    case 'fullName':
      if (!data.fullName.trim()) return 'Full name is required';
      return undefined;
    case 'email':
      if (!data.email.trim()) return 'Email is required for account verification';
      if (!EMAIL_REGEX.test(data.email)) return 'Please enter a valid email address';
      return undefined;
    case 'phone':
      return getIndianPhoneValidationError(data.phone);
    case 'password':
      if (!data.password) return 'Password is required';
      if (data.password.length < 8) return 'Password must be at least 8 characters';
      return undefined;
    case 'confirmPassword':
      if (data.password !== data.confirmPassword) return 'Passwords do not match';
      return undefined;
    case 'street':
      if (!data.street?.trim()) return 'Street address is required';
      return undefined;
    case 'city':
      if (!data.city?.trim()) return 'City/Area is required';
      return undefined;
    case 'state':
      if (!data.state?.trim()) return 'State is required';
      return undefined;
    case 'pincode':
      if (!data.pincode?.trim()) return 'Pincode is required';
      return undefined;
    case 'country':
      if (!data.country?.trim()) return 'Country is required';
      return undefined;
    case 'termsAccepted':
      if (!data.termsAccepted) return 'You must accept the terms and conditions';
      return undefined;
    default:
      return undefined;
  }
}

function getRelatedFields(field: keyof FormData): ValidatableField[] {
  if (field === 'password') return ['password', 'confirmPassword'];
  if (field === 'confirmPassword') return ['confirmPassword'];
  return [field as ValidatableField];
}

function getFieldsInOrder(userRole: string): ValidatableField[] {
  return [
    'fullName',
    'email',
    'phone',
    'password',
    'confirmPassword',
    'street',
    'city',
    'state',
    'pincode',
    'country',
    'termsAccepted',
  ];
}

function scrollToFirstError(fields: ValidatableField[], errorMap: FormErrors) {
  const firstInvalidField = fields.find((field) => errorMap[field]);
  if (!firstInvalidField) return;

  requestAnimationFrame(() => {
    const container = document.getElementById(`register-field-${firstInvalidField}`);
    container?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const focusable = container?.querySelector<HTMLElement>('input, select, textarea, button');
    focusable?.focus({ preventScroll: true });
  });
}

export default function RegisterRolePage(): ReactNode {
  const router = useRouter();
  const params = useParams();
  const role = params.role as string;
  const guestStatus = useGuestGuard();

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpSentTo, setOtpSentTo] = useState('');

  const config = roleConfig[role as keyof typeof roleConfig];

  useEffect(() => {
    if (!config) {
      router.push('/register');
    }
  }, [role, config, router]);

  const clearFeedback = () => {
    setErrors({});
    setSuccessMessage('');
  };

  const handleFieldChange = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    const nextData = { ...formData, [field]: value };
    setFormData(nextData);

    const relatedFields = getRelatedFields(field);
    setErrors((prev) => {
      if (!relatedFields.some((key) => prev[key])) return prev;

      const nextErrors = { ...prev };
      for (const key of relatedFields) {
        const message = getFieldError(key, nextData, role);
        if (message) nextErrors[key] = message;
        else delete nextErrors[key];
      }
      return nextErrors;
    });
  };

  const handlePhoneChange = (value: string) => {
    handleFieldChange('phone', normalizeIndianPhoneInput(value));
  };

  const validateForm = (): boolean => {
    const fieldsToValidate = getFieldsInOrder(role);

    const newErrors: FormErrors = {};
    for (const field of fieldsToValidate) {
      const message = getFieldError(field, formData, role);
      if (message) newErrors[field] = message;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      scrollToFirstError(fieldsToValidate, newErrors);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    clearFeedback();

    try {
      // Send OTP first — account is created only after verification
      await registrationService.sendOTP(formData.email.trim(), 'register');
      setOtpSentTo(formData.email.trim());
      setShowOTP(true);
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to send OTP. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerify = async () => {
    if (otpValue.length !== 6) {
      setSuccessMessage('');
      setErrors({ general: 'Please enter a valid 6-digit OTP' });
      requestAnimationFrame(() => {
        document
          .getElementById('register-field-otp')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }

    setIsLoading(true);
    clearFeedback();

    try {
      await registrationService.verifyOTP(otpValue, formData.email.trim(), 'register');

      registrationService.savePendingRegistration({
        fullName: formData.fullName,
        email: formData.email.trim(),
        phone: formData.phone ? formatIndianPhone(formData.phone) : undefined,
        password: formData.password,
        role: role as 'farmer' | 'trader' | 'warehouse' | 'transporter',
        termsAccepted: formData.termsAccepted,
        emailVerified: true,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country,
      });

      router.push(`/register/${role}/kyc`);
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Invalid OTP. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!formData.email.trim()) return;

    setIsLoading(true);
    setErrors({});
    try {
      await registrationService.sendOTP(formData.email.trim(), 'register');
      setOtpValue('');
      setSuccessMessage('A new verification code has been sent to your email.');
    } catch (error) {
      setSuccessMessage('');
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to resend OTP',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (value: string) => {
    setOtpValue(value);
    if (value.length === 6 && errors.general) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.general;
        return next;
      });
    }
  };

  if (!config) {
    return null;
  }

  if (guestStatus !== 'allowed') {
    return <GuestPageShell />;
  }

  return (
    <div className="min-h-screen bg-[#f9f9f7]">
      <div className="bg-gradient-to-r from-[#0b5d68] to-[#2eb5c2] py-8 pt-24">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center text-white">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">
                {roleIcons[role] ?? 'person_add'}
              </span>
            </div>
            <h1 className="font-headline text-2xl sm:text-3xl font-bold mb-2">{config.title}</h1>
            <p className="text-white/90 text-sm sm:text-base max-w-xl mx-auto">
              {config.description}
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-1 mt-4 text-sm text-white/80 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Change role
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-8">
        <div className="mb-6">
          <ProgressIndicator
            currentStep={showOTP ? 2 : 2}
            totalSteps={3}
            steps={[
              { label: 'Role', status: 'completed' },
              { label: showOTP ? 'Verify' : 'Details', status: 'active' },
              { label: 'KYC', status: 'pending' },
            ]}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
          <TransitionWrapper show={!showOTP} animation="slideIn">
            <div className="mb-6">
              <h2 className="font-headline text-xl font-bold text-[#0b5d68]">
                Create your account
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Fill in your details below. We&apos;ll verify your email before continuing.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <RegistrationFormSection title="Account Information" />

              <RegistrationFormField
                size={FIELD_SIZE}
                fieldId="fullName"
                label="Full Name"
                icon="person"
                error={errors.fullName}
              >
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleFieldChange('fullName', e.target.value)}
                  className={registrationInputClass(errors.fullName, { size: FIELD_SIZE })}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </RegistrationFormField>

              <RegistrationFormField
                size={FIELD_SIZE}
                fieldId="email"
                label="Email Address"
                icon="email"
                error={errors.email}
              >
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className={registrationInputClass(errors.email, { size: FIELD_SIZE })}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </RegistrationFormField>

              <RegistrationFormField
                size={FIELD_SIZE}
                fieldId="phone"
                label="Phone Number"
                icon="phone"
                prefix="+91"
                optional
                error={errors.phone}
                hint="10-digit phone number"
              >
                <input
                  type="tel"
                  inputMode="numeric"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={registrationInputClass(errors.phone, {
                    withPrefix: true,
                    size: FIELD_SIZE,
                  })}
                  placeholder="0000000000"
                  autoComplete="tel-national"
                  maxLength={10}
                />
              </RegistrationFormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <RegistrationFormField
                  size={FIELD_SIZE}
                  fieldId="password"
                  label="Password"
                  icon="lock"
                  error={errors.password}
                  hint="Minimum 8 characters"
                >
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleFieldChange('password', e.target.value)}
                    className={registrationInputClass(errors.password, { size: FIELD_SIZE })}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    required
                  />
                </RegistrationFormField>

                <RegistrationFormField
                  size={FIELD_SIZE}
                  fieldId="confirmPassword"
                  label="Confirm Password"
                  icon="lock"
                  error={errors.confirmPassword}
                >
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                    className={registrationInputClass(errors.confirmPassword, { size: FIELD_SIZE })}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    required
                  />
                </RegistrationFormField>
              </div>

              <RegistrationFormSection title="Address Details" />

              <RegistrationFormField
                size={FIELD_SIZE}
                fieldId="street"
                label="Street Address"
                icon="home"
                error={errors.street}
              >
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => handleFieldChange('street', e.target.value)}
                  className={registrationInputClass(errors.street, { size: FIELD_SIZE })}
                  placeholder="Enter your street address"
                  required
                />
              </RegistrationFormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <RegistrationFormField
                  size={FIELD_SIZE}
                  fieldId="city"
                  label="City / Area"
                  icon="location_city"
                  error={errors.city}
                >
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                    className={registrationInputClass(errors.city, { size: FIELD_SIZE })}
                    placeholder="Enter city or area"
                    required
                  />
                </RegistrationFormField>

                <RegistrationFormField
                  size={FIELD_SIZE}
                  fieldId="state"
                  label="State"
                  icon="map"
                  error={errors.state}
                >
                  <select
                    value={formData.state}
                    onChange={(e) => handleFieldChange('state', e.target.value)}
                    className={registrationSelectClass(errors.state, { size: FIELD_SIZE })}
                    required
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((stateName) => (
                      <option key={stateName} value={stateName}>
                        {stateName}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="material-symbols-outlined text-base text-gray-400">
                      expand_more
                    </span>
                  </div>
                </RegistrationFormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <RegistrationFormField
                  size={FIELD_SIZE}
                  fieldId="pincode"
                  label="Pincode"
                  icon="pin_drop"
                  error={errors.pincode}
                >
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handleFieldChange('pincode', e.target.value)}
                    className={registrationInputClass(errors.pincode, { size: FIELD_SIZE })}
                    placeholder="Enter pincode"
                    required
                  />
                </RegistrationFormField>

                <RegistrationFormField
                  size={FIELD_SIZE}
                  fieldId="country"
                  label="Country"
                  icon="public"
                  error={errors.country}
                >
                  <input
                    type="text"
                    value={formData.country}
                    readOnly
                    className={`${registrationInputClass(errors.country, { size: FIELD_SIZE })} bg-gray-50 text-gray-500 cursor-not-allowed`}
                    required
                  />
                </RegistrationFormField>
              </div>

              <div
                id="register-field-termsAccepted"
                className="flex items-start rounded-lg border border-gray-100 bg-gray-50 p-4 scroll-mt-28"
              >
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.termsAccepted}
                  onChange={(e) => handleFieldChange('termsAccepted', e.target.checked)}
                  className="mt-0.5 h-5 w-5 text-[#0b5d68] focus:ring-[#2eb5c2] border-[#2eb5c2] rounded"
                />
                <label htmlFor="terms" className="ml-3 text-sm text-gray-700 leading-relaxed">
                  I accept the{' '}
                  <Link
                    href="/terms"
                    className="text-[#2eb5c2] font-semibold hover:text-[#0b5d68] transition-colors"
                  >
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/privacy"
                    className="text-[#2eb5c2] font-semibold hover:text-[#0b5d68] transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.termsAccepted && (
                <p className="text-xs text-red-600">{errors.termsAccepted}</p>
              )}

              {errors.general && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <span className="material-symbols-outlined text-base shrink-0">error</span>
                  {errors.general}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading}
                className="w-full"
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
            <div className="space-y-5">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#a5dce4]/40">
                  <span className="material-symbols-outlined text-2xl text-[#0b5d68]">
                    mark_email_unread
                  </span>
                </div>
                <h3 className="font-headline text-lg font-bold text-[#0b5d68] mb-1">
                  Verify your email
                </h3>
                <p className="text-sm text-gray-500">
                  Enter the 6-digit code sent to{' '}
                  <span className="font-medium text-gray-700">{otpSentTo}</span>
                </p>
              </div>

              <div id="register-field-otp" className="scroll-mt-28">
                <OtpInput
                  value={otpValue}
                  onChange={handleOtpChange}
                  disabled={isLoading}
                  size="lg"
                />
              </div>

              {successMessage && (
                <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                  <span className="material-symbols-outlined text-base shrink-0">check_circle</span>
                  {successMessage}
                </div>
              )}

              {errors.general && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <span className="material-symbols-outlined text-base shrink-0">error</span>
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

              <div className="flex flex-col items-center gap-2 text-sm">
                <button
                  type="button"
                  className="text-[#0b5d68] font-medium hover:underline disabled:opacity-50"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                >
                  Resend code
                </button>
                <button
                  type="button"
                  className="text-gray-500 hover:underline"
                  onClick={() => {
                    setShowOTP(false);
                    clearFeedback();
                  }}
                >
                  Edit registration details
                </button>
              </div>
            </div>
          </TransitionWrapper>

          <div className="mt-6 border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-[#0b5d68] hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
