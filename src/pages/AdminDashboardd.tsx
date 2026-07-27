import React, { useState } from 'react';
import { Apartment, ApartmentStatus } from "./types";

export function AdminDashboardd() {
  // 1. Initial Default Apartments List
  const [apartments, setApartments] = useState<Apartment[]>([
    {
      id: '1',
      unitNumber: '101',
      floor: 1,
      rooms: 3,
      price: 450000,
      apartmentType: 'Residential Apartment',
      view: 'Front Facade - Main Street',
      paymentPlan: '3-Year Installments (15% Down Payment)',
      status: 'available',
    },
    {
      id: '2',
      unitNumber: '102',
      floor: 1,
      rooms: 4,
      price: 580000,
      apartmentType: 'Duplex',
      view: 'Garden View',
      paymentPlan: 'Cash Only',
      status: 'reserved',
    },
  ]);

  // 2. Add Form State
  const [unitNumber, setUnitNumber] = useState('');
  const [floor, setFloor] = useState<number | ''>('');
  const [rooms, setRooms] = useState<number | ''>('');
  const [price, setPrice] = useState<number | ''>('');
  const [apartmentType, setApartmentType] = useState('Residential Apartment');
  const [view, setView] = useState('');
  const [paymentPlan, setPaymentPlan] = useState('Cash');
  const [status, setStatus] = useState<ApartmentStatus>('available');

  // 3. Add New Apartment Handler
  const handleAddApartment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!unitNumber || floor === '' || rooms === '' || price === '') {
      alert('Please fill in all required fields!');
      return;
    }

    const newApartment: Apartment = {
      id: Date.now().toString(),
      unitNumber,
      floor: Number(floor),
      rooms: Number(rooms),
      price: Number(price),
      apartmentType,
      view,
      paymentPlan,
      status,
    };

    setApartments([newApartment, ...apartments]);

    // Reset Form
    setUnitNumber('');
    setFloor('');
    setRooms('');
    setPrice('');
    setView('');
    alert('Apartment successfully added to inventory!');
  };

  // 4. Quick Status Change Handler
  const handleStatusChange = (id: string, newStatus: ApartmentStatus) => {
    setApartments(
      apartments.map((apt) =>
        apt.id === id ? { ...apt, status: newStatus } : apt
      )
    );
  };

  // 5. Delete Apartment Handler
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this apartment?')) {
      setApartments(apartments.filter((apt) => apt.id !== id));
    }
  };

  const getStatusBadge = (status: ApartmentStatus) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'sold':
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-left" dir="ltr">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        🏢 Real Estate Admin Dashboard - Add & Edit Apartments
      </h1>

      {/* 📊 Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-gray-500 text-xs font-medium">Total Apartments</p>
          <p className="text-2xl font-bold">{apartments.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-gray-500 text-xs font-medium">🟢 Available for Sale</p>
          <p className="text-2xl font-bold">
            {apartments.filter((a) => a.status === 'available').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <p className="text-gray-500 text-xs font-medium">🟡 Temporarily Reserved</p>
          <p className="text-2xl font-bold">
            {apartments.filter((a) => a.status === 'reserved').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <p className="text-gray-500 text-xs font-medium">🔴 Sold</p>
          <p className="text-2xl font-bold">
            {apartments.filter((a) => a.status === 'sold').length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 📝 Add New Apartment Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold mb-4 text-blue-900 flex items-center gap-2">
            ➕ Add New Apartment to Inventory
          </h2>

          <form onSubmit={handleAddApartment} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Apartment / Unit Number *
              </label>
              <input
                type="text"
                placeholder="e.g. 101 or A-12"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                className="w-full p-2.5 border rounded-lg text-sm border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Floor *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 2"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value ? Number(e.target.value) : '')}
                  className="w-full p-2.5 border rounded-lg text-sm border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Rooms *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 3"
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value ? Number(e.target.value) : '')}
                  className="w-full p-2.5 border rounded-lg text-sm border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Price *
              </label>
              <input
                type="number"
                placeholder="e.g. 500000"
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full p-2.5 border rounded-lg text-sm border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Apartment Type
              </label>
              <select
                value={apartmentType}
                onChange={(e) => setApartmentType(e.target.value)}
                className="w-full p-2.5 border rounded-lg text-sm border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="Residential Apartment">Standard Residential Apartment</option>
                <option value="Duplex">Duplex</option>
                <option value="Penthouse">Penthouse / Roof</option>
                <option value="Apartment with Garden">Apartment with Garden (Ground)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                View & Facade
              </label>
              <input
                type="text"
                placeholder="e.g. Front view - Main street"
                value={view}
                onChange={(e) => setView(e.target.value)}
                className="w-full p-2.5 border rounded-lg text-sm border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Payment Plan
              </label>
              <select
                value={paymentPlan}
                onChange={(e) => setPaymentPlan(e.target.value)}
                className="w-full p-2.5 border rounded-lg text-sm border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="Cash">Cash Only</option>
                <option value="3-Year Installments (10% DP)">3-Year Installments (10% DP)</option>
                <option value="5-Year Installments (15% DP)">5-Year Installments (15% DP)</option>
                <option value="Bank Mortgage">Bank Mortgage Supported</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Availability Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApartmentStatus)}
                className="w-full p-2.5 border rounded-lg text-sm border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="available">🟢 Available</option>
                <option value="reserved">🟡 Reserved</option>
                <option value="sold">🔴 Sold</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-sm transition shadow-md"
            >
              Save Apartment
            </button>
          </form>
        </div>

        {/* 🏬 Display Inventory List */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              Registered Apartments ({apartments.length})
            </h2>

            {apartments.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No apartments in inventory currently. Add your first apartment using the form.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {apartments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Header: Unit Number + Status */}
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-900 text-base">
                          Apt {apt.unitNumber}
                        </span>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${getStatusBadge(
                            apt.status
                          )}`}
                        >
                          {apt.status === 'available' && '🟢 Available'}
                          {apt.status === 'reserved' && '🟡 Reserved'}
                          {apt.status === 'sold' && '🔴 Sold'}
                        </span>
                      </div>

                      {/* Display Details */}
                      <div className="space-y-1 text-xs text-gray-600 mb-3">
                        <p>
                          <strong>Type & Floor:</strong> {apt.apartmentType} - Floor {apt.floor}
                        </p>
                        <p>
                          <strong>Rooms:</strong> {apt.rooms} Rooms
                        </p>
                        <p>
                          <strong>Price:</strong>{' '}
                          <span className="text-blue-700 font-bold text-sm">
                            ${apt.price.toLocaleString()}
                          </span>
                        </p>
                        <p>
                          <strong>View:</strong> {apt.view || 'Not specified'}
                        </p>
                        <p>
                          <strong>Payment Plan:</strong> {apt.paymentPlan}
                        </p>
                      </div>
                    </div>

                    {/* Quick Status Controls */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <select
                        value={apt.status}
                        onChange={(e) =>
                          handleStatusChange(apt.id, e.target.value as ApartmentStatus)
                        }
                        className="text-xs p-1.5 border rounded bg-gray-50 focus:outline-none"
                      >
                        <option value="available">Set to: Available</option>
                        <option value="reserved">Set to: Reserved</option>
                        <option value="sold">Set to: Sold</option>
                      </select>

                      <button
                        onClick={() => handleDelete(apt.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 👈 Default export to resolve lazyLoad import issues
export default AdminDashboardd;