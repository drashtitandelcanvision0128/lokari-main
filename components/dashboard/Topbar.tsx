'use client'

import { Icon } from '@/components/ui/Icon'

interface TopbarProps {
  userName: string
  userAvatar?: string
}

export function Topbar({ userName, userAvatar }: TopbarProps) {
  return (
    <header className="h-16 px-8 flex justify-between items-center bg-[#fcf9f5]/80 backdrop-blur-md sticky top-0 z-50">
      {/* User Info */}
      <div className="flex items-center gap-4">
        <div className="md:hidden flex items-center gap-2">
          <Icon name="menu" className="text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-secondary font-bold">
            Farmer Access
          </span>
          <h2 className="font-['Manrope'] font-bold text-[#012d1d] text-lg">
            {userName}
          </h2>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-full">
          <Icon name="search" className="text-sm text-stone-400" />
          <input
            className="bg-transparent border-none text-sm focus:ring-0 p-0 w-48 text-on-surface placeholder-stone-400"
            placeholder="Search marketplace..."
            type="text"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button className="relative text-stone-500 hover:text-primary transition-colors">
            <Icon name="notifications" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
          </button>
          <button className="text-stone-500 hover:text-primary transition-colors">
            <Icon name="help" />
          </button>
          
          {/* Profile Avatar */}
          <div className="h-8 w-8 rounded-full overflow-hidden bg-surface-container">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt="User profile photo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary text-white text-sm font-bold">
                {userName.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
