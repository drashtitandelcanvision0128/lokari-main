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
  const [filter, setFilter] =
    useState<'all' | 'ACTIVE' | 'DRAFT' | 'SOLD' | 'EXPIRED'>('all')
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

  // For Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // For sorting
  const [sortField, setSortField] = useState<'product' | 'price' | 'listingLocation' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: 'product' | 'price' | 'listingLocation') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const fetchListings = async () => {
    try {
      const currentUser = getCurrentUser();

      if (!currentUser?.id) {
        setListings([]);
        return;
      }

      // const response = await fetch(apiUrl('/listings'));
      const response = await fetch(
        apiUrl(
          `/listings?search=${localSearch.trim()}&status=${filter.trim()}&sortField=${sortField?.trim()}&sortDirection=${sortDirection.trim()}&page=${currentPage}&limit=${rowsPerPage}`
        )
      )
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
            quantity: item.farmerProduce
              ? `${item.farmerProduce.quantity} ${item.farmerProduce.unit || ''}`
              : item.warehouse
                ? `${item.warehouse.capacity}`
                : item.transport
                  ? `${item.transport.capacity}`
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
            priceType: item.price_type || '-',
            listingLocation: item.listing_location || '-',
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
  useEffect(() => {

    fetchListings();
  }, []);

  useEffect(() => {
    fetchListings();
  }, [
    localSearch,
    filter,
    sortField,
    sortDirection,
    currentPage,
    rowsPerPage
  ]);


  const handleStatusChange = async (
    listingId: string,
    newStatus: 'live' | 'paused'
  ) => {
    setOpenStatusDropdown(null);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, localSearch, listingTypeFilter]);

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading listings...</p>
      </div>
    );
  }

  // const filteredListings = listings.filter((listing) => {
  //   const matchesFilter = filter === 'all' || listing.status === filter;
  //   const matchesTypeFilter =
  //     listingTypeFilter === 'all' || listing.listingType === listingTypeFilter;
  //   const matchesSearch =
  //     localSearch === '' ||
  //     listing.product.toLowerCase().includes(localSearch.toLowerCase()) ||
  //     listing.description.toLowerCase().includes(localSearch.toLowerCase());
  //   return matchesFilter && matchesTypeFilter && matchesSearch;
  // });
  // const filteredListings = listings

  // const sortedListings = [...filteredListings].sort((a, b) => {
  // const sortedListings = filteredListings
  // const paginatedListings = listings;
  //   if (!sortField) return 0;

  //   let valueA: any = '';
  //   let valueB: any = '';

  //   if (sortField === 'product') {
  //     valueA = a.product.toLowerCase();
  //     valueB = b.product.toLowerCase();
  //   } else if (sortField === 'price') {
  //     valueA = Number((a.price || '').replace(/[^0-9.-]+/g, ""));
  //     valueB = Number((b.price || '').replace(/[^0-9.-]+/g, ""));
  //   } else if (sortField === 'listingLocation') {
  //     valueA = a.listingLocation?.toLowerCase() || '';
  //     valueB = b.listingLocation?.toLowerCase() || '';
  //   }

  //   if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
  //   if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
  //   return 0;
  // });

  // const totalPages = Math.ceil(sortedListings.length / rowsPerPage);
  // const paginatedListings = sortedListings.slice(
  //   (currentPage - 1) * rowsPerPage,
  //   currentPage * rowsPerPage
  // );
  // const paginatedListings = sortedListings;
  const paginatedListings = listings;

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
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="SOLD">Sold</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>
      {/* Product Cards Grid */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#0b5d68]">Active Listings</h2>
          <div className="text-sm text-[#666666]">
            {listings.length} {listings.length === 1 ? 'listing' : 'listings'} found
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto pb-24">
            <table className="min-w-full divide-y divide-outline-variant">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                    <button onClick={() => handleSort('product')} className="flex items-center gap-1 hover:text-primary">
                      Product
                      <span className="material-symbols-outlined text-sm">
                        {sortField === 'product' ? (sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                      </span>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                    <button onClick={() => handleSort('price')} className="flex items-center gap-1 hover:text-primary">
                      Price
                      <span className="material-symbols-outlined text-sm">
                        {sortField === 'price' ? (sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                      </span>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">Price Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                    <button onClick={() => handleSort('listingLocation')} className="flex items-center gap-1 hover:text-primary">
                      Location
                      <span className="material-symbols-outlined text-sm">
                        {sortField === 'listingLocation' ? (sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                      </span>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">Stats</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedListings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon name="inventory_2" className="text-2xl text-gray-400" />
                      </div>
                      <p>No listings found.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedListings.map((listing) => (
                    <tr key={listing.id} className={`hover:bg-gray-50 transition-colors ${listing.status === 'paused' ? 'opacity-70 bg-[#fcfcfc]' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {listing.image ? (
                            <img src={listing.image} alt={listing.product} className="h-10 w-10 rounded-lg object-cover bg-gray-100" />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Icon name="inventory_2" className="text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{listing.product}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{listing.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-[#0b5d68]">
                        {listing.price}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${listing.priceType === 'AUCTION'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : listing.priceType === 'FIXED_PRICE'
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                              : 'text-gray-400 border-transparent'
                            }`}
                        >
                          {listing.priceType?.replace('_', ' ') || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {listing.listingLocation !== '-' ? listing.listingLocation : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#2eb5c2]/10 text-[#2eb5c2] border border-[#2eb5c2]/20">
                          {listing.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(listing.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1" title="Views"><Icon name="visibility" className="text-[#2eb5c2] text-sm" />{listing.views}</span>
                          <span className="flex items-center gap-1" title="Inquiries"><Icon name="question_answer" className="text-[#e89151] text-sm" />{listing.inquiries}</span>
                          <span className="flex items-center gap-1" title="Bids"><Icon name="gavel" className="text-[#d55b39] text-sm" />{listing.bids}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="hover:border-[#2eb5c2] hover:text-[#2eb5c2]" title="Edit">
                            <Icon name="edit" />
                          </Button>
                          <div className="relative" ref={openStatusDropdown === listing.id ? statusDropdownRef : undefined}>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`hover:border-[#2eb5c2] hover:text-[#2eb5c2] transition-colors ${openStatusDropdown === listing.id ? 'border-[#2eb5c2] text-[#2eb5c2]' : ''}`}
                              onClick={() => setOpenStatusDropdown((prev) => (prev === listing.id ? null : listing.id))}
                              title="Change status"
                            >
                              <Icon name="visibility" />
                            </Button>
                            {openStatusDropdown === listing.id && (
                              <div className="absolute right-0 top-full mt-2 z-50 min-w-[130px] bg-white rounded-xl shadow-xl border border-[#e0e0e0] overflow-hidden">
                                <div className="absolute -top-1.5 right-4 w-3 h-3 bg-white border-l border-t border-[#e0e0e0] rotate-45" />
                                <div className="p-1.5 space-y-0.5 relative bg-white z-10">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(listing.id, 'live'); }}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${listing.status === 'live' ? 'bg-[#2eb5c2]/10 text-[#2eb5c2]' : 'text-[#0b5d68] hover:bg-[#f5fafa] hover:text-[#2eb5c2]'}`}
                                  >
                                    <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${listing.status === 'live' ? 'bg-[#2eb5c2]' : 'bg-[#cccccc]'}`} />
                                    Active
                                    {listing.status === 'live' && <Icon name="check" className="ml-auto text-[#2eb5c2] text-base" />}
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(listing.id, 'paused'); }}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${listing.status === 'paused' ? 'bg-[#d55b39]/10 text-[#d55b39]' : 'text-[#0b5d68] hover:bg-[#fef5f3] hover:text-[#d55b39]'}`}
                                  >
                                    <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${listing.status === 'paused' ? 'bg-[#d55b39]' : 'bg-[#cccccc]'}`} />
                                    Inactive
                                    {listing.status === 'paused' && <Icon name="check" className="ml-auto text-[#d55b39] text-base" />}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(listing.id)} className="hover:border-[#d55b39] hover:text-[#d55b39] transition-colors" title="Delete">
                            <Icon name="delete" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer pagination */}
          {/* {sortedListings.length > 0 && ( */}
          {listings.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, listings.length)} of {listings.length} listings
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Rows:</span>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-200 rounded-md px-2 py-1 text-sm focus:outline-none"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className="px-3 py-1 text-sm border rounded-md disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      {currentPage} / {totalPages || 1}
                    </span>
                    <button
                      disabled={currentPage === totalPages || totalPages === 0}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="px-3 py-1 text-sm border rounded-md disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
