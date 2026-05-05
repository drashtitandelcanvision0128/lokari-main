'use client'

import { useState } from 'react'
import { AdminUser } from '@/types/admin'
import { mockAdminUsers } from '@/data/adminMock'
import { AdminDetailDrawer } from '../AdminDetailDrawer'

interface UsersPanelProps {
  searchQuery?: string
}

export function UsersPanel({ searchQuery = '' }: UsersPanelProps) {
  const [users] = useState<AdminUser[]>(mockAdminUsers)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const handleViewUser = (user: AdminUser) => {
    setSelectedUser(user)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedUser(null)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-primary-fixed text-primary'
      case 'pending':
        return 'bg-secondary-fixed text-secondary'
      case 'suspended':
        return 'bg-error-container text-error'
      case 'banned':
        return 'bg-error text-on-error'
      default:
        return 'bg-surface-container text-on-surface-variant'
    }
  }

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-tertiary-fixed text-tertiary'
      case 'pending':
        return 'bg-secondary-fixed text-secondary'
      case 'unverified':
        return 'bg-outline-variant text-on-surface-variant'
      default:
        return 'bg-surface-container text-on-surface-variant'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return formatDate(dateString)
  }

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-on-surface-variant">Role:</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-1.5 text-sm border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Roles</option>
              <option value="farmer">Farmer</option>
              <option value="trader">Trader</option>
              <option value="warehouse">Warehouse</option>
              <option value="transporter">Transporter</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-on-surface-variant">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 text-sm border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
          </div>

          <div className="ml-auto text-sm text-on-surface-variant">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-outline-variant">
              <thead className="bg-surface-container">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                    Verification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-surface-container-lowest divide-y divide-outline-variant">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-container transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-surface-container-high flex items-center justify-center">
                            <span className="text-sm font-medium text-on-surface-variant">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-on-surface">{user.name}</div>
                          <div className="text-sm text-on-surface-variant">{user.email}</div>
                          <div className="text-xs text-on-surface-variant">{user.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-container text-on-surface capitalize">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVerificationColor(user.verificationStatus)}`}>
                        {user.verificationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-on-surface">
                        <div>{formatLastActive(user.lastActive)}</div>
                        <div className="text-xs text-on-surface-variant">Joined {formatDate(user.joinedAt)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-on-surface">
                        <div>{user.listings} listings</div>
                        <div className="text-xs text-on-surface-variant">{user.orders} orders</div>
                        <div className="text-xs font-medium text-primary">{user.revenue}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewUser(user)}
                          className="text-primary hover:text-primary-container transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </button>
                        <button className="text-on-surface hover:text-on-surface-variant transition-colors cursor-pointer">
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button className="text-secondary hover:text-secondary-container transition-colors cursor-pointer">
                          <span className="material-symbols-outlined text-lg">mail</span>
                        </button>
                        <button className="text-error hover:text-error-container transition-colors cursor-pointer">
                          <span className="material-symbols-outlined text-lg">block</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-2xl text-on-surface-variant">search_off</span>
            </div>
            <h3 className="text-lg font-medium text-on-surface mb-2">No users found</h3>
            <p className="text-on-surface-variant">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Admin Detail Drawer */}
      <AdminDetailDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        data={selectedUser}
        type="user"
      />
    </>
  )
}
