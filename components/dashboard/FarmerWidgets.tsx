import { dummyListings, dummyTransactions, dummyUser } from '@/lib/dummyData'
import Button from '@/components/common/Button'

const FarmerWidgets = () => {
  const myListings = dummyListings.filter(listing => 
    dummyUser.listings.includes(listing.id)
  )
  const activeListings = myListings.filter(listing => listing.status === 'active')
  const pendingTransactions = dummyTransactions.filter(transaction => 
    transaction.seller.name === dummyUser.name && transaction.status === 'pending'
  )
  const totalRevenue = dummyTransactions
    .filter(transaction => transaction.seller.name === dummyUser.name && transaction.status === 'completed')
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-[#e0e0e0] p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[#666666]">Active Listings</h3>
            <div className="w-8 h-8 bg-[#2eb5c2] rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">inventory_2</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0b5d68]">{activeListings.length}</p>
          <p className="text-xs text-[#666666] mt-1">Total listings: {myListings.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-[#e0e0e0] p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[#666666]">Pending Orders</h3>
            <div className="w-8 h-8 bg-[#0b5d68] rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">pending_actions</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0b5d68]">{pendingTransactions.length}</p>
          <p className="text-xs text-[#666666] mt-1">Awaiting confirmation</p>
        </div>

        <div className="bg-white rounded-xl border border-[#e0e0e0] p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[#666666]">Total Revenue</h3>
            <div className="w-8 h-8 bg-[#e89151] rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">payments</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0b5d68]">${totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-[#666666] mt-1">All time earnings</p>
        </div>

        <div className="bg-white rounded-xl border border-[#e0e0e0] p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[#666666]">Profile Rating</h3>
            <div className="w-8 h-8 bg-secondary-container rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-sm">star</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0b5d68]">{dummyUser.rating}</p>
          <p className="text-xs text-[#666666] mt-1">Verified seller</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#e0e0e0] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#0b5d68] font-headline">Recent Listings</h3>
            <Button variant="outline" size="sm" className="border-outline text-[#0b5d68] hover:bg-surface-container">View All</Button>
          </div>
          <div className="space-y-3">
            {myListings.slice(0, 3).map((listing) => (
              <div key={listing.id} className="flex items-center justify-between p-3 bg-surface-container rounded-lg">
                <div>
                  <p className="font-medium text-[#0b5d68]">{listing.title}</p>
                  <p className="text-sm text-[#666666]">
                    ${listing.price} / {listing.unit} • {listing.quantity} {listing.unit}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  listing.status === 'active' ? 'bg-primary-fixed text-primary' :
                  listing.status === 'pending' ? 'bg-secondary-fixed text-secondary' :
                  'bg-surface-container text-[#666666]'
                }`}>
                  {listing.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e0e0e0] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#0b5d68] font-headline">Recent Activity</h3>
            <Button variant="outline" size="sm" className="border-outline text-[#0b5d68] hover:bg-surface-container">View All</Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-surface-container rounded-lg">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#0b5d68]">New bid received</p>
                <p className="text-xs text-[#666666]">Fresh Market Co bid on your tomatoes</p>
              </div>
              <span className="text-xs text-[#666666]">2h ago</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-surface-container rounded-lg">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#0b5d68]">Payment released</p>
                <p className="text-xs text-[#666666]">Transaction #t2 completed</p>
              </div>
              <span className="text-xs text-[#666666]">1d ago</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-surface-container rounded-lg">
              <div className="w-2 h-2 bg-tertiary rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#0b5d68]">Listing sold</p>
                <p className="text-xs text-[#666666]">Organic Apples sold out</p>
              </div>
              <span className="text-xs text-[#666666]">3d ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FarmerWidgets
