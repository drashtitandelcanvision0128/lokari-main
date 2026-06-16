'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    // const handleSubmit = async (e: React.FormEvent) => {
    const handleSubmit = async (e: any) => {
        e.preventDefault()

        setError('')
        setIsLoading(true)

        try {
            // API call will go here later

            await new Promise((resolve) => setTimeout(resolve, 1000))

            setSuccess(true)
        } catch (err) {
            setError('Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-[#f9f9f7] flex items-center justify-center p-8">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-green-600 text-3xl">
                            mark_email_read
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold text-[#0b5d68] mb-3">
                        Check Your Email
                    </h1>

                    <p className="text-gray-600 mb-6">
                        If an account exists with that email address, we've sent a password
                        reset link.
                    </p>

                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-[#2eb5c2] hover:text-[#0b5d68] font-medium"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f9f9f7] flex items-center justify-center p-8">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2] rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-white text-3xl">
                            lock_reset
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold text-[#0b5d68] mb-2">
                        Forgot Password
                    </h1>

                    <p className="text-gray-600">
                        Enter your email and we'll send you a password reset link.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-semibold text-[#0b5d68] mb-2"
                        >
                            Email Address
                        </label>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-[#2eb5c2]">
                                    email
                                </span>
                            </div>

                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full pl-10 pr-4 py-3 border border-[#2eb5c2] rounded-xl bg-white text-[#0b5d68] placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2eb5c2]"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-[#e89151] to-[#d55b39] hover:from-[#d67a3a] hover:to-[#c54a28] text-white px-6 py-4 rounded-xl font-bold transition-all duration-200 disabled:opacity-50"
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <Link
                        href="/login"
                        className="text-sm text-[#2eb5c2] hover:text-[#0b5d68] font-medium"
                    >
                        Back to Login
                    </Link>
                </div>

            </div>
        </div>
    )
}