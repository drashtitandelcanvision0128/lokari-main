'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Requirement } from '@/types/dashboard'
import { mockRequirements } from '@/data/dashboardMock'

interface RequirementsPageProps {
  searchQuery?: string
}

export function RequirementsPage({ searchQuery = '' }: RequirementsPageProps) {
  const [requirements, setRequirements] = useState<Requirement[]>(mockRequirements)
  const [filter, setFilter] = useState<'all' | 'open' | 'fulfilled' | 'expired'>('all')

  const filteredRequirements = requirements.filter(req => {
    const matchesFilter = filter === 'all' || req.status === filter
    const matchesSearch = searchQuery === '' || 
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getStatusBadge = (status: Requirement['status']) => {
    const variants = {
      open: 'success',
      fulfilled: 'primary',
      expired: 'default'
    } as const

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">Requirements</h1>
          <p className="text-on-surface-variant mt-1">Browse and respond to buyer requirements</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2">
          <Icon name="add" />
          Post Requirement
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'open', 'fulfilled', 'expired'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter(status)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Requirements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRequirements.map((requirement) => (
          <Card key={requirement.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{requirement.title}</CardTitle>
                {getStatusBadge(requirement.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-on-surface-variant line-clamp-3">
                  {requirement.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Quantity:</span>
                    <span className="font-medium">{requirement.quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Budget:</span>
                    <span className="font-medium text-primary">{requirement.budget}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Responses:</span>
                    <span className="font-medium">{requirement.responses}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {requirement.status === 'open' && (
                    <>
                      <Button variant="primary" size="sm" className="flex-1">
                        Respond
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Icon name="bookmark_border" />
                      </Button>
                    </>
                  )}
                  {requirement.status === 'fulfilled' && (
                    <Button variant="ghost" size="sm" className="flex-1">
                      View Details
                    </Button>
                  )}
                  {requirement.status === 'expired' && (
                    <Button variant="ghost" size="sm" className="flex-1" disabled>
                      Expired
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredRequirements.length === 0 && (
        <div className="text-center py-12">
          <Icon name="inbox" className="text-6xl text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-primary mb-2">
            No requirements found
          </h3>
          <p className="text-on-surface-variant">
            {filter === 'all' 
              ? 'No requirements available at the moment.'
              : `No ${filter} requirements found.`
            }
          </p>
        </div>
      )}
    </div>
  )
}
