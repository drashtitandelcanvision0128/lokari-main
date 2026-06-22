'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getCurrentUser, changePassword } from '@/lib/auth'
import { useDashboardSearch } from '@/hooks/useSearchFilter'
import { useSettings } from '@/lib/context/SettingsContext'
import { useSearchParams } from 'next/navigation'

import ProfileCard from '@/components/profile/ProfileCard'
import BusinessInformationCard from '@/components/profile/BusinessInformationCard'

import { apiUrl } from '@/lib/api'

interface Address {
  id: string
  type: 'farm' | 'warehouse' | 'office'
  name: string
  address: string
  city: string
  country: string
  isDefault: boolean
}

const mockAddresses: Address[] = [
  {
    id: '1',
    type: 'farm',
    name: 'Main Farm Location',
    address: '123 Agriculture Road',
    city: 'Mumbai',
    country: 'India',
    isDefault: true
  },
  {
    id: '2',
    type: 'warehouse',
    name: 'Storage Warehouse',
    address: '456 Industrial Zone',
    city: 'Chennai',
    country: 'India',
    isDefault: false
  }
]

interface SettingsPageProps {
  searchQuery?: string
}

export function SettingsPage({ searchQuery = '' }: SettingsPageProps) {
  // const [activeSection, setActiveSection] = useState<'profile' | 'kyc' | 'addresses' | 'notifications' | 'security'>('profile')
  const searchParams = useSearchParams()
  const { activeSection, setActiveSection } = useSettings()
  const [addresses] = useState<Address[]>(mockAddresses)

  // Filter addresses based on search query using the new search hook
  const filteredAddresses = useDashboardSearch(addresses, searchQuery)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const [profileStats, setProfileStats] = useState({
    listings: 0,
    completed: 0,
    businessLocation: '',
    createdAt: ''
  })

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    businessLocation: '',
    businessType: '',
    bio: ''
  })

  useEffect(() => {
    const section = searchParams.get('section')

    if (
      section === 'profile' ||
      section === 'kyc' ||
      section === 'addresses' ||
      section === 'notifications' ||
      section === 'security'
    ) {
      setActiveSection(section)
    }
  }, [searchParams, setActiveSection])

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [showPasswords, setShowPasswords] = useState({ current: false, next: false, confirm: false })
  const [passwordErrors, setPasswordErrors] = useState<{ current?: string; next?: string; confirm?: string; general?: string }>({})
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)


  const handlePasswordChange = (field: keyof typeof passwords, value: string) => {
    setPasswords(p => ({ ...p, [field]: value }))
    if (passwordErrors[field]) setPasswordErrors(pe => ({ ...pe, [field]: undefined }))
  }

  const toggleShowPassword = (field: keyof typeof showPasswords) => {
    setShowPasswords(p => ({ ...p, [field]: !p[field] }))
  }

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: '', width: '0%', color: '' }
    let score = 0
    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    if (score <= 1) return { label: 'Weak', width: '25%', color: 'bg-red-500' }
    if (score === 2) return { label: 'Fair', width: '50%', color: 'bg-orange-400' }
    if (score === 3) return { label: 'Good', width: '75%', color: 'bg-[#2eb5c2]' }
    return { label: 'Strong', width: '100%', color: 'bg-primary' }
  }

  const validatePasswords = (): boolean => {
    const errs: typeof passwordErrors = {}
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

  const handlePasswordClear = () => {
    setPasswords({ current: '', next: '', confirm: '' })
    setPasswordErrors({})
  }

  const handlePasswordUpdate = async () => {
    if (!validatePasswords()) return
    setPasswordSaving(true)
    setPasswordSuccess(false)

    const result = await changePassword(passwords.current, passwords.next)

    setPasswordSaving(false)
    if (result.success) {
      setPasswordSuccess(true)
      setPasswords({ current: '', next: '', confirm: '' })
      setTimeout(() => setPasswordSuccess(false), 3000)
    } else {
      setPasswordErrors({ general: result.message })
    }
  }

  const passwordStrength = getPasswordStrength(passwords.next)



  // Load user data on component mount
  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      setCurrentUser(user)
      setProfileData({
        name: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        businessLocation: '',
        businessType: user.role || '',
        bio: ''
      })
    }
  }, [])

  useEffect(() => {
    const fetchProfileStats = async () => {
      try {
        const user = getCurrentUser()

        if (!user?.id) return

        const response = await fetch(apiUrl('/listings'))
        const result = await response.json()

        if (result.success) {
          const userListings = result.data.filter(
            (item: any) => item.user_id === user.id
          )

          setProfileData(prev => ({
            ...prev,
            businessLocation: userListings[0]?.listing_location || ''
          }))

          // console.log(
          //   'Business Location:',
          //   userListings[0]?.listing_location
          // )

          setProfileStats({
            listings: userListings.length,

            completed: userListings.filter(
              (item: any) => item.status === 'SOLD'
            ).length,

            businessLocation:
              userListings[0]?.listing_location || '',
            createdAt: userListings[0]?.created_at || ''
          })
        }
      } catch (error) {
        console.error(error)
      }
    }

    fetchProfileStats()
  }, [])

  const kycStatus = {
    level: 'verified',
    documents: ['ID Document', 'Farm Registration', 'Tax Certificate'],
    lastUpdated: '2024-01-10'
  }

  const getKycBadge = (level: string) => {
    const variants = {
      verified: 'success',
      pending: 'warning',
      rejected: 'error'
    } as const

    return (
      <Badge variant={variants[level as keyof typeof variants] || 'default'}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    )
  }

  const getAddressIcon = (type: Address['type']) => {
    const icons = {
      farm: 'agriculture',
      warehouse: 'warehouse',
      office: 'apartment'
    }
    return icons[type]
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">Settings</h1>
          <p className="text-on-surface-variant mt-1">Manage your account settings and preferences</p>
        </div>
      </div>

      {/* <div className="grid grid-cols-1 lg:grid-cols-4 gap-8"> */}
      <div>
        {/* Content */}
        {/* <div className="lg:col-span-3"> */}
        <div>
          {/* Profile Section */}
          {activeSection === 'profile' && (

            <div className="grid lg:grid-cols-3 gap-8">

              <ProfileCard
                user={{
                  ...profileData,
                  role: currentUser?.role,
                  location: currentUser?.location,
                  listings: profileStats.listings,
                  completed: profileStats.completed,
                  createdAt: profileStats.createdAt
                }}
              />


              <div className="lg:col-span-2">

                <BusinessInformationCard

                  user={profileData}

                  setUser={setProfileData}

                />

              </div>


            </div>

          )}

          {/* KYC Section */}
          {activeSection === 'kyc' && (
            <Card>
              <CardHeader>
                <CardTitle>KYC Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-primary">Verification Status</h3>
                    <p className="text-sm text-on-surface-variant mt-1">Last updated: {kycStatus.lastUpdated}</p>
                  </div>
                  {getKycBadge(kycStatus.level)}
                </div>

                <div>
                  <h3 className="font-semibold text-primary mb-4">Submitted Documents</h3>
                  <div className="space-y-3">
                    {kycStatus.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-stone-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Icon name="description" className="text-stone-400" />
                          <span className="font-medium">{doc}</span>
                        </div>
                        <Badge variant="success">Verified</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Benefits of Verification</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Higher trust rating with buyers</li>
                    <li>• Access to premium features</li>
                    <li>• Faster payment processing</li>
                    <li>• Priority customer support</li>
                  </ul>
                </div>

                <button
                  type="button"
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-[#0a4e58] transition-colors cursor-pointer shadow-sm"
                >
                  <Icon name="upload_file" className="text-[16px]" />
                  Upload Additional Documents
                </button>
              </CardContent>
            </Card>
          )}

          {/* Addresses Section */}
          {activeSection === 'addresses' && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Address Management</CardTitle>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-[#0a4e58] transition-colors cursor-pointer shadow-sm"
                  >
                    <Icon name="add" className="text-[16px]" />
                    Add Address
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAddresses.map((address) => (
                    <div key={address.id} className="border border-stone-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                          <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Icon name={getAddressIcon(address.type)} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{address.name}</h3>
                              {address.isDefault && (
                                <Badge variant="primary">Default</Badge>
                              )}
                            </div>
                            <p className="text-stone-600">{address.address}</p>
                            <p className="text-stone-600">{address.city}, {address.country}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Icon name="edit" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Icon name="delete" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { title: 'Bid Notifications', description: 'Get notified when someone bids on your listings', enabled: true },
                  { title: 'Order Updates', description: 'Receive updates about your order status', enabled: true },
                  { title: 'Payment Alerts', description: 'Get notified about payments and refunds', enabled: true },
                  { title: 'Marketing Emails', description: 'Receive promotional offers and updates', enabled: false },
                  { title: 'SMS Notifications', description: 'Get important updates via SMS', enabled: false }
                ].map((setting, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0">
                    <div>
                      <h3 className="font-medium text-primary">{setting.title}</h3>
                      <p className="text-sm text-stone-600">{setting.description}</p>
                    </div>
                    <button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${setting.enabled ? 'bg-primary' : 'bg-stone-200'
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${setting.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}


          {/* Reset Password Section */}
          {activeSection === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Reset Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                <div className="flex items-start gap-3 p-4 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-600">
                  <Icon name="info" className="text-primary mt-0.5" />
                  <span>Choose a strong password with at least 8 characters, one uppercase letter, and one number.</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwords.current}
                      onChange={(e) => handlePasswordChange('current', e.target.value)}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${passwordErrors.current ? 'border-red-400' : 'border-outline'
                        }`}
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowPassword('current')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      <Icon name={showPasswords.current ? 'visibility_off' : 'visibility'} />
                    </button>
                  </div>
                  {passwordErrors.current && <p className="text-red-600 text-xs mt-1">{passwordErrors.current}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.next ? 'text' : 'password'}
                      value={passwords.next}
                      onChange={(e) => handlePasswordChange('next', e.target.value)}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${passwordErrors.next ? 'border-red-400' : 'border-outline'
                        }`}
                      placeholder="Enter your new password"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowPassword('next')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      <Icon name={showPasswords.next ? 'visibility_off' : 'visibility'} />
                    </button>
                  </div>
                  {passwordErrors.next && <p className="text-red-600 text-xs mt-1">{passwordErrors.next}</p>}

                  {passwords.next && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1.5 w-full rounded-full bg-stone-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: passwordStrength.width }}
                        />
                      </div>
                      <p className="text-xs text-stone-500">
                        Strength: <span className="font-semibold text-on-surface">{passwordStrength.label}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwords.confirm}
                      onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${passwordErrors.confirm ? 'border-red-400' : 'border-outline'
                        }`}
                      placeholder="Re-enter your new password"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowPassword('confirm')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      <Icon name={showPasswords.confirm ? 'visibility_off' : 'visibility'} />
                    </button>
                  </div>
                  {passwordErrors.confirm && <p className="text-red-600 text-xs mt-1">{passwordErrors.confirm}</p>}
                  {passwords.confirm && passwords.next === passwords.confirm && !passwordErrors.confirm && (
                    <p className="text-xs text-primary mt-1 flex items-center gap-1">
                      <Icon name="check_circle" className="text-sm" />
                      Passwords match
                    </p>
                  )}
                </div>

                {passwordSuccess && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                    <Icon name="check_circle" />
                    Password updated successfully!
                  </div>
                )}
                {passwordErrors.general && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    <Icon name="error" />
                    {passwordErrors.general}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePasswordUpdate}
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
                        <Icon name="lock_reset" className="text-[16px]" />
                        Update Password
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handlePasswordClear}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer border border-outline"
                  >
                    Clear
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
