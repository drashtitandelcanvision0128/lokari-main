'use client'

import Link from 'next/link'
import { Listing } from '@/lib/dummyData'
import WishlistIcon from '@/components/ui/WishlistIcon'

interface ListingCardProps {
  listing: Listing
}

const getProductImage = (listing: Listing) => {
  // Use working Pexels URLs for the problematic products
  const imageMap: { [key: string]: string } = {
    'Fresh Organic Tomatoes': 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
    'Premium Wheat Grains': 'https://images.pexels.com/photos/1631378/wheat-field-harvest-agriculture-1631378.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
    'Cold Storage Warehouse': 'https://images.pexels.com/photos/704971/pexels-photo-704971.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
    'Refrigerated Transport Service': 'https://images.pexels.com/photos/707046/truck-truck-driver-semi-trailer-707046.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
    'Organic Apples': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=200&fit=crop&crop=center',
    // New products from stitch marketplace with actual stitch images
    'A-Grade Wheat': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPZxN73cAToZ1xs2ois-pOf3NPnE4X4FYsWgrE-vv3-QVq166zMI3nn5Pk8bPvup640j1hUU_BzyybMm86DjNt6D_2sQSqdYgwVHFN7UPnbczRDY5voBZvT-GqnykJtWf7XOCkleFVHFnSFeOQYKU1Wefezvql-gNR5bothSVNm_I4Mv-c9DysStzxcedSHCStpin-H66TJIkR6eAYzrWrdvLGuguIQkZ__eEx6Y68ATKOWQnJbSU7RWUG8rBfGkoEypYCrA06CHE',
    'Cold Storage Unit B-4': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfeB_JebhZ_ezEka2VU1Zg1zFkGVkyTZwXMVRLEMTpEfS7uKH9YhT07550Xcazi8pmVGj6h8CWQSAJ-zRWMHGFApqEVtuqF8p7T3vW6BgLJx55Tdi4TKuW-RmNLXXrcmf5W5G7ePEBmxBVQuoeUtF0ZO7ae7lZ0KqbDkYG_dPJ2AWTE9QY3zgIvIsu1bYsGatHERC4YrGtgGim-1TYAtMoXgdzC1fGsLYFwC0Pi8wlwpXTaan8n3u2Sup5tOkWir45iCi50dFUF74',
    'Bulk Grain Hauler': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnMLdCPM5iqB0puuJ1zypdL6jgVB1rp8sVTCLcq8fuGu59hqqbBSr4ZoF93pwPGEWdr5PaHOEpbMIvqfELmBhZzS_WriAjk1dgfUrJdREa8BScsQARjcVlXBZ_1v0cKfAkacPbJrTXLYuoz8UqUYwPTOtMFKTed3M9DknA8p5luT1zWwzjaG5ULo0hphTgFxNaGsOb19svfkqlulscbi8eRNLlBhN3PE_ZyHsXo4_ur-I4GmtjYXObJEeCGwU7Xl-5_fuOxS846zo',
    // Demo Auction Products
    'Premium Organic Corn - Live Auction': 'https://images.pexels.com/photos/1549251/corn-cornfield-maize-agriculture-1549251.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
    'Heritage Potatoes - Auction Ending Soon': 'https://images.pexels.com/photos/2284101/potatoes-vegetables-food-farm-2284101.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
    'Fresh Strawberries - Hot Auction': 'https://images.pexels.com/photos/1994461/strawberries-fruits-fresh-red-1994461.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
    'Premium Soybeans - Fixed Price Deal': 'https://images.pexels.com/photos/536210/soybeans-bean-legume-soy-536210.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
    // Homepage Active Listings - Add these 4 items with their exact images
    'Durum Wheat': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbWL41VUZZ52UwNK1jj17RrN8lpBtb1htUK7daWe1IrGt5N0il31C-eNG6NIsMAC-N-mUndYLUB_rgwRaOkiLtVHfHkBmsj8h-TsfMCmoomYrfNH2mEaPURld9oYV_JiK4vL33l6sU9GRTYKm5kaqY3S7O_6nn1zT1TDAQ0evz5CCZCynv7-Zx0JalKFQU6-qYcZhe485imaPu68X9jQmL49c_0U7baWRRpMRlo1PYCXyTMslox9ujgGIgZBT1STrVRQ-p3HoQUIk',
    'Mustard Seed': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCntfrXe0AmTNrDTTb4AjIFxLuEyWdCrkBnDXNE9crfFkdxjtdpC-_XltQKkDMflv7hjzUFnh7M0zKmLNoCRMWzwso9mKgh1AGDWVm36nh5F6je8ESXOdMB1mebnI4XRlxTjXZ7RvQsxDnHdwZwOziTBLN1zI3a25gdr-6cILW0TYRiZ5IkHlEdUosRr_BSRjKF4HuCRZQNMttAtzwtMiWmVxdr-BBrMesCd59B3oijDtgI9PP1BMsEXkntrh5veiQzyxlzVMip5yc',
    'Cold Storage Unit 4': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXeDmeZwUegHs4iiR1A4KGm3uwoQDIMOQzG0fx9cLfmbP3N730p_wLe9VI6mIoVHemgC_Jp1LK-VRxnRfoGRgYIXXeW8V7qaV49gPeTBiFNYzwDiU71tuWMdjJW5DWHDgQ0SoQYGCYEoP9tmp72XqFcAk90UYl8jMfOab0jsFwUTEnQz4cwTb2_EeNwyVPcQCPtLuehFGyBv9DE29nKay5zF1LoMYuI4XtEGsEGIvDcwmniOqSAAyBEQ-NhrN5ntutsuc9B9_hXcI',
    'Basmati Rice (Long)': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrv1X4l-V9Y-DM5LgGI6TVIvBNMLTcdRTNG8HWlutEt-VFFvlSiqTg6JNz3D9dl5gkd5Z4Hsu7x-Wx7jLswA2uWVJF2-cw4Ny9qdzcimgA5jWyYgelBZT7HgcVsfJ-oOpbYMlbSURsEtz74R5yD16eoYFVpvk_Y4Azx8jmTNldB9xhvRgdZSUduNsha7K6WjHJ6djkjkkijcDdfMp3RVBf_9nzMXifRgtDhl0LEzFUBdUiY259Sp_8qVnetbPUyb_MzfvfSG3Xxbs'
  }
  
  return imageMap[listing.title] || 'https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop' // Default farm image
}

const ListingCard = ({ listing }: ListingCardProps) => {
  const getCategoryBadge = (type: string) => {
    switch (type) {
      case 'produce':
        return 'bg-[#c1ecd4] text-[#274e3d]'
      case 'warehouse':
        return 'bg-[#ffddb6] text-[#594325]'
      case 'transport':
        return 'bg-[#b1f0ce] text-[#0e5138]'
      default:
        return 'bg-[#c1ecd4] text-[#274e3d]'
    }
  }

  const getCategoryLabel = (type: string) => {
    switch (type) {
      case 'produce':
        return 'Produce'
      case 'warehouse':
        return 'Storage'
      case 'transport':
        return 'Transport'
      default:
        return type
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'produce':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )
      case 'warehouse':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        )
      case 'transport':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
      <div className="bg-[#ffffff] rounded-xl overflow-hidden flex flex-col group transition-all hover:translate-y-[-4px] h-full">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={getProductImage(listing)}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const target = e.currentTarget;
              const fallback = target.nextElementSibling as HTMLElement;
              target.style.display = 'none';
              if (fallback) {
                fallback.style.display = 'flex';
              }
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#f6f3ef] to-[#e5e2de]" style={{display: 'none'}}>
            <div className="p-4 bg-white/80 rounded-lg backdrop-blur-sm">
              {getTypeIcon(listing.type)}
            </div>
          </div>
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${getCategoryBadge(listing.type)}`}>
              {getCategoryLabel(listing.type)}
            </span>
          </div>
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <WishlistIcon listing={listing} size="md" />
            {listing.priceType === 'auction' && (
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse shadow-lg">
                LIVE BID
              </span>
            )}
          </div>
        </div>
        
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-xl text-[#012d1d] leading-none mb-1 font-['Manrope']">{listing.title}</h3>
              <p className="text-xs text-[#717973] flex items-center gap-1">
                <span className="text-[14px]">📍</span>
                {listing.location}
              </p>
            </div>
            <span className="text-lg font-bold text-[#735a3a]">
              &#8377;{listing.price.toFixed(2)}
              <span className="text-xs font-medium text-[#717973]">/{listing.unit}</span>
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#f0ede9] p-3 rounded-lg">
              <span className="block text-[10px] text-[#717973] uppercase font-bold mb-1">Quantity</span>
              <span className="text-sm font-semibold text-[#012d1d]">{listing.quantity} {listing.unit}</span>
            </div>
            <div className="bg-[#f0ede9] p-3 rounded-lg">
              <span className="block text-[10px] text-[#717973] uppercase font-bold mb-1">Quality</span>
              <span className="text-sm font-semibold text-[#012d1d]">{listing.status === 'active' ? 'Available' : listing.status}</span>
            </div>
          </div>
          
          <Link href={`/listings/${listing.id}`} className="mt-auto w-full py-3 bg-[#f0ede9] text-[#012d1d] font-bold rounded-lg hover:bg-[#012d1d] hover:text-white transition-all font-['Manrope'] text-center block">
            View Details
          </Link>
        </div>
      </div>
  )
}

export default ListingCard
