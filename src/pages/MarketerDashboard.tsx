import React, { useState } from 'react';
import { Apartment, Lead, ApartmentStatus } from './types';

export function MarketerDashboard() {
  // 1. Apartment Inventory (Represents available properties provided by management)
  const [apartments] = useState<Apartment[]>([
    {
      id: '1',
      unitNumber: '101',
      floor: 1,
      rooms: 3,
      price: 450000,
      apartmentType: 'Residential Apartment',
      view: 'Front View - Main Street',
      paymentPlan: '3-Year Installments (15% down payment)',
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
    {
      id: '3',
      unitNumber: '201',
      floor: 2,
      rooms: 5,
      price: 720000,
      apartmentType: 'Penthouse / Roof',
      view: 'Panoramic City View',
      paymentPlan: '5-Year Installments (15% down payment)',
      status: 'available',
    },
  ]);

  // 2. Search & Filter States
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchRooms, setSearchRooms] = useState<string>('all');

  // 3. New Lead Input States
  const [leads, setLeads] = useState<Lead[]>([]); // Current marketer's leads
  
  // 🔍 System-wide database (contains leads from all marketers for duplication check)
  const [allSystemLeads, setAllSystemLeads] = useState<Lead[]>([
    {
      id: '99',
      name: 'Abdullah Al-Salman',
      phone: '0501234567', // Sample pre-registered phone to test protection alert
      apartmentId: '101',
      marketerName: 'Khaled (Other Marketer)',
      status: 'New',
      createdAt: '09:30 AM',
    }
  ]);

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');

  // Filter apartments automatically
  const filteredApartments = apartments.filter((apt) => {
    const matchesStatus =
      filterStatus === 'all' || apt.status === filterStatus;
    const matchesRooms =
      searchRooms === 'all' || apt.rooms.toString() === searchRooms;
    return matchesStatus && matchesRooms;
  });

  // 🛡️ Add new lead with Lead Protection & Duplication Check
  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPhone = clientPhone.trim();

    if (!clientName || !cleanPhone) {
      alert('Please enter both client name and phone number.');
      return;
    }

    // 🔍 1. System Check: Is this phone number registered under any marketer?
    const existingLead = allSystemLeads.find((lead) => lead.phone === cleanPhone);

    if (existingLead) {
      alert(
        `⚠️ Lead Protection Alert:\nClient with phone number (${cleanPhone}) is already registered in the system under marketer: [ ${existingLead.marketerName} ]!\n\nYou cannot register this client under your account.`
      );
      return;
    }

    // ✅ 2. If phone is new, register under current marketer
    const newLead: Lead = {
      id: Date.now().toString(),
      name: clientName,
      phone: cleanPhone,
      apartmentId: selectedUnit,
      marketerName: 'My Account',
      status: 'New',
      createdAt: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setLeads([newLead, ...leads]);
    setAllSystemLeads([newLead, ...allSystemLeads]); // Reserve in system database immediately

    // Reset Form Fields
    setClientName('');
    setClientPhone('');
    setSelectedUnit('');

    alert('🟢 Lead successfully registered and protected under your name!');
  };

  // 💬 Generate and send WhatsApp offer
  const sendWhatsAppOffer = (phone: string, apt: Apartment) => {
    const statusText =
      apt.status === 'available'
        ? '🟢 Available'
        : apt.status === 'reserved'
        ? '🟡 Reserved'
        : '🔴 Sold';

    const message = `Hello! 🏢
Here are the details for the apartment you inquired about:

• Unit Number: ${apt.unitNumber}
• Apartment Type: ${apt.apartmentType}
• Floor: ${apt.floor}
• Rooms: ${apt.rooms}
• View: ${apt.view || 'Not specified'}
• Asking Price: $${apt.price.toLocaleString()}
• Payment Plan: ${apt.paymentPlan}
• Status: ${statusText}

For more photos or to schedule an on-site visit, feel free to contact me directly!`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
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
    <div className="p-4 bg-gray-100 min-h-screen text-left" dir="ltr">
      {/* 🔗 1. Personal Marketing Link (Bio Link) */}
      <div className="bg-blue-900 text-white p-4 rounded-xl shadow mb-6">
        <h2 className="font-bold text-lg mb-1">Personal Marketing Link (Bio Link)</h2>
        <p className="text-xs text-blue-200 mb-2">
          Place this link in your social media bio (TikTok / Instagram) to attribute leads from your videos automatically to your account:
        </p>
        <div className="bg-blue-800 p-2.5 rounded-lg text-sm font-mono flex justify-between items-center">
          <span className="text-blue-100 text-xs">https://yoursite.com/m/ahmed</span>
          <button
            onClick={() => alert('Link copied to clipboard!')}
            className="bg-blue-600 text-xs text-white px-3 py-1.5 rounded-md hover:bg-blue-500 transition"
          >
            Copy
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 🏢 2. Inventory Display */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <h2 className="font-bold text-gray-800 text-lg">
                🏬 Available Inventory Apartments ({filteredApartments.length})
              </h2>

              {/* Quick Filters */}
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-xs p-2 border rounded-lg bg-gray-50 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="available">🟢 Available Only</option>
                  <option value="reserved">🟡 Reserved</option>
                  <option value="sold">🔴 Sold</option>
                </select>

                <select
                  value={searchRooms}
                  onChange={(e) => setSearchRooms(e.target.value)}
                  className="text-xs p-2 border rounded-lg bg-gray-50 focus:outline-none"
                >
                  <option value="all">All Room Counts</option>
                  <option value="3">3 Rooms</option>
                  <option value="4">4 Rooms</option>
                  <option value="5">5 Rooms</option>
                </select>
              </div>
            </div>

            {/* Apartment Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredApartments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-400 transition flex flex-col justify-between"
                >
                  <div>
                    {/* Header & Status */}
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-900 text-base">
                        Unit {apt.unitNumber}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getStatusBadge(
                          apt.status
                        )}`}
                      >
                        {apt.status === 'available' && '🟢 Available'}
                        {apt.status === 'reserved' && '🟡 Reserved'}
                        {apt.status === 'sold' && '🔴 Sold'}
                      </span>
                    </div>

                    {/* Apartment Details */}
                    <div className="space-y-1.5 text-xs text-gray-600 mb-4">
                      <div className="flex justify-between border-b border-gray-100 pb-1">
                        <span>Type & Floor:</span>
                        <span className="font-semibold text-gray-800">
                          {apt.apartmentType} (Floor {apt.floor})
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-1">
                        <span>Rooms:</span>
                        <span className="font-semibold text-gray-800">{apt.rooms} Rooms</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-1">
                        <span>View:</span>
                        <span className="font-semibold text-gray-800">
                          {apt.view || 'Not specified'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-1">
                        <span>Payment Plan:</span>
                        <span className="font-semibold text-gray-800">{apt.paymentPlan}</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span>Price:</span>
                        <span className="font-bold text-blue-700 text-sm">
                          ${apt.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Offer Button */}
                  <button
                    onClick={() => {
                      const phone = prompt('Enter client phone number for WhatsApp (e.g., 05xxxx):');
                      if (phone) sendWhatsAppOffer(phone, apt);
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-2 rounded-lg font-bold flex items-center justify-center gap-1 shadow-sm transition"
                  >
                    💬 Send Details via WhatsApp
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ⚡ 3. Quick Lead Entry Form (With Lead Protection) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-bold text-gray-800 mb-3 text-md">⚡ Quick Entry for New Caller</h2>
            <p className="text-xs text-gray-500 mb-4">
              Register caller details right after the call to claim and protect your lead ownership in the system.
            </p>

            <form onSubmit={handleAddLead} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Client Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., John Doe"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-sm border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="05xxxxxxxx"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-sm border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Interested Unit (Select Available)
                </label>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-sm border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">-- Select Unit Number --</option>
                  {apartments.map((apt) => (
                    <option key={apt.id} value={apt.unitNumber}>
                      Unit {apt.unitNumber} - {apt.apartmentType} (${apt.price.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-sm transition shadow-sm"
              >
                Check & Claim Lead Ownership
              </button>
            </form>
          </div>

          {/* List of Registered Leads */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-bold text-gray-800 mb-3 text-md">
              Your Registered Leads ({leads.length})
            </h2>
            {leads.length === 0 ? (
              <p className="text-gray-400 text-xs">No leads registered today yet.</p>
            ) : (
              <div className="space-y-3">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3 border rounded-lg bg-gray-50 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold text-sm text-gray-800">{lead.name}</p>
                      <p className="text-xs text-gray-500">
                        {lead.phone} | Unit: {lead.apartmentId || 'Not specified'}
                      </p>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full mt-1 inline-block">
                        {lead.status} ({lead.createdAt})
                      </span>
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

export default MarketerDashboard;