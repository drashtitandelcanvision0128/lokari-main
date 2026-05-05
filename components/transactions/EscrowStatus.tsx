interface EscrowStatusProps {
  status: 'pending' | 'funded' | 'released' | 'disputed'
  amount?: number
}

const EscrowStatus = ({ status, amount }: EscrowStatusProps) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: 'Pending Payment',
          description: 'Waiting for buyer to fund the escrow'
        }
      case 'funded':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: 'Payment Secured',
          description: 'Funds are held in escrow'
        }
      case 'released':
        return {
          color: 'bg-green-100 text-green-800',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
          title: 'Payment Released',
          description: 'Funds have been released to seller'
        }
      case 'disputed':
        return {
          color: 'bg-red-100 text-red-800',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          title: 'Payment Disputed',
          description: 'Transaction is under review'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: null,
          title: 'Unknown Status',
          description: 'Status information not available'
        }
    }
  }

  const statusInfo = getStatusInfo(status)

  return (
    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${statusInfo.color}`}>
      {statusInfo.icon && <span className="mr-1.5">{statusInfo.icon}</span>}
      {statusInfo.title}
    </div>
  )
}

export default EscrowStatus
