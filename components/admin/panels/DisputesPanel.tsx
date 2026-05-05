'use client'

import { useState } from 'react'
import { AdminDispute } from '@/types/admin'
import { mockAdminDisputes } from '@/data/adminMock'
import { AdminDetailDrawer } from '../AdminDetailDrawer'

interface DisputesPanelProps {
  searchQuery?: string
}

export function DisputesPanel({ searchQuery = '' }: DisputesPanelProps) {
  const [disputes] = useState<AdminDispute[]>(mockAdminDisputes)
  const [selectedDispute, setSelectedDispute] = useState<AdminDispute | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')

  const handleViewDispute = (dispute: AdminDispute) => {
    setSelectedDispute(dispute)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedDispute(null)
  }

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = dispute.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dispute.orderTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dispute.raisedBy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dispute.against.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || dispute.status === selectedStatus
    const matchesPriority = selectedPriority === 'all' || dispute.priority === selectedPriority
    const matchesType = selectedType === 'all' || dispute.type === selectedType
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-error text-on-error'
      case 'investigating':
        return 'bg-secondary-fixed text-secondary'
      case 'resolved':
        return 'bg-tertiary text-on-tertiary'
      case 'closed':
        return 'bg-surface-container text-on-surface-variant'
      default:
        return 'bg-surface-container text-on-surface-variant'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-error text-on-error'
      case 'high':
        return 'bg-error-container text-error'
      case 'medium':
        return 'bg-secondary-fixed text-secondary'
      case 'low':
        return 'bg-tertiary-fixed text-tertiary'
      default:
        return 'bg-surface-container text-on-surface-variant'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quality':
        return 'thumb_down'
      case 'delivery':
        return 'local_shipping'
      case 'payment':
        return 'payments'
      case 'fraud':
        return 'warning'
      case 'other':
        return 'more_horiz'
      default:
        return 'help'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusPriority = (status: string) => {
    const priorities = {
      'open': 0,
      'investigating': 1,
      'resolved': 2,
      'closed': 3
    }
    return priorities[status as keyof typeof priorities] || 999
  }

  const getPriorityValue = (priority: string) => {
    const values = {
      'critical': 0,
      'high': 1,
      'medium': 2,
      'low': 3
    }
    return values[priority as keyof typeof values] || 999
  }

  const sortedDisputes = [...filteredDisputes].sort((a, b) => {
    const statusPriority = getStatusPriority(a.status) - getStatusPriority(b.status)
    if (statusPriority !== 0) return statusPriority
    return getPriorityValue(a.priority) - getPriorityValue(b.priority)
  })

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-on-surface-variant">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 text-sm border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-on-surface-variant">Priority:</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-1.5 text-sm border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-on-surface-variant">Type:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 text-sm border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Types</option>
              <option value="quality">Quality</option>
              <option value="delivery">Delivery</option>
              <option value="payment">Payment</option>
              <option value="fraud">Fraud</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="ml-auto text-sm text-on-surface-variant">
            Showing {sortedDisputes.length} of {disputes.length} disputes
          </div>
        </div>

        {/* Disputes Grid */}
        <div className="grid gap-4">
          {sortedDisputes.map((dispute) => (
            <div key={dispute.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden hover:shadow-sm transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm text-on-surface-variant">
                        {getTypeIcon(dispute.type)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-on-surface">{dispute.id}</h3>
                      <p className="text-sm text-on-surface-variant">{dispute.orderTitle}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(dispute.priority)}`}>
                      {dispute.priority}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                      {dispute.status}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-on-surface mb-3">{dispute.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">person</span>
                      Raised by: {dispute.raisedBy.name} ({dispute.raisedBy.role})
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">gavel</span>
                      Against: {dispute.against.name} ({dispute.against.role})
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">schedule</span>
                      Created: {formatDate(dispute.createdAt)}
                    </span>
                    {dispute.assignedTo && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">assignment_ind</span>
                        Assigned to: {dispute.assignedTo}
                      </span>
                    )}
                  </div>
                </div>

                {dispute.evidence.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-on-surface mb-2">Evidence ({dispute.evidence.length} files)</div>
                    <div className="flex gap-2">
                      {dispute.evidence.map((evidence, index) => (
                        <div key={index} className="px-3 py-1.5 bg-surface-container rounded-lg text-xs text-on-surface-variant">
                          📎 {evidence.split('/').pop()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dispute.resolution && (
                  <div className="mb-4 p-3 bg-tertiary-container rounded-lg">
                    <div className="text-sm font-medium text-tertiary mb-1">Resolution</div>
                    <p className="text-sm text-on-tertiary">{dispute.resolution}</p>
                    <div className="text-xs text-tertiary-variant mt-1">
                      Resolved on: {formatDate(dispute.resolvedAt!)}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleViewDispute(dispute)}
                    className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-100 hover:text-blue-900 transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                  {dispute.status === 'open' && (
                    <button className="px-4 py-2 text-sm font-medium bg-green-600 text-white hover:bg-green-100 hover:text-green-900 transition-colors cursor-pointer">
                      Start Investigation
                    </button>
                  )}
                  {dispute.status === 'investigating' && (
                    <button className="px-4 py-2 text-sm font-medium bg-purple-600 text-white hover:bg-purple-100 hover:text-purple-900 transition-colors cursor-pointer">
                      Resolve Dispute
                    </button>
                  )}
                  <button className="px-4 py-2 text-sm font-medium border border-outline text-on-surface rounded-lg hover:bg-surface-container transition-colors cursor-pointer">
                    Download Evidence
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedDisputes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-2xl text-on-surface-variant">gavel</span>
            </div>
            <h3 className="text-lg font-medium text-on-surface mb-2">No disputes found</h3>
            <p className="text-on-surface-variant">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Admin Detail Drawer */}
      <AdminDetailDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        data={selectedDispute}
        type="dispute"
      />
    </>
  )
}
