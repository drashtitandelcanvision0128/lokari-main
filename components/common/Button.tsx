import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}: ButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'bg-[#e89151] text-white hover:bg-[#d67a3a] focus:ring-[#e89151]',
    secondary: 'bg-[#0b5d68] text-white hover:bg-[#094851] focus:ring-[#0b5d68]',
    accent: 'bg-[#2eb5c2] text-white hover:bg-[#2699a3] focus:ring-[#2eb5c2]',
    danger: 'bg-[#d55b39] text-white hover:bg-[#c44928] focus:ring-[#d55b39]',
    outline: 'border border-[#0b5d68] text-[#0b5d68] bg-[#f9f9f7] hover:bg-[#0b5d68] hover:text-white focus:ring-[#0b5d68]',
    ghost: 'text-[#0b5d68] hover:bg-[#f0f0f0] focus:ring-[#0b5d68]'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}

export default Button
