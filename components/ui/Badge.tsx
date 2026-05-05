import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors'
  
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-accent/10 text-accent px-2 py-1 text-[10px] rounded uppercase font-bold tracking-tighter',
    secondary: 'bg-orange/10 text-orange text-[10px] rounded uppercase font-bold tracking-tighter',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red/10 text-red'
  }
  
  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  }

  return (
    <span className={cn(baseClasses, variants[variant], sizes[size], className)}>
      {children}
    </span>
  )
}
