'use client';

import { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Listing } from '@/types/dashboard';
// import { mockListings } from '@/data/dashboardMock'
import { apiUrl, authHeaders } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';

interface ListingsPageProps {
  searchQuery?: string;
}

export function ListingsPage({ searchQuery = '' }: ListingsPageProps) {
  // const [listings, setListings] = useState<Listing[]>(mockListings)
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    'all' | 'live' | 'reviewing' | 'paused' | 'sold' | 'expired'
  >('all');
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(null);
  const statusDropdownRef = useRef<HTMLDivElement | null>(null);

  const [localSearch, setLocalSearch] = useState(''); // local state for search

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setOpenStatusDropdown(null);
      }
    }
    if (openStatusDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openStatusDropdown]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const currentUser = getCurrentUser();

        if (!currentUser?.id) {
          setListings([]);
          return;
        }

        const response = await fetch(apiUrl('/listings'));
        const result = await response.json();
        // console.log(result.data[0])
        console.log('Full result:', result);

        if (result.success) {
          const userListings = result.data
            .filter((item: any) => item.user_id === currentUser.id)
            .map((item: any) => ({
              id: item.listing_id,
              product: item.title,
              description: item.description || '',
              quantity: item.produceListing
                ? `${item.produceListing.quantity} ${item.produceListing.unit}`
                : item.warehouseListing
                  ? `${item.warehouseListing.capacity}`
                  : 'N/A',
              bids: 0,
              views: 0,
              inquiries: 0,
              status:
                item.status === 'ACTIVE'
                  ? 'live'
                  : item.status === 'DRAFT'
                    ? 'paused'
                    : 'reviewing',
              listingType:
                item.type === 'PRODUCE'
                  ? 'produce'
                  : item.type === 'WAREHOUSE'
                    ? 'warehouse'
                    : 'transport',
              price: `₹${item.price}`,
              image: '',
              createdAt: item.created_at,
            }));

          setListings(userListings);
        }
      } catch (error) {
        console.error('Failed to fetch listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleStatusChange = async (
    listingId: string,
    newStatus: 'live' | 'paused'
  ) => {

    const dbStatus =
      newStatus === 'live'
        ? 'ACTIVE'
        : 'INACTIVE';


    const response = await fetch(
      apiUrl(`/listings/${listingId}`),
      {
        method: 'PUT',
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: dbStatus
        })
      }
    );


    const result = await response.json();


    if (result.success) {

      setListings(prev =>
        prev.map(item =>
          item.id === listingId
            ? { ...item, status: newStatus }
            : item
        )
      );

    }

  };
  const [listingTypeFilter, setListingTypeFilter] = useState<
    'all' | 'produce' | 'warehouse' | 'transport'
  >('all');

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading listings...</p>
      </div>
    );
  }
  // const filteredListings = listings.filter(listing => {
  //   const matchesFilter = filter === 'all' || listing.status === filter
  //   const matchesTypeFilter = listingTypeFilter === 'all' || listing.listingType === listingTypeFilter
  //   const matchesSearch = searchQuery === '' ||
  //     listing.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     listing.description.toLowerCase().includes(searchQuery.toLowerCase())
  //   return matchesFilter && matchesTypeFilter && matchesSearch
  // })

  const filteredListings = listings.filter((listing) => {
    const matchesFilter = filter === 'all' || listing.status === filter;
    const matchesTypeFilter =
      listingTypeFilter === 'all' || listing.listingType === listingTypeFilter;
    const matchesSearch =
      localSearch === '' ||
      listing.product.toLowerCase().includes(localSearch.toLowerCase()) ||
      listing.description.toLowerCase().includes(localSearch.toLowerCase());
    return matchesFilter && matchesTypeFilter && matchesSearch;
  });

  const getStatusBadge = (status: Listing['status']) => {
    const statusConfig = {
      live: { color: 'text-[#2eb5c2]', bg: 'bg-[#f9f9f7]', border: 'border-[#2eb5c2]/20' },
      reviewing: { color: 'text-[#e89151]', bg: 'bg-[#fef9f5]', border: 'border-[#e89151]/20' },
      paused: { color: 'text-[#d55b39]', bg: 'bg-[#fef5f3]', border: 'border-[#d55b39]/20' },
      sold: { color: 'text-[#0b5d68]', bg: 'bg-[#f5f9f9]', border: 'border-[#0b5d68]/20' },
      expired: { color: 'text-[#666666]', bg: 'bg-[#f8f8f8]', border: 'border-[#666666]/20' },
    } as const;

    const config = statusConfig[status];

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.color} ${config.bg} ${config.border} border backdrop-blur-sm`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Connecting delete action to UI
  const handleDelete = async (listingId: string) => {
    try {
      const response = await fetch(apiUrl(`/listings/${listingId}`), {
        method: 'DELETE',
        headers: authHeaders(),
      });

      const result = await response.json();

      if (result.success) {
        setListings((prev) => prev.filter((listing) => listing.id !== listingId));
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto w-full">
      {/* Header Section */}
      <div className="flex items-center flex-wrap gap-4 w-full">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold text-primary mb-1">My Listings</h1>
          <p className="text-on-surface-variant text-sm">
            Manage your product listings and track bids
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap ml-auto">
          {/* Search Bar */}
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-full border border-outline">
            <span className="material-symbols-outlined text-sm text-on-surface-variant">
              search
            </span>
            <input
              className="bg-transparent border-none text-sm focus:ring-0 p-0 w-48 text-on-surface placeholder-on-surface-variant outline-none"
              placeholder="Search listings..."
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-4 py-2 rounded-full border border-outline bg-surface text-sm text-on-surface cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Status</option>
            <option value="live">Live</option>
            <option value="reviewing">Reviewing</option>
            <option value="paused">Paused</option>
            <option value="sold">Sold</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>
      {/* Product Cards Grid */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#0b5d68]">Active Listings</h2>
          <div className="text-sm text-[#666666]">
            {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'} found
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map((listing) => (
            <div
              key={listing.id}
              className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group border border-[#f0f0f0] ${listing.status === 'paused' ? 'opacity-70 grayscale-[0.3] bg-[#fcfcfc]' : ''
                }`}
            >
              {/* Product Image */}
              <div className="h-56 relative bg-gradient-to-br from-[#f9f9f7] to-[#f5f5f3]">
                {listing.image ? (
                  <img
                    src={listing.image}
                    alt={listing.product}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Icon name="inventory_2" className="text-5xl text-[#2eb5c2]/30 mb-2" />
                      <p className="text-sm text-[#666666]">No Image</p>
                    </div>
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-4 right-4">{getStatusBadge(listing.status)}</div>
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Product Details */}
              <div className="p-6 space-y-4">
                {/* Product Name and Description */}
                <div>
                  <h3 className="font-bold text-lg text-[#0b5d68] mb-2 leading-tight">
                    {listing.product}
                  </h3>
                  <p className="text-sm text-[#666666] leading-relaxed">{listing.description}</p>
                </div>

                {/* Stats Row */}
                <div className="flex justify-between items-center py-3 border-y border-[#f0f0f0]">
                  <div className="flex items-center gap-1 text-xs text-[#666666]">
                    <Icon name="visibility" className="text-[#2eb5c2]" />
                    <span>{listing.views}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#666666]">
                    <Icon name="question_answer" className="text-[#e89151]" />
                    <span>{listing.inquiries}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#666666]">
                    <Icon name="gavel" className="text-[#d55b39]" />
                    <span>{listing.bids}</span>
                  </div>
                </div>

                {/* Price and Quantity */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-[#666666] mb-1">Price</p>
                    <p className="text-xl font-bold text-[#0b5d68]">{listing.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#666666] mb-1">Available</p>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#2eb5c2]/10 text-[#2eb5c2] border border-[#2eb5c2]/20">
                      {listing.quantity}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-4 gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:border-[#2eb5c2] hover:text-[#2eb5c2] transition-colors"
                  >
                    <Icon name="edit" />
                  </Button>

                  {/* Eye / Status Toggle Button */}
                  <div
                    className="relative"
                    ref={openStatusDropdown === listing.id ? statusDropdownRef : undefined}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full hover:border-[#2eb5c2] hover:text-[#2eb5c2] transition-colors ${openStatusDropdown === listing.id ? 'border-[#2eb5c2] text-[#2eb5c2]' : ''
                        }`}
                      onClick={() =>
                        setOpenStatusDropdown((prev) => (prev === listing.id ? null : listing.id))
                      }
                      title="Change status"
                    >
                      <Icon name="visibility" />
                    </Button>

                    {/* Status Dropdown */}
                    {openStatusDropdown === listing.id && (
                      <div className="absolute left-0 bottom-full mb-2 z-50 min-w-[130px] bg-white rounded-xl shadow-xl border border-[#e0e0e0] overflow-hidden animate-fade-in-up">
                        {/* Dropdown arrow */}
                        <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-white border-r border-b border-[#e0e0e0] rotate-45" />

                        <div className="p-1.5 space-y-0.5">
                          <button
                            onClick={() => handleStatusChange(listing.id, 'live')}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${listing.status === 'live'
                              ? 'bg-[#2eb5c2]/10 text-[#2eb5c2]'
                              : 'text-[#0b5d68] hover:bg-[#f5fafa] hover:text-[#2eb5c2]'
                              }`}
                          >
                            <span
                              className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${listing.status === 'live' ? 'bg-[#2eb5c2]' : 'bg-[#cccccc]'
                                }`}
                            />
                            Active
                            {listing.status === 'live' && (
                              <Icon name="check" className="ml-auto text-[#2eb5c2] text-base" />
                            )}
                          </button>

                          <button
                            onClick={() => handleStatusChange(listing.id, 'paused')}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${listing.status === 'paused'
                              ? 'bg-[#d55b39]/10 text-[#d55b39]'
                              : 'text-[#0b5d68] hover:bg-[#fef5f3] hover:text-[#d55b39]'
                              }`}
                          >
                            <span
                              className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${listing.status === 'paused' ? 'bg-[#d55b39]' : 'bg-[#cccccc]'
                                }`}
                            />
                            Inactive
                            {listing.status === 'paused' && (
                              <Icon name="check" className="ml-auto text-[#d55b39] text-base" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(listing.id)}
                    className="hover:border-[#d55b39] hover:text-[#d55b39] transition-colors"
                  >
                    <Icon name="delete" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
