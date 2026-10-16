import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Address } from '../../types/index.js';
import { api } from '../../lib/api.js';
import { Button } from '../../components/common/Button.js';
import { Badge } from '../../components/common/Badge.js';

export const Addresses: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isDefaultShipping, setIsDefaultShipping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadAddresses = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<{ data: Address[] }>('/addresses');
      setAddresses(res.data);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const openAddModal = () => {
    setEditingAddress(null);
    setFullName('');
    setPhone('');
    setStreetAddress('');
    setApartment('');
    setCity('');
    setState('');
    setPostalCode('');
    setIsDefaultShipping(addresses.length === 0);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddress(addr);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setStreetAddress(addr.streetAddress);
    setApartment(addr.apartment || '');
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
    setIsDefaultShipping(addr.isDefaultShipping);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const payload = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        streetAddress: streetAddress.trim(),
        apartment: apartment.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        isDefaultShipping,
      };

      if (editingAddress) {
        await api.patch(`/addresses/${editingAddress.id}`, payload);
      } else {
        await api.post('/addresses', payload);
      }

      setIsModalOpen(false);
      await loadAddresses();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to save address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/addresses/${id}`);
      await loadAddresses();
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to delete address');
    }
  };

  return (
    <div className="bg-white border border-vastra-border rounded-sm p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-vastra-border/60">
        <div>
          <h2 className="font-serif text-xl font-semibold text-vastra-charcoal">Delivery Addresses</h2>
          <p className="text-xs text-vastra-muted mt-0.5">
            Manage destinations for your handcrafted deliveries
          </p>
        </div>
        <Button onClick={openAddModal} size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add New Address</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="w-6 h-6 border-2 border-vastra-terracotta border-t-transparent rounded-full animate-spin" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="py-12 text-center text-xs text-vastra-muted">
          No addresses saved yet. Click "Add New Address" to save your shipping destination.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-4 border rounded-sm relative flex flex-col justify-between ${
                addr.isDefaultShipping
                  ? 'border-vastra-terracotta bg-vastra-terracotta-light/10'
                  : 'border-vastra-border bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-semibold text-sm text-vastra-charcoal">
                    {addr.fullName}
                  </span>
                  {addr.isDefaultShipping && (
                    <Badge variant="sale" className="text-[10px]">
                      Default Shipping
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-vastra-muted space-y-1">
                  <p>{addr.streetAddress}</p>
                  {addr.apartment && <p>{addr.apartment}</p>}
                  <p>
                    {addr.city}, {addr.state} - {addr.postalCode}
                  </p>
                  <p>{addr.country}</p>
                  <p className="pt-1 text-vastra-charcoal font-medium">Phone: {addr.phone}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-vastra-border/40">
                <button
                  onClick={() => openEditModal(addr)}
                  className="text-xs text-vastra-charcoal hover:text-vastra-terracotta flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-sm border border-vastra-border max-w-lg w-full p-6 shadow-elevated animate-fade-in">
            <h3 className="font-serif text-lg font-semibold text-vastra-charcoal mb-4">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>

            {errorMessage && (
              <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-vastra-surface border border-vastra-border rounded-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-vastra-surface border border-vastra-border rounded-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-vastra-surface border border-vastra-border rounded-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
                  Apartment / Suite (Optional)
                </label>
                <input
                  type="text"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-vastra-surface border border-vastra-border rounded-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-vastra-surface border border-vastra-border rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-vastra-surface border border-vastra-border rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-vastra-charcoal mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-vastra-surface border border-vastra-border rounded-sm"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs text-vastra-charcoal cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDefaultShipping}
                    onChange={(e) => setIsDefaultShipping(e.target.checked)}
                    className="text-vastra-terracotta focus:ring-vastra-terracotta rounded-xs"
                  />
                  <span>Make this my default shipping address</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-vastra-border/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-vastra-muted hover:text-vastra-charcoal"
                >
                  Cancel
                </button>
                <Button type="submit" size="sm" isLoading={isSubmitting}>
                  Save Address
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
