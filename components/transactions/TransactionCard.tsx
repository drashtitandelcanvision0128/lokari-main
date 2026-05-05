import Link from 'next/link'
import { Transaction } from '@/lib/dummyData'

interface TransactionCardProps {
  transaction: Transaction
}

const TransactionCard = ({ transaction }: TransactionCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_transit':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEscrowColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      case 'funded':
        return 'bg-blue-100 text-blue-800'
      case 'released':
        return 'bg-green-100 text-green-800'
      case 'disputed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{transaction.listingTitle}</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
              {transaction.status.replace('_', ' ')}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <span>Transaction #{transaction.id}</span>
            <span>•</span>
            <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Buyer</p>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {transaction.buyer.name.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">{transaction.buyer.name}</span>
                <span className="text-xs text-gray-500">★ {transaction.buyer.rating}</span>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Seller</p>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {transaction.seller.name.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">{transaction.seller.name}</span>
                <span className="text-xs text-gray-500">★ {transaction.seller.rating}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="text-xl font-bold text-green-600">Rs. {(transaction.amount * 83).toFixed(2)}</p>
              <p className="text-xs text-gray-500">
                {transaction.quantity} units
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Escrow Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEscrowColor(transaction.escrowStatus)}`}>
                {transaction.escrowStatus}
              </span>
            </div>
          </div>

          {transaction.trackingNumber && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">Tracking Number</p>
              <p className="text-sm font-medium text-gray-900">{transaction.trackingNumber}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          Last updated: {new Date(transaction.updatedAt).toLocaleDateString()}
        </div>
        <Link href={`/transactions/${transaction.id}`}>
          <button className="text-sm font-medium text-green-600 hover:text-green-700">
            View Details →
          </button>
        </Link>
      </div>
    </div>
  )
}

export default TransactionCard
