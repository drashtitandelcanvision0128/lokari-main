'use client'

import { useRef, useState, useEffect } from 'react'
import { fetchMyProfile, uploadAvatar, deleteAvatar, updateMyProfile, type ProfileAddress } from '@/lib/profile'
import { patchLocalUser } from '@/lib/auth/session'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { setUser as setReduxUser, selectCurrentUser } from '@/lib/store/slices/authSlice'

interface ProfileCardProps {
  user: any
}

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  farmer:      { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  trader:      { bg: 'bg-blue-100',    text: 'text-blue-700'    },
  transporter: { bg: 'bg-amber-100',   text: 'text-amber-700'   },
  warehouse:   { bg: 'bg-purple-100',  text: 'text-purple-700'  },
  admin:       { bg: 'bg-rose-100',    text: 'text-rose-700'    },
}

const CACHE_KEY = 'lokhari_profile_avatar'

export default function ProfileCard({ user }: ProfileCardProps) {
  const dispatch   = useAppDispatch()
  const reduxUser  = useAppSelector(selectCurrentUser)
  const fileRef    = useRef<HTMLInputElement>(null)

  // savedAvatar — what's currently stored in DB / cache
  const [savedAvatar, setSavedAvatar] = useState<string | null>(null)
  // pendingFile — file selected but not yet saved
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  // pendingPreview — object URL for local preview of pending file
  const [pendingPreview, setPendingPreview] = useState<string | null>(null)

  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Address modal
  const [addrOpen,   setAddrOpen]   = useState(false)
  const [address,    setAddress]    = useState<ProfileAddress>({ street: '', city: '', state: '', pincode: '', country: 'India' })
  const [addrSaving, setAddrSaving] = useState(false)
  const [addrError,  setAddrError]  = useState<string | null>(null)
  const [addrSaved,  setAddrSaved]  = useState(false)
  const [addrErrs,   setAddrErrs]   = useState<Partial<Record<keyof ProfileAddress, string>>>({})

  const role = user.role?.toLowerCase() ?? 'farmer'
  const roleStyle = ROLE_COLORS[role] ?? { bg: 'bg-gray-100', text: 'text-gray-600' }
  const initial = (user.name || 'U').charAt(0).toUpperCase()

  // The avatar shown in UI — pending preview takes precedence
  const displayAvatar = pendingPreview ?? savedAvatar

  /** Sync avatar URL to local state, localStorage cache, and Redux (for Navbar) */
  const syncAvatar = (url: string | null) => {
    setSavedAvatar(url)
    if (url) {
      localStorage.setItem(CACHE_KEY, url)
    } else {
      localStorage.removeItem(CACHE_KEY)
    }
    if (reduxUser) {
      dispatch(setReduxUser({ ...reduxUser, avatar: url ?? undefined }))
    }
  }

  // Load from cache then DB
  useEffect(() => {
    const cached = typeof window !== 'undefined' ? localStorage.getItem(CACHE_KEY) : null
    if (cached) setSavedAvatar(cached)

    fetchMyProfile().then((profile) => {
      if (profile?.avatarUrl) {
        syncAvatar(profile.avatarUrl)
      }
      if (profile?.address) {
        const addrDefaults = { street: '', city: '', state: '', pincode: '', country: 'India' }
        setAddress({ ...addrDefaults, ...profile.address })
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cleanup object URL when pending preview changes
  useEffect(() => {
    return () => {
      if (pendingPreview) URL.revokeObjectURL(pendingPreview)
    }
  }, [pendingPreview])

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setError(null)
    setSaved(false)

    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2 MB.')
      return
    }

    // Revoke previous pending preview
    if (pendingPreview) URL.revokeObjectURL(pendingPreview)

    setPendingFile(file)
    setPendingPreview(URL.createObjectURL(file))
  }

  const handleSavePhoto = async () => {
    if (!pendingFile) return
    setUploading(true)
    setError(null)

    const result = await uploadAvatar(pendingFile)
    setUploading(false)

    if (result.success && result.avatarUrl) {
      syncAvatar(result.avatarUrl)
      // Clear pending state
      if (pendingPreview) URL.revokeObjectURL(pendingPreview)
      setPendingFile(null)
      setPendingPreview(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      setError(result.message ?? 'Upload failed')
    }
  }

  const handleCancelPending = () => {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview)
    setPendingFile(null)
    setPendingPreview(null)
    setError(null)
  }

  const validateAddress = (): Partial<Record<keyof ProfileAddress, string>> => {
    const errs: Partial<Record<keyof ProfileAddress, string>> = {}
    const street  = (address.street  || '').trim()
    const city    = (address.city    || '').trim()
    const state   = (address.state   || '').trim()
    const pincode = (address.pincode || '').trim()

    if (!street)               errs.street  = 'Street address is required.'
    else if (street.length < 5) errs.street  = 'Enter a more complete street address.'
    else if (street.length > 200) errs.street = 'Street address is too long.'

    if (!city)                 errs.city    = 'City is required.'
    else if (city.length < 2)  errs.city    = 'Enter a valid city name.'

    if (!state)                errs.state   = 'Please select a state.'

    if (!pincode)              errs.pincode = 'Pincode is required.'
    else if (!/^\d{6}$/.test(pincode)) errs.pincode = 'Pincode must be exactly 6 digits.'

    return errs
  }

  const handleSaveAddress = async () => {
    const errs = validateAddress()
    if (Object.keys(errs).length) {
      setAddrErrs(errs)
      return
    }
    setAddrErrs({})
    setAddrSaving(true)
    setAddrError(null)
    const result = await updateMyProfile({ address })
    setAddrSaving(false)
    if (result.success) {
      patchLocalUser({
        street:  address.street,
        city:    address.city,
        state:   address.state,
        pincode: address.pincode,
        country: address.country ?? 'India',
      })
      setAddrSaved(true)
      setTimeout(() => { setAddrSaved(false); setAddrOpen(false) }, 1200)
    } else {
      setAddrError(result.message ?? 'Save failed')
    }
  }

  const handleRemoveAvatar = async () => {
    syncAvatar(null)
    await deleteAvatar()
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-[#0b5d68] via-[#1a8a96] to-[#2eb5c2] px-5 pb-5 pt-5">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        {/* Avatar row */}
        <div className="relative flex items-start justify-between">
          {/* Avatar with camera overlay */}
          <div className="group relative">
            <div className="h-20 w-20 overflow-hidden rounded-2xl border-4 border-white/30 shadow-xl">
              {displayAvatar ? (
                <img src={displayAvatar} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/20">
                  <span className="text-3xl font-bold text-white">{initial}</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
              title="Select photo"
            >
              <span className="material-symbols-outlined text-[1.1rem] text-white">photo_camera</span>
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />

          {/* Top-right action */}
          {pendingFile ? (
            /* Pending: Save + Cancel inside header */
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelPending}
                className="rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] font-medium text-white/80 transition-colors hover:bg-white/20 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePhoto}
                disabled={uploading}
                className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#0b5d68] shadow-sm transition-colors hover:bg-white/90 disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#0b5d68]/30 border-t-[#0b5d68]" />
                    Saving…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[0.9rem]">save</span>
                    Save Photo
                  </>
                )}
              </button>
            </div>
          ) : savedAvatar ? (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/70 transition-colors hover:bg-red-500/80 hover:text-white"
            >
              Remove
            </button>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/70 transition-colors hover:bg-white/20 hover:text-white"
            >
              Upload photo
            </button>
          )}
        </div>

        {/* Identity */}
        <div className="mt-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-headline text-lg font-bold text-white">{user.name || '—'}</h2>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${roleStyle.bg} ${roleStyle.text}`}>
              {role}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-white/70">{user.email || '—'}</p>
        </div>
      </div>


      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="px-5 pb-5 pt-4">
        {error && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-600">{error}</p>
        )}
        {saved && (
          <p className="mb-3 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
            <span className="material-symbols-outlined text-[0.9rem]">check_circle</span>
            Photo saved successfully!
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: user.listings ?? 0,  label: 'Listings',  color: 'text-[#2eb5c2]' },
            { value: user.completed ?? 0, label: 'Completed', color: 'text-[#e89151]' },
            {
              value: user.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
                : '—',
              label: 'Since',
              color: 'text-[#d55b39]',
            },
          ].map(({ value, label, color }) => (
            <div key={label} className="flex flex-col items-center rounded-xl bg-gray-50 px-1 py-3">
              <span className={`text-center text-sm font-bold leading-tight ${color}`}>{value}</span>
              <span className="mt-1 text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</span>
            </div>
          ))}
        </div>

        {/* Info rows */}
        <div className="mt-4 space-y-2">
          {/* Location row with edit button */}
          <div className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-3 py-2.5">
            <span className="material-symbols-outlined text-[1rem] text-[#2eb5c2]">location_on</span>
            <span className="text-xs text-gray-500">Location</span>
            <span className="flex-1 truncate text-right text-xs font-medium text-gray-700">
              {address.city && address.state
                ? `${address.city}, ${address.state}`
                : user.location || 'Not added'}
            </span>
            <button
              type="button"
              onClick={() => setAddrOpen(true)}
              className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-[#0b5d68]/10 hover:text-[#0b5d68]"
              title="Edit address"
            >
              <span className="material-symbols-outlined text-[0.9rem]">edit</span>
            </button>
          </div>

          {/* Member since */}
          <div className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-3 py-2.5">
            <span className="material-symbols-outlined text-[1rem] text-[#2eb5c2]">calendar_today</span>
            <span className="text-xs text-gray-500">Member since</span>
            <span className="ml-auto text-xs font-medium text-gray-700">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
            </span>
          </div>
        </div>

        {/* Change photo shortcut */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-2 text-xs font-medium text-gray-500 transition-colors hover:border-[#2eb5c2] hover:text-[#2eb5c2]"
        >
          <span className="material-symbols-outlined text-[1rem]">upload</span>
          {savedAvatar ? 'Change photo' : 'Upload profile photo'}
        </button>
      </div>

      {/* ── Address Modal ───────────────────────────────────────────── */}
      {addrOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setAddrOpen(false)} />

          {/* Dialog */}
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[1.1rem] text-[#2eb5c2]">home_pin</span>
                <h3 className="font-headline text-base font-bold text-[#0b5d68]">Update Address</h3>
              </div>
              <button type="button" onClick={() => setAddrOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <span className="material-symbols-outlined text-[1rem]">close</span>
              </button>
            </div>

            {/* Fields */}
            <div className="space-y-4 p-5">
              {/* Street */}
              <AddrField label="Street Address" required error={addrErrs.street}>
                <input type="text" value={address.street} placeholder="House no., street name, area"
                  onChange={(e) => { setAddress(a => ({ ...a, street: e.target.value })); setAddrErrs(x => ({ ...x, street: undefined })) }}
                  className={addrFieldCls(!!addrErrs.street)} />
              </AddrField>

              <div className="grid grid-cols-2 gap-3">
                {/* City */}
                <AddrField label="City / Area" required error={addrErrs.city}>
                  <input type="text" value={address.city} placeholder="City"
                    onChange={(e) => { setAddress(a => ({ ...a, city: e.target.value })); setAddrErrs(x => ({ ...x, city: undefined })) }}
                    className={addrFieldCls(!!addrErrs.city)} />
                </AddrField>

                {/* State */}
                <AddrField label="State" required error={addrErrs.state}>
                  <select value={address.state}
                    onChange={(e) => { setAddress(a => ({ ...a, state: e.target.value })); setAddrErrs(x => ({ ...x, state: undefined })) }}
                    className={`${addrFieldCls(!!addrErrs.state)} appearance-none`}>
                    <option value="">Select</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </AddrField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Pincode */}
                <AddrField label="Pincode" required error={addrErrs.pincode}>
                  <input type="text" value={address.pincode} placeholder="6-digit" maxLength={6}
                    onChange={(e) => { setAddress(a => ({ ...a, pincode: e.target.value.replace(/\D/g, '') })); setAddrErrs(x => ({ ...x, pincode: undefined })) }}
                    className={addrFieldCls(!!addrErrs.pincode)} />
                </AddrField>

                {/* Country — locked */}
                <AddrField label="Country">
                  <input type="text" value="India" readOnly
                    className="w-full cursor-not-allowed rounded border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-400" />
                </AddrField>
              </div>

              {addrError && (
                <p className="rounded bg-red-50 px-3 py-2 text-xs text-red-600">{addrError}</p>
              )}
              {addrSaved && (
                <p className="flex items-center gap-1.5 rounded bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                  <span className="material-symbols-outlined text-[0.9rem]">check_circle</span>
                  Address saved!
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
              <button type="button" onClick={() => setAddrOpen(false)}
                className="rounded border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button type="button" onClick={handleSaveAddress} disabled={addrSaving}
                className="inline-flex items-center gap-1.5 rounded bg-gradient-to-r from-[#0b5d68] to-[#2eb5c2] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">
                {addrSaving ? (
                  <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />Saving…</>
                ) : (
                  <><span className="material-symbols-outlined text-[0.9rem]">save</span>Save Address</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Modal helpers ─────────────────────────────────────────────────────────────
const addrFieldCls = (err?: boolean) =>
  `w-full rounded border px-3 py-2 text-sm text-gray-700 transition-all focus:outline-none focus:ring-2 ${
    err
      ? 'border-red-400 hover:border-red-400 focus:border-red-400 focus:ring-red-400/20'
      : 'border-gray-200 hover:border-gray-300 focus:border-[#2eb5c2] focus:ring-[#2eb5c2]/30'
  }`

const INDIAN_STATES = [
  'Andaman and Nicobar Islands','Andhra Pradesh','Arunachal Pradesh','Assam','Bihar',
  'Chandigarh','Chhattisgarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jammu and Kashmir','Jharkhand','Karnataka',
  'Kerala','Ladakh','Lakshadweep','Madhya Pradesh','Maharashtra','Manipur','Meghalaya',
  'Mizoram','Nagaland','Odisha','Puducherry','Punjab','Rajasthan','Sikkim','Tamil Nadu',
  'Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
]

function AddrField({ label, required, error, children }: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold text-gray-500">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  )
}
