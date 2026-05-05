'use client'

import { useState, useEffect } from 'react'
import { dummyUser, dummyListings, dummyTransactions } from '@/lib/dummyData'
import { getCurrentUser } from '@/lib/auth'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [user, setUser] = useState<any>(dummyUser)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const loggedInUser = getCurrentUser()
    if (loggedInUser) {
      setCurrentUser(loggedInUser)
      // Merge current user data with dummy data structure
      setUser({
        ...dummyUser,
        name: loggedInUser.fullName || dummyUser.name,
        email: loggedInUser.email || dummyUser.email,
        role: loggedInUser.role || dummyUser.role,
        location: loggedInUser.location || dummyUser.location,
        joinedAt: loggedInUser.createdAt || dummyUser.joinedAt,
        verified: (loggedInUser as any).verified !== undefined ? (loggedInUser as any).verified : dummyUser.verified,
        rating: (loggedInUser as any).rating || dummyUser.rating,
        listings: (loggedInUser as any).listings || dummyUser.listings,
        transactions: (loggedInUser as any).transactions || dummyUser.transactions,
        phone: (loggedInUser as any).phone || (dummyUser as any).phone,
        bio: (loggedInUser as any).bio || (dummyUser as any).bio
      })
    }
  }, [])

  const myListings = dummyListings.filter(listing => 
    user.listings.includes(listing.id)
  )
  const myTransactions = dummyTransactions.filter(transaction => 
    user.transactions.includes(transaction.id)
  )

  const handleSave = () => {
    setIsEditing(false)
    // Save updated user data to localStorage
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        bio: user.bio,
        phone: user.phone
      }
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      setCurrentUser(updatedUser)
    }
    console.log('Profile updated:', user)
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset to original user data
    if (currentUser) {
      setUser({
        ...dummyUser,
        name: currentUser.fullName || dummyUser.name,
        email: currentUser.email || dummyUser.email,
        role: currentUser.role || dummyUser.role,
        location: currentUser.location || dummyUser.location,
        joinedAt: currentUser.createdAt || dummyUser.joinedAt,
        verified: (currentUser as any).verified !== undefined ? (currentUser as any).verified : dummyUser.verified,
        rating: (currentUser as any).rating || dummyUser.rating,
        listings: (currentUser as any).listings || dummyUser.listings,
        transactions: (currentUser as any).transactions || dummyUser.transactions,
        phone: (currentUser as any).phone || (dummyUser as any).phone,
        bio: (currentUser as any).bio || (dummyUser as any).bio
      })
    } else {
      setUser(dummyUser)
    }
  }

  const completedTransactions = myTransactions.filter(t => t.status === 'completed')
  const averageRating = user.rating

  return (
    <div className="min-h-screen bg-[#f9f9f7]">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#2eb5c2] to-[#0b5d68] text-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Professional Profile</h1>
              <p className="text-emerald-100 text-lg">Manage your agricultural business identity</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-emerald-100">Account Status</p>
                <p className="font-semibold text-white">Premium Member</p>
              </div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{user.name.charAt(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Cover Image */}
              <div className="h-32 bg-gradient-to-r from-[#2eb5c2] to-[#0b5d68]"></div>
              
              {/* Profile Info */}
              <div className="relative px-6 pb-6">
                <div className="absolute -top-12 left-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#2eb5c2] to-[#0b5d68] rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                    <span className="text-3xl font-bold text-white">{user.name.charAt(0)}</span>
                  </div>
                </div>
                
                <div className="pt-14">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-[#0b5d68] mb-1">{user.name}</h2>
                      <p className="text-gray-600 text-sm">{user.email}</p>
                    </div>
                    {user.verified && (
                      <div className="bg-[#2eb5c2]/20 text-[#0b5d68] px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </div>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-6">
                    <div className="flex items-center bg-[#e89151]/10 px-3 py-2 rounded-lg">
                      <span className="text-[#e89151] mr-1">&#9733;</span>
                      <span className="font-bold text-[#0b5d68]">{averageRating}</span>
                      <span className="text-gray-600 ml-1 text-sm">/5.0</span>
                    </div>
                    <span className="text-gray-500 text-sm ml-2">({completedTransactions.length} reviews)</span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-[#2eb5c2]/10 to-[#2eb5c2]/20 p-4 rounded-xl text-center">
                      <p className="text-2xl font-bold text-[#0b5d68]">{myListings.length}</p>
                      <p className="text-xs text-[#2eb5c2] font-medium">Listings</p>
                    </div>
                    <div className="bg-gradient-to-br from-[#e89151]/10 to-[#e89151]/20 p-4 rounded-xl text-center">
                      <p className="text-2xl font-bold text-[#0b5d68]">{completedTransactions.length}</p>
                      <p className="text-xs text-[#e89151] font-medium">Completed</p>
                    </div>
                    <div className="bg-gradient-to-br from-[#d55b39]/10 to-[#d55b39]/20 p-4 rounded-xl text-center">
                      <p className="text-2xl font-bold text-[#0b5d68]">{new Date(user.joinedAt).getFullYear()}</p>
                      <p className="text-xs text-[#d55b39] font-medium">Since</p>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[#f9f9f7] rounded-lg">
                      <span className="text-gray-600 text-sm font-medium">Role</span>
                      <span className="bg-[#2eb5c2]/20 text-[#0b5d68] px-3 py-1 rounded-full text-xs font-semibold capitalize">
                        {user.role}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#f9f9f7] rounded-lg">
                      <span className="text-gray-600 text-sm font-medium">Location</span>
                      <span className="text-[#0b5d68] font-medium text-sm">{user.location}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#f9f9f7] rounded-lg">
                      <span className="text-gray-600 text-sm font-medium">Response Rate</span>
                      <span className="text-[#2eb5c2] font-semibold text-sm">98%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#2eb5c2] to-[#0b5d68] text-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Business Information</h3>
                  {!isEditing ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditing(true)}
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCancel}
                        className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleSave}
                        className="bg-white text-[#0b5d68] hover:bg-[#f9f9f7]"
                      >
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#0b5d68] mb-2">Full Name</label>
                    <Input
                      value={user.name}
                      onChange={(e) => setUser({...user, name: e.target.value})}
                      disabled={!isEditing}
                      className="border-gray-300 focus:border-[#2eb5c2] focus:ring-[#2eb5c2]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0b5d68] mb-2">Email Address</label>
                    <Input
                      type="email"
                      value={user.email}
                      onChange={(e) => setUser({...user, email: e.target.value})}
                      disabled={!isEditing}
                      className="border-gray-300 focus:border-[#2eb5c2] focus:ring-[#2eb5c2]"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#0b5d68] mb-2">Business Location</label>
                    <Input
                      value={user.location}
                      onChange={(e) => setUser({...user, location: e.target.value})}
                      disabled={!isEditing}
                      className="border-gray-300 focus:border-[#2eb5c2] focus:ring-[#2eb5c2]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0b5d68] mb-2">Business Type</label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] font-medium"
                      value={user.role}
                      onChange={(e) => setUser({...user, role: e.target.value as any})}
                      disabled={!isEditing}
                    >
                      <option value="farmer">Farmer</option>
                      <option value="trader">Trader</option>
                      <option value="warehouse">Warehouse</option>
                      <option value="transporter">Transporter</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0b5d68] mb-2">Business Description</label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2eb5c2] focus:border-[#2eb5c2] placeholder-gray-400 resize-none"
                    rows={4}
                    placeholder="Tell us about your agricultural business, expertise, and what makes you unique..."
                    value={user.bio || ''}
                    onChange={(e) => setUser({...user, bio: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            {/* Recent Listings */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#2eb5c2] to-[#0b5d68] text-white px-6 py-4">
                <h3 className="text-xl font-bold">Recent Listings</h3>
              </div>
              <div className="p-6">
                {myListings.length > 0 ? (
                  <div className="space-y-4">
                    {myListings.slice(0, 3).map((listing) => (
                      <div key={listing.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-[#f9f9f7] to-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex-1">
                          <h4 className="font-semibold text-[#0b5d68] mb-1">{listing.title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="font-medium text-[#2eb5c2]">&#8377;{listing.price.toFixed(2)}/{listing.unit}</span>
                            <span>Quantity: {listing.quantity} {listing.unit}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          listing.status === 'active' 
                            ? 'bg-[#2eb5c2]/20 text-[#0b5d68] border border-[#2eb5c2]/30' 
                            : listing.status === 'pending' 
                            ? 'bg-[#e89151]/20 text-[#e89151] border border-[#e89151]/30'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {listing.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-[#0b5d68] mb-2">No Listings Yet</h4>
                    <p className="text-gray-600 mb-4">Start by creating your first agricultural listing</p>
                    <Button className="bg-[#e89151] hover:bg-[#d55b39]">
                      Create Listing
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#e89151] to-[#d55b39] text-white px-6 py-4">
                <h3 className="text-xl font-bold">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex-col hover:bg-[#2eb5c2]/10 hover:border-[#2eb5c2] hover:text-[#0b5d68]">
                    <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <span className="font-medium">Security</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex-col hover:bg-[#2eb5c2]/10 hover:border-[#2eb5c2] hover:text-[#0b5d68]">
                    <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="font-medium">Privacy</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex-col hover:bg-[#2eb5c2]/10 hover:border-[#2eb5c2] hover:text-[#0b5d68]">
                    <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Support</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
