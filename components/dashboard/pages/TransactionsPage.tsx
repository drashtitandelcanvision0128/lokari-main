'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Transaction } from '@/types/dashboard'
import { mockTransactions } from '@/data/dashboardMock'

interface TransactionsPageProps {
  searchQuery?: string
}

export function TransactionsPage({ searchQuery = '' }: TransactionsPageProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [filter, setFilter] = useState<'payment' | 'payout' | 'refund' | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed' | 'in_escrow'>('all')
  const [timePeriod, setTimePeriod] = useState<'thisWeek' | 'thisMonth' | 'allTime'>('thisWeek')

  const filteredTransactions = transactions.filter(transaction => {
    const typeMatch = filter === 'all' || transaction.type === filter
    const statusMatch = statusFilter === 'all' || transaction.status === statusFilter
    const searchMatch = searchQuery === '' || 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.invoice && transaction.invoice.toLowerCase().includes(searchQuery.toLowerCase()))
    return typeMatch && statusMatch && searchMatch
  })

  const getStatusBadge = (status: Transaction['status']) => {
    const variants = {
      completed: 'success',
      pending: 'warning',
      failed: 'error',
      in_escrow: 'primary'
    } as const

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getTypeBadge = (type: Transaction['type']) => {
    const variants = {
      payment: 'primary',
      refund: 'secondary',
      payout: 'success'
    } as const

    return (
      <Badge variant={variants[type]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  // Calculate summary statistics
  const totalCompleted = transactions
    .filter(t => t.status === 'completed' && t.type === 'payment')
    .reduce((sum, t) => sum + parseFloat(t.amount.replace(/[^0-9.-]/g, '')), 0)

  const pendingAmount = transactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + parseFloat(t.amount.replace(/[^0-9.-]/g, '')), 0)

  const totalPayouts = transactions
    .filter(t => t.status === 'completed' && t.type === 'payout')
    .reduce((sum, t) => sum + parseFloat(t.amount.replace(/[^0-9.-]/g, '')), 0)

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">Transactions</h1>
          <p className="text-on-surface-variant mt-1">View payment history and download invoices</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2">
          <Icon name="download" />
          Export All
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-on-surface-variant">Total Earnings</p>
                <p className="text-2xl font-bold text-primary">${totalCompleted.toFixed(2)}</p>
              </div>
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <Icon name="trending_up" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-on-surface-variant">Pending</p>
                <p className="text-2xl font-bold text-orange">${pendingAmount.toFixed(2)}</p>
              </div>
              <div className="p-2 bg-warning/10 rounded-lg text-warning">
                <Icon name="schedule" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-stone-500">Payouts</p>
                <p className="text-2xl font-bold text-success">${totalPayouts.toFixed(2)}</p>
              </div>
              <div className="p-2 bg-success/10 rounded-lg text-success">
                <Icon name="account_balance" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-stone-500">Net Balance</p>
                <p className="text-2xl font-bold text-primary">
                  ${(totalCompleted - totalPayouts).toFixed(2)}
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Icon name="account_balance_wallet" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Summary Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button
              variant={timePeriod === 'thisWeek' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setTimePeriod('thisWeek')}
            >
              This Week
            </Button>
            <Button
              variant={timePeriod === 'thisMonth' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setTimePeriod('thisMonth')}
            >
              This Month
            </Button>
            <Button
              variant={timePeriod === 'allTime' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setTimePeriod('allTime')}
            >
              All Time
            </Button>
          </div>
          
          {/* Chart Representation */}
          <div className="h-48 w-full flex items-end gap-2 px-2">
            {timePeriod === 'thisWeek' && (
              <>
                <div className="flex-1 bg-[#2eb5c2] rounded-t h-1/2"></div>
                <div className="flex-1 bg-[#2eb5c2] rounded-t h-3/4"></div>
                <div className="flex-1 bg-[#2eb5c2] rounded-t h-1/3"></div>
                <div className="flex-1 bg-[#0b5d68] rounded-t h-full"></div>
                <div className="flex-1 bg-[#2eb5c2] rounded-t h-2/3"></div>
                <div className="flex-1 bg-[#e89151] rounded-t h-1/4"></div>
                <div className="flex-1 bg-[#e89151] rounded-t h-1/5"></div>
              </>
            )}
            {timePeriod === 'thisMonth' && (
              <>
                <div className="flex-1 bg-[#2eb5c2] rounded-t h-4/5"></div>
                <div className="flex-1 bg-[#2eb5c2] rounded-t h-2/3"></div>
                <div className="flex-1 bg-[#0b5d68] rounded-t h-full"></div>
                <div className="flex-1 bg-[#2eb5c2] rounded-t h-3/5"></div>
              </>
            )}
            {timePeriod === 'allTime' && (
              <>
                <div className="flex-1 bg-[#2eb5c2] rounded-t h-2/5"></div>
                <div className="flex-1 bg-[#2eb5c2] rounded-t h-3/4"></div>
                <div className="flex-1 bg-[#2eb5c2] rounded-t h-4/5"></div>
                <div className="flex-1 bg-[#0b5d68] rounded-t h-full"></div>
                <div className="flex-1 bg-[#e89151] rounded-t h-2/3"></div>
                <div className="flex-1 bg-[#e89151] rounded-t h-1/2"></div>
              </>
            )}
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-medium opacity-50 px-2 uppercase tracking-tighter">
            {timePeriod === 'thisWeek' && (
              <>
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </>
            )}
            {timePeriod === 'thisMonth' && (
              <>
                <span>W1</span><span>W2</span><span>W3</span><span>W4</span>
              </>
            )}
            {timePeriod === 'allTime' && (
              <>
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
              </>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-sm text-on-surface-variant">Completed Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-accent rounded-full"></div>
              <span className="text-sm text-on-surface-variant">Payouts</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-on-surface-variant uppercase tracking-widest border-b border-outline">
                  <th className="pb-4 font-bold">Date</th>
                  <th className="pb-4 font-bold">Amount</th>
                  <th className="pb-4 font-bold">Status</th>
                  <th className="pb-4 font-bold">Method</th>
                  <th className="pb-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium divide-y divide-outline">
                {transactions.filter(t => t.type === 'payout').map((payout) => (
                  <tr key={payout.id}>
                    <td className="py-4 text-on-surface-variant">{payout.date}</td>
                    <td className="py-4 text-primary font-bold">{payout.amount}</td>
                    <td className="py-4">
                      <Badge variant="success">Completed</Badge>
                    </td>
                    <td className="py-4 text-on-surface-variant">Bank Transfer</td>
                    <td className="py-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button variant="ghost" size="sm">
                          <Icon name="download" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Icon name="visibility" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Types
          </Button>
          <Button
            variant={filter === 'payment' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('payment')}
          >
            Payments
          </Button>
          <Button
            variant={filter === 'refund' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('refund')}
          >
            Refunds
          </Button>
          <Button
            variant={filter === 'payout' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('payout')}
          >
            Payouts
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All Status
          </Button>
          <Button
            variant={statusFilter === 'completed' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setStatusFilter('completed')}
          >
            Completed
          </Button>
          <Button
            variant={statusFilter === 'pending' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === 'in_escrow' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setStatusFilter('in_escrow')}
          >
            In Escrow
          </Button>
          <Button
            variant={statusFilter === 'failed' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setStatusFilter('failed')}
          >
            Failed
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-on-surface-variant uppercase tracking-widest border-b border-outline">
                  <th className="pb-4 font-bold">Date</th>
                  <th className="pb-4 font-bold">Type</th>
                  <th className="pb-4 font-bold">Description</th>
                  <th className="pb-4 font-bold">Amount</th>
                  <th className="pb-4 font-bold">Status</th>
                  <th className="pb-4 font-bold">Invoice</th>
                  <th className="pb-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium divide-y divide-outline">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="py-4 text-on-surface-variant">{transaction.date}</td>
                    <td className="py-4">
                      {getTypeBadge(transaction.type)}
                    </td>
                    <td className="py-4">
                      <p className="text-primary">{transaction.description}</p>
                    </td>
                    <td className="py-4">
                      <span className={`font-bold ${
                        transaction.type === 'payment' ? 'text-accent' : 'text-red'
                      }`}>
                        {transaction.type === 'payment' ? '+' : '-'}{transaction.amount}
                      </span>
                    </td>
                    <td className="py-4">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="py-4">
                      {transaction.invoice ? (
                        <span className="text-stone-600 font-mono text-sm">
                          {transaction.invoice}
                        </span>
                      ) : (
                        <span className="text-stone-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {transaction.invoice && (
                          <Button variant="ghost" size="sm">
                            <Icon name="download" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Icon name="visibility" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <Icon name="receipt_long" className="text-6xl text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-600 mb-2">
            No transactions found
          </h3>
          <p className="text-stone-500">
            No transactions match your current filters.
          </p>
        </div>
      )}
    </div>
  )
}
