'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import GuestPageShell from '@/components/layout/GuestPageShell'

export default function ForgotPasswordPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login?mode=forgot')
  }, [router])

  return <GuestPageShell />
}
