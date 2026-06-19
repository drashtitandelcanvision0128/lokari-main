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
  // Farmer specific
  farmName?: string;
  farmLocation?: string;
  // Trader specific
  companyName?: string;
  businessType?: string;
  // Warehouse specific
  warehouseName?: string;
  warehouseLocation?: string;
  capacity?: string;
  // Transporter specific
  vehicleType?: string;
  serviceArea?: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;

  farmName?: string;
  farmLocation?: string;

  companyName?: string;
  businessType?: string;

  warehouseName?: string;
  warehouseLocation?: string;
  capacity?: string;

  vehicleType?: string;
  serviceArea?: string;
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
    case 'farmName':
      if (userRole === 'farmer' && !data.farmName?.trim()) return 'Farm name is required';
      return undefined;
    case 'farmLocation':
      if (userRole === 'farmer' && !data.farmLocation?.trim()) return 'Farm location is required';
      return undefined;
    case 'companyName':
      if (userRole === 'trader' && !data.companyName?.trim()) return 'Company name is required';
      return undefined;
    case 'businessType':
      if (userRole === 'trader' && !data.businessType) return 'Please select a business type';
      return undefined;
    case 'warehouseName':
      if (userRole === 'warehouse' && !data.warehouseName?.trim()) {
        return 'Warehouse name is required';
      }
      return undefined;
    case 'warehouseLocation':
      if (userRole === 'warehouse' && !data.warehouseLocation?.trim()) {
        return 'Warehouse location is required';
      }
      return undefined;
    case 'capacity':
      if (userRole === 'warehouse' && !data.capacity?.trim()) return 'Capacity is required';
      return undefined;
    case 'vehicleType':
      if (userRole === 'transporter' && !data.vehicleType) return 'Please select a vehicle type';
      return undefined;
    case 'serviceArea':
      if (userRole === 'transporter' && !data.serviceArea?.trim())
        return 'Service area is required';
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
    ...(userRole === 'farmer' ? (['farmName', 'farmLocation'] as ValidatableField[]) : []),
    ...(userRole === 'trader' ? (['companyName', 'businessType'] as ValidatableField[]) : []),
    ...(userRole === 'warehouse'
      ? (['warehouseName', 'warehouseLocation', 'capacity'] as ValidatableField[])
      : []),
    ...(userRole === 'transporter' ? (['vehicleType', 'serviceArea'] as ValidatableField[]) : []),
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
    farmName: '',
    farmLocation: '',
    companyName: '',
    businessType: '',
    warehouseName: '',
    warehouseLocation: '',
    capacity: '',
    vehicleType: '',
    serviceArea: '',
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

              <RegistrationFormSection title={roleSectionTitles[role] ?? 'Additional Details'} />

              {/* Role-specific fields */}
              {role === 'farmer' && (
                <>
                  <RegistrationFormField
                    size={FIELD_SIZE}
                    fieldId="farmName"
                    label="Farm Name"
                    icon="agriculture"
                    error={errors.farmName}
                  >
                    <input
                      type="text"
                      value={formData.farmName || ''}
                      onChange={(e) => handleFieldChange('farmName', e.target.value)}
                      className={registrationInputClass(errors.farmName, { size: FIELD_SIZE })}
                      placeholder="e.g., Green Valley Farms"
                      required
                    />
                  </RegistrationFormField>
                  <RegistrationFormField
                    size={FIELD_SIZE}
                    fieldId="farmLocation"
                    label="Farm Location"
                    icon="location_on"
                    error={errors.farmLocation}
                  >
                    <input
                      type="text"
                      value={formData.farmLocation || ''}
                      onChange={(e) => handleFieldChange('farmLocation', e.target.value)}
                      className={registrationInputClass(errors.farmLocation, { size: FIELD_SIZE })}
                      placeholder="e.g., Nashik, Maharashtra"
                      required
                    />
                  </RegistrationFormField>
                </>
              )}

              {role === 'trader' && (
                <>
                  <RegistrationFormField
                    size={FIELD_SIZE}
                    fieldId="companyName"
                    label="Company Name"
                    icon="business"
                    error={errors.companyName}
                  >
                    <input
                      type="text"
                      value={formData.companyName || ''}
                      onChange={(e) => handleFieldChange('companyName', e.target.value)}
                      className={registrationInputClass(errors.companyName, { size: FIELD_SIZE })}
                      placeholder="Enter your company or trading name"
                      required
                    />
                  </RegistrationFormField>
                  <RegistrationFormField
                    size={FIELD_SIZE}
                    fieldId="businessType"
                    label="Business Type"
                    icon="work"
                    error={errors.businessType}
                  >
                    <select
                      value={formData.businessType || ''}
                      onChange={(e) => handleFieldChange('businessType', e.target.value)}
                      className={registrationSelectClass(errors.businessType, { size: FIELD_SIZE })}
                      required
                    >
                      <option value="">Select business type</option>
                      <option value="individual">Individual Trader</option>
                      <option value="partnership">Partnership</option>
                      <option value="corporation">Corporation</option>
                      <option value="cooperative">Cooperative</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="material-symbols-outlined text-base text-gray-400">
                        expand_more
                      </span>
                    </div>
                  </RegistrationFormField>
                </>
              )}

              {role === 'warehouse' && (
                <>
                  <RegistrationFormField
                    size={FIELD_SIZE}
                    fieldId="warehouseName"
                    label="Warehouse Name"
                    icon="warehouse"
                    error={errors.warehouseName}
                  >
                    <input
                      value={formData.warehouseName || ''}
                      onChange={(e) => handleFieldChange('warehouseName', e.target.value)}
                      className={registrationInputClass(errors.warehouseName, { size: FIELD_SIZE })}
                      placeholder="Enter warehouse name"
                      required
                    />
                  </RegistrationFormField>
                  <RegistrationFormField
                    size={FIELD_SIZE}
                    fieldId="warehouseLocation"
                    label="Warehouse Location"
                    icon="location_on"
                    error={errors.warehouseLocation}
                  >
                    <input
                      value={formData.warehouseLocation || ''}
                      onChange={(e) => handleFieldChange('warehouseLocation', e.target.value)}
                      className={registrationInputClass(errors.warehouseLocation, {
                        size: FIELD_SIZE,
                      })}
                      placeholder="e.g., Indore, Madhya Pradesh"
                      required
                    />
                  </RegistrationFormField>
                  <RegistrationFormField
                    size={FIELD_SIZE}
                    fieldId="capacity"
                    label="Storage Capacity"
                    icon="inventory"
                    error={errors.capacity}
                    hint="Total storage available in metric tons"
                  >
                    <input
                      value={formData.capacity || ''}
                      onChange={(e) => handleFieldChange('capacity', e.target.value)}
                      className={registrationInputClass(errors.capacity, { size: FIELD_SIZE })}
                      placeholder="e.g., 500 MT"
                      required
                    />
                  </RegistrationFormField>
                </>
              )}

              {role === 'transporter' && (
                <>
                  <RegistrationFormField
                    size={FIELD_SIZE}
                    fieldId="vehicleType"
                    label="Vehicle Type"
                    icon="local_shipping"
                    error={errors.vehicleType}
                  >
                    <select
                      value={formData.vehicleType || ''}
                      onChange={(e) => handleFieldChange('vehicleType', e.target.value)}
                      className={registrationSelectClass(errors.vehicleType, { size: FIELD_SIZE })}
                    >
                      <option value="">Select vehicle type</option>
                      <option value="truck">Truck</option>
                      <option value="refrigerated_truck">Refrigerated Truck</option>
                      <option value="flatbed">Flatbed</option>
                      <option value="container">Container Truck</option>
                      <option value="van">Van</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="material-symbols-outlined text-base text-gray-400">
                        expand_more
                      </span>
                    </div>
                  </RegistrationFormField>
                  <RegistrationFormField
                    size={FIELD_SIZE}
                    fieldId="serviceArea"
                    label="Service Area"
                    icon="route"
                    error={errors.serviceArea}
                  >
                    <input
                      type="text"
                      value={formData.serviceArea || ''}
                      onChange={(e) => handleFieldChange('serviceArea', e.target.value)}
                      className={registrationInputClass(errors.serviceArea, { size: FIELD_SIZE })}
                      placeholder="e.g., Mumbai to Pune"
                      required
                    />
                  </RegistrationFormField>
                </>
              )}

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
