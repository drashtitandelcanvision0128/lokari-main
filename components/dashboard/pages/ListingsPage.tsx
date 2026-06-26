'use client';

import { useState, useRef, useEffect } from 'react';
import DashboardLoader from '@/components/ui/DashboardLoader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Listing } from '@/types/dashboard';
// import { mockListings } from '@/data/dashboardMock'
import { apiUrl, authHeaders } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import { getAuthToken } from "@/lib/api";

import EditUserListingModal from '@/components/dashboard/modals/EditUserListingModal';

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


  // Modal State
  const [editOpen, setEditOpen] = useState(false)
  // const [selectedListing, setSelectedListing] = useState<any>(null)
  const [selectedListing, setSelectedListing] =
    useState<Listing | null>(null)

  const [imageModalOpen, setImageModalOpen] = useState(false)

  const [listingImages, setListingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  // state to track which image is being replaced
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);
  // state to track per-index replacement files
  const [replacedImages, setReplacedImages] = useState<Record<number, File>>({});

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
  const [sortField, setSortField] = useState<'product' | 'price' | 'quantity' | 'listingLocation' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: 'product' | 'price' | 'quantity' | 'listingLocation') => {
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

      console.log("FULL API DATA:", result.data);

      result.data.forEach((item: any) => {
        console.log(
          item.product,
          item.product_images
        );
      });
      // console.log(result.data[0])
      console.log('Full result:', result);
      console.log(
        "FIRST LISTING IMAGES:",
        result.data?.[0]?.product_images
      );

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
            // listingLocation:
            //   item.address?.city
            //     ? `${item.address.city}`
            //     : item.listing_location || '-',

            // listingLocation: item.address?.city ?? '-',

            address: item.address || null,

            listingLocation: item.address?.city ?? '-',
            // image: '',
            product_images: item.product_images || [],
            image:
              item.product_images?.length > 0
                ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${item.product_images[0]}`
                : '',
            createdAt: item.created_at,

            farmerProduce: item.farmerProduce ?? null,
            warehouse: item.warehouse ?? null,
            transport: item.transport ?? null,
          }));
        setListings(userListings);

        if (selectedListing) {
          const freshListing = userListings.find(
            (item: Listing) => item.id === selectedListing.id
          );

          if (freshListing) {
            setSelectedListing(freshListing);
          }
        }
        console.log("USER LISTINGS:", userListings);
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
        : 'DRAFT';


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
    return <DashboardLoader />;
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

  const closeImageModal = () => {
    setListingImages(
      selectedListing?.product_images || []
    );
    setReplacedImages({});

    setNewImages([]);
    setImageModalOpen(false);
  };


  const saveImages = async () => {
    if (!selectedListing?.id) {
      // console.log("NO SELECTED LISTING");
      return;
    }
    // console.log("SAVING IMAGES FOR:", selectedListing);
    // console.log("LISTING:", selectedListing);
    const formData = new FormData();

    const existingWithPlaceholders = listingImages.map((img, i) =>
      replacedImages[i] ? '__replaced__' : img
    );
    formData.append(
      "existingImages",
      JSON.stringify(existingWithPlaceholders)
    );

    // Send replacement files in order under ONE known field
    // Also send their index so backend knows which slot to put them in
    const replacedEntries = Object.entries(replacedImages);
    replacedEntries.forEach(([index, file]) => {
      formData.append('replaced_images', file);
    });

    // Send the indices separately so backend can map file → slot
    formData.append(
      'replacedIndices',
      JSON.stringify(replacedEntries.map(([index]) => Number(index)))
    );

    // New images (bulk added)
    newImages.forEach(file => {
      formData.append(
        "product_images",
        file
      );
    });

    // // Replaced images — send with index so backend knows which slot
    // Object.entries(replacedImages).forEach(([index, file]) => {
    //   formData.append(`replace_image_${index}`, file);
    // });


    const res = await fetch(
      apiUrl(`/listings/${selectedListing.id}/images`),
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        },
        // headers: {
        //   ...authHeaders()
        // },
        body: formData
      }
    );


    const result = await res.json();

    if (result.success) {
      await fetchListings();
      closeImageModal();
    }
  };


  const getImageSrc = (img?: string) => {
    if (!img) return '';

    if (img.startsWith('blob:')) return img;
    if (img.startsWith('http')) return img;

    return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${img}`;
  }


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
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto pb-24">
            <table className="min-w-full divide-y divide-outline-variant">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-[13px] font-semibold tracking-[0.02em] text-[#667085]">
                    <button onClick={() => handleSort('product')} className="
    group
    inline-flex
    items-center
    gap-2
    text-[13px]
    font-semibold
    text-[#667085]
    transition-colors
    hover:text-[#0b5d68]
  ">
                      Product
                      <span className="
    material-symbols-outlined
    text-[13px]
    text-gray-400
    transition-all
    duration-200
    group-hover:-translate-y-[1px]
    group-hover:text-[#0b5d68]
  ">
                        {sortField === 'product' ? (sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                      </span>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-center text-[13px] font-semibold tracking-[0.02em] text-[#667085]">
                    <button onClick={() => handleSort('price')} className="
    group
    inline-flex
    items-center
    gap-2
    text-[13px]
    font-semibold
    text-[#667085]
    transition-colors
    hover:text-[#0b5d68]
  ">
                      Price
                      <span className="
    material-symbols-outlined
    text-[13px]
    text-gray-400
    transition-all
    duration-200
    group-hover:-translate-y-[1px]
    group-hover:text-[#0b5d68]
  ">
                        {sortField === 'price' ? (sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                      </span>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-center text-[13px] font-semibold tracking-[0.02em] text-[#667085]">Price Type</th>
                  <th className="px-6 py-3 text-center text-[13px] font-semibold tracking-[0.02em] text-[#667085]">
                    <button
                      onClick={() => handleSort('listingLocation')}
                      className="
    group
    inline-flex
    items-center
    gap-2
    text-[13px]
    font-semibold
    text-[#667085]
    transition-colors
    hover:text-[#0b5d68]
  "
                    >
                      Location

                      <span className="
    material-symbols-outlined
    text-[13px]
    text-gray-400
    transition-all
    duration-200
    group-hover:-translate-y-[1px]
    group-hover:text-[#0b5d68]
  ">
                        {
                          sortField === 'listingLocation'
                            ? sortDirection === 'asc'
                              ? 'arrow_upward'
                              : 'arrow_downward'
                            : 'unfold_more'
                        }
                      </span>

                    </button>
                  </th>
                  <th className="px-6 py-3 text-center text-[13px] font-semibold tracking-[0.02em] text-[#667085]">
                    <button
                      onClick={() => handleSort('quantity')}
                      className="
    group
    inline-flex
    items-center
    gap-2
    text-[13px]
    font-semibold
    text-[#667085]
    transition-colors
    hover:text-[#0b5d68]
  "
                    >
                      Quantity

                      <span className="
    material-symbols-outlined
    text-[13px]
    text-gray-400
    transition-all
    duration-200
    group-hover:-translate-y-[1px]
    group-hover:text-[#0b5d68]
  ">
                        {
                          sortField === 'quantity'
                            ? sortDirection === 'asc'
                              ? 'arrow_upward'
                              : 'arrow_downward'
                            : 'unfold_more'
                        }
                      </span>

                    </button>
                  </th>
                  <th className="px-6 py-3 text-center text-[13px] font-semibold tracking-[0.02em] text-[#667085]">Status</th>
                  <th className="px-6 py-3 text-center text-[13px] font-semibold tracking-[0.02em] text-[#667085]">Stats</th>
                  <th className="px-6 py-3 text-center text-[13px] font-semibold tracking-[0.02em] text-[#667085]">Actions</th>
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
                          className={`inline-block whitespace-nowrap px-2.5 py-0.5 rounded-full text-xs font-medium border ${listing.priceType === 'AUCTION'
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
                          <span className="
group
inline-flex
items-center
gap-2
transition-colors
hover:text-[#0b5d68]
" title="Views"><Icon name="visibility" className="text-[#2eb5c2] text-sm" />{listing.views}</span>
                          <span className="
group
inline-flex
items-center
gap-2
transition-colors
hover:text-[#0b5d68]
" title="Inquiries"><Icon name="question_answer" className="text-[#e89151] text-sm" />{listing.inquiries}</span>
                          <span className="
group
inline-flex
items-center
gap-2
transition-colors
hover:text-[#0b5d68]
" title="Bids"><Icon name="gavel" className="text-[#d55b39] text-sm" />{listing.bids}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {/* <Button variant="outline" size="sm" className="hover:border-[#2eb5c2] hover:text-[#2eb5c2]" title="Edit">
                            <Icon name="edit" />
                          </Button> */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="
    h-7
    px-2.5
    rounded-md
    border
    border-gray-200
    bg-white
    text-gray-500
    shadow-sm
    hover:border-[#2eb5c2]/40
    hover:text-[#0b5d68]
    hover:shadow-md
    transition-all
    duration-200
    flex
    items-center
    justify-center
    group/edit
  "
                            onClick={() => {
                              setSelectedListing(listing)
                              setEditOpen(true)
                            }}
                          >

                            <div className="relative w-5 h-5">

                              {/* paper */}
                              <span
                                className="
        absolute
        left-[1px]
        top-[3px]
        w-[13px]
        h-[15px]
        rounded-[2px]
        border-[1.5px]
        border-current
        transition-all
        duration-200
        group-hover/edit:-translate-x-[1px]
      "
                              >

                                {/* paper line 1 */}
                                <span
                                  className="
          absolute
          left-[3px]
          top-[4px]
          w-[6px]
          h-[1px]
          bg-current
          rounded-full
        "
                                />

                                {/* paper line 2 */}
                                <span
                                  className="
          absolute
          left-[3px]
          top-[8px]
          w-[8px]
          h-[1px]
          bg-current
          rounded-full
        "
                                />

                              </span>


                              {/* pen */}
                              <span
                                className="
        absolute
        right-[-1px]
        top-[0px]
        w-[10px]
        h-[3px]
        rounded-full
        bg-current
        rotate-[-45deg]
        transition-all
        duration-200
        origin-left

        group-hover/edit:translate-x-[4px]
        group-hover/edit:-translate-y-[2px]
      "
                              />

                            </div>

                          </Button>
                          <div className="relative" ref={openStatusDropdown === listing.id ? statusDropdownRef : undefined}>
                            <Button
                              variant="outline"
                              size="sm"
                              // className={`hover:border-[#2eb5c2] hover:text-[#2eb5c2] transition-colors ${openStatusDropdown === listing.id ? 'border-[#2eb5c2] text-[#2eb5c2]' : ''}`}
                              className="
  h-7
  px-2.5
  rounded-md
  border
  border-gray-200
  bg-white
  shadow-sm
  hover:border-[#2eb5c2]/40
  hover:shadow-md
  transition-all
  duration-200
  flex
  items-center
  justify-center
"
                              onClick={() => setOpenStatusDropdown((prev) => (prev === listing.id ? null : listing.id))}
                              title="Change status"
                            >
                              <div
                                className={`
    relative
    w-6 h-3
    rounded-full
    transition-all
    duration-300
    ease-in-out
    ${listing.status === 'live'
                                    ? 'bg-[#2eb5c2]'
                                    : 'bg-[#d55b39]'
                                  }
  `}
                              >
                                <span
                                  className={`
      absolute
      top-[1.5px]
      w-2 h-2
      rounded-full
      bg-white
      shadow-sm
      transition-all
      duration-300
      ease-in-out
      ${listing.status === 'live'
                                      ? 'left-[14px]'
                                      : 'left-[2px]'
                                    }
    `}
                                />
                              </div>
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedListing(listing)
                              setListingImages(listing.product_images || [])
                              setNewImages([])
                              setImageModalOpen(true)
                            }}
                            className="
  h-7
  px-2.5
  rounded-md
  border
  border-[#2eb5c2]/20
  bg-white
  text-[#2eb5c2]
  shadow-sm
  hover:bg-[#2eb5c2]/5
  hover:border-[#2eb5c2]/50
  hover:shadow-md
  transition-all
  duration-200
  flex
  items-center
  justify-center
  group
"
                            title="Update Images"
                          >
                            <Icon
                              name="upload"
                              className="
    text-[14px]
    transition-transform
    duration-200
    group-hover:-translate-y-[1px]
  "
                            />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(listing.id)}
                            className="
    h-7
    px-2.5
    rounded-md
    border
    border-gray-200
    bg-white
    text-red-400
    shadow-sm
    hover:border-red-200
    hover:bg-red-50
    hover:text-red-500
    hover:shadow-md
    transition-all
    duration-200
    flex
    items-center
    justify-center
    group/delete
  

" title="Delete">
                            <div className="relative w-[16px] h-[16px]">

                              {/* lid */}
                              <span
                                className="
    absolute
    left-[3px]
    top-[1px]
    w-[10px]
    h-[3px]
    rounded-sm
    bg-current
    transition-all
    duration-200
    origin-left

    group-hover/delete:-rotate-12
    group-hover/delete:-translate-y-[2px]
    group-hover/delete:-translate-x-[1px]
  "
                              />

                              {/* body */}
                              <span
                                className="
    absolute
    left-[4px]
    top-[5px]
    w-[8px]
    h-[10px]
    rounded-b-sm
    bg-current
    transition-all
    duration-200

    group-hover/delete:translate-y-[1px]
  "
                              />

                            </div>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <EditUserListingModal
            isOpen={editOpen}
            listing={selectedListing}
            onClose={() => setEditOpen(false)}
            onSuccess={fetchListings}
          />

          {imageModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => closeImageModal()}
              />


              <div className="
            relative w-full max-w-lg
            rounded-2xl bg-white shadow-2xl
            overflow-hidden
        ">


                {/* Header */}
                <div className="relative bg-white border-b border-[#edf1f3]">

                  {/* Accent bar */}
                  <div
                    className="
            absolute top-0 left-0 w-full h-[3px]
            bg-gradient-to-r
            from-[#0b5d68]
            via-[#2eb5c2]
            to-[#2eb5c2]/30
        "
                  />

                  <div className="flex items-center justify-between px-5 pt-5 pb-4">

                    <div className="flex items-center gap-3">

                      <div
                        className="
                    w-10 h-10
                    rounded-md
                    bg-gradient-to-br
                    from-[#0b5d68]
                    to-[#2eb5c2]
                    flex items-center justify-center
                    shadow-md
                "
                      >
                        <span className="material-symbols-outlined text-white text-[18px]">
                          photo_library
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-[#0b5d68]">
                          Update Images
                        </h3>

                        <p className="text-[11px] text-[#888]">
                          Manage listing gallery and cover image
                        </p>
                      </div>

                    </div>

                    <button
                      onClick={closeImageModal}
                      className="
                w-8 h-8
                rounded
                flex items-center justify-center
                text-[#999]
                hover:bg-[#f3f6f7]
                hover:text-[#0b5d68]
                transition
            "
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        close
                      </span>
                    </button>

                  </div>
                </div>



                {/* Body */}
                <div className="p-5">


                  <div className="
                    grid grid-cols-3 gap-3
                ">

                    {listingImages.map((img, index) => (
                      <div
                        key={img}
                        className="
        group
        relative
        h-28
        rounded
        overflow-hidden
        bg-gray-100
    "
                      >

                        {index === 0 && (
                          <div
                            className="
                                                absolute top-2 left-2 z-10
                                                px-2 py-1
                                                rounded-md
                                                bg-black/45
                                                backdrop-blur-md
                                                text-white
                                                text-[10px]
                                                font-medium
                                                tracking-wide
                                            "
                          >
                            Cover Image
                          </div>

                          //                                     <div
                          //                                         className="
                          //     absolute top-2 left-2 z-10
                          //     px-2.5 py-1
                          //     rounded
                          //     bg-white/90
                          //     backdrop-blur-md
                          //     border border-white
                          //     text-[#0b5d68]
                          //     text-[10px]
                          //     font-semibold
                          // "
                          //                                     >
                          //                                         COVER
                          //                                     </div>

                          //                                     <div
                          //                                         className="
                          //     absolute top-2 left-2 z-10
                          //     text-white
                          //     text-[10px]
                          //     font-medium
                          //     tracking-[0.12em]
                          //     uppercase
                          //     drop-shadow-md
                          // "
                          //                                     >
                          //                                         Cover
                          //                                     </div>
                        )}


                        <img
                          src={getImageSrc(img)}
                          className="
        w-full
        h-full
        object-cover
        transition-transform
        duration-300
        group-hover:scale-105
    "
                        />

                        <div
                          className="
        absolute
        inset-0
        flex
        items-center
        justify-center
        bg-black/40
        opacity-0
        group-hover:opacity-100
        transition
    "
                        >
                          <label
                            htmlFor="listing-image-replace" // ← shared input, index tracked via state
                            onClick={() => setReplacingIndex(index)}
                            className="
            w-10
            h-10
            rounded-full
            bg-white/90
            flex
            items-center
            justify-center
            cursor-pointer
            shadow-lg
            hover:bg-white
            transition
        "
                          >
                            <span className="material-symbols-outlined text-[#0b5d68] text-[22px]">
                              upload
                            </span>
                          </label>
                        </div>
                        <button
                          onClick={() => {
                            setListingImages(
                              listingImages.filter((_, i) => i !== index)
                            )
                          }}
                          className="
    absolute top-1.5 right-1.5
    w-5 h-5
    rounded-full
    bg-[#faf7f2]
    border border-[#f0ebe3]
    flex items-center justify-center
    text-[#666]
    shadow-sm
    transition-all duration-300
    hover:bg-white
    hover:text-red-500
    group/delete
"
                        >
                          <span
                            className="
        block text-sm
        leading-none
        transition-transform duration-300
        group-hover/delete:rotate-90
    "
                          >
                            ×
                          </span>
                        </button>

                      </div>
                    ))}


                  </div>


                  {/* Hidden input for per-image replacement */}
                  <input
                    id="listing-image-replace"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file || replacingIndex === null) return;

                      const objectUrl = URL.createObjectURL(file);

                      // Swap the image at replacingIndex with a preview URL
                      setListingImages(prev =>
                        prev.map((img, i) => (i === replacingIndex ? objectUrl : img))
                      );

                      // Track the replacement so saveImages can send it
                      setReplacedImages(prev => ({
                        ...prev,
                        [replacingIndex]: file,
                      }));

                      setReplacingIndex(null);
                      e.target.value = ''; // reset so same file can be re-selected
                    }}
                  />

                  <label
                    htmlFor="listing-image-upload"
                    className="
        mt-4
        flex flex-col items-center justify-center
        gap-2
        p-6
        border-2 border-dashed border-[#2eb5c2]/30
        rounded-xl
        bg-[#f8fcfc]
        cursor-pointer
        hover:border-[#2eb5c2]
        hover:bg-[#f2fbfc]
        transition
    "
                  >
                    <span
                      className="
            material-symbols-outlined
            text-[#2eb5c2]
            text-[32px]
        "
                    >
                      cloud_upload
                    </span>

                    <div className="text-sm font-semibold text-[#0b5d68]">
                      Choose Images
                    </div>

                    <div className="text-xs text-gray-500">
                      PNG, JPG, WEBP • Multiple files allowed
                    </div>

                    {newImages.length > 0 && (
                      <div className="
            mt-2
            px-3 py-1
            rounded-full
            bg-[#2eb5c2]/10
            text-[#0b5d68]
            text-xs
            font-medium
        ">
                        {newImages.length} file{newImages.length > 1 ? 's' : ''} selected
                      </div>
                    )}
                  </label>

                  <input
                    id="listing-image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (!e.target.files) return

                      setNewImages(Array.from(e.target.files))
                    }}
                  />

                </div>



                {/* Footer */}
                <div
                  className="
        flex items-center justify-between
        gap-3
        px-5 py-4
        bg-white
        border-t border-[#edf1f3]
    "
                >

                  {/* <p className="text-xs text-[#999]">
                                The first image will be used as the cover image.
                            </p> */}

                  <div className="ml-auto flex items-center gap-2">

                    <button
                      onClick={closeImageModal}
                      className="
                px-4 py-2
                rounded-md
                text-sm font-medium
                text-[#555]
                border border-[#e0e4e6]
                bg-white
                hover:bg-[#f5f7f8]
                hover:border-[#cdd3d6]
                transition-all
            "
                    >
                      Cancel
                    </button>

                    <button
                      onClick={saveImages}
                      className="
                inline-flex items-center gap-2
                px-5 py-2
                rounded-md
                text-sm font-semibold
                text-white
                bg-gradient-to-r
                from-[#0b5d68]
                to-[#2eb5c2]
                hover:from-[#0a5260]
                hover:to-[#28a8b4]
                shadow-[0_2px_12px_rgba(46,181,194,0.35)]
                transition-all
            "
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        save
                      </span>

                      Save Images
                    </button>

                  </div>

                </div>


              </div>

            </div>
          )}

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
    </div >
  );
}
