'use client'

import { useState, useEffect } from 'react'
import { dummyTransactions } from '@/lib/dummyData'
import TransactionCard from '@/components/transactions/TransactionCard'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState(dummyTransactions)
  const [filterTransactions, setFilterTransactions] = useState(dummyTransactions)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedEscrow, setSelectedEscrow] = useState('all')

  useEffect(() => {
    setLoading(true)
    
    const timer = setTimeout(() => {
      let filtered = transactions

      if (searchTerm) {
        filtered = filtered.filter(transaction =>
          transaction.listingTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      if (selectedStatus !== 'all') {
        filtered = filtered.filter(transaction => transaction.status === selectedStatus)
      }

      if (selectedEscrow !== 'all') {
        filtered = filtered.filter(transaction => transaction.escrowStatus === selectedEscrow)
      }

      setFilterTransactions(filtered)
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, selectedStatus, selectedEscrow, transactions])

  const statuses = ['all', 'pending', 'in_transit', 'completed', 'cancelled']
  const escrowStatuses = ['all', 'pending', 'funded', 'released', 'disputed']

  const getStatusStats = () => {
    const stats = {
      total: transactions.length,
      pending: transactions.filter(t => t.status === 'pending').length,
      inTransit: transactions.filter(t => t.status === 'in_transit').length,
      completed: transactions.filter(t => t.status === 'completed').length,
      cancelled: transactions.filter(t => t.status === 'cancelled').length
    }
    return stats
  }

  const stats = getStatusStats()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Transactions</h1>
        <p className="text-gray-600">Manage and track all your agricultural transactions</p>
      </div>

      <div className="grid md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.inTransit}</p>
            <p className="text-sm text-gray-500">In Transit</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            <p className="text-sm text-gray-500">Cancelled</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
              value={selectedEscrow}
              onChange={(e) => setSelectedEscrow(e.target.value)}
            >
              {escrowStatuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Escrow' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          Showing {filterTransactions.length} of {transactions.length} transactions
        </p>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            Export CSV
          </Button>
          <Button variant="outline" size="sm">
            Filter
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-3 w-1/2"></div>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filterTransactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
          <p className="text-gray-500">Try adjusting your filters or check back later for new transactions.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filterTransactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </div>
      )}
    </div>
  )
}
