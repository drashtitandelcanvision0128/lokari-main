import { useState } from 'react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any) => Promise<void>;
}

export function AddUserModal({ isOpen, onClose, onSave }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'farmer',
    farmName: '',
    companyName: '',
    businessType: '',
    warehouseName: '',
    capacity: '',
    vehicleType: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      // Reset form after successful save
      setFormData({
        fullName: '', email: '', password: '', phone: '', role: 'farmer',
        farmName: '', companyName: '', businessType: '', warehouseName: '',
        capacity: '', vehicleType: '', location: '',
      });
      onClose();
    } catch (error) {
      console.error('Failed to create user:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSpecificFields = () => {
    switch (formData.role) {
      case 'farmer':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Farm Name</label>
              <input type="text" value={formData.farmName} onChange={e => setFormData({...formData, farmName: e.target.value})} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Farm Location</label>
              <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent" />
            </div>
          </>
        );
      case 'trader':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Company Name</label>
              <input type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Business Type</label>
              <input type="text" value={formData.businessType} onChange={e => setFormData({...formData, businessType: e.target.value})} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent" />
            </div>
          </>
        );
      case 'warehouse':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Warehouse Name</label>
              <input type="text" value={formData.warehouseName} onChange={e => setFormData({...formData, warehouseName: e.target.value})} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Warehouse Location</label>
              <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Capacity</label>
              <input type="text" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent" />
            </div>
          </>
        );
      case 'transporter':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Vehicle Type</label>
              <input type="text" value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Service Area</label>
              <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent" />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-outline/20 flex justify-between items-center">
          <h3 className="text-xl font-bold text-on-surface">Add New User</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          <form id="add-user-form" onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Full Name *</label>
                <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Email *</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Password *</label>
                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Phone</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Role *</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value, location: ''})} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent">
                  <option value="farmer">Farmer</option>
                  <option value="trader">Trader</option>
                  <option value="warehouse">Warehouse</option>
                  <option value="transporter">Transporter</option>
                </select>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-outline/20">
              <h4 className="text-sm font-bold text-primary mb-4 capitalize">{formData.role} Details</h4>
              <div className="grid grid-cols-2 gap-4">
                {renderRoleSpecificFields()}
              </div>
            </div>
          </form>
        </div>
        <div className="p-6 border-t border-outline/20 bg-surface flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
            Cancel
          </button>
          <button type="submit" form="add-user-form" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-colors disabled:opacity-70">
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  );
}
