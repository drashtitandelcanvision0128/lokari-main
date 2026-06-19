'use client'

import type { ReactNode } from 'react'

export type FormFieldSize = 'md' | 'lg'

interface RegistrationFormFieldProps {
  label: string
  icon: string
  fieldId?: string
  prefix?: string
  size?: FormFieldSize
  error?: string
  hint?: string
  optional?: boolean
  children: ReactNode
}

const fieldTextSize = 'text-[0.875rem]'
const fieldRadius = 'rounded-[0.3125rem]'

const fieldSizeStyles = {
  md: {
    label: fieldTextSize,
    icon: 'text-base pl-3',
    prefix: `left-10 ${fieldTextSize}`,
  },
  lg: {
    label: fieldTextSize,
    icon: 'text-lg pl-4',
    prefix: `left-12 ${fieldTextSize}`,
  },
} as const

export function RegistrationFormSection({ title }: { title: string }) {
  return (
    <div className="pt-1">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-[#0b5d68]/80 border-b border-gray-100 pb-2 mb-4">
        {title}
      </h2>
    </div>
  )
}

export default function RegistrationFormField({
  label,
  icon,
  fieldId,
  prefix,
  size = 'md',
  error,
  hint,
  optional,
  children,
}: RegistrationFormFieldProps) {
  const styles = fieldSizeStyles[size]

  return (
    <div id={fieldId ? `register-field-${fieldId}` : undefined} className="space-y-1.5 scroll-mt-28">
      <label className={`block font-medium text-[#0b5d68] ${styles.label}`}>
        {label}
        {optional && <span className="ml-1 font-normal text-gray-500">(optional)</span>}
      </label>
      <div className="relative">
        <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center ${styles.icon}`}>
          <span className={`material-symbols-outlined text-[#2eb5c2] ${size === 'lg' ? 'text-lg' : 'text-base'}`}>
            {icon}
          </span>
        </div>
        {prefix && (
          <span
            className={`pointer-events-none absolute inset-y-0 flex items-center border-r border-gray-200 pr-2 font-medium text-gray-600 ${styles.prefix}`}
          >
            {prefix}
          </span>
        )}
        {children}
      </div>
      {error && <p className={`text-red-600 ${size === 'lg' ? 'text-sm' : 'text-xs'}`}>{error}</p>}
      {hint && !error && <p className={`text-gray-500 ${size === 'lg' ? 'text-sm' : 'text-xs'}`}>{hint}</p>}
    </div>
  )
}

export function registrationInputClass(
  error?: string,
  options?: { withPrefix?: boolean; size?: FormFieldSize }
) {
  const size = options?.size ?? 'md'
  const isLg = size === 'lg'
  const paddingLeft = options?.withPrefix
    ? isLg
      ? 'pl-[6.5rem]'
      : 'pl-[5.25rem]'
    : isLg
      ? 'pl-12'
      : 'pl-10'
  const sizing = isLg ? `py-3 pr-4 ${fieldTextSize}` : `py-2 pr-3 ${fieldTextSize}`

  return `w-full ${fieldRadius} border bg-white ${paddingLeft} ${sizing} text-gray-900 placeholder:text-gray-400 transition-all focus:outline-none focus:ring-2 ${
    error
      ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30'
      : 'border-gray-200 focus:border-[#2eb5c2] focus:ring-[#2eb5c2]/30'
  }`
}

export function registrationSelectClass(error?: string, options?: { size?: FormFieldSize }) {
  const isLg = (options?.size ?? 'md') === 'lg'
  return `${registrationInputClass(error, options)} appearance-none ${isLg ? 'pr-10' : 'pr-9'}`
}

export const INDIAN_PHONE_PREFIX = '+91'
export const INDIAN_PHONE_DIGITS_REGEX = /^\d{10}$/

export function formatIndianPhone(digits: string): string {
  return `${INDIAN_PHONE_PREFIX}${digits}`
}

export function normalizeIndianPhoneInput(value: string): string {
  let digits = value.replace(/\D/g, '')

  // User pasted full number including country code (91XXXXXXXXXX)
  if (digits.startsWith('91') && digits.length > 10) {
    digits = digits.slice(2)
  }

  // Strip leading 0(s) — e.g. 09876543210 → 9876543210
  digits = digits.replace(/^0+/, '')

  return digits.slice(0, 10)
}

export function getIndianPhoneValidationError(digits: string): string | undefined {
  const phone = digits.trim()
  if (!phone) return undefined

  if (!INDIAN_PHONE_DIGITS_REGEX.test(phone)) {
    return 'Enter a valid 10-digit phone number'
  }

  return undefined
}
