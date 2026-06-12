'use client'

import Link from 'next/link'
import { useState } from 'react'
import { registrationService } from '@/lib/registration'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { setUser } from '@/lib/store/slices/authSlice'

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Debug: Check what users are stored
      const allUsers = registrationService.getAllUsers()
      console.log('All registered users:', allUsers)
      console.log('Attempting login with:', { email, password })
      
      // Validate credentials against registered users
      const user = await registrationService.authenticateUser(email, password)
      
      if (user) {
        dispatch(setUser(user))
        console.log('Login successful:', user)
        
        // Redirect to user's dashboard
        const dashboardUrl = registrationService.getDashboardUrl(user.role)
        window.location.href = dashboardUrl
      } else {
        // Invalid credentials
        console.log('Authentication failed')
        setError('Invalid email or password')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError(error instanceof Error ? error.message : 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9f7] flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-center text-white max-w-md">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl">agriculture</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">Lokhari</h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Connecting farmers, traders, and logistics providers in a transparent agricultural marketplace
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold mb-1">10K+</div>
              <div className="text-sm text-white/80">Active Users</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold mb-1">50K+</div>
              <div className="text-sm text-white/80">Transactions</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold mb-1">24/7</div>
              <div className="text-sm text-white/80">Support</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Login Form */}
      <div className="flex-1 lg:flex-none lg:w-1/2 bg-[#f9f9f7] flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="lg:hidden w-16 h-16 bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-3xl text-white">agriculture</span>
            </div>
            <h1 className="font-headline text-3xl font-bold text-[#0b5d68] mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your Lokhari account</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#0b5d68] mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-[#2eb5c2]">email</span>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[#2eb5c2] rounded-xl bg-white text-[#0b5d68] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#0b5d68] mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-[#2eb5c2]">lock</span>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[#2eb5c2] rounded-xl bg-white text-[#0b5d68] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">error</span>
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#e89151] to-[#d55b39] hover:from-[#d67a3a] hover:to-[#c54a28] text-white px-6 py-4 rounded-xl font-headline font-bold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In
                  <span className="material-symbols-outlined">arrow_forward</span>
                </span>
              )}
            </button>
          </form>
          
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-[#2eb5c2] font-semibold hover:text-[#0b5d68] transition-colors">
                Choose your role to get started
              </Link>
            </p>
          </div>
          
          <div className="text-center mt-4">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">home</span>
              Back to home
            </Link>
          </div>
          
          {/* Debug Section - Hidden in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 text-center">
              <button 
                onClick={() => setShowDebug(!showDebug)}
                className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
              >
                {showDebug ? 'Hide' : 'Show'} Debug Info
              </button>
              {showDebug && (
                <div className="mt-2 p-3 bg-gray-900 text-green-400 rounded-lg text-xs text-left font-mono max-h-40 overflow-auto">
                  <p className="text-yellow-400 mb-2">Stored Users:</p>
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(registrationService.getAllUsers(), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
