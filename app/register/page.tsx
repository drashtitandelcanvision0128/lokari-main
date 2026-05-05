import Link from 'next/link'

export default function ChooseRolePage() {
  const roles = [
    {
      id: 'farmer',
      title: 'Farmer / Producer',
      description: 'List your produce directly and access fair market prices with guaranteed payments.',
      icon: 'agriculture',
      color: 'primary',
      hoverColor: 'primary-fixed'
    },
    {
      id: 'trader',
      title: 'Trader',
      description: 'Real-time market insights and direct procurement channels from verified sources.',
      icon: 'monitoring',
      color: 'secondary',
      hoverColor: 'secondary-fixed'
    },
    {
      id: 'warehouse',
      title: 'Warehouse',
      description: 'Manage space availability and digitize warehouse receipts for financing.',
      icon: 'warehouse',
      color: 'tertiary',
      hoverColor: 'tertiary-fixed'
    },
    {
      id: 'transporter',
      title: 'Logistics',
      description: 'Optimize routes and secure consistent cargo from the exchange\'s vast network.',
      icon: 'local_shipping',
      color: 'primary',
      hoverColor: 'primary-fixed-dim'
    }
  ]

  return (
    <div className="min-h-screen bg-[#f9f9f7]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b5d68]/5 to-[#2eb5c2]/5"></div>
        <div className="relative max-w-6xl mx-auto px-8 py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="material-symbols-outlined text-4xl text-white">agriculture</span>
            </div>
            <h1 className="font-headline text-4xl font-bold text-[#0b5d68] mb-4">Join Lokhari</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select your role and become part of India's trusted agricultural marketplace platform
            </p>
          </div>
        </div>
      </div>
      
      {/* Role Selection */}
      <div className="max-w-7xl mx-auto px-8 pb-12 mt-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role) => (
            <Link 
              key={role.id} 
              href={`/register/${role.id}`}
              className="block group"
            >
              <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-[#2eb5c2] hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5">
                {/* Icon */}
                <div className="w-14 h-14 bg-gradient-to-br from-[#2eb5c2]/10 to-[#e89151]/10 rounded-xl flex items-center justify-center mb-4 group-hover:from-[#2eb5c2]/20 group-hover:to-[#e89151]/20 transition-all duration-300">
                  <span className="material-symbols-outlined text-2xl text-[#0b5d68] group-hover:text-[#2eb5c2] transition-colors">
                    {role.icon}
                  </span>
                </div>
                
                {/* Content */}
                <h3 className="font-headline text-lg font-bold text-[#0b5d68] mb-2 group-hover:text-[#2eb5c2] transition-colors">
                  {role.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {role.description}
                </p>
                
                {/* Features */}
                <div className="space-y-1 mb-4">
                  {role.id === 'farmer' && (
                    <>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span className="material-symbols-outlined text-[#2eb5c2] text-xs">check_circle</span>
                        Direct market access
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span className="material-symbols-outlined text-[#2eb5c2] text-xs">check_circle</span>
                        Fair pricing
                      </div>
                    </>
                  )}
                  {role.id === 'trader' && (
                    <>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span className="material-symbols-outlined text-[#2eb5c2] text-xs">check_circle</span>
                        Real-time insights
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span className="material-symbols-outlined text-[#2eb5c2] text-xs">check_circle</span>
                        Verified sources
                      </div>
                    </>
                  )}
                  {role.id === 'warehouse' && (
                    <>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span className="material-symbols-outlined text-[#2eb5c2] text-xs">check_circle</span>
                        Space management
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span className="material-symbols-outlined text-[#2eb5c2] text-xs">check_circle</span>
                        Digital receipts
                      </div>
                    </>
                  )}
                  {role.id === 'transporter' && (
                    <>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span className="material-symbols-outlined text-[#2eb5c2] text-xs">check_circle</span>
                        Route optimization
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span className="material-symbols-outlined text-[#2eb5c2] text-xs">check_circle</span>
                        Consistent cargo
                      </div>
                    </>
                  )}
                </div>
                
                {/* CTA */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#e89151] font-semibold text-sm">
                    <span>Get Started</span>
                  </div>
                  <div className="w-6 h-6 bg-gradient-to-br from-[#e89151]/10 to-[#d55b39]/10 rounded-full flex items-center justify-center group-hover:from-[#e89151]/20 group-hover:to-[#d55b39]/20 transition-colors">
                    <span className="material-symbols-outlined text-xs text-[#e89151] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Trust Indicators */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-lg">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-[#0b5d68] mb-2">Trusted by India's Agricultural Community</h3>
            <p className="text-gray-600 text-sm">Join thousands of farmers, traders, and logistics partners</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-[#2eb5c2] mb-1">10K+</div>
              <div className="text-xs text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#e89151] mb-1">50K+</div>
              <div className="text-xs text-gray-600">Transactions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#d55b39] mb-1">28+</div>
              <div className="text-xs text-gray-600">States</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0b5d68] mb-1">4.9★</div>
              <div className="text-xs text-gray-600">Rating</div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-[#2eb5c2] font-semibold hover:text-[#0b5d68] transition-colors flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">login</span>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
