'use client'

import { useState, useEffect } from 'react'
import { AdminUser } from '@/types/admin'
import { mockAdminUsers } from '@/data/adminMock'
import { apiUrl, authHeaders } from '@/lib/api'
import { AdminDetailDrawer } from '../AdminDetailDrawer'
import { useAdminSearch } from '@/hooks/useSearchFilter'
import { EditUserModal } from './EditUserModal'
import { AddUserModal } from './AddUserModal'

import AdminTable from '@/components/admin/common/AdminTable'

interface UsersPanelProps {
  searchQuery?: string
}

export function UsersPanel({ searchQuery = '' }: UsersPanelProps) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Edit modal state
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Add modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')


  //For sorting 
  const [sortField, setSortField] = useState<'name' | 'email' | 'location' | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (field: 'name' | 'email' | 'location') => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }


  // For Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)


  const fetchUsers = async () => {
    try {
      setLoading(true)
      // Use local dev server URL for fetching
      const response = await fetch(apiUrl('/admin/users'), {
        headers: authHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data.data || [])
      } else {
        alert('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      alert('Error connecting to backend')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleViewUser = (user: AdminUser) => {
    setSelectedUser(user)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedUser(null)
  }

  const handleEditUser = (user: AdminUser) => {
    setEditUser(user)
    setIsEditModalOpen(true)
  }

  const handleSaveUser = async (userId: string, updatedData: any) => {
    try {
      const response = await fetch(apiUrl(`/admin/users/${userId}`), {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(updatedData),
      })
      if (response.ok) {
        alert('User updated successfully')
        fetchUsers() // Refresh list
      } else {
        alert('Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error updating user')
    }
  }

  const handleCreateUser = async (userData: any) => {
    try {
      const response = await fetch(apiUrl('/admin/users'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(userData),
      })
      if (response.ok) {
        alert('User created successfully')
        fetchUsers() // Refresh list
      } else {
        const errorData = await response.json()
        alert(`Failed to create user: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Error creating user')
    }
  }

  const handleToggleSuspend = async (userId: string) => {
    try {
      const response = await fetch(apiUrl(`/admin/users/${userId}/suspend`), {
        method: 'PUT',
        headers: authHeaders(),
      })
      if (response.ok) {
        alert('User status updated')
        fetchUsers() // Refresh list

        // Also update the selected user in drawer if it's currently open
        if (selectedUser && selectedUser.id === userId) {
          const updatedData = await response.json()
          setSelectedUser(updatedData.data)
        }
      } else {
        alert('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error updating status')
    }
  }

  const handleToggleVerify = async (userId: string) => {
    try {
      const response = await fetch(apiUrl(`/admin/users/${userId}/verify`), {
        method: 'PUT',
        headers: authHeaders(),
      })
      if (response.ok) {
        alert('User verification updated')
        fetchUsers() // Refresh list

        // Also update the selected user in drawer if it's currently open
        if (selectedUser && selectedUser.id === userId) {
          const updatedData = await response.json()
          setSelectedUser(updatedData.data)
        }
      } else {
        alert('Failed to update verification')
      }
    } catch (error) {
      console.error('Error updating verification:', error)
      alert('Error updating verification')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const response = await fetch(apiUrl(`/admin/users/${userId}`), {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (response.ok) {
        alert('User deleted successfully')
        fetchUsers() // Refresh list
        handleCloseDrawer() // Close the drawer
      } else {
        alert('Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user')
    }
  }

  const handleDrawerAction = (action: string, item: any) => {
    if (action === 'toggle_ban') {
      handleToggleSuspend(item.id)
    } else if (action === 'toggle_verify') {
      handleToggleVerify(item.id)
    } else if (action === 'edit') {
      handleEditUser(item)
    } else if (action === 'delete') {
      handleDeleteUser(item.id)
    }
  }

  const filteredUsers = useAdminSearch(users, searchQuery, (user) => {
    const isNotAdmin = user.role !== 'admin'
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
    return matchesRole && matchesStatus && isNotAdmin
  })

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortField) return 0

    const aValue = (a[sortField] ?? '').toString().toLowerCase()
    const bValue = (b[sortField] ?? '').toString().toLowerCase()

    const comparison = aValue.localeCompare(bValue)

    return sortDirection === 'asc'
      ? comparison
      : -comparison
  })

  // Pagination
  const totalPages = Math.ceil(sortedUsers.length / rowsPerPage)

  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  )

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
        <div className="flex flex-wrap gap-4 items-center justify-between">
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
                {/* <option value="admin">Admin</option> */}
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
                <option value="banned">Banned</option>
              </select>
            </div>

            <div className="text-sm text-on-surface-variant ml-2">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            <span className="
material-symbols-outlined
text-[13px]
text-gray-400
transition-all
duration-200
group-hover:-translate-y-[1px]
group-hover:text-[#0b5d68]
">add</span>
            <span className="text-sm font-medium">Add User</span>
          </button>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          // <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
          <AdminTable>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-outline-variant">
                {/* <thead className="bg-surface-container"> */}
                <thead className="bg-gray-50">
                  <tr>
                    <th className="
px-6
py-3
text-center
text-[13px]
font-semibold
tracking-[0.02em]
text-[#667085]
">
                      <button
                        onClick={() => handleSort('name')}
                        className="
    group
    w-full
    inline-flex
    items-center
    justify-center
    gap-2
    text-[13px]
    font-semibold
    tracking-[0.02em]
    text-[#667085]
    transition-colors
    hover:text-[#0b5d68]
  "
                      >
                        Name

                        <span
                          className="
      material-symbols-outlined
      text-[13px]
      text-gray-400
      transition-all
      duration-200
      group-hover:-translate-y-[1px]
      group-hover:text-[#0b5d68]
    "
                        >
                          {sortField === 'name'
                            ? sortDirection === 'asc'
                              ? 'arrow_upward'
                              : 'arrow_downward'
                            : 'unfold_more'}
                        </span>

                      </button>
                    </th>

                    <th className="
px-6
py-3
text-center
text-[13px]
font-semibold
tracking-[0.02em]
text-[#667085]
">
                      <button
                        onClick={() => handleSort('email')}
                        className="
  group
  w-full
  inline-flex
  items-center
  justify-center
  gap-2
  text-[13px]
  font-semibold
  tracking-[0.02em]
  text-[#667085]
  transition-colors
  hover:text-[#0b5d68]
"
                      >
                        Email
                        <span className="
material-symbols-outlined
text-[13px]
text-gray-400
transition-all
duration-200
group-hover:-translate-y-[1px]
group-hover:text-[#0b5d68]
">
                          {sortField === 'email'
                            ? sortDirection === 'asc'
                              ? 'arrow_upward'
                              : 'arrow_downward'
                            : 'unfold_more'}
                        </span>
                      </button>
                    </th>

                    <th className="
px-6
py-3
text-center
text-[13px]
font-semibold
tracking-[0.02em]
text-[#667085]
">
                      <button
                        onClick={() => handleSort('location')}
                        className="
  group
  w-full
  inline-flex
  items-center
  justify-center
  gap-2
  text-[13px]
  font-semibold
  tracking-[0.02em]
  text-[#667085]
  transition-colors
  hover:text-[#0b5d68]
"
                      >
                        Location
                        <span className="
material-symbols-outlined
text-[13px]
text-gray-400
transition-all
duration-200
group-hover:-translate-y-[1px]
group-hover:text-[#0b5d68]
">
                          {sortField === 'location'
                            ? sortDirection === 'asc'
                              ? 'arrow_upward'
                              : 'arrow_downward'
                            : 'unfold_more'}
                        </span>
                      </button>
                    </th>
                    <th className="
px-6
py-3
text-center
text-[13px]
font-semibold
tracking-[0.02em]
text-[#667085]
">
                      Role
                    </th>
                    <th className="
px-6
py-3
text-center
text-[13px]
font-semibold
tracking-[0.02em]
text-[#667085]
">
                      Status
                    </th>
                    <th className="
px-6
py-3
text-center
text-[13px]
font-semibold
tracking-[0.02em]
text-[#667085]
">
                      Verification
                    </th>
                    <th className="
px-6
py-3
text-center
text-[13px]
font-semibold
tracking-[0.02em]
text-[#667085]
">
                      Last Active
                    </th>
                    <th className="
px-6
py-3
text-center
text-[13px]
font-semibold
tracking-[0.02em]
text-[#667085]
">
                      Actions
                    </th>
                  </tr>
                </thead>
                {/* <tbody className="bg-surface-container-lowest divide-y divide-outline-variant"> */}
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 flex-shrink-0">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <span className="text-sm font-medium">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                            )}
                          </div>

                          <span className="text-sm font-medium text-gray-900">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.location || '-'}
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
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                          {formatLastActive(user.lastActive)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">

                        <div className="flex gap-2">

                          {/* View */}
                          <button
                            onClick={() => handleViewUser(user)}
                            className="
        h-7
        px-2.5
        rounded-md
        border
        border-sky-200
        bg-white
        text-sky-600
        shadow-sm
        hover:border-sky-300
        hover:bg-sky-50
        hover:text-sky-700
        hover:shadow-md
        transition-all
        duration-200
        flex
        items-center
        justify-center
        group/view
      "
                            title="View Details"
                          >
                            <span
                              className="
          material-symbols-outlined
          text-[18px]
          transition-all
          duration-200
          group-hover/view:scale-110
          group-hover/view:-translate-y-[1px]
        "
                            >
                              pageview
                            </span>
                          </button>


                          {/* Edit */}
                          <button
                            onClick={() => handleEditUser(user)}
                            title="Edit User"
                            className="
        h-7
        px-2.5
        rounded-md
        border
        border-gray-200
        bg-white
        text-gray-500
        shadow-sm
        hover:border-[#2eb5c2]/40
        hover:text-[#0b5d68]
        hover:shadow-md
        transition-all
        duration-200
        flex
        items-center
        justify-center
        group/edit
      "
                          >
                            <div className="relative w-5 h-5">

                              {/* Paper */}
                              <span
                                className="
      absolute
      left-[1px]
      top-[3px]
      w-[13px]
      h-[15px]
      rounded-[2px]
      border-[1.5px]
      border-current
      transition-all
      duration-200
      group-hover/edit:-translate-x-[1px]
    "
                              >
                                <span
                                  className="
        absolute
        left-[3px]
        top-[4px]
        w-[6px]
        h-[1px]
        bg-current
        rounded-full
      "
                                />

                                <span
                                  className="
        absolute
        left-[3px]
        top-[8px]
        w-[8px]
        h-[1px]
        bg-current
        rounded-full
      "
                                />

                              </span>


                              {/* Pen */}
                              <span
                                className="
      absolute
      right-[-1px]
      top-[0px]
      w-[10px]
      h-[3px]
      rounded-full
      bg-current
      rotate-[-45deg]
      transition-all
      duration-200
      origin-left
      group-hover/edit:translate-x-[4px]
      group-hover/edit:-translate-y-[2px]
    "
                              />

                            </div>
                          </button>


                          {/* Ban */}
                          <button
                            onClick={() => handleToggleSuspend(user.id)}
                            title={user.status === 'banned' ? 'Unban User' : 'Ban User'}
                            className="
        h-7
        px-2.5
        rounded-md
        border
        border-gray-200
        bg-white
        shadow-sm
        hover:border-[#2eb5c2]/40
        hover:shadow-md
        transition-all
        duration-200
        flex
        items-center
        justify-center
      "
                          >
                            <div
                              className={`
          relative
          w-6
          h-3
          rounded-full
          transition-all
          duration-300
          ${user.status === 'banned'
                                  ? 'bg-[#d55b39]'
                                  : 'bg-[#2eb5c2]'
                                }
        `}
                            >
                              <span
                                className={`
            absolute
            top-[1.5px]
            w-2
            h-2
            rounded-full
            bg-white
            shadow-sm
            transition-all
            duration-300
            ${user.status === 'banned'
                                    ? 'left-[2px]'
                                    : 'left-[14px]'
                                  }
          `}
                              />
                            </div>
                          </button>


                        </div>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center justify-between">

                  {/* Left */}
                  <p className="text-sm text-gray-500">
                    Showing{" "}
                    {(currentPage - 1) * rowsPerPage + 1}
                    {" - "}
                    {Math.min(currentPage * rowsPerPage, sortedUsers.length)}
                    {" of "}
                    {sortedUsers.length} users
                  </p>


                  {/* Right */}
                  <div className="flex items-center gap-4">

                    {/* Rows dropdown */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Rows:</span>

                      <select
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(Number(e.target.value))
                          setCurrentPage(1)
                        }}
                        className="border border-gray-200 rounded-md px-2 py-1 text-sm"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                    </div>


                    {/* Pagination */}
                    <div className="flex items-center gap-2">

                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="px-3 py-1 text-sm border rounded-md disabled:opacity-40"
                      >
                        Previous
                      </button>


                      <span className="text-sm text-gray-600">
                        {currentPage} / {totalPages}
                      </span>


                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="px-3 py-1 text-sm border rounded-md disabled:opacity-40"
                      >
                        Next
                      </button>

                    </div>

                  </div>

                </div>
              </div>
            </div>
          </AdminTable>
          // </div>
        )}

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
        onAction={handleDrawerAction}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={editUser}
        onSave={handleSaveUser}
      />

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleCreateUser}
      />
    </>
  )
}
