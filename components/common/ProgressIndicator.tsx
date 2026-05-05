import React from 'react'

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  steps: { label: string; status?: 'completed' | 'active' | 'pending' }[]
  className?: string
}

const ProgressIndicator = ({ 
  currentStep, 
  totalSteps, 
  steps, 
  className = '' 
}: ProgressIndicatorProps) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-center space-x-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isActive = stepNumber === currentStep
          const isPending = stepNumber > currentStep
          
          const status = step.status || (isCompleted ? 'completed' : isActive ? 'active' : 'pending')
          
          return (
            <React.Fragment key={index}>
              <div className="flex items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    transition-all duration-300 ease-in-out transform
                    ${status === 'completed' 
                      ? 'bg-[#0b5d68] text-white scale-105' 
                      : status === 'active'
                      ? 'bg-[#0b5d68] text-white ring-4 ring-[#a5dce4] scale-110'
                      : 'bg-[#e0e0e0] text-[#666666]'
                    }
                  `}
                >
                  {status === 'completed' ? (
                    <span className="material-symbols-outlined text-sm">check</span>
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  className={`
                    ml-2 text-sm font-medium transition-colors duration-300
                    ${status === 'completed' || status === 'active' 
                      ? 'text-[#0b5d68]' 
                      : 'text-[#666666]'
                    }
                  `}
                >
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div
                  className={`
                    w-12 h-0.5 transition-all duration-500 ease-in-out
                    ${status === 'completed' ? 'bg-[#0b5d68]' : 'bg-[#e0e0e0]'}
                  `}
                  style={{
                    transform: status === 'completed' ? 'scaleX(1)' : 'scaleX(0.3)',
                    transformOrigin: 'left'
                  }}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default ProgressIndicator
