import { useState, useEffect } from 'react';
import { AdminListing } from '@/types/admin';

interface EditListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: AdminListing | null;
  onSave: (listingId: string, updatedData: any) => Promise<void>;
}

export function EditListingModal({ isOpen, onClose, listing, onSave }: EditListingModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    status: 'active'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title || '',
        description: listing.description || '',
        price: listing.price || 0,
        status: listing.status === 'active' ? 'ACTIVE' : 
                listing.status === 'expired' ? 'EXPIRED' : 
                (listing.status as string) === 'sold' ? 'SOLD' : 'DRAFT'
      });
    }
  }, [listing]);

  if (!isOpen || !listing) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(listing.id, formData);
      onClose();
    } catch (error) {
      console.error('Failed to save listing:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-outline/20">
          <h3 className="text-xl font-bold text-on-surface">Edit Listing</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">Title</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">Description</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              rows={4}
              className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">Price (Rs.)</label>
            <input 
              type="number" 
              value={formData.price} 
              onChange={e => setFormData({...formData, price: Number(e.target.value)})}
              className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">Status</label>
            <select 
              value={formData.status} 
              onChange={e => setFormData({...formData, status: e.target.value})}
              className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="SOLD">Sold</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-70"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
