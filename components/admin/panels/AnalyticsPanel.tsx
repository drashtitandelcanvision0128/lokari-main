'use client'

import { useState } from 'react'
import { AdminAnalytics } from '@/types/admin'
import { mockAdminAnalytics } from '@/data/adminMock'

interface AnalyticsPanelProps {
  searchQuery?: string
}

export function AnalyticsPanel({ searchQuery = '' }: AnalyticsPanelProps) {
  const [analytics] = useState<AdminAnalytics>(mockAdminAnalytics)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('6months')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getGrowthColor = (value: number) => {
    if (value > 0) return 'text-tertiary'
    if (value < 0) return 'text-error'
    return 'text-on-surface-variant'
  }

  const getGrowthIcon = (value: number) => {
    if (value > 0) return 'trending_up'
    if (value < 0) return 'trending_down'
    return 'trending_flat'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-on-surface font-headline">Analytics Dashboard</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-on-surface-variant">Period:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-1.5 text-sm border border-outline rounded-lg bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary-fixed rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl">payments</span>
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${getGrowthColor(analytics.overview.revenueGrowth)}`}>
              <span className="material-symbols-outlined text-sm">
                {getGrowthIcon(analytics.overview.revenueGrowth)}
              </span>
              {formatPercentage(analytics.overview.revenueGrowth)}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-on-surface">
              {formatCurrency(analytics.overview.totalRevenue)}
            </div>
            <div className="text-sm text-on-surface-variant">Total Revenue</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-secondary-fixed rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-xl">people</span>
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${getGrowthColor(analytics.overview.userGrowth)}`}>
              <span className="material-symbols-outlined text-sm">
                {getGrowthIcon(analytics.overview.userGrowth)}
              </span>
              {formatPercentage(analytics.overview.userGrowth)}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-on-surface">
              {analytics.overview.activeUsers.toLocaleString()}
            </div>
            <div className="text-sm text-on-surface-variant">Active Users</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-tertiary-fixed rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary text-xl">shopping_cart</span>
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${getGrowthColor(analytics.overview.transactionGrowth)}`}>
              <span className="material-symbols-outlined text-sm">
                {getGrowthIcon(analytics.overview.transactionGrowth)}
              </span>
              {formatPercentage(analytics.overview.transactionGrowth)}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-on-surface">
              {analytics.overview.totalTransactions.toLocaleString()}
            </div>
            <div className="text-sm text-on-surface-variant">Total Transactions</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl">trending_up</span>
            </div>
            <div className="text-sm font-medium text-on-surface-variant">
              {formatPercentage(analytics.overview.conversionRate)}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-on-surface">
              {formatCurrency(analytics.overview.avgOrderValue)}
            </div>
            <div className="text-sm text-on-surface-variant">Avg Order Value</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-4 font-headline">Revenue Trend</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {analytics.charts.revenueChart.data.map((value, index) => {
              const maxValue = Math.max(...analytics.charts.revenueChart.data)
              const height = (value / maxValue) * 100
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-primary rounded-t-lg relative group cursor-pointer" style={{ height: `${height}%` }}>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-surface-container border border-outline rounded px-2 py-1 text-xs text-on-surface opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {formatCurrency(value)}
                    </div>
                  </div>
                  <span className="text-xs text-on-surface-variant">
                    {analytics.charts.revenueChart.labels[index]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-4 font-headline">User Growth</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {analytics.charts.userGrowthChart.data.map((value, index) => {
              const maxValue = Math.max(...analytics.charts.userGrowthChart.data)
              const height = (value / maxValue) * 100
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-secondary rounded-t-lg relative group cursor-pointer" style={{ height: `${height}%` }}>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-surface-container border border-outline rounded px-2 py-1 text-xs text-on-surface opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {value} users
                    </div>
                  </div>
                  <span className="text-xs text-on-surface-variant">
                    {analytics.charts.userGrowthChart.labels[index]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
        <h3 className="text-lg font-semibold text-on-surface mb-4 font-headline">Category Breakdown</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {analytics.charts.categoryBreakdown.categories.map((category, index) => {
            const value = analytics.charts.categoryBreakdown.data[index]
            const total = analytics.charts.categoryBreakdown.data.reduce((sum, val) => sum + val, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            
            return (
              <div key={category} className="flex items-center gap-4">
                <div className="w-16 h-16 bg-surface-container rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-on-surface-variant">
                    {category === 'Produce' ? 'agriculture' : category === 'Warehouse' ? 'warehouse' : 'local_shipping'}
                  </span>
                </div>
                <div>
                  <div className="text-lg font-semibold text-on-surface">{category}</div>
                  <div className="text-sm text-on-surface-variant">{percentage}% of total</div>
                  <div className="w-32 bg-surface-container rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Users */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-4 font-headline">Top Performers - Users</h3>
          <div className="space-y-3">
            {analytics.topPerformers.users.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-surface-container rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-fixed rounded-full flex items-center justify-center text-sm font-medium text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-on-surface">{user.name}</div>
                    <div className="text-sm text-on-surface-variant">{user.role}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-primary">{user.revenue}</div>
                  <div className="text-sm text-on-surface-variant">{user.orders} orders</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Listings */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
          <h3 className="text-lg font-semibold text-on-surface mb-4 font-headline">Top Performers - Listings</h3>
          <div className="space-y-3">
            {analytics.topPerformers.listings.map((listing, index) => (
              <div key={listing.id} className="flex items-center justify-between p-3 bg-surface-container rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-secondary-fixed rounded-full flex items-center justify-center text-sm font-medium text-secondary">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-on-surface line-clamp-1">{listing.title}</div>
                    <div className="text-sm text-on-surface-variant">{listing.seller.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-secondary">${listing.price}/{listing.unit}</div>
                  <div className="text-sm text-on-surface-variant">{listing.views} views</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
