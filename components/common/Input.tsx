import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = ({ 
  label, 
  error, 
  helperText, 
  className = '', 
  ...props 
}: InputProps) => {
  const inputClasses = `block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#0b5d68] focus:border-[#0b5d68] sm:text-sm ${
    error ? 'border-[#d55b39]' : 'border-[#e0e0e0]'
  } ${className}`

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#0b5d68] mb-1">
          {label}
        </label>
      )}
      <input className={inputClasses} {...props} />
      {error && (
        <p className="mt-1 text-sm text-[#d55b39]">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-[#666666]">{helperText}</p>
      )}
    </div>
  )
}

export default Input
