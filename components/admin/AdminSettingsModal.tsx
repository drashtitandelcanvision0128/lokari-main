'use client'

import { useState, useEffect, useRef } from 'react'

interface AdminProfile {
  username: string
  email: string
}

interface AdminSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  initialUsername: string
  initialEmail: string
  onSave?: (profile: AdminProfile) => void
}

type ActiveTab = 'profile' | 'security'

interface FormState {
  username: string
  email: string
}

interface PasswordState {
  current: string
  next: string
  confirm: string
}

interface FieldError {
  username?: string
  email?: string
  current?: string
  next?: string
  confirm?: string
}

export function AdminSettingsModal({
  isOpen,
  onClose,
  initialUsername,
  initialEmail,
  onSave,
}: AdminSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile')

  // Profile form
  const [form, setForm] = useState<FormState>({
    username: initialUsername,
    email: initialEmail,
  })
  const [profileErrors, setProfileErrors] = useState<FieldError>({})
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)

  // Password form
  const [passwords, setPasswords] = useState<PasswordState>({ current: '', next: '', confirm: '' })
  const [showPasswords, setShowPasswords] = useState({ current: false, next: false, confirm: false })
  const [passwordErrors, setPasswordErrors] = useState<FieldError>({})
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const overlayRef = useRef<HTMLDivElement>(null)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setForm({ username: initialUsername, email: initialEmail })
      setPasswords({ current: '', next: '', confirm: '' })
      setProfileErrors({})
      setPasswordErrors({})
      setProfileSuccess(false)
      setPasswordSuccess(false)
      setActiveTab('profile')
    }
  }, [isOpen, initialUsername, initialEmail])

  // Close on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  // ── Validation helpers ──────────────────────────────────────────────────────

  const validateProfile = (): boolean => {
    const errs: FieldError = {}
    if (!form.username.trim()) {
      errs.username = 'Username is required.'
    } else if (form.username.trim().length < 3) {
      errs.username = 'Username must be at least 3 characters.'
    }
    if (!form.email.trim()) {
      errs.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Enter a valid email address.'
    }
    setProfileErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validatePasswords = (): boolean => {
    const errs: FieldError = {}
    if (!passwords.current) errs.current = 'Current password is required.'
    if (!passwords.next) {
      errs.next = 'New password is required.'
    } else if (passwords.next.length < 8) {
      errs.next = 'Password must be at least 8 characters.'
    } else if (!/[A-Z]/.test(passwords.next)) {
      errs.next = 'Include at least one uppercase letter.'
    } else if (!/[0-9]/.test(passwords.next)) {
      errs.next = 'Include at least one number.'
    }
    if (!passwords.confirm) {
      errs.confirm = 'Please confirm your new password.'
    } else if (passwords.next !== passwords.confirm) {
      errs.confirm = 'Passwords do not match.'
    }
    setPasswordErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleProfileSave = async () => {
    if (!validateProfile()) return
    setProfileSaving(true)
    // Simulate API call
    await new Promise(r => setTimeout(r, 900))
    setProfileSaving(false)
    setProfileSuccess(true)
    onSave?.({ username: form.username.trim(), email: form.email.trim() })
    setTimeout(() => setProfileSuccess(false), 3000)
  }

  const handlePasswordSave = async () => {
    if (!validatePasswords()) return
    setPasswordSaving(true)
    await new Promise(r => setTimeout(r, 900))
    setPasswordSaving(false)
    setPasswordSuccess(true)
    setPasswords({ current: '', next: '', confirm: '' })
    setTimeout(() => setPasswordSuccess(false), 3000)
  }

  const toggleShow = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  // ── Password strength meter ──────────────────────────────────────────────────

  const getPasswordStrength = (pwd: string): { label: string; width: string; color: string } => {
    if (!pwd) return { label: '', width: '0%', color: '' }
    let score = 0
    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    if (score <= 1) return { label: 'Weak', width: '25%', color: 'bg-error' }
    if (score === 2) return { label: 'Fair', width: '50%', color: 'bg-[#e89151]' }
    if (score === 3) return { label: 'Good', width: '75%', color: 'bg-[#2eb5c2]' }
    return { label: 'Strong', width: '100%', color: 'bg-[#0b5d68]' }
  }

  const strength = getPasswordStrength(passwords.next)

  if (!isOpen) return null

  // ── UI ───────────────────────────────────────────────────────────────────────

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(11,93,104,0.35)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-surface shadow-2xl border border-outline overflow-hidden"
        style={{ animation: 'settingsModalIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both' }}
        role="dialog"
        aria-modal="true"
        aria-label="Admin Settings"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline bg-surface-container">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-white">admin_panel_settings</span>
            </div>
            <div>
              <h2 className="font-headline font-bold text-on-surface text-base leading-tight">Admin Settings</h2>
              <p className="text-xs text-on-surface-variant">Manage your account credentials</p>
            </div>
          </div>
          <button
            id="admin-settings-close"
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-outline bg-surface-container">
          {(['profile', 'security'] as ActiveTab[]).map((tab) => {
            const isActive = activeTab === tab
            const icons = { profile: 'manage_accounts', security: 'lock' }
            const labels = { profile: 'Profile', security: 'Security' }
            return (
              <button
                key={tab}
                id={`admin-settings-tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium transition-all duration-200 border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-primary text-primary bg-surface'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{icons[tab]}</span>
                {labels[tab]}
              </button>
            )
          })}
        </div>

        {/* ── Body ── */}
        <div className="p-6 space-y-5 bg-surface">

          {/* ──────── PROFILE TAB ──────── */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Avatar section */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container border border-outline-variant">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="text-white text-xl font-bold font-headline">
                    {form.username.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-on-surface text-sm">{form.username || 'Admin User'}</p>
                  <p className="text-xs text-on-surface-variant">{form.email || 'admin@lokhari.com'}</p>
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-semibold uppercase tracking-wide">
                    <span className="material-symbols-outlined text-[12px]">shield</span>
                    Super Admin
                  </span>
                </div>
              </div>

              {/* Username */}
              <div>
                <label htmlFor="admin-settings-username" className="block text-sm font-medium text-on-surface mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-on-surface-variant">
                    person
                  </span>
                  <input
                    id="admin-settings-username"
                    type="text"
                    value={form.username}
                    onChange={(e) => {
                      setForm(f => ({ ...f, username: e.target.value }))
                      if (profileErrors.username) setProfileErrors(pe => ({ ...pe, username: undefined }))
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm bg-surface text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 transition-colors ${
                      profileErrors.username
                        ? 'border-error focus:ring-error/30'
                        : 'border-outline focus:ring-primary/30 focus:border-primary'
                    }`}
                    placeholder="Enter username"
                  />
                </div>
                {profileErrors.username && (
                  <p className="mt-1 text-xs text-error flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {profileErrors.username}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="admin-settings-email" className="block text-sm font-medium text-on-surface mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-on-surface-variant">
                    mail
                  </span>
                  <input
                    id="admin-settings-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                      setForm(f => ({ ...f, email: e.target.value }))
                      if (profileErrors.email) setProfileErrors(pe => ({ ...pe, email: undefined }))
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm bg-surface text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 transition-colors ${
                      profileErrors.email
                        ? 'border-error focus:ring-error/30'
                        : 'border-outline focus:ring-primary/30 focus:border-primary'
                    }`}
                    placeholder="Enter email address"
                  />
                </div>
                {profileErrors.email && (
                  <p className="mt-1 text-xs text-error flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {profileErrors.email}
                  </p>
                )}
              </div>

              {/* Success banner */}
              {profileSuccess && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-primary-fixed text-primary text-sm font-medium border border-primary/20">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Profile updated successfully!
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  id="admin-settings-profile-cancel"
                  onClick={() => {
                    setForm({ username: initialUsername, email: initialEmail })
                    setProfileErrors({})
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer border border-outline"
                >
                  Reset
                </button>
                <button
                  id="admin-settings-profile-save"
                  onClick={handleProfileSave}
                  disabled={profileSaving}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-[#0a4e58] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >
                  {profileSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">save</span>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ──────── SECURITY / PASSWORD TAB ──────── */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              {/* Info banner */}
              <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-primary-fixed border border-primary/20 text-sm text-primary">
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">info</span>
                <span>Choose a strong password with at least 8 characters, one uppercase letter, and one number.</span>
              </div>

              {/* Current password */}
              <div>
                <label htmlFor="admin-settings-current-password" className="block text-sm font-medium text-on-surface mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-on-surface-variant">lock</span>
                  <input
                    id="admin-settings-current-password"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwords.current}
                    onChange={(e) => {
                      setPasswords(p => ({ ...p, current: e.target.value }))
                      if (passwordErrors.current) setPasswordErrors(pe => ({ ...pe, current: undefined }))
                    }}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm bg-surface text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 transition-colors ${
                      passwordErrors.current
                        ? 'border-error focus:ring-error/30'
                        : 'border-outline focus:ring-primary/30 focus:border-primary'
                    }`}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShow('current')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined text-[18px]">{showPasswords.current ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {passwordErrors.current && (
                  <p className="mt-1 text-xs text-error flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {passwordErrors.current}
                  </p>
                )}
              </div>

              {/* New password */}
              <div>
                <label htmlFor="admin-settings-new-password" className="block text-sm font-medium text-on-surface mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-on-surface-variant">key</span>
                  <input
                    id="admin-settings-new-password"
                    type={showPasswords.next ? 'text' : 'password'}
                    value={passwords.next}
                    onChange={(e) => {
                      setPasswords(p => ({ ...p, next: e.target.value }))
                      if (passwordErrors.next) setPasswordErrors(pe => ({ ...pe, next: undefined }))
                    }}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm bg-surface text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 transition-colors ${
                      passwordErrors.next
                        ? 'border-error focus:ring-error/30'
                        : 'border-outline focus:ring-primary/30 focus:border-primary'
                    }`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShow('next')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined text-[18px]">{showPasswords.next ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {passwordErrors.next && (
                  <p className="mt-1 text-xs text-error flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {passwordErrors.next}
                  </p>
                )}
                {/* Strength meter */}
                {passwords.next && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 w-full rounded-full bg-surface-container-highest overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                        style={{ width: strength.width }}
                      />
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      Strength: <span className="font-semibold text-on-surface">{strength.label}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label htmlFor="admin-settings-confirm-password" className="block text-sm font-medium text-on-surface mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-on-surface-variant">lock_reset</span>
                  <input
                    id="admin-settings-confirm-password"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwords.confirm}
                    onChange={(e) => {
                      setPasswords(p => ({ ...p, confirm: e.target.value }))
                      if (passwordErrors.confirm) setPasswordErrors(pe => ({ ...pe, confirm: undefined }))
                    }}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm bg-surface text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 transition-colors ${
                      passwordErrors.confirm
                        ? 'border-error focus:ring-error/30'
                        : passwords.confirm && passwords.next === passwords.confirm
                          ? 'border-[#0b5d68] focus:ring-primary/30'
                          : 'border-outline focus:ring-primary/30 focus:border-primary'
                    }`}
                    placeholder="Re-enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShow('confirm')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined text-[18px]">{showPasswords.confirm ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {passwordErrors.confirm && (
                  <p className="mt-1 text-xs text-error flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {passwordErrors.confirm}
                  </p>
                )}
                {passwords.confirm && passwords.next === passwords.confirm && !passwordErrors.confirm && (
                  <p className="mt-1 text-xs text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    Passwords match
                  </p>
                )}
              </div>

              {/* Success banner */}
              {passwordSuccess && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-primary-fixed text-primary text-sm font-medium border border-primary/20">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Password changed successfully!
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  id="admin-settings-password-cancel"
                  onClick={() => {
                    setPasswords({ current: '', next: '', confirm: '' })
                    setPasswordErrors({})
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer border border-outline"
                >
                  Clear
                </button>
                <button
                  id="admin-settings-password-save"
                  onClick={handlePasswordSave}
                  disabled={passwordSaving}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-[#0a4e58] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >
                  {passwordSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Updating…
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer note ── */}
        <div className="px-6 py-3 border-t border-outline bg-surface-container text-xs text-on-surface-variant flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px] text-primary">security</span>
          Changes are securely stored and take effect immediately.
        </div>
      </div>

      <style>{`
        @keyframes settingsModalIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
