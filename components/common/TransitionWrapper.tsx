import React from 'react'

interface TransitionWrapperProps {
  children: React.ReactNode
  show: boolean
  animation?: 'slideIn' | 'fadeIn' | 'scaleIn' | 'slideUp'
  duration?: number
  className?: string
}

const TransitionWrapper = ({ 
  children, 
  show, 
  animation = 'slideIn', 
  duration = 300,
  className = '' 
}: TransitionWrapperProps) => {
  const getAnimationClasses = () => {
    const baseClasses = 'transition-all ease-in-out'
    
    switch (animation) {
      case 'slideIn':
        return `${baseClasses} transform ${show ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`
      case 'fadeIn':
        return `${baseClasses} ${show ? 'opacity-100' : 'opacity-0'}`
      case 'scaleIn':
        return `${baseClasses} transform ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`
      case 'slideUp':
        return `${baseClasses} transform ${show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`
      default:
        return baseClasses
    }
  }

  return (
    <div
      className={`${getAnimationClasses()} ${className}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {show ? children : null}
    </div>
  )
}

export default TransitionWrapper
