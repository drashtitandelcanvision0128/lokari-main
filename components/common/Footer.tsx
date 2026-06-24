'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Footer() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark')
      setIsDark(isDarkMode)
    }

    // Check initial theme
    checkTheme()

    // Set up interval to check for theme changes
    const interval = setInterval(checkTheme, 100)

    // Also listen for storage changes
    const handleStorageChange = (e: any) => {
      if (e.key === 'theme') {
        checkTheme()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return (
    <footer className={`${isDark ? 'bg-gray-900' : 'bg-[#0b5d68]'} text-white w-full py-20 px-8`}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto">
        <div className="col-span-1 md:col-span-1">
          <div className="font-['Manrope'] font-bold text-white text-2xl mb-6">Lokhari</div>
          <p className={`${isDark ? 'text-gray-400' : 'text-stone-400'} text-sm leading-relaxed lowercase mb-6`}>Building the digital infrastructure for global agrarian sovereignty.</p>
          <div className="flex gap-4">
            <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-gray-700/10' : 'bg-white/10'} flex items-center justify-center ${isDark ? 'hover:bg-gray-700/20' : 'hover:bg-white/20'} cursor-pointer transition-colors`}>
              <span className="material-symbols-outlined text-sm">public</span>
            </div>
            <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-gray-700/10' : 'bg-white/10'} flex items-center justify-center ${isDark ? 'hover:bg-gray-700/20' : 'hover:bg-white/20'} cursor-pointer transition-colors`}>
              <span className="material-symbols-outlined text-sm">share</span>
            </div>
          </div>
        </div>
        <div>
          <h5 className="font-['Inter'] text-xs uppercase tracking-wider text-white font-bold mb-6">Marketplace</h5>
          <ul className={`space-y-4 font-['Inter'] text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-stone-400'}`}>
            <li className={`transition-colors cursor-pointer ${isDark ? 'hover:text-gray-200' : 'hover:text-white'}`}>Live Bidding</li>
            <li className={`transition-colors cursor-pointer ${isDark ? 'hover:text-gray-200' : 'hover:text-white'}`}>Commodity Index</li>
            <li className={`transition-colors cursor-pointer ${isDark ? 'hover:text-gray-200' : 'hover:text-white'}`}>Warehouse Access</li>
            <li className={`transition-colors cursor-pointer ${isDark ? 'hover:text-gray-200' : 'hover:text-white'}`}>Verified Sellers</li>
          </ul>
        </div>
        <div>
          <h5 className="font-['Inter'] text-xs uppercase tracking-wider text-white font-bold mb-6">Quick Links</h5>
          <ul className={`space-y-4 font-['Inter'] text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-stone-400'}`}>
            <li className={`transition-colors cursor-pointer ${isDark ? 'hover:text-gray-200' : 'hover:text-white'}`}>Farmer Portal</li>
            <li className={`transition-colors cursor-pointer ${isDark ? 'hover:text-gray-200' : 'hover:text-white'}`}>Logistics Network</li>
            <li className={`transition-colors cursor-pointer ${isDark ? 'hover:text-gray-200' : 'hover:text-white'}`}>Insights Blog</li>
            <li className={`transition-colors cursor-pointer ${isDark ? 'hover:text-gray-200' : 'hover:text-white'}`}>Support Center</li>
          </ul>
        </div>
        <div>
          <h5 className="font-['Inter'] text-xs uppercase tracking-wider text-white font-bold mb-6">Legal</h5>
          <ul className={`space-y-4 font-['Inter'] text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-stone-400'}`}>
            <li><Link href="/privacy-policy" className={`transition-colors ${isDark ? 'hover:text-gray-200' : 'hover:text-white'}`}>Privacy Policy</Link></li>
            <li><Link href="/terms" className={`transition-colors ${isDark ? 'hover:text-gray-200' : 'hover:text-white'}`}>Terms of Service</Link></li>
            <li className={`transition-colors cursor-pointer ${isDark ? 'hover:text-gray-200' : 'hover:text-white'}`}>Compliance</li>
          </ul>
        </div>
      </div>
      <div className={`max-w-7xl mx-auto pt-20 mt-12 border-t ${isDark ? 'border-gray-700' : 'border-white/5'} flex flex-col md:flex-row justify-between items-center gap-4`}>
        <p className={`font-['Inter'] text-[10px] uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-stone-500'}`}>© 2024 Lokhari. All rights reserved.</p>
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined text-sm ${isDark ? 'text-[#2eb5c2]' : 'text-[#0b5d68]-fixed'}`} style={{fontVariationSettings: "'FILL' 1", fontSize: '14px'}}>verified</span>
          <span className={`text-[10px] uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-stone-300'}`}>Certified Secure Platform</span>
        </div>
      </div>
    </footer>
  )
}
