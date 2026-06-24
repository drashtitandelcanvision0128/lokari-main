'use client'

import { useState } from 'react'
import { updateMyProfile } from '@/lib/profile'
import { patchLocalUser } from '@/lib/auth/session'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { setUser as setReduxUser, selectCurrentUser } from '@/lib/store/slices/authSlice'

interface Props {
  user: any
  setUser: any
}

type FieldErrors = { name?: string; phone?: string }

const inputCls = (err?: boolean, readOnly?: boolean) =>
  `w-full rounded border px-3 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
    readOnly
      ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400 focus:ring-transparent'
      : err
        ? 'border-red-400 bg-white text-gray-700 focus:border-red-400 focus:ring-red-400/20'
        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 focus:border-[#2eb5c2] focus:ring-[#2eb5c2]/30'
  }`

function validate(user: any): FieldErrors {
  const errs: FieldErrors = {}
  const name = (user.name || '').trim()
  if (!name) {
    errs.name = 'Full name is required.'
  } else if (name.length < 2) {
    errs.name = 'Name must be at least 2 characters.'
  } else if (name.length > 80) {
    errs.name = 'Name must be 80 characters or fewer.'
  } else if (!/^[\p{L}\s'.,-]+$/u.test(name)) {
    errs.name = 'Name contains invalid characters.'
  }

  const rawPhone = (user.phone || '').replace(/^\+91\s?/, '').trim()
  if (rawPhone && !/^\d{10}$/.test(rawPhone)) {
    errs.phone = 'Enter a valid 10-digit mobile number.'
  }

  return errs
}

export default function BusinessInformationCard({ user, setUser }: Props) {
  const dispatch     = useAppDispatch()
  const reduxUser    = useAppSelector(selectCurrentUser)

  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [fieldErrs,  setFieldErrs]  = useState<FieldErrors>({})

  const handleChange = (key: string, value: string) => {
    setUser((prev: any) => ({ ...prev, [key]: value }))
    setSaved(false)
    // Clear per-field error on edit
    if (key in fieldErrs) setFieldErrs((e) => ({ ...e, [key]: undefined }))
  }

  const handleSave = async () => {
    const errs = validate(user)
    if (Object.keys(errs).length) {
      setFieldErrs(errs)
      return
    }
    setFieldErrs({})
    setSaving(true)
    setError(null)
    const result = await updateMyProfile({
      name:  user.name.trim(),
      phone: user.phone || undefined,
      bio:   user.bio,
    })
    setSaving(false)
    if (result.success) {
      const trimmedName = user.name.trim()
      // Sync to localStorage
      patchLocalUser({ fullName: trimmedName, phone: user.phone })
      // Sync to Redux so Navbar (and all other consumers) update immediately
      if (reduxUser) {
        dispatch(setReduxUser({ ...reduxUser, fullName: trimmedName, phone: user.phone }))
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      setError(result.message ?? 'Save failed')
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div>
          <h3 className="font-headline text-base font-bold text-[#0b5d68]">Business Information</h3>
          <p className="mt-0.5 text-xs text-gray-400">Update your profile details</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded bg-gradient-to-r from-[#0b5d68] to-[#2eb5c2] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-60"
        >
          {saving ? (
            <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />Saving…</>
          ) : saved ? (
            <><span className="material-symbols-outlined text-[0.9rem]">check_circle</span>Saved!</>
          ) : (
            <><span className="material-symbols-outlined text-[0.9rem]">save</span>Save Changes</>
          )}
        </button>
      </div>

      <div className="space-y-5 p-6">

        {/* ── Personal info ─────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2">

          {/* Full Name */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Full Name <span className="text-red-500">*</span></label>
            <input type="text" value={user.name || ''} placeholder="Your full name"
              onChange={(e) => handleChange('name', e.target.value)} className={inputCls(!!fieldErrs.name)} />
            {fieldErrs.name && <p className="mt-1 text-[11px] text-red-500">{fieldErrs.name}</p>}
          </div>

          {/* Email — read only */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Email Address</label>
            <div className="relative">
              <input type="email" value={user.email || ''} readOnly className={inputCls(false, true)} />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[0.85rem] text-gray-300">lock</span>
            </div>
          </div>

          {/* Phone with +91 prefix */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Phone Number</label>
            <div className={`flex overflow-hidden rounded border bg-white transition-all focus-within:ring-2 ${
              fieldErrs.phone
                ? 'border-red-400 focus-within:border-red-400 focus-within:ring-red-400/20'
                : 'border-gray-200 hover:border-gray-300 focus-within:border-[#2eb5c2] focus-within:ring-[#2eb5c2]/30'
            }`}>
              <span className="flex items-center border-r border-gray-200 bg-gray-50 px-3 text-xs font-semibold text-gray-500 select-none">
                +91
              </span>
              <input
                type="tel"
                value={(user.phone || '').replace(/^\+91\s?/, '')}
                placeholder="00000 00000"
                maxLength={10}
                onChange={(e) => handleChange('phone', `+91 ${e.target.value}`)}
                className="flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-700 focus:outline-none"
              />
            </div>
            {fieldErrs.phone && <p className="mt-1 text-[11px] text-red-500">{fieldErrs.phone}</p>}
          </div>

          {/* User Type — read only */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">User Type</label>
            <div className="relative">
              <input type="text" value={user.businessType || ''} readOnly className={inputCls(false, true)} />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[0.85rem] text-gray-300">lock</span>
            </div>
          </div>
        </div>

        {/* ── Bio ───────────────────────────────────────────────────── */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Bio / Description</label>
          <textarea
            rows={4}
            value={user.bio || ''}
            placeholder="Tell buyers a bit about your business..."
            onChange={(e) => handleChange('bio', e.target.value)}
            className="w-full rounded border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 transition-all hover:border-gray-300 focus:border-[#2eb5c2] focus:outline-none focus:ring-2 focus:ring-[#2eb5c2]/30"
          />
        </div>

        {/* Feedback */}
        {error && (
          <div className="flex items-center gap-2 rounded bg-red-50 px-4 py-2.5 text-sm text-red-700">
            <span className="material-symbols-outlined text-[1rem]">error</span>{error}
          </div>
        )}
        {saved && (
          <div className="flex items-center gap-2 rounded bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
            <span className="material-symbols-outlined text-[1rem]">check_circle</span>
            Profile updated successfully!
          </div>
        )}
      </div>
    </div>
  )
}
