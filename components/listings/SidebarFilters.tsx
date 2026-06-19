'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUserRole } from '@/lib/auth';
import { usePostListingNavigation } from '@/hooks/usePostListingNavigation';

interface SidebarFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

interface FilterState {
  categories: string[];
  location: string;
  priceMin: string;
  priceMax: string;
  availabilityDate: string;
  storageTypes: string[];
}

const filterSectionTitle =
  'text-xs font-semibold uppercase tracking-wider text-[#0b5d68]/80 border-b border-gray-100 pb-2 mb-4 font-headline';

const filterLabel = 'block font-medium text-xs text-[#0b5d68] mb-1 font-body';

const filterInput =
  'w-full rounded-[0.3125rem] border border-gray-200 bg-white py-1.5 text-xs text-[#0b5d68] placeholder:text-gray-400 transition-all focus:border-[#2eb5c2] focus:outline-none focus:ring-2 focus:ring-[#2eb5c2]/30 font-body';

const filterCheckbox =
  'h-4 w-4 rounded-[0.3125rem] border-gray-300 text-[#0b5d68] focus:ring-[#2eb5c2]/30 focus:ring-2';

function FilterField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={filterLabel}>{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
          <span className="material-symbols-outlined text-sm text-[#2eb5c2]">{icon}</span>
        </span>
        {children}
      </div>
    </div>
  );
}

const SidebarFilters = ({ onFilterChange }: SidebarFiltersProps) => {
  const [userRole, setUserRole] = useState<string>('');
  const { createListingPath } = usePostListingNavigation();
  const [filters, setFilters] = useState<FilterState>({
    categories: ['produce', 'warehouse', 'transport'],
    location: 'all',
    priceMin: '',
    priceMax: '',
    availabilityDate: '',
    storageTypes: [],
  });

  useEffect(() => {
    setUserRole(getUserRole());
  }, []);

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter((c) => c !== category);

    const newFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleStorageTypeClick = (storageType: string) => {
    const newStorageTypes = filters.storageTypes.includes(storageType)
      ? filters.storageTypes.filter((t) => t !== storageType)
      : [...filters.storageTypes, storageType];

    const newFilters = { ...filters, storageTypes: newStorageTypes };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleChange = (field: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const storagePillClass = (active: boolean) =>
    `px-2 py-1 rounded-[0.3125rem] text-xs font-medium border cursor-pointer transition-all font-body ${
      active
        ? 'bg-[#0b5d68] text-white border-[#0b5d68]'
        : 'bg-white text-[#0b5d68] border-gray-200 hover:border-[#2eb5c2] hover:text-[#2eb5c2]'
    }`;

  return (
    <aside className="hidden lg:flex flex-col w-72 shrink-0 bg-white border-r border-gray-100 sticky top-16 self-start max-h-[calc(100vh-4rem)] overflow-y-auto py-8 px-6 z-10">
      <div className="mb-6">
        <h2 className="font-headline text-lg font-bold text-[#0b5d68] mb-1">Market Filters</h2>
        {/* <p className="text-[0.875rem] text-[#666666] font-body">Refine listings by category, location, and price</p> */}
      </div>

      <div className="space-y-8 flex-1">
        {/* Category Filters */}
        <div>
          <h3 className={filterSectionTitle}>Category</h3>
          <div className="space-y-2.5">
            {[
              { id: 'produce', label: 'Produce' },
              { id: 'warehouse', label: 'Storage Units' },
              { id: 'transport', label: 'Transport' },
            ].map(({ id, label }) => (
              <label
                key={id}
                className="flex items-center gap-3 cursor-pointer text-[0.875rem] text-[#0b5d68] font-body"
              >
                <input
                  checked={filters.categories.includes(id)}
                  onChange={(e) => handleCategoryChange(id, e.target.checked)}
                  className={filterCheckbox}
                  type="checkbox"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Location Filter */}
        <div>
          <h3 className={filterSectionTitle}>Location</h3>
          <FilterField label="Region" icon="location_on">
            <select
              value={filters.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className={`${filterInput} appearance-none pl-8 pr-7`}
            >
              <option value="all">All Regions</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Uttarakhand">Uttarakhand</option>
              <option value="Punjab">Punjab</option>
              <option value="Himachal Pradesh">Himachal Pradesh</option>
              <option value="Delhi">Delhi</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <span className="material-symbols-outlined text-sm text-[#2eb5c2]">
                expand_more
              </span>
            </span>
          </FilterField>
        </div>

        {/* Price Range */}
        <div>
          <h3 className={filterSectionTitle}>Price Range</h3>
          <label className={filterLabel}>Min – Max (₹)</label>
          <div className="flex items-center gap-2">
            <input
              value={filters.priceMin}
              onChange={(e) => handleChange('priceMin', e.target.value)}
              className={`${filterInput} px-2`}
              placeholder="Min"
              type="text"
              inputMode="numeric"
            />
            <span className="text-[#666666] text-xs shrink-0">–</span>
            <input
              value={filters.priceMax}
              onChange={(e) => handleChange('priceMax', e.target.value)}
              className={`${filterInput} px-2`}
              placeholder="Max"
              type="text"
              inputMode="numeric"
            />
          </div>
        </div>

        {/* Storage Type */}
        <div>
          <h3 className={filterSectionTitle}>Storage Type</h3>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'cold', label: 'Cold Storage' },
              { id: 'dry', label: 'Dry Grain Silo' },
              { id: 'climate', label: 'Climate Controlled' },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleStorageTypeClick(id)}
                className={storagePillClass(filters.storageTypes.includes(id))}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {userRole !== 'trader' && (
        <Link
          href={createListingPath}
          className="mt-8 w-full py-2.5 bg-[#0b5d68] text-white rounded-[0.3125rem] font-medium text-[0.875rem] font-headline flex items-center justify-center gap-2 hover:bg-[#094851] transition-colors"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Post Listing
        </Link>
      )}
    </aside>
  );
};

export default SidebarFilters;
