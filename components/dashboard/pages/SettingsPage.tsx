'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getCurrentUser } from '@/lib/auth'
import { useDashboardSearch } from '@/hooks/useSearchFilter'

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
  const [activeSection, setActiveSection] = useState<'profile' | 'kyc' | 'addresses' | 'notifications'>('profile')
  const [addresses] = useState<Address[]>(mockAddresses)

  // Filter addresses based on search query using the new search hook
  const filteredAddresses = useDashboardSearch(addresses, searchQuery)
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    farmName: '',
    description: ''
  })

  // Load user data on component mount
  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      setCurrentUser(user)
      setProfileData({
        name: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        farmName: '',
        description: ''
      })
    }
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {[
              { id: 'profile', label: 'Profile', icon: 'person' },
              { id: 'kyc', label: 'KYC Verification', icon: 'verified_user' },
              { id: 'addresses', label: 'Addresses', icon: 'location_on' },
              { id: 'notifications', label: 'Notifications', icon: 'notifications' }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                  activeSection === section.id
                    ? 'bg-primary text-white'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Icon name={section.icon} />
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-surface-container">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtcgwObeViinNN0eoLWBwhhJ0GVy6Fb60CZTEB5YNI9pPmfAICJtPgUEEKnAbb3n2vXd1zqAcFit9CLpUsa3S_i_JOx0T9DWXhXN9TeO1Az3stLuWy2_epMdPJEC3zhh_jj9QrCdBgn7OOGXkqNmDrhyMO2LHUyI68R7llG227nMDW7_F1zLxQI3ovhA_b7OBauTXjBFpfPLxNwi2dZPNdcpQpv02nyAZVOvV1biO76xCpZDutKelMLqXbYGI2GjOHJyJZe8kskPo"
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <Button variant="primary" size="sm">Change Photo</Button>
                    <p className="text-xs text-stone-500 mt-1">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">
                      Farm Name
                    </label>
                    <input
                      type="text"
                      value={profileData.farmName}
                      onChange={(e) => setProfileData({...profileData, farmName: e.target.value})}
                      className="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Farm Description
                  </label>
                  <textarea
                    value={profileData.description}
                    onChange={(e) => setProfileData({...profileData, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="primary">Save Changes</Button>
                  <Button variant="ghost">Cancel</Button>
                </div>
              </CardContent>
            </Card>
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

                <Button variant="primary">Upload Additional Documents</Button>
              </CardContent>
            </Card>
          )}

          {/* Addresses Section */}
          {activeSection === 'addresses' && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Address Management</CardTitle>
                  <Button variant="primary" size="sm">
                    <Icon name="add" className="mr-2" />
                    Add Address
                  </Button>
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
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        setting.enabled ? 'bg-primary' : 'bg-stone-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          setting.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
