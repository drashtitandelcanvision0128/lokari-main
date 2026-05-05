'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { mockNotifications, mockBids } from '@/data/dashboardMock'

interface OverviewPageProps {
  searchQuery?: string
}

export function OverviewPage({ searchQuery = '' }: OverviewPageProps) {
  const stats = [
    {
      title: 'Active Listings',
      value: '14',
      change: '+12%',
      icon: 'inventory',
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
      changeBg: 'bg-accent/10'
    },
    {
      title: 'Pending Bids',
      value: '42',
      change: 'Active',
      icon: 'gavel',
      iconBg: 'bg-secondary-container',
      iconColor: 'text-on-secondary-container',
      changeBg: 'bg-secondary-container'
    },
    {
      title: 'Ongoing Shipments',
      value: '21',
      change: '8 Transit',
      icon: 'local_shipping',
      iconBg: 'bg-[#e89151]',
      iconColor: 'text-white',
      changeBg: 'bg-[#e89151]/10'
    },
    {
      title: 'Total Earnings',
      value: '₹10.3L',
      change: 'This Month',
      icon: 'payments',
      iconBg: 'bg-[#d55b39]',
      iconColor: 'text-white',
      changeBg: 'bg-[#d55b39]/10'
    }
  ]

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto w-full">
      {/* Header Section with Stats */}
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Dashboard Overview</h1>
          <p className="text-on-surface-variant">Welcome back! Here's what's happening with your farm today.</p>
        </div>

        {/* Stats Cards Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={`p-3 ${stat.iconBg} rounded-xl ${stat.iconColor}`}>
                    <Icon name={stat.icon} />
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 ${stat.changeBg} rounded-full`}>
                    {stat.change}
                  </span>
                </div>
                <div>
                  <p className="text-on-surface-variant text-sm font-medium">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-bold text-primary mt-1">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column - Analytics Chart (8 columns) */}
        <div className="xl:col-span-8">
          <section className="bg-primary p-8 rounded-2xl relative overflow-hidden text-white shadow-lg">
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8">
                <div>
                  <h4 className="text-sm font-medium opacity-70 uppercase tracking-widest mb-2">
                    Market Price Trend
                  </h4>
                  <h3 className="text-2xl font-bold">Premium Cocoa Beans</h3>
                </div>
                <div className="text-right mt-4 sm:mt-0">
                  <p className="text-3xl font-bold">
                    ₹236.55<span className="text-sm font-normal opacity-60">/kg</span>
                  </p>
                  <p className="text-xs text-white/80 font-bold">+4.2% vs last week</p>
                </div>
              </div>
              <div className="h-48 w-full flex items-end gap-2 px-2">
                <div className="flex-1 bg-white/10 rounded-t h-1/2"></div>
                <div className="flex-1 bg-white/10 rounded-t h-3/4"></div>
                <div className="flex-1 bg-white/10 rounded-t h-2/3"></div>
                <div className="flex-1 bg-white/10 rounded-t h-4/5"></div>
                <div className="flex-1 bg-white/20 rounded-t h-full"></div>
                <div className="flex-1 bg-white/10 rounded-t h-2/3"></div>
                <div className="flex-1 bg-white/10 rounded-t h-3/4"></div>
                <div className="flex-1 bg-white/30 rounded-t h-[90%] border-t-2 border-accent"></div>
              </div>
              <div className="flex justify-between mt-4 text-[10px] font-medium opacity-50 px-2 uppercase tracking-tighter">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span><span>Today</span>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/20 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          </section>
        </div>

        {/* Right Column - Notifications (4 columns) */}
        <div className="xl:col-span-4">
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-primary">Alerts</h3>
                <span className="w-6 h-6 flex items-center justify-center bg-red rounded-full text-[10px] font-bold text-white">
                  {mockNotifications.length}
                </span>
              </div>
              <div className="space-y-4">
                {mockNotifications.map((notification) => (
                  <div key={notification.id} className="bg-surface-container p-4 rounded-xl flex gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                      <Icon name={notification.type === 'payment' ? 'payments' : notification.type === 'bid' ? 'gavel' : 'schedule'} className="text-sm" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-primary truncate">{notification.title}</p>
                      <p className="text-xs text-on-surface-variant line-clamp-2">{notification.message}</p>
                      <p className="text-[10px] text-on-surface-variant mt-2 font-medium uppercase">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-primary">Recent Activity</h3>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-surface-container rounded-lg">
                <div className="p-2 bg-accent/10 rounded-lg text-accent">
                  <Icon name="inventory_2" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">New listing created</p>
                  <p className="text-sm text-on-surface-variant">Arabica Coffee - 500kg</p>
                </div>
                <span className="text-xs text-on-surface-variant">2h ago</span>
              </div>
              <div className="flex items-center gap-4 p-3 bg-surface-container rounded-lg">
                <div className="p-2 bg-green-100 rounded-lg text-green-800">
                  <Icon name="check_circle" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Order completed</p>
                  <p className="text-sm text-on-surface-variant">ORD-2024-001 - ₹1,28,650</p>
                </div>
                <span className="text-xs text-on-surface-variant">5h ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* High Potential Bids */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-primary mb-6">High Potential Bids</h3>
            <div className="space-y-4">
              {mockBids.filter(bid => bid.isHighPotential).map((bid) => (
                <div
                  key={bid.id}
                  className={`bg-surface-container rounded-xl p-4 border-l-4 ${
                    bid.currentPosition === 'leading' ? 'border-accent' : 'border-orange'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">
                      {bid.product}
                    </p>
                    <span className={`flex items-center gap-1 text-xs font-bold ${
                        bid.timeLeft === '00:00:00' ? 'text-[#d55b39]' : 'text-[#e89151]'
                      }`}>
                        <Icon name="timer" className="text-sm" />
                        {bid.timeLeft}
                      </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-on-surface-variant">Current Top Bid</p>
                      <h4 className="text-xl font-bold text-primary">
                        {bid.currentBid}
                        <span className="text-[10px] opacity-60">/kg</span>
                      </h4>
                    </div>
                    <Button
                      variant={bid.currentPosition === 'leading' ? 'primary' : 'outline'}
                      size="sm"
                      className={bid.currentPosition === 'leading' ? 'text-primary' : 'text-primary border-outline'}
                    >
                      {bid.currentPosition === 'leading' ? 'View Details' : 'Outbid'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
