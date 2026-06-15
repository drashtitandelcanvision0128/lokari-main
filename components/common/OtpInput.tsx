'use client'

import { useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from 'react'

const OTP_LENGTH = 6

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  autoFocus?: boolean
}

export default function OtpInput({
  value,
  onChange,
  error,
  disabled = false,
  autoFocus = true,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? '')

  useEffect(() => {
    if (autoFocus && !disabled) {
      inputRefs.current[0]?.focus()
    }
  }, [autoFocus, disabled])

  const updateValue = (index: number, digit: string) => {
    const next = digits.slice()
    next[index] = digit
    onChange(next.join('').slice(0, OTP_LENGTH))
  }

  const handleChange = (index: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, '')
    if (!cleaned) {
      updateValue(index, '')
      return
    }

    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, OTP_LENGTH)
      onChange(pasted)
      const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1)
      inputRefs.current[focusIndex]?.focus()
      return
    }

    updateValue(index, cleaned)
    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
      updateValue(index - 1, '')
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (pasted) {
      onChange(pasted)
      const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1)
      inputRefs.current[focusIndex]?.focus()
    }
  }

  return (
    <div className="w-full">
      <div className="flex justify-center gap-2 sm:gap-3">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={digit}
            disabled={disabled}
            aria-label={`OTP digit ${index + 1}`}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={`h-12 w-10 sm:h-14 sm:w-12 rounded-lg border text-center text-lg font-semibold font-mono shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#0b5d68] focus:border-[#0b5d68] disabled:cursor-not-allowed disabled:opacity-50 ${
              error ? 'border-[#d55b39]' : 'border-[#e0e0e0]'
            }`}
          />
        ))}
      </div>
      {error && <p className="mt-2 text-center text-sm text-[#d55b39]">{error}</p>}
    </div>
  )
}
