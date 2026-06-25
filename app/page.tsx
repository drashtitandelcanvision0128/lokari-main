'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getUserDisplayName, getUserRole } from '@/lib/auth';
import { registrationService } from '@/lib/registration';
import { dummyListings } from '@/lib/dummyData';
import WishlistIcon from '@/components/ui/WishlistIcon';
import CartIcon from '@/components/ui/CartIcon';

const HERO_IMAGE_PARAMS = 'auto=format&fit=crop&q=85&w=2400';

const HERO_SLIDES = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4rAv6vCmh58dNkxAmjj0isNiNm9QpFFF4W6udCed3icdViXIlZC1uQNsWAY4zyb8Smy-mZN_X8g-HZVESnbQ01FnwrqnYDBZwEQfI2a3DY6v5MAB-KooTkulBxmTgNmZCXzAe4jUcFqjopVfb3_J6e-4SjhPNxQbQ5C-CJc0U5lqwDDC-3XThJGrsFT8gkg3FkzM40GhbSApC9c41G5WC7_xiIEljYrU3AI-ZxjBstaWl0G2ofkivFydox9y4dvwjL80YVTVR33Q',
    alt: 'Agricultural landscape',
  },
  {
    src: `https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?${HERO_IMAGE_PARAMS}`,
    alt: 'Warehouse and cold storage facility',
  },
  {
    src: `https://images.pexels.com/photos/1267329/pexels-photo-1267329.jpeg?auto=compress&cs=tinysrgb&w=2400&h=1350&fit=crop`,
    alt: 'Trader buying and selling crops at market',
  },
  {
    src: '/hero/logistics.jpg',
    alt: 'Agricultural crop transport and logistics',
  },
];

const HERO_SLIDE_INTERVAL_MS = 3000;
const HERO_FADE_MS = 700;

const sectionPad = 'py-12 px-4 sm:py-16 sm:px-6 lg:py-24 lg:px-8';
const heroBtnClass =
  'w-full sm:w-auto bg-[#e89151] hover:bg-[#d67a3a] text-white px-5 py-3.5 sm:px-8 sm:py-4 rounded-xl font-headline text-sm sm:text-base font-bold transition-all duration-300 active:scale-[0.98] sm:hover:scale-105 sm:hover:shadow-2xl relative overflow-hidden group min-h-[44px]';
const heroBtnSecondaryClass =
  'w-full sm:w-auto bg-[#d55b39] hover:bg-[#c44928] text-white px-5 py-3.5 sm:px-8 sm:py-4 rounded-xl font-headline text-sm sm:text-base font-bold transition-all duration-300 active:scale-[0.98] sm:hover:scale-105 sm:hover:shadow-2xl relative overflow-hidden group min-h-[44px]';

// Set up global event handler immediately (outside React component)
if (typeof window !== 'undefined') {
  // Remove any existing handler first
  if ((window as any).globalCardClickHandler) {
    document.removeEventListener('click', (window as any).globalCardClickHandler);
  }

  // Create global handler
  const handleCardClick = (event: Event) => {
    const target = event.target as HTMLElement;
    const card = target.closest('[data-role-card]');

    if (!card) return;

    const role = card.getAttribute('data-role-card');
    const dashboardUrl = card.getAttribute('data-dashboard-url');

    console.log(`${role} card clicked via global handler`);

    try {
      const user = getCurrentUser();
      console.log('Current user:', user);

      if (!user || user.role !== role) {
        console.log('Redirecting to register');
        window.location.href = '/register';
      } else {
        console.log('Redirecting to dashboard');
        window.location.href = dashboardUrl || '/';
      }
    } catch (error) {
      console.error('Error in global click handler:', error);
      window.location.href = '/register';
    }
  };

  // Store handler globally and add to document
  (window as any).globalCardClickHandler = handleCardClick;
  document.addEventListener('click', handleCardClick);
  console.log('Global event handler added immediately on script load');
}

export default function Home() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [isDark, setIsDark] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const heroPausedRef = useRef(false);
  const slideTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startHeroTimer = useCallback(() => {
    if (slideTimerRef.current) {
      clearInterval(slideTimerRef.current);
    }

    slideTimerRef.current = setInterval(() => {
      if (heroPausedRef.current || document.hidden) return;
      setHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, HERO_SLIDE_INTERVAL_MS);
  }, []);

  const goToHeroSlide = useCallback(
    (index: number) => {
      setHeroSlide(index);
      startHeroTimer();
    },
    [startHeroTimer]
  );

  useEffect(() => {
    HERO_SLIDES.forEach((slide) => {
      const img = new Image();
      img.src = slide.src;
    });
  }, []);

  useEffect(() => {
    startHeroTimer();

    const handleVisibility = () => {
      if (!document.hidden) {
        startHeroTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (slideTimerRef.current) {
        clearInterval(slideTimerRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [startHeroTimer]);

  useEffect(() => {
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };

    // Check initial theme
    checkTheme();

    // Get user role
    const role = getUserRole();
    setUserRole(role);

    // Get current user for dynamic content
    const user = getCurrentUser();
    setCurrentUser(user);

    // Set up interval to check for theme changes (more reliable than events)
    const interval = setInterval(checkTheme, 100);

    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Also listen for storage changes (for cross-tab sync)
    const handleStorageChange = (e: any) => {
      if (e.key === 'theme') {
        checkTheme();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Counter animation for Trust Section
    const animateCounters = () => {
      const counters = document.querySelectorAll('.counter');

      counters.forEach((counter) => {
        const target = parseInt(counter.getAttribute('data-target') || '0');
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const updateCounter = () => {
          current += increment;
          if (current < target) {
            counter.textContent = Math.floor(current).toLocaleString();
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target.toLocaleString();
          }
        };

        // Start animation when element is in view
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              updateCounter();
              observer.unobserve(entry.target);
            }
          });
        });

        observer.observe(counter);
      });
    };

    // Initialize counters after component mounts
    setTimeout(animateCounters, 500);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <main>
      {/* Hero Section */}
      <section
        className="relative -mt-16 flex min-h-[min(100svh,720px)] items-end overflow-hidden pt-20 pb-8 sm:min-h-0 sm:h-[560px] sm:items-center sm:pt-0 sm:pb-0 lg:h-[770px]"
        onMouseEnter={() => {
          heroPausedRef.current = true;
        }}
        onMouseLeave={() => {
          heroPausedRef.current = false;
          startHeroTimer();
        }}
      >
        <div className="absolute inset-0 z-0">
          {HERO_SLIDES.map((slide, index) => (
            <img
              key={slide.src}
              alt={slide.alt}
              aria-hidden={index !== heroSlide}
              className={`absolute inset-0 w-full h-full object-cover ease-in-out ${
                index === heroSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              style={{ transition: `opacity ${HERO_FADE_MS}ms ease-in-out` }}
              src={slide.src}
            />
          ))}
          <div
            className={`absolute inset-0 bg-gradient-to-r ${
              isDark ? 'from-[#0b5d68]/80 to-black/60' : 'from-[#0b5d68]/60 to-black/40'
            }`}
          ></div>
        </div>
        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 sm:bottom-8 sm:gap-2">
          {HERO_SLIDES.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => goToHeroSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === heroSlide ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
        <div className="container relative z-10 mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            {/* Live badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
              </span>
              India's #1 Agri Exchange
            </div>
            <h1 className="mb-4 font-headline text-[1.75rem] font-bold leading-[1.15] tracking-tighter text-white sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl">
              The Future of{' '}
              <span className="text-[#e89151]">
                Agricultural Trade
              </span>
            </h1>
            <p className="mb-6 max-w-lg font-body text-sm leading-relaxed text-white/85 sm:mb-8 sm:text-base lg:text-lg">
              Connect farmers, traders, and logistics in one digital marketplace. List produce,
              find storage, and move crops with confidence.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link href="/listings" className="w-full sm:w-auto">
                <button type="button" className={heroBtnClass}>
                  <span className="relative z-10">Explore Marketplace</span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"></div>
                </button>
              </Link>
              {userRole !== 'trader' && (
                <Link href="/create-listing" className="w-full sm:w-auto">
                  <button type="button" className={heroBtnSecondaryClass}>
                    <span className="relative z-10">List Inventory</span>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"></div>
                  </button>
                </Link>
              )}
            </div>
            {/* Quick stat pills */}
            <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
              {[
                { val: '50K+', label: 'Farmers', icon: 'agriculture' },
                { val: '₹2,500 Cr', label: 'Traded', icon: 'payments' },
                { val: '1,200+', label: 'Warehouses', icon: 'warehouse' },
              ].map(({ val, label, icon }) => (
                <div key={label} className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[0.9rem] text-[#2eb5c2]">{icon}</span>
                  <span className="text-xs font-bold text-white">{val}</span>
                  <span className="text-[10px] text-white/60">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Role Entry Points (Bento Style) */}
      <section className={`${sectionPad} relative overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-[#f9f9f7]'}`}>
        {/* Subtle dot grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle, #0b5d68 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-12">
            <div className={`mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest ${isDark ? 'border-[#2eb5c2]/30 bg-[#2eb5c2]/10 text-[#2eb5c2]' : 'border-[#0b5d68]/20 bg-[#0b5d68]/5 text-[#0b5d68]'}`}>
              <span className="material-symbols-outlined text-[0.8rem]">hub</span>
              Your Portal
            </div>
            <h2
              className={`font-headline text-xl sm:text-2xl lg:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}
            >
              Tailored for the Ecosystem
            </h2>
            <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-[#666666]'}`}>
              Join through portals built for your role in the supply chain.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-6">
            {/* Farmers */}
            <div
              data-role-card="farmer"
              data-dashboard-url="/farmer-dashboard"
              className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl group transition-all duration-500 cursor-pointer active:scale-[0.98] sm:hover:scale-105 sm:hover:shadow-2xl border ${isDark ? 'border-gray-700 hover:border-[#2eb5c2]' : 'border-gray-100 sm:border-transparent hover:border-[#2eb5c2]'} relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-[#2eb5c2]/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-[#2eb5c2] to-[#0b5d68] rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <span className="material-symbols-outlined text-white text-xl sm:text-3xl">agriculture</span>
              </div>
              <h3
                className={`font-headline text-sm sm:text-xl font-bold mb-1.5 sm:mb-3 transition-colors duration-300 ${isDark ? 'text-white group-hover:text-[#2eb5c2]' : 'text-[#0b5d68]'}`}
              >
                Farmers
              </h3>
              <p
                className={`text-xs sm:text-sm mb-3 sm:mb-6 leading-relaxed line-clamp-2 sm:line-clamp-none transition-colors duration-300 ${isDark ? 'text-gray-300 group-hover:text-gray-200' : 'text-[#666666] group-hover:text-gray-700'}`}
              >
                List your produce and manage farm operations with digital tools
              </p>
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-semibold transition-colors duration-300 ${isDark ? 'text-[#2eb5c2]' : 'text-[#0b5d68]'}`}
                >
                  Get Started
                </span>
                <span
                  className={`material-symbols-outlined transition-all duration-300 ${isDark ? 'text-[#2eb5c2]' : 'text-[#0b5d68]'} group-hover:translate-x-1`}
                >
                  arrow_forward
                </span>
              </div>
            </div>
            {/* Traders */}
            <div
              data-role-card="trader"
              data-dashboard-url="/trader-dashboard"
              className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl group transition-all duration-500 cursor-pointer active:scale-[0.98] sm:hover:scale-105 sm:hover:shadow-2xl border ${isDark ? 'border-gray-700 hover:border-[#e89151]' : 'border-gray-100 sm:border-transparent hover:border-[#e89151]'} relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-[#e89151]/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-[#e89151] to-[#d55b39] rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <span className="material-symbols-outlined text-white text-xl sm:text-3xl">monitoring</span>
              </div>
              <h3
                className={`font-headline text-sm sm:text-xl font-bold mb-1.5 sm:mb-3 transition-colors duration-300 ${isDark ? 'text-white group-hover:text-[#e89151]' : 'text-[#0b5d68]'}`}
              >
                Traders
              </h3>
              <p
                className={`text-xs sm:text-sm mb-3 sm:mb-6 leading-relaxed line-clamp-2 sm:line-clamp-none transition-colors duration-300 ${isDark ? 'text-gray-300 group-hover:text-gray-200' : 'text-[#666666] group-hover:text-gray-700'}`}
              >
                Real-time market insights and direct procurement channels from verified sources
              </p>
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-semibold transition-colors duration-300 ${isDark ? 'text-[#e89151]' : 'text-[#e89151]'}`}
                >
                  Get Started
                </span>
                <span
                  className={`material-symbols-outlined transition-all duration-300 ${isDark ? 'text-[#e89151]' : 'text-[#e89151]'} group-hover:translate-x-1`}
                >
                  arrow_forward
                </span>
              </div>
            </div>
            {/* Warehouse */}
            <div
              data-role-card="warehouse"
              data-dashboard-url="/warehouse-dashboard"
              className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl group transition-all duration-500 cursor-pointer active:scale-[0.98] sm:hover:scale-105 sm:hover:shadow-2xl border ${isDark ? 'border-gray-700 hover:border-[#d55b39]' : 'border-gray-100 sm:border-transparent hover:border-[#d55b39]'} relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-[#d55b39]/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-[#d55b39] to-[#c44928] rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <span className="material-symbols-outlined text-white text-xl sm:text-3xl">warehouse</span>
              </div>
              <h3
                className={`font-headline text-sm sm:text-xl font-bold mb-1.5 sm:mb-3 transition-colors duration-300 ${isDark ? 'text-white group-hover:text-[#d55b39]' : 'text-[#0b5d68]'}`}
              >
                Warehouse
              </h3>
              <p
                className={`text-xs sm:text-sm mb-3 sm:mb-6 leading-relaxed line-clamp-2 sm:line-clamp-none transition-colors duration-300 ${isDark ? 'text-gray-300 group-hover:text-gray-200' : 'text-[#666666] group-hover:text-gray-700'}`}
              >
                Manage space availability and digitize warehouse receipts for financing
              </p>
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-semibold transition-colors duration-300 ${isDark ? 'text-[#d55b39]' : 'text-[#d55b39]'}`}
                >
                  Get Started
                </span>
                <span
                  className={`material-symbols-outlined transition-all duration-300 ${isDark ? 'text-[#d55b39]' : 'text-[#d55b39]'} group-hover:translate-x-1`}
                >
                  arrow_forward
                </span>
              </div>
            </div>
            {/* Transporters */}
            <div
              data-role-card="transporter"
              data-dashboard-url="/transporter-dashboard"
              className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl group transition-all duration-500 cursor-pointer active:scale-[0.98] sm:hover:scale-105 sm:hover:shadow-2xl border ${isDark ? 'border-gray-700 hover:border-[#0b5d68]' : 'border-gray-100 sm:border-transparent hover:border-[#0b5d68]'} relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-[#0b5d68]/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2] rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <span className="material-symbols-outlined text-white text-xl sm:text-3xl">
                  local_shipping
                </span>
              </div>
              <h3
                className={`font-headline text-sm sm:text-xl font-bold mb-1.5 sm:mb-3 transition-colors duration-300 ${isDark ? 'text-white group-hover:text-[#2eb5c2]' : 'text-[#0b5d68]'}`}
              >
                Logistics
              </h3>
              <p
                className={`text-xs sm:text-sm mb-3 sm:mb-6 leading-relaxed line-clamp-2 sm:line-clamp-none transition-colors duration-300 ${isDark ? 'text-gray-300 group-hover:text-gray-200' : 'text-[#666666] group-hover:text-gray-700'}`}
              >
                Optimize routes and secure consistent cargo from the exchange's vast network
              </p>
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-semibold transition-colors duration-300 ${isDark ? 'text-[#2eb5c2]' : 'text-[#0b5d68]'}`}
                >
                  Get Started
                </span>
                <span
                  className={`material-symbols-outlined transition-all duration-300 ${isDark ? 'text-[#2eb5c2]' : 'text-[#0b5d68]'} group-hover:translate-x-1`}
                >
                  arrow_forward
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Categories Section */}
      <section className={`${sectionPad} ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-14">
            <div className={`mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest ${isDark ? 'border-[#2eb5c2]/30 bg-[#2eb5c2]/10 text-[#2eb5c2]' : 'border-[#0b5d68]/20 bg-[#0b5d68]/5 text-[#0b5d68]'}`}>
              <span className="material-symbols-outlined text-[0.8rem]">category</span>
              Browse
            </div>
            <h2 className={`font-headline text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}>
              Explore Categories
            </h2>
            <p className={`text-sm sm:text-base lg:text-lg px-2 ${isDark ? 'text-gray-400' : 'text-[#666666]'} max-w-2xl mx-auto`}>
              Browse produce, storage, and transport across the marketplace
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3 md:gap-8">
            {/* Produce Category */}
            <Link href="/listings?category=produce" className="group">
              <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden cursor-pointer shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80"
                  alt="Agricultural produce"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
                <div className="absolute top-4 left-4">
                  <div className="w-11 h-11 bg-gradient-to-br from-[#2eb5c2] to-[#0b5d68] rounded-xl flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-white text-xl">agriculture</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  <h3 className="font-headline text-2xl font-bold text-white mb-1.5">Produce</h3>
                  <p className="text-sm text-white/70 mb-4 leading-relaxed">
                    Fresh grains, vegetables &amp; fruits directly from verified farmers nationwide.
                  </p>
                  <div className="flex items-center gap-2 text-[#2eb5c2] font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                    <span>Browse Produce</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Storage Category */}
            <Link href="/listings?category=storage" className="group">
              <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden cursor-pointer shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
                  alt="Warehouse storage"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
                <div className="absolute top-4 left-4">
                  <div className="w-11 h-11 bg-gradient-to-br from-[#e89151] to-[#d55b39] rounded-xl flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-white text-xl">warehouse</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  <h3 className="font-headline text-2xl font-bold text-white mb-1.5">Storage</h3>
                  <p className="text-sm text-white/70 mb-4 leading-relaxed">
                    Climate-controlled facilities with digital receipts &amp; real-time monitoring.
                  </p>
                  <div className="flex items-center gap-2 text-[#e89151] font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                    <span>Find Storage</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Transport Category */}
            <Link href="/listings?category=transport" className="group">
              <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden cursor-pointer shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80"
                  alt="Agricultural transport logistics"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
                <div className="absolute top-4 left-4">
                  <div className="w-11 h-11 bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2] rounded-xl flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-white text-xl">local_shipping</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  <h3 className="font-headline text-2xl font-bold text-white mb-1.5">Transport</h3>
                  <p className="text-sm text-white/70 mb-4 leading-relaxed">
                    Optimised routes &amp; real-time tracking connecting farms to markets.
                  </p>
                  <div className="flex items-center gap-2 text-[#2eb5c2] font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                    <span>Book Transport</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className={`${sectionPad} ${isDark ? 'bg-gray-900' : 'bg-[#f9f9f7]'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:justify-between sm:items-end sm:mb-12">
            <div>
              <div className={`mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest ${isDark ? 'border-[#2eb5c2]/30 bg-[#2eb5c2]/10 text-[#2eb5c2]' : 'border-[#0b5d68]/20 bg-[#0b5d68]/5 text-[#0b5d68]'}`}>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
                </span>
                Live
              </div>
              <h2 className={`font-headline text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}>
                Active Listings
              </h2>
              <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-[#666666]'}`}>
                Verified inventory ready for procurement.
              </p>
            </div>
            <Link href="/listings" className="w-full sm:w-auto">
              <button
                type="button"
                className={`w-full sm:w-auto px-5 py-3 sm:px-6 sm:py-3 rounded-xl font-headline text-sm sm:text-base font-bold transition-all duration-300 active:scale-[0.98] sm:hover:scale-105 sm:hover:shadow-2xl min-h-[44px] ${isDark ? 'bg-gradient-to-r from-[#2eb5c2] to-[#0b5d68] text-white hover:from-[#0b5d68] hover:to-[#2eb5c2]' : 'bg-gradient-to-r from-[#0b5d68] to-[#2eb5c2] text-white hover:from-[#2eb5c2] hover:to-[#0b5d68]'} flex items-center justify-center gap-2 sm:gap-3 group`}
              >
                <span className="relative z-10">View Marketplace</span>
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform duration-300">
                  arrow_forward
                </span>
              </button>
            </Link>
          </div>
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-4">
            {dummyListings
              .filter((listing) => ['12', '13', '14', '15'].includes(listing.id))
              .map((listing) => (
                <Link href={`/listings/${listing.id}`} key={listing.id} className="min-w-[82%] shrink-0 snap-center sm:min-w-0">
                  <div
                    className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl sm:rounded-2xl overflow-hidden group transition-all duration-500 active:scale-[0.98] sm:hover:scale-105 sm:hover:shadow-2xl cursor-pointer h-full`}
                  >
                    <div className="h-40 sm:h-48 relative overflow-hidden">
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
                          <div
                            className={`${isDark ? 'bg-gray-700/90' : 'bg-white/90'} backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${isDark ? 'border-gray-600' : 'border-white/20'}`}
                          >
                            {listing.qualityGrade}
                          </div>
                        )}
                        {listing.type === 'warehouse' && (
                          <div
                            className={`${isDark ? 'bg-gray-700/90' : 'bg-white/90'} backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${isDark ? 'border-gray-600' : 'border-white/20'}`}
                          >
                            Featured
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                            listing.type === 'warehouse'
                              ? isDark
                                ? 'bg-[#d55b39] text-white'
                                : 'bg-[#d55b39] text-white'
                              : isDark
                                ? 'bg-[#2eb5c2] text-white'
                                : 'bg-[#0b5d68] text-white'
                          } transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300`}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                    <div className="p-4 sm:p-6">
                      <h4
                        className={`font-headline font-bold text-base sm:text-lg mb-2 line-clamp-2 ${isDark ? 'text-[#2eb5c2]' : 'text-[#0b5d68]'} group-hover:text-[#2eb5c2] transition-colors duration-300`}
                      >
                        {listing.title}
                      </h4>
                      <div
                        className={`flex items-center gap-1 text-xs mb-4 ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}
                      >
                        <span className="material-symbols-outlined text-sm">location_on</span>{' '}
                        {listing.location}
                      </div>
                      <div
                        className={`flex justify-between items-center pt-4 border-t ${isDark ? 'border-gray-700' : 'border-surface-container'}`}
                      >
                        <span
                          className={`font-bold text-lg ${isDark ? 'text-[#e89151]' : 'text-secondary'}`}
                        >
                          ₹{listing.price.toLocaleString()} / {listing.unit}
                        </span>
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-semibold ${
                            listing.type === 'warehouse'
                              ? isDark
                                ? 'bg-gray-700 text-[#d55b39]'
                                : 'bg-secondary-fixed text-on-secondary-container'
                              : isDark
                                ? 'bg-gray-700 text-[#2eb5c2]'
                                : 'bg-primary-fixed text-[#0b5d68]'
                          }`}
                        >
                          {listing.type === 'warehouse'
                            ? `${(listing.quantity / 1000).toFixed(1)}k Available`
                            : `${listing.quantity} ${listing.unit}s`}
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
      <section className={`${sectionPad} ${isDark ? 'bg-gray-900' : 'bg-[#f9f9f7]'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <div className={`mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest ${isDark ? 'border-[#2eb5c2]/30 bg-[#2eb5c2]/10 text-[#2eb5c2]' : 'border-[#0b5d68]/20 bg-[#0b5d68]/5 text-[#0b5d68]'}`}>
              <span className="material-symbols-outlined text-[0.8rem]">route</span>
              How It Works
            </div>
            <h2 className={`font-headline text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}>
              Three Simple Steps
            </h2>
            <p className={`text-sm sm:text-base lg:text-lg px-2 ${isDark ? 'text-gray-400' : 'text-[#666666]'} max-w-2xl mx-auto`}>
              {currentUser
                ? 'Navigate your agricultural trading journey with our streamlined platform'
                : 'Get started in minutes and join the digital agricultural revolution'}
            </p>
          </div>
          {/* connector line (desktop only) */}
          <div className="relative">
          <div className={`pointer-events-none absolute top-10 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] hidden h-px md:block ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#2eb5c2]/0 via-[#2eb5c2]/60 to-[#2eb5c2]/0" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
            {currentUser ? (
              // Logged IN content
              <>
                {/* Step 1 */}
                <div className="text-center group">
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${isDark ? 'bg-gradient-to-br from-[#2eb5c2] to-[#0b5d68]' : 'bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2]'}`}
                  >
                    <span className="material-symbols-outlined text-white text-3xl sm:text-4xl">search</span>
                  </div>
                  <div className="mb-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-gray-700 text-[#2eb5c2]' : 'bg-primary-fixed text-[#0b5d68]'} mb-3`}
                    >
                      STEP 01
                    </span>
                  </div>
                  <h3
                    className={`font-headline text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}
                  >
                    List/Search
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}
                  >
                    Create listings for your produce or search through our verified marketplace for
                    exactly what you need.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="text-center group">
                  <div
                    className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${isDark ? 'bg-gradient-to-br from-[#e89151] to-[#d55b39]' : 'bg-gradient-to-br from-[#e89151] to-[#d55b39]'}`}
                  >
                    <span className="material-symbols-outlined text-white text-4xl">gavel</span>
                  </div>
                  <div className="mb-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-gray-700 text-[#e89151]' : 'bg-secondary-fixed text-on-secondary-container'} mb-3`}
                    >
                      STEP 02
                    </span>
                  </div>
                  <h3
                    className={`font-headline text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}
                  >
                    Bid/Buy
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}
                  >
                    Place competitive bids or purchase directly at market rates. Secure transactions
                    with escrow protection.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="text-center group">
                  <div
                    className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${isDark ? 'bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2]' : 'bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2]'}`}
                  >
                    <span className="material-symbols-outlined text-white text-4xl">
                      local_shipping
                    </span>
                  </div>
                  <div className="mb-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-gray-700 text-[#2eb5c2]' : 'bg-primary-fixed text-[#0b5d68]'} mb-3`}
                    >
                      STEP 03
                    </span>
                  </div>
                  <h3
                    className={`font-headline text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}
                  >
                    Deliver
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}
                  >
                    Track your shipment in real-time. Integrated logistics ensure timely delivery
                    with quality assurance.
                  </p>
                </div>
              </>
            ) : (
              // Logged OUT content
              <>
                {/* Step 1 */}
                <div className="text-center group">
                  <div
                    className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${isDark ? 'bg-gradient-to-br from-[#2eb5c2] to-[#0b5d68]' : 'bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2]'}`}
                  >
                    <span className="material-symbols-outlined text-white text-4xl">
                      how_to_reg
                    </span>
                  </div>
                  <div className="mb-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-gray-700 text-[#2eb5c2]' : 'bg-primary-fixed text-[#0b5d68]'} mb-3`}
                    >
                      STEP 01
                    </span>
                  </div>
                  <h3
                    className={`font-headline text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}
                  >
                    Signup & Verify
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}
                  >
                    Create your account and complete KYC verification. Join thousands of trusted
                    agricultural partners.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="text-center group">
                  <div
                    className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${isDark ? 'bg-gradient-to-br from-[#e89151] to-[#d55b39]' : 'bg-gradient-to-br from-[#e89151] to-[#d55b39]'}`}
                  >
                    <span className="material-symbols-outlined text-white text-4xl">explore</span>
                  </div>
                  <div className="mb-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-gray-700 text-[#e89151]' : 'bg-secondary-fixed text-on-secondary-container'} mb-3`}
                    >
                      STEP 02
                    </span>
                  </div>
                  <h3
                    className={`font-headline text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}
                  >
                    List or Explore
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}
                  >
                    Browse our marketplace or list your products. Access real-time pricing and
                    market insights.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="text-center group">
                  <div
                    className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${isDark ? 'bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2]' : 'bg-gradient-to-br from-[#0b5d68] to-[#2eb5c2]'}`}
                  >
                    <span className="material-symbols-outlined text-white text-4xl">shield</span>
                  </div>
                  <div className="mb-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-gray-700 text-[#2eb5c2]' : 'bg-primary-fixed text-[#0b5d68]'} mb-3`}
                    >
                      STEP 03
                    </span>
                  </div>
                  <h3
                    className={`font-headline text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}
                  >
                    Trade with Confidence
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}
                  >
                    Execute secure transactions with escrow protection. Quality assurance and
                    dispute resolution included.
                  </p>
                </div>
              </>
            )}
          </div>

          </div>{/* /relative connector wrapper */}
          {/* CTA Section */}
          <div className="mt-10 px-2 text-center sm:mt-16 sm:px-0">
            {currentUser ? (
              <Link href="/listings" className="inline-block w-full sm:w-auto">
                <button
                  type="button"
                  className={`w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl font-headline text-sm sm:text-base font-bold transition-all active:scale-[0.98] sm:hover:scale-105 min-h-[44px] ${isDark ? 'bg-[#2eb5c2] text-white hover:bg-[#0b5d68]' : 'bg-[#0b5d68] text-white hover:bg-[#2eb5c2]'}`}
                >
                  Start Trading
                </button>
              </Link>
            ) : (
              <div className="mx-auto flex max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4">
                <Link href="/register" className="w-full sm:w-auto">
                  <button
                    type="button"
                    className={`w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl font-headline text-sm sm:text-base font-bold transition-all active:scale-[0.98] sm:hover:scale-105 min-h-[44px] ${isDark ? 'bg-[#e89151] text-white hover:bg-[#d67a3a]' : 'bg-[#e89151] text-white hover:bg-[#d67a3a]'}`}
                  >
                    Get Started Now
                  </button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <button
                    type="button"
                    className={`w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl font-headline text-sm sm:text-base font-bold transition-all active:scale-[0.98] sm:hover:scale-105 border-2 min-h-[44px] ${isDark ? 'border-[#2eb5c2] text-[#2eb5c2] hover:bg-[#2eb5c2] hover:text-white' : 'border-[#0b5d68] text-[#0b5d68] hover:bg-[#0b5d68] hover:text-white'}`}
                  >
                    Sign in
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Market Trends Snapshot */}
      <section className={`${sectionPad} relative overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gradient-to-br from-[#0b5d68] via-[#1a8a96] to-[#2eb5c2]'}`}>
        {/* Subtle wave overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-8 items-center lg:grid-cols-3 lg:gap-12">
            <div className="lg:col-span-1">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm">
                <span className="material-symbols-outlined text-[0.8rem]">monitoring</span>
                Live Data
              </div>
              <h2 className={`font-headline text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 ${isDark ? 'text-[#2eb5c2]' : 'text-white'}`}>
                Market Intelligence
              </h2>
              <p className={`text-sm sm:text-base mb-6 sm:mb-8 ${isDark ? 'text-gray-300' : 'text-white/85'}`}>
                Real-time price volatility maps and harvest forecasting powered by satellite telemetry.
              </p>
              <div className="space-y-3">
                {[
                  { name: 'Wheat Futures',  change: '+2.4%', trend: 'Active Upswing',   up: true  },
                  { name: 'Mustard Index',  change: '-0.8%', trend: 'Correction Phase', up: false },
                  { name: 'Soybean Spot',   change: '+1.1%', trend: 'Steady Rise',      up: true  },
                  { name: 'Rice (IR-64)',   change: '+0.3%', trend: 'Stable',           up: true  },
                ].map(({ name, change, trend, up }) => (
                  <div key={name}
                    className={`flex items-center justify-between rounded-xl border p-3.5 backdrop-blur-sm transition-colors ${isDark ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' : 'border-white/15 bg-white/15 hover:bg-white/25'}`}>
                    <div className="flex items-center gap-2.5">
                      <span className={`material-symbols-outlined text-base ${up ? 'text-emerald-400' : 'text-red-400'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                        {up ? 'trending_up' : 'trending_down'}
                      </span>
                      <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-white'}`}>{name}</span>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${up ? 'text-emerald-400' : 'text-red-400'}`}>{change}</div>
                      <div className={`text-[9px] uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-white/60'}`}>{trend}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              className={`lg:col-span-2 ${isDark ? 'bg-gray-700/50' : 'bg-white/20'} backdrop-blur border ${isDark ? 'border-gray-600' : 'border-white/20'} p-4 sm:p-8 rounded-xl sm:rounded-2xl h-56 sm:h-72 lg:h-80 relative`}
            >
              <div className="flex flex-col gap-3 mb-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
                <span
                  className={`font-bold font-headline text-sm sm:text-base ${isDark ? 'text-[#2eb5c2]' : 'text-white'}`}
                >
                  Price Trend (30D)
                </span>
                <div className="flex gap-3 sm:gap-4">
                  <div
                    className={`flex items-center gap-2 text-[10px] uppercase font-bold ${isDark ? 'text-[#2eb5c2]' : 'text-white'}`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#2eb5c2]' : 'bg-white'}`}
                    ></div>{' '}
                    Wheat
                  </div>
                  <div
                    className={`flex items-center gap-2 text-[10px] uppercase font-bold ${isDark ? 'text-[#e89151]' : 'text-white/70'}`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#e89151]' : 'bg-white/70'}`}
                    ></div>{' '}
                    Rice
                  </div>
                </div>
              </div>
              {/* Abstract Chart Representation */}
              <div className="absolute bottom-12 left-8 right-8 h-32 flex items-end gap-1">
                <div
                  className={`flex-1 ${isDark ? 'bg-[#2eb5c2]/20' : 'bg-white/20'} h-[40%] rounded-t-sm`}
                ></div>
                <div
                  className={`flex-1 ${isDark ? 'bg-[#2eb5c2]/20' : 'bg-white/20'} h-[45%] rounded-t-sm`}
                ></div>
                <div
                  className={`flex-1 ${isDark ? 'bg-[#2eb5c2]/20' : 'bg-white/20'} h-[38%] rounded-t-sm`}
                ></div>
                <div
                  className={`flex-1 ${isDark ? 'bg-[#2eb5c2]/20' : 'bg-white/20'} h-[52%] rounded-t-sm`}
                ></div>
                <div
                  className={`flex-1 ${isDark ? 'bg-[#2eb5c2]/20' : 'bg-white/20'} h-[65%] rounded-t-sm`}
                ></div>
                <div
                  className={`flex-1 ${isDark ? 'bg-[#2eb5c2]/40' : 'bg-white/40'} h-[72%] rounded-t-sm relative`}
                >
                  <div
                    className={`absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold ${isDark ? 'text-white' : 'text-white'}`}
                  >
                    Peak
                  </div>
                </div>
                <div
                  className={`flex-1 ${isDark ? 'bg-[#2eb5c2]/20' : 'bg-white/20'} h-[68%] rounded-t-sm`}
                ></div>
                <div
                  className={`flex-1 ${isDark ? 'bg-[#2eb5c2]/20' : 'bg-white/20'} h-[60%] rounded-t-sm`}
                ></div>
              </div>
              <div className="absolute bottom-12 left-8 right-8 h-32 flex items-end gap-1 opacity-50">
                <div
                  className={`flex-1 ${isDark ? 'bg-[#e89151]/20' : 'bg-white/15'} h-[20%] rounded-t-sm`}
                ></div>
                <div
                  className={`flex-1 ${isDark ? 'bg-[#e89151]/20' : 'bg-white/15'} h-[22%] rounded-t-sm`}
                ></div>
                <div
                  className={`flex-1 ${isDark ? 'bg-[#e89151]/20' : 'bg-white/15'} h-[30%] rounded-t-sm`}
                ></div>
                <div
                  className={`flex-1 ${isDark ? 'bg-[#e89151]/20' : 'bg-white/15'} h-[28%] rounded-t-sm`}
                ></div>
                <div
                  className={`flex-1 ${isDark ? 'bg-[#e89151]/20' : 'bg-white/15'} h-[35%] rounded-t-sm`}
                ></div>
                <div
                  className={`flex-1 ${isDark ? 'bg-[#e89151]/20' : 'bg-white/15'} h-[32%] rounded-t-sm`}
                ></div>
                <div
                  className={`flex-1 ${isDark ? 'bg-[#e89151]/20' : 'bg-white/15'} h-[40%] rounded-t-sm`}
                ></div>
                <div
                  className={`flex-1 ${isDark ? 'bg-[#e89151]/20' : 'bg-secondary-fixed/20'} h-[38%] rounded-t-sm`}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gap Section */}
      <div className="h-8 sm:h-16"></div>

      {/* Premium Trust Section */}
      <section
        className={`${sectionPad} relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-[#0b5d68] via-[#2eb5c2] to-[#0b5d68]'}`}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={`absolute top-20 left-10 w-72 h-72 rounded-full opacity-10 ${isDark ? 'bg-[#2eb5c2]' : 'bg-white'} animate-pulse`}
          ></div>
          <div
            className={`absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-10 ${isDark ? 'bg-[#e89151]' : 'bg-white'} animate-pulse animation-delay-2000`}
          ></div>
          <div
            className={`absolute top-1/2 left-1/3 w-64 h-64 rounded-full opacity-10 ${isDark ? 'bg-[#d55b39]' : 'bg-white'} animate-pulse animation-delay-4000`}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-8 sm:mb-16">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm">
              <span className="material-symbols-outlined text-[0.8rem]">verified</span>
              Trusted Platform
            </div>
            <h2 className="font-headline text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
              Trusted by Thousands
            </h2>
            <p className="text-sm sm:text-base lg:text-xl text-white/85 max-w-3xl mx-auto px-2">
              Join India's digital agricultural marketplace with verified partners and secure transactions
            </p>
          </div>

          {/* Stats Grid */}
          <div className="stagger-grid grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-4 md:gap-8 mb-8 sm:mb-16">
            {[
              { target: 50000, suffix: '+', label: 'Farmers', icon: 'agriculture'     },
              { target: 1200,  suffix: '+', label: 'Warehouses', icon: 'warehouse'    },
              { target: 3500,  suffix: '+', label: 'Transporters', icon: 'local_shipping' },
              { target: null,  suffix: '',  label: 'GMV Traded', icon: 'payments',    special: true },
            ].map(({ target, suffix, label, icon, special }, i) => (
              <div key={label} className={`text-center group ${i === 3 ? 'col-span-2 md:col-span-1' : ''}`}>
                <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-white/20 transition-all duration-300 active:scale-[0.98] sm:hover:scale-105 sm:hover:bg-white/20">
                  <div className={`mb-2 flex justify-center`}>
                    <span className="material-symbols-outlined text-white/40 text-lg sm:text-2xl">{icon}</span>
                  </div>
                  {special ? (
                    <div className="text-xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">
                      ₹<span className="counter" data-target="2500">0</span>
                      <span className="text-base sm:text-2xl"> Cr</span>
                    </div>
                  ) : (
                    <div className="text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">
                      <span className="counter" data-target={target}>{0}</span>{suffix}
                    </div>
                  )}
                  <div className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wider">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Features */}
          <div className="stagger-grid grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3 md:gap-8 mb-8 sm:mb-16">
            <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-white/20 group active:scale-[0.98] sm:hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-white text-2xl sm:text-3xl">verified_user</span>
              </div>
              <h3 className="font-headline text-lg sm:text-xl font-bold text-white mb-2 sm:mb-4">Verified Partners</h3>
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                Every partner is verified through KYC and on-site inspections
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-white/20 group active:scale-[0.98] sm:hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-white text-2xl sm:text-3xl">security</span>
              </div>
              <h3 className="font-headline text-lg sm:text-xl font-bold text-white mb-2 sm:mb-4">Escrow Protection</h3>
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                Payments held in escrow until successful delivery
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-white/20 group active:scale-[0.98] sm:hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-white text-2xl sm:text-3xl">support_agent</span>
              </div>
              <h3 className="font-headline text-lg sm:text-xl font-bold text-white mb-2 sm:mb-4">24/7 Support</h3>
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                Round-the-clock support for every trade on the platform
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center px-2 sm:px-0">
            <div className="mx-auto flex max-w-lg flex-col items-stretch gap-4 rounded-xl sm:rounded-2xl border border-white/20 bg-white/10 px-5 py-5 backdrop-blur-md sm:max-w-none sm:inline-flex sm:flex-row sm:items-center sm:gap-4 sm:px-8 sm:py-6">
              <div className="text-center sm:text-left">
                <h4 className="font-headline text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                  Ready to Get Started?
                </h4>
                <p className="text-sm sm:text-base text-white/80">Join 50,000+ trusted partners</p>
              </div>
              <Link href="/register" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto min-h-[44px] px-6 py-3.5 sm:px-8 sm:py-4 bg-white text-[#0b5d68] rounded-xl font-headline text-sm sm:text-base font-bold transition-all active:scale-[0.98] sm:hover:scale-105 sm:hover:shadow-2xl"
                >
                  Join Now
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className={`${sectionPad} relative overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #0b5d68 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">

            {/* ── Left: text + CTAs ─────────────────────────────────── */}
            <div className="flex-1">
              <div className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest ${isDark ? 'border-[#2eb5c2]/30 bg-[#2eb5c2]/10 text-[#2eb5c2]' : 'border-[#0b5d68]/20 bg-[#0b5d68]/5 text-[#0b5d68]'}`}>
                <span className="material-symbols-outlined text-[0.85rem]">smartphone</span>
                Coming Soon
              </div>
              <h2 className={`font-headline text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}>
                Lokhari in Your Pocket
              </h2>
              <p className={`text-sm sm:text-base leading-relaxed mb-8 max-w-lg ${isDark ? 'text-gray-300' : 'text-[#666666]'}`}>
                Manage listings, track bids, and monitor market prices on the go.
                Our app brings the full Lokhari marketplace experience to your smartphone.
              </p>
              <div className="mb-8 flex flex-wrap gap-2">
                {[
                  { icon: 'notifications_active', label: 'Real-time Bid Alerts' },
                  { icon: 'bar_chart',            label: 'Live Price Trends'   },
                  { icon: 'inventory_2',          label: 'Manage Listings'     },
                  { icon: 'wifi_off',             label: 'Works Offline'       },
                  { icon: 'verified_user',        label: 'Secure Payments'     },
                  { icon: 'gps_fixed',            label: 'Live Tracking'       },
                ].map(({ icon, label }) => (
                  <span key={label} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-[#f9f9f7] text-[#444]'}`}>
                    <span className={`material-symbols-outlined text-[0.9rem] ${isDark ? 'text-[#2eb5c2]' : 'text-[#0b5d68]'}`}>{icon}</span>
                    {label}
                  </span>
                ))}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="button" className={`group flex items-center gap-3 rounded-xl border-2 px-5 py-3.5 transition-all duration-300 active:scale-[0.98] sm:hover:scale-105 sm:hover:shadow-xl ${isDark ? 'border-white/20 bg-white/5 hover:bg-white/10 text-white' : 'border-[#0b5d68]/20 bg-[#0b5d68] hover:bg-[#0a4e58] text-white'}`}>
                  <span className="material-symbols-outlined text-[2rem]">android</span>
                  <div className="text-left">
                    <p className={`text-[10px] font-medium leading-none mb-0.5 ${isDark ? 'text-white/60' : 'text-white/80'}`}>GET IT ON</p>
                    <p className="text-[15px] font-bold leading-tight tracking-tight">Google Play</p>
                  </div>
                  <span className={`material-symbols-outlined ml-auto text-[1rem] opacity-40 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 ${isDark ? 'text-[#2eb5c2]' : 'text-white'}`}>arrow_forward</span>
                </button>
                <button type="button" className={`group flex items-center gap-3 rounded-xl border-2 px-5 py-3.5 transition-all duration-300 active:scale-[0.98] sm:hover:scale-105 sm:hover:shadow-xl ${isDark ? 'border-white/20 bg-white/5 hover:bg-white/10 text-white' : 'border-[#0b5d68] bg-white hover:bg-[#f0fafb] text-[#0b5d68]'}`}>
                  <span className="material-symbols-outlined text-[2rem]">apple</span>
                  <div className="text-left">
                    <p className={`text-[10px] font-medium leading-none mb-0.5 ${isDark ? 'text-white/60' : 'text-[#0b5d68]/60'}`}>DOWNLOAD ON THE</p>
                    <p className="text-[15px] font-bold leading-tight tracking-tight">App Store</p>
                  </div>
                  <span className={`material-symbols-outlined ml-auto text-[1rem] opacity-40 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 ${isDark ? 'text-[#2eb5c2]' : 'text-[#0b5d68]'}`}>arrow_forward</span>
                </button>
              </div>
              <div className={`mt-6 flex items-center gap-4 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className="material-symbols-outlined text-[0.9rem] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                  <span className="ml-1 font-semibold">4.8</span>
                </div>
                <span>·</span><span>10,000+ downloads</span><span>·</span><span>Free</span>
              </div>
            </div>

            {/* ── Right: phone mockup ───────────────────────────────── */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-56 sm:w-64">
                <div className={`absolute inset-0 scale-110 rounded-[3rem] blur-3xl ${isDark ? 'bg-[#2eb5c2]/20' : 'bg-[#0b5d68]/10'}`} />
                <div className={`relative mx-auto w-52 rounded-[2.5rem] border-4 shadow-2xl ${isDark ? 'border-gray-600 bg-gray-900' : 'border-[#0b5d68]/30 bg-[#0b5d68]'}`}>
                  <div className={`mx-auto mt-3 h-4 w-20 rounded-full ${isDark ? 'bg-gray-700' : 'bg-[#0a4e58]'}`} />
                  <div className={`mx-2 my-2 overflow-hidden rounded-[1.75rem] ${isDark ? 'bg-gray-800' : 'bg-[#f0fafb]'}`}>
                    <div className={`flex items-center justify-between px-4 py-2 text-[9px] font-semibold ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}>
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[0.7rem]">signal_cellular_alt</span>
                        <span className="material-symbols-outlined text-[0.7rem]">wifi</span>
                        <span className="material-symbols-outlined text-[0.7rem]">battery_full</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-[#0b5d68] to-[#2eb5c2] px-4 py-3 flex items-center gap-2">
                      <div className="h-5 w-5 rounded-md bg-white/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[0.7rem] text-white">agriculture</span>
                      </div>
                      <span className="text-[11px] font-bold text-white">Lokhari</span>
                    </div>
                    <div className="space-y-2 p-3">
                      {[
                        { label: 'Wheat — Grade A', price: '₹2,450/qtl', up: true  },
                        { label: 'Mustard',         price: '₹5,800/qtl', up: false },
                        { label: 'Soybean',         price: '₹4,200/qtl', up: true  },
                      ].map(({ label, price, up }) => (
                        <div key={label} className={`flex items-center justify-between rounded-xl p-2.5 ${isDark ? 'bg-gray-700' : 'bg-white'} shadow-sm`}>
                          <div>
                            <p className={`text-[9px] font-semibold ${isDark ? 'text-white' : 'text-[#0b5d68]'}`}>{label}</p>
                            <p className={`text-[8px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{price}</p>
                          </div>
                          <span className={`material-symbols-outlined text-[0.85rem] ${up ? 'text-emerald-500' : 'text-red-400'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                            {up ? 'trending_up' : 'trending_down'}
                          </span>
                        </div>
                      ))}
                      <div className="rounded-xl bg-gradient-to-r from-[#e89151] to-[#d55b39] p-2.5 text-center">
                        <p className="text-[9px] font-bold text-white">Place a Bid →</p>
                      </div>
                    </div>
                    <div className={`flex justify-around border-t px-2 py-2 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                      {['home', 'inventory_2', 'gavel', 'person'].map((icon) => (
                        <span key={icon} className={`material-symbols-outlined text-[1.1rem] ${isDark ? 'text-gray-400' : 'text-[#0b5d68]/50'}`}>{icon}</span>
                      ))}
                    </div>
                  </div>
                  <div className={`mx-auto mb-3 mt-1 h-1 w-16 rounded-full ${isDark ? 'bg-gray-600' : 'bg-[#0a4e58]/40'}`} />
                </div>
                <div className={`absolute -right-4 top-16 rounded-2xl px-3 py-2 shadow-xl ${isDark ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-100'}`}>
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100">
                      <span className="material-symbols-outlined text-[0.85rem] text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
                    </span>
                    <div>
                      <p className={`text-[9px] font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-800'}`}>New Bid!</p>
                      <p className={`text-[8px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>₹2,480/qtl</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
