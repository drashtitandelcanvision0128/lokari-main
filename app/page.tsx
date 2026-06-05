'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getUserDisplayName, getUserRole } from '@/lib/auth'
import { registrationService } from '@/lib/registration'
import { dummyListings } from '@/lib/dummyData'
import WishlistIcon from '@/components/ui/WishlistIcon'
import CartIcon from '@/components/ui/CartIcon'

// Set up global event handler immediately (outside React component)
if (typeof window !== 'undefined') {
  // Remove any existing handler first
  if ((window as any).globalCardClickHandler) {
    document.removeEventListener('click', (window as any).globalCardClickHandler)
  }
  
  // Create global handler
  const handleCardClick = (event: Event) => {
    const target = event.target as HTMLElement
    const card = target.closest('[data-role-card]')
    
    if (!card) return
    
    const role = card.getAttribute('data-role-card')
    const dashboardUrl = card.getAttribute('data-dashboard-url')
    
    console.log(`${role} card clicked via global handler`)
    
    try {
      const user = getCurrentUser()
      console.log('Current user:', user)
      
      if (!user || user.role !== role) {
        console.log('Redirecting to register')
        window.location.href = '/register'
      } else {
        console.log('Redirecting to dashboard')
        window.location.href = dashboardUrl || '/'
      }
    } catch (error) {
      console.error('Error in global click handler:', error)
      window.location.href = '/register'
    }
  }
  
  // Store handler globally and add to document
  ;(window as any).globalCardClickHandler = handleCardClick
  document.addEventListener('click', handleCardClick)
  console.log('Global event handler added immediately on script load')
}

export default function Home() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>('')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark')
      setIsDark(isDarkMode)
    }

    // Check initial theme
    checkTheme()

    // Get user role
    const role = getUserRole()
    setUserRole(role)
    
    // Get current user for dynamic content
    const user = getCurrentUser()
    setCurrentUser(user)

    // Set up interval to check for theme changes (more reliable than events)
    const interval = setInterval(checkTheme, 100)

    // Listen for theme changes
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    // Also listen for storage changes (for cross-tab sync)
    const handleStorageChange = (e: any) => {
      if (e.key === 'theme') {
        checkTheme()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // Counter animation for Trust Section
    const animateCounters = () => {
      const counters = document.querySelectorAll('.counter')
      
      counters.forEach((counter) => {
        const target = parseInt(counter.getAttribute('data-target') || '0')
        const duration = 2000 // 2 seconds
        const increment = target / (duration / 16) // 60fps
        let current = 0
        
        const updateCounter = () => {
          current += increment
          if (current < target) {
            counter.textContent = Math.floor(current).toLocaleString()
            requestAnimationFrame(updateCounter)
          } else {
            counter.textContent = target.toLocaleString()
          }
        }
        
        // Start animation when element is in view
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              updateCounter()
              observer.unobserve(entry.target)
            }
          })
        })
        
        observer.observe(counter)
      })
    }

    // Initialize counters after component mounts
    setTimeout(animateCounters, 500)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])
  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[870px] flex items-center overflow-hidden -mt-16">
        <div className="absolute inset-0 z-0">
          <img alt="Agricultural Landscape" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4rAv6vCmh58dNkxAmjj0isNiNm9QpFFF4W6udCed3icdViXIlZC1uQNsWAY4zyb8Smy-mZN_X8g-HZVESnbQ01FnwrqnYDBZwEQfI2a3DY6v5MAB-KooTkulBxmTgNmZCXzAe4jUcFqjopVfb3_J6e-4SjhPNxQbQ5C-CJc0U5lqwDDC-3XThJGrsFT8gkg3FkzM40GhbSApC9c41G5WC7_xiIEljYrU3AI-ZxjBstaWl0G2ofkivFydox9y4dvwjL80YVTVR33Q"/>
          <div className={`absolute inset-0 bg-gradient-to-r ${
            isDark ? 'from-[#0b5d68]/80 to-black/60' : 'from-[#0b5d68]/60 to-black/40'
          }`}></div>
        </div>
        <div className="container mx-auto px-8 relative z-10">
          <div className="max-w-2xl">
            <h1 className="font-headline text-6xl font-bold text-white leading-tight mb-6 tracking-tighter">
                        The Future of <br/> <span className={isDark ? "text-[#2eb5c2]" : "text-[#0b5d68]"}>Agricultural Trade</span>
            </h1>
            <p className="text-white/90 text-lg mb-10 font-body leading-relaxed max-w-lg">
                        A sophisticated ecosystem connecting farmers, traders, and logistics. Digitize your harvest, secure storage, and optimize your supply chain with the Digital Agrarian network.
                    </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/listings">
                <button className="bg-[#e89151] hover:bg-[#d67a3a] text-white px-8 py-4 rounded-xl font-headline font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 relative overflow-hidden group">
                  <span className="relative z-10">Explore Marketplace</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </button>
              </Link>
              {userRole !== 'trader' && (
                <Link href="/create-listing">
                  <button className="bg-[#d55b39] hover:bg-[#c44928] text-white px-8 py-4 rounded-xl font-headline font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 relative overflow-hidden group">
                    <span className="relative z-10">List Inventory</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Role Entry Points (Bento Style) */}
      <section className={`py-24 px-8 ${isDark ? 'bg-gray-900' : 'bg-[#f9f9f7]'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className={`font-headline text-3xl font-bold mb-2 ${isDark ? 'text-[#2eb5c2]' : 'text-[#0b5d68]'}`}>Tailored for the Ecosystem</h2>
            <p className={isDark ? 'text-gray-300' : 'text-[#666666]'}>Join the exchange through specialized portals designed for your specific role in the supply chain.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Farmers */}
            <div 
              data-role-card="farmer"
              data-dashboard-url="/farmer-dashboard"
              className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-8 rounded-2xl group transition-all duration-500 cursor-pointer hover:scale-105 hover:shadow-2xl border ${isDark ? 'border-gray-700 hover:border-[#2eb5c2]' : 'border-transparent hover:border-[#2eb5c2]'} relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-[#2eb5c2]/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#2eb5c2] to-[#0b5d68] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <span className="material-symbols-outlined text-white text-3xl">agriculture</span>
              </div>
              <h3 className={`font-headline text-xl font-bold mb-3 transition-colors duration-300 ${isDark ? 'text-white group-hover:text-[#2eb5c2]' : 'text-[#0b5d68]'}`}>Farmers</h3>
              <p className={`text-sm mb-6 leading-relaxed transition-colors duration-300 ${isDark ? 'text-gray-300 group-hover:text-gray-200' : 'text-[#666666] group-hover:text-gray-700'}`}>List your produce and manage farm operations with digital tools</p>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold transition-colors duration-300 ${isDark ? 'text-[#2eb5c2]' : 'text-[#0b5d68]'}`}>Get Started</span>
                <span className={`material-symbols-outlined transition-all duration-300 ${isDark ? 'text-[#2eb5c2]' : 'text-[#0b5d68]'} group-hover:translate-x-1`}>arrow_forward</span>
              </div>
            </div>
            {/* Traders */}
            <div 
              data-role-card="trader"
              data-dashboard-url="/trader-dashboard"
              className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-8 rounded-2xl group transition-all duration-500 cursor-pointer hover:scale-105 hover:shadow-2xl border ${isDark ? 'border-gray-700 hover:border-[#e89151]' : 'border-transparent hover:border-[#e89151]'} relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-[#e89151]/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#e89151] to-[#d55b39] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <span className="material-symbols-outlined text-white text-3xl">monitoring</span>
              </div>
              <h3 className={`font-headline text-xl font-bold mb-3 transition-colors duration-300 ${isDark ? 'text-white group-hover:text-[#e89151]' : 'text-[#0b5d68]'}`}>Traders</h3>
              <p className={`text-sm mb-6 leading-relaxed transition-colors duration-300 ${isDark ? 'text-gray-300 group-hover:text-gray-200' : 'text-[#666666] group-hover:text-gray-700'}`}>Real-time market insights and direct procurement channels from verified sources</p>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold transition-colors duration-300 ${isDark ? 'text-[#e89151]' : 'text-[#e89151]'}`}>Get Started</span>
                <span className={`material-symbols-outlined transition-all duration-300 ${isDark ? 'text-[#e89151]' : 'text-[#e89151]'} group-hover:translate-x-1`}>arrow_forward</span>
              </div>
            </div>
            {/* Warehouse */}
            <div 
              data-role-card="warehouse"
              data-dashboard-url="/warehouse-dashboard"
              className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-8 rounded-2xl group transition-all duration-500 cursor-pointer hover:scale-105 hover:shadow-2xl border ${isDark ? 'border-gray-700 hover:border-[#d55b39]' : 'border-transparent hover:border-[#d55b39]'} relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-[#d55b39]/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#d55b39] to-[#c44928] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <span className="material-symbols-outlined text-white text-3xl">warehouse</span>
              </div>
              <h3 className={`font-headline text-xl font-bold mb-3 transition-colors duration-300 ${isDark ? 'text-white group-hover:text-[#d55b39]' : 'text-[#0b5d68]'}`}>Warehouse</h3>
              <p className={`text-sm mb-6 leading-relaxed transition-colors duration-300 ${isDark ? 'text-gray-300 group-hover:text-gray-200' : 'text-[#666666] group-hover:text-gray-700'}`}>Manage space availability and digitize warehouse receipts for financing</p>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold transition-colors duration-300 ${isDark ? 'text-[#d55b39]' : 'text-[#d55b39]'}`}>Get Started</span>
                <span className={`material-symbols-outlined transition-all duration-300 ${isDark ? 'text-[#d55b39]' : 'text-[#d55b39]'} group-hover:translate-x-1`}>arrow_forward</span>
              </div>
            </div>
            {/* Transporters */}
            <div 
              data-role-card="transporter"
              data-dashboard-url="/transporter-dashboard"
              className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-8 rounded-2xl group transition-all duration-500 cursor-pointer hover:scale-105 hover:shadow-2xl border ${isDark ? 'border-gray-700 hover:border-[#0b5d68]' : 'border-transparent hover:border-[#0b5d68]'} relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-[#0b5d68]/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <span className="material-symbols-outlined text-white text-3xl">local_shipping</span>
              </div>
              <h3 className={`font-headline text-xl font-bold mb-3 transition-colors duration-300 ${isDark ? 'text-white group-hover:text-[#2eb5c2]' : 'text-[#0b5d68]'}`}>Logistics</h3>
              <p className={`text-sm mb-6 leading-relaxed transition-colors duration-300 ${isDark ? 'text-gray-300 group-hover:text-gray-200' : 'text-[#666666] group-hover:text-gray-700'}`}>Optimize routes and secure consistent cargo from the exchange's vast network</p>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold transition-colors duration-300 ${isDark ? 'text-[#2eb5c2]' : 'text-[#0b5d68]'}`}>Get Started</span>
                <span className={`material-symbols-outlined transition-all duration-300 ${isDark ? 'text-[#2eb5c2]' : 'text-[#0b5d68]'} group-hover:translate-x-1`}>arrow_forward</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Categories Section */}
      <section className={`py-24 px-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`font-headline text-4xl font-bold mb-4 ${isDark ? 'text-[#2eb5c2]' : 'text-[#0b5d68]'}`}>Explore Categories</h2>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-[#666666]'} max-w-2xl mx-auto`}>Discover our comprehensive marketplace offerings across produce, storage, and transportation solutions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Produce Category */}
            <Link href="/listings?category=produce" className="group">
              <div className={`${isDark ? 'bg-gray-700' : 'bg-[#f9f9f7]'} rounded-2xl p-8 h-full transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer border ${isDark ? 'border-gray-600' : 'border-transparent'}`}>
                <div className="w-16 h-16 bg-gradient-to-br from-[#2eb5c2] to-[#0b5d68] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-white text-3xl">agriculture</span>
                </div>
                <h3 className={`font-headline text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}>Produce</h3>
                <p className={`text-sm mb-6 leading-relaxed ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}>Fresh, high-quality agricultural produce directly from verified farmers. Grains, vegetables, fruits, and more.</p>
                <div className={`flex items-center gap-2 font-semibold text-sm ${isDark ? 'text-[#2eb5c2]' : 'text-[#0b5d68]'} group-hover:gap-3 transition-all duration-300`}>
                  <span>Browse Produce</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </div>
              </div>
            </Link>

            {/* Storage Category */}
            <Link href="/listings?category=storage" className="group">
              <div className={`${isDark ? 'bg-gray-700' : 'bg-[#f9f9f7]'} rounded-2xl p-8 h-full transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer border ${isDark ? 'border-gray-600' : 'border-transparent'}`}>
                <div className="w-16 h-16 bg-gradient-to-br from-[#e89151] to-[#d55b39] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-white text-3xl">warehouse</span>
                </div>
                <h3 className={`font-headline text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}>Storage</h3>
                <p className={`text-sm mb-6 leading-relaxed ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}>Secure, climate-controlled storage facilities with digital receipts and real-time monitoring capabilities.</p>
                <div className={`flex items-center gap-2 font-semibold text-sm ${isDark ? 'text-[#e89151]' : 'text-[#e89151]'} group-hover:gap-3 transition-all duration-300`}>
                  <span>Find Storage</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </div>
              </div>
            </Link>

            {/* Transport Category */}
            <Link href="/listings?category=transport" className="group">
              <div className={`${isDark ? 'bg-gray-700' : 'bg-[#f9f9f7]'} rounded-2xl p-8 h-full transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer border ${isDark ? 'border-gray-600' : 'border-transparent'}`}>
                <div className="w-16 h-16 bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-white text-3xl">local_shipping</span>
                </div>
                <h3 className={`font-headline text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}>Transport</h3>
                <p className={`text-sm mb-6 leading-relaxed ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}>Reliable logistics network connecting producers to markets with optimized routes and real-time tracking.</p>
                <div className={`flex items-center gap-2 font-semibold text-sm ${isDark ? 'text-[#2eb5c2]' : 'text-[#0b5d68]'} group-hover:gap-3 transition-all duration-300`}>
                  <span>Book Transport</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className={`py-24 px-8 ${isDark ? 'bg-gray-900' : 'bg-[#f9f9f7]'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className={`font-headline text-3xl font-bold mb-2 ${isDark ? 'text-[#2eb5c2]' : 'text-[#0b5d68]'}`}>Active Listings</h2>
              <p className={isDark ? 'text-gray-300' : 'text-[#666666]'}>Verified inventory ready for procurement.</p>
            </div>
            <Link href="/listings">
              <button className={`px-6 py-3 rounded-xl font-headline font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl ${isDark ? 'bg-gradient-to-r from-[#2eb5c2] to-[#0b5d68] text-white hover:from-[#0b5d68] hover:to-[#2eb5c2]' : 'bg-gradient-to-r from-[#0b5d68] to-[#2eb5c2] text-white hover:from-[#2eb5c2] hover:to-[#0b5d68]'} flex items-center gap-3 group`}>
                <span className="relative z-10">View All Marketplace</span>
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {dummyListings.filter(listing => ['12', '13', '14', '15'].includes(listing.id)).map((listing) => (
              <Link href={`/listings/${listing.id}`} key={listing.id}>
                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl overflow-hidden group transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer`}>
                  <div className="h-48 relative overflow-hidden">
                    <img 
                      alt={listing.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      src={listing.images[0]}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <WishlistIcon listing={listing} size="md" />
                      <CartIcon listing={listing} size="md" />
                      {listing.qualityGrade && (
                        <div className={`${isDark ? 'bg-gray-700/90' : 'bg-white/90'} backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${isDark ? 'border-gray-600' : 'border-white/20'}`}>
                          {listing.qualityGrade}
                        </div>
                      )}
                      {listing.type === 'warehouse' && (
                        <div className={`${isDark ? 'bg-gray-700/90' : 'bg-white/90'} backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${isDark ? 'border-gray-600' : 'border-white/20'}`}>
                          Featured
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                        listing.type === 'warehouse' 
                          ? (isDark ? 'bg-[#d55b39] text-white' : 'bg-[#d55b39] text-white')
                          : (isDark ? 'bg-[#2eb5c2] text-white' : 'bg-[#0b5d68] text-white')
                      } transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300`}>
                        View Details
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className={`font-headline font-bold text-lg mb-2 ${isDark ? 'text-[#2eb5c2]' : 'text-[#0b5d68]'} group-hover:text-[#2eb5c2] transition-colors duration-300`}>{listing.title}</h4>
                    <div className={`flex items-center gap-1 text-xs mb-4 ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}>
                      <span className="material-symbols-outlined text-sm">location_on</span> {listing.location}
                    </div>
                    <div className={`flex justify-between items-center pt-4 border-t ${isDark ? 'border-gray-700' : 'border-surface-container'}`}>
                      <span className={`font-bold text-lg ${isDark ? 'text-[#e89151]' : 'text-secondary'}`}>₹{listing.price.toLocaleString()} / {listing.unit}</span>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        listing.type === 'warehouse' 
                          ? (isDark ? 'bg-gray-700 text-[#d55b39]' : 'bg-secondary-fixed text-on-secondary-container')
                          : (isDark ? 'bg-gray-700 text-[#2eb5c2]' : 'bg-primary-fixed text-[#0b5d68]')
                      }`}>
                        {listing.type === 'warehouse' ? `${(listing.quantity / 1000).toFixed(1)}k Available` : `${listing.quantity} ${listing.unit}s`}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={`py-24 px-8 ${isDark ? 'bg-gray-900' : 'bg-[#f9f9f7]'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`font-headline text-4xl font-bold mb-4 ${isDark ? 'text-[#2eb5c2]' : 'text-[#0b5d68]'}`}>How It Works</h2>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-[#666666]'} max-w-2xl mx-auto`}>
              {currentUser ? 'Navigate your agricultural trading journey with our streamlined platform' : 'Get started in minutes and join the digital agricultural revolution'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {currentUser ? (
              // Logged IN content
              <>
                {/* Step 1 */}
                <div className="text-center group">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${isDark ? 'bg-gradient-to-br from-[#2eb5c2] to-[#0b5d68]' : 'bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2]'}`}>
                    <span className="material-symbols-outlined text-white text-4xl">search</span>
                  </div>
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-gray-700 text-[#2eb5c2]' : 'bg-primary-fixed text-[#0b5d68]'} mb-3`}>STEP 01</span>
                  </div>
                  <h3 className={`font-headline text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}>List/Search</h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}>Create listings for your produce or search through our verified marketplace for exactly what you need.</p>
                </div>

                {/* Step 2 */}
                <div className="text-center group">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${isDark ? 'bg-gradient-to-br from-[#e89151] to-[#d55b39]' : 'bg-gradient-to-br from-[#e89151] to-[#d55b39]'}`}>
                    <span className="material-symbols-outlined text-white text-4xl">gavel</span>
                  </div>
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-gray-700 text-[#e89151]' : 'bg-secondary-fixed text-on-secondary-container'} mb-3`}>STEP 02</span>
                  </div>
                  <h3 className={`font-headline text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}>Bid/Buy</h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}>Place competitive bids or purchase directly at market rates. Secure transactions with escrow protection.</p>
                </div>

                {/* Step 3 */}
                <div className="text-center group">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${isDark ? 'bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2]' : 'bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2]'}`}>
                    <span className="material-symbols-outlined text-white text-4xl">local_shipping</span>
                  </div>
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-gray-700 text-[#2eb5c2]' : 'bg-primary-fixed text-[#0b5d68]'} mb-3`}>STEP 03</span>
                  </div>
                  <h3 className={`font-headline text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}>Deliver</h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}>Track your shipment in real-time. Integrated logistics ensure timely delivery with quality assurance.</p>
                </div>
              </>
            ) : (
              // Logged OUT content
              <>
                {/* Step 1 */}
                <div className="text-center group">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${isDark ? 'bg-gradient-to-br from-[#2eb5c2] to-[#0b5d68]' : 'bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2]'}`}>
                    <span className="material-symbols-outlined text-white text-4xl">how_to_reg</span>
                  </div>
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-gray-700 text-[#2eb5c2]' : 'bg-primary-fixed text-[#0b5d68]'} mb-3`}>STEP 01</span>
                  </div>
                  <h3 className={`font-headline text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}>Signup & Verify</h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}>Create your account and complete KYC verification. Join thousands of trusted agricultural partners.</p>
                </div>

                {/* Step 2 */}
                <div className="text-center group">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${isDark ? 'bg-gradient-to-br from-[#e89151] to-[#d55b39]' : 'bg-gradient-to-br from-[#e89151] to-[#d55b39]'}`}>
                    <span className="material-symbols-outlined text-white text-4xl">explore</span>
                  </div>
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-gray-700 text-[#e89151]' : 'bg-secondary-fixed text-on-secondary-container'} mb-3`}>STEP 02</span>
                  </div>
                  <h3 className={`font-headline text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}>List or Explore</h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}>Browse our marketplace or list your products. Access real-time pricing and market insights.</p>
                </div>

                {/* Step 3 */}
                <div className="text-center group">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${isDark ? 'bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2]' : 'bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2]'}`}>
                    <span className="material-symbols-outlined text-white text-4xl">shield</span>
                  </div>
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-gray-700 text-[#2eb5c2]' : 'bg-primary-fixed text-[#0b5d68]'} mb-3`}>STEP 03</span>
                  </div>
                  <h3 className={`font-headline text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}>Trade with Confidence</h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}>Execute secure transactions with escrow protection. Quality assurance and dispute resolution included.</p>
                </div>
              </>
            )}
          </div>
          
          {/* CTA Section */}
          <div className="text-center mt-16">
            {currentUser ? (
              <Link href="/listings">
                <button className={`px-8 py-4 rounded-xl font-headline font-bold transition-all hover:scale-105 ${isDark ? 'bg-[#2eb5c2] text-white hover:bg-[#0b5d68]' : 'bg-[#0b5d68] text-white hover:bg-[#2eb5c2]'}`}>
                  Start Trading
                </button>
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <button className={`px-8 py-4 rounded-xl font-headline font-bold transition-all hover:scale-105 ${isDark ? 'bg-[#e89151] text-white hover:bg-[#d67a3a]' : 'bg-[#e89151] text-white hover:bg-[#d67a3a]'}`}>
                    Get Started Now
                  </button>
                </Link>
                <Link href="/login">
                  <button className={`px-8 py-4 rounded-xl font-headline font-bold transition-all hover:scale-105 border-2 ${isDark ? 'border-[#2eb5c2] text-[#2eb5c2] hover:bg-[#2eb5c2] hover:text-white' : 'border-[#0b5d68] text-[#0b5d68] hover:bg-[#0b5d68] hover:text-white'}`}>
                    Sign In
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Market Trends Snapshot */}
      <section className={`py-24 px-8 ${isDark ? 'bg-gray-800' : 'bg-[#2eb5c2]'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-1">
              <h2 className={`font-headline text-3xl font-bold mb-4 ${isDark ? 'text-[#2eb5c2]' : 'text-white'}`}>Market Intelligence</h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-white/90'} mb-8`}>Access real-time price volatility maps and harvest forecasting powered by satellite telemetry.</p>
              <div className="space-y-4">
                <div className={`${isDark ? 'bg-gray-700' : 'bg-white/20'} p-4 rounded-xl flex items-center justify-between border ${isDark ? 'border-gray-600' : 'border-white/10'}`}>
                  <span className={`font-medium ${isDark ? 'text-[#2eb5c2]' : 'text-white'}`}>Wheat Futures</span>
                  <div className="text-right">
                    <div className={`font-bold ${isDark ? 'text-[#2eb5c2]' : 'text-white'}`}>+2.4%</div>
                    <div className={`text-[10px] uppercase tracking-widest ${isDark ? 'text-gray-300' : 'text-white/80'}`}>Active Upswing</div>
                  </div>
                </div>
                <div className={`${isDark ? 'bg-gray-700' : 'bg-white/20'} p-4 rounded-xl flex items-center justify-between border ${isDark ? 'border-gray-600' : 'border-white/10'}`}>
                  <span className={`font-medium ${isDark ? 'text-[#2eb5c2]' : 'text-white'}`}>Mustard Index</span>
                  <div className="text-right">
                    <div className="text-error font-bold">-0.8%</div>
                    <div className={`text-[10px] uppercase tracking-widest ${isDark ? 'text-gray-300' : 'text-white/80'}`}>Correction Phase</div>
                  </div>
                </div>
              </div>
            </div>
            <div className={`lg:col-span-2 ${isDark ? 'bg-gray-700/50' : 'bg-white/20'} backdrop-blur border ${isDark ? 'border-gray-600' : 'border-white/20'} p-8 rounded-2xl h-80 relative`}>
              <div className="flex items-center justify-between mb-8">
                <span className={`font-bold font-headline ${isDark ? 'text-[#2eb5c2]' : 'text-white'}`}>Price Trend Aggregate (30D)</span>
                <div className="flex gap-4">
                  <div className={`flex items-center gap-2 text-[10px] uppercase font-bold ${isDark ? 'text-[#2eb5c2]' : 'text-white'}`}>
                    <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#2eb5c2]' : 'bg-white'}`}></div> Wheat
                  </div>
                  <div className={`flex items-center gap-2 text-[10px] uppercase font-bold ${isDark ? 'text-[#e89151]' : 'text-white/70'}`}>
                    <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#e89151]' : 'bg-white/70'}`}></div> Rice
                  </div>
                </div>
              </div>
              {/* Abstract Chart Representation */}
              <div className="absolute bottom-12 left-8 right-8 h-32 flex items-end gap-1">
                <div className={`flex-1 ${isDark ? 'bg-[#2eb5c2]/20' : 'bg-white/20'} h-[40%] rounded-t-sm`}></div>
                <div className={`flex-1 ${isDark ? 'bg-[#2eb5c2]/20' : 'bg-white/20'} h-[45%] rounded-t-sm`}></div>
                <div className={`flex-1 ${isDark ? 'bg-[#2eb5c2]/20' : 'bg-white/20'} h-[38%] rounded-t-sm`}></div>
                <div className={`flex-1 ${isDark ? 'bg-[#2eb5c2]/20' : 'bg-white/20'} h-[52%] rounded-t-sm`}></div>
                <div className={`flex-1 ${isDark ? 'bg-[#2eb5c2]/20' : 'bg-white/20'} h-[65%] rounded-t-sm`}></div>
                <div className={`flex-1 ${isDark ? 'bg-[#2eb5c2]/40' : 'bg-white/40'} h-[72%] rounded-t-sm relative`}>
                  <div className={`absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold ${isDark ? 'text-white' : 'text-white'}`}>Peak</div>
                </div>
                <div className={`flex-1 ${isDark ? 'bg-[#2eb5c2]/20' : 'bg-white/20'} h-[68%] rounded-t-sm`}></div>
                <div className={`flex-1 ${isDark ? 'bg-[#2eb5c2]/20' : 'bg-white/20'} h-[60%] rounded-t-sm`}></div>
              </div>
              <div className="absolute bottom-12 left-8 right-8 h-32 flex items-end gap-1 opacity-50">
                <div className={`flex-1 ${isDark ? 'bg-[#e89151]/20' : 'bg-white/15'} h-[20%] rounded-t-sm`}></div>
                <div className={`flex-1 ${isDark ? 'bg-[#e89151]/20' : 'bg-white/15'} h-[22%] rounded-t-sm`}></div>
                <div className={`flex-1 ${isDark ? 'bg-[#e89151]/20' : 'bg-white/15'} h-[30%] rounded-t-sm`}></div>
                <div className={`flex-1 ${isDark ? 'bg-[#e89151]/20' : 'bg-white/15'} h-[28%] rounded-t-sm`}></div>
                <div className={`flex-1 ${isDark ? 'bg-[#e89151]/20' : 'bg-white/15'} h-[35%] rounded-t-sm`}></div>
                <div className={`flex-1 ${isDark ? 'bg-[#e89151]/20' : 'bg-white/15'} h-[32%] rounded-t-sm`}></div>
                <div className={`flex-1 ${isDark ? 'bg-[#e89151]/20' : 'bg-white/15'} h-[40%] rounded-t-sm`}></div>
                <div className={`flex-1 ${isDark ? 'bg-[#e89151]/20' : 'bg-secondary-fixed/20'} h-[38%] rounded-t-sm`}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gap Section */}
      <div className="h-16"></div>

      {/* Premium Trust Section */}
      <section className={`py-24 px-8 relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-[#0b5d68] via-[#2eb5c2] to-[#0b5d68]'}`}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-20 left-10 w-72 h-72 rounded-full opacity-10 ${isDark ? 'bg-[#2eb5c2]' : 'bg-white'} animate-pulse`}></div>
          <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-10 ${isDark ? 'bg-[#e89151]' : 'bg-white'} animate-pulse animation-delay-2000`}></div>
          <div className={`absolute top-1/2 left-1/3 w-64 h-64 rounded-full opacity-10 ${isDark ? 'bg-[#d55b39]' : 'bg-white'} animate-pulse animation-delay-4000`}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-headline text-5xl font-bold text-white mb-6 animate-fade-in-up">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              Join the leading digital agricultural marketplace with verified partners, secure transactions, and proven track record
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 transition-all duration-300 hover:scale-105 hover:bg-white/20">
                <div className="text-4xl font-bold text-white mb-2 counter" data-target="50000">0</div>
                <div className="text-sm text-white/80 uppercase tracking-wider">Farmers</div>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 transition-all duration-300 hover:scale-105 hover:bg-white/20">
                <div className="text-4xl font-bold text-white mb-2 counter" data-target="1200">0</div>
                <div className="text-sm text-white/80 uppercase tracking-wider">Warehouses</div>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 transition-all duration-300 hover:scale-105 hover:bg-white/20">
                <div className="text-4xl font-bold text-white mb-2 counter" data-target="3500">0</div>
                <div className="text-sm text-white/80 uppercase tracking-wider">Transporters</div>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 transition-all duration-300 hover:scale-105 hover:bg-white/20">
                <div className="text-4xl font-bold text-white mb-2">₹<span className="counter" data-target="2500">0</span>Crore</div>
                <div className="text-sm text-white/80 uppercase tracking-wider">Transactions</div>
              </div>
            </div>
          </div>

          {/* Trust Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 group hover:bg-white/20 transition-all duration-300">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-white text-3xl">verified_user</span>
              </div>
              <h3 className="font-headline text-xl font-bold text-white mb-4">Verified Partners</h3>
              <p className="text-white/80 text-sm leading-relaxed">Every farmer, warehouse, and transporter is thoroughly verified through KYC and on-site inspections</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 group hover:bg-white/20 transition-all duration-300">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-white text-3xl">security</span>
              </div>
              <h3 className="font-headline text-xl font-bold text-white mb-4">Escrow Protection</h3>
              <p className="text-white/80 text-sm leading-relaxed">All transactions are protected by escrow accounts. Payment released only after successful delivery</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 group hover:bg-white/20 transition-all duration-300">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-white text-3xl">support_agent</span>
              </div>
              <h3 className="font-headline text-xl font-bold text-white mb-4">24/7 Support</h3>
              <p className="text-white/80 text-sm leading-relaxed">Round-the-clock customer support with dedicated relationship managers for enterprise clients</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl px-8 py-6 border border-white/20">
              <div className="text-left">
                <h4 className="font-headline text-2xl font-bold text-white mb-2">Ready to Get Started?</h4>
                <p className="text-white/80">Join 50,000+ trusted agricultural partners</p>
              </div>
              <Link href="/register">
                <button className="px-8 py-4 bg-white text-[#0b5d68] rounded-xl font-headline font-bold transition-all hover:scale-105 hover:shadow-2xl">
                  Join Now
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
