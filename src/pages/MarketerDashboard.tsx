import React, { useState } from 'react';

// --- Types & Interfaces ---
export interface UnitType {
  id: string;
  title: string; // e.g., "One bed room"
  area: number;  // e.g., 90
}

export type UnitStatus = 'available' | 'unavailable' | 'reserved';

export interface MatrixCell {
  floor: string;
  unitTypeId: string;
  status: UnitStatus;
  unitNumber?: string;
  price?: number;
  remark?: string;
}

export interface Project {
  id: string;
  name: string;
  subtitle: string; // e.g., "BOLE 24 AROUND IMPERIAL FEB,2026"
  floors: string[]; // ["Third", "Fourth", ..., "Seventeenth"]
  unitTypes: UnitType[];
  matrix: Record<string, UnitStatus>; // Key: "FloorName-UnitTypeId", Value: status
  remarks?: Record<string, string>;   // Key: "FloorName", Value: Remark text
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  apartmentId: string;
  marketerName: string;
  status: string;
  createdAt: string;
}

export function MarketerDashboard() {
  // 1. Projects Data (Added by Admin in System)
  const [projects] = useState<Project[]>([
    {
      id: 'proj-1',
      name: 'Bole 24 Imperial Project',
      subtitle: 'BOLE 24 AROUND IMPERIAL FEB,2026',
      unitTypes: [
        { id: '1b-90', title: 'One bed room', area: 90 },
        { id: '2b-105', title: 'Two bed room', area: 105 },
        { id: '2b-110', title: 'Two bed room', area: 110 },
        { id: '3b-140', title: 'Three bed room', area: 140 },
        { id: '3b-145', title: 'Three bed room', area: 145 },
      ],
      floors: [
        'Third',
        'Fourth',
        'Fifth',
        'Sixth',
        'Seventh',
        'Eighth',
        'Ninth',
        'Tenth',
        'Eleventh',
        'Twelfth',
        'Thirteenth',
        'Fourteenth',
        'Fifteenth',
        'Sixteenth',
        'Seventeenth',
      ],
      // Matrix status map: defaults to 'unavailable' (RED) except floor Tenth 1b-90 which is 'available' (GREEN)
      matrix: {
        'Tenth-1b-90': 'available', // The green cell matching your reference image
      },
      remarks: {},
    },
    {
      id: 'proj-2',
      name: 'Downtown Towers',
      subtitle: 'DOWNTOWN PLAZA APR,2026',
      unitTypes: [
        { id: 'dt-1b-80', title: '1 Bed Studio', area: 80 },
        { id: 'dt-2b-120', title: '2 Bed Luxury', area: 120 },
        { id: 'dt-3b-160', title: '3 Bed Family', area: 160 },
      ],
      floors: ['First', 'Second', 'Third', 'Fourth', 'Fifth'],
      matrix: {
        'First-dt-1b-80': 'available',
        'Second-dt-2b-120': 'available',
        'Fifth-dt-3b-160': 'available',
      },
      remarks: {
        First: 'Commercial Discount',
      },
    },
  ]);

  // Selected Project State
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0].id);
  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Lead Protection & Data State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [allSystemLeads, setAllSystemLeads] = useState<Lead[]>([
    {
      id: '99',
      name: 'Abdullah Al-Salman',
      phone: '0501234567',
      apartmentId: 'Tenth - 1 Bed (90m²)',
      marketerName: 'Khaled (Other Marketer)',
      status: 'Registered',
      createdAt: '09:30 AM',
    },
  ]);

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedUnitInfo, setSelectedUnitInfo] = useState('');

  // Cell click handler
  const handleCellClick = (floor: string, unitType: UnitType, status: UnitStatus) => {
    const unitLabel = `${selectedProject.name} - ${floor} Floor [${unitType.title} (${unitType.area}m²)]`;
    
    if (status === 'available') {
      setSelectedUnitInfo(unitLabel);
      
      const confirmSend = window.confirm(
        `🟢 Unit Selected: ${unitLabel}\nStatus: Available\n\nWould you like to send this unit offer via WhatsApp?`
      );
      
      if (confirmSend) {
        const phone = prompt('Enter WhatsApp Phone Number (e.g., 05xxxxxxxx):');
        if (phone) {
          const message = `Hello! 🏢\nDetails for available stock in ${selectedProject.subtitle}:\n\n• Floor: ${floor}\n• Unit Type: ${unitType.title}\n• Area: ${unitType.area} m²\n• Status: Available 🟢\n\nPlease reply if you would like to reserve or visit the site!`;
          window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
        }
      }
    } else {
      alert(`🔴 This unit on ${floor} floor (${unitType.title}) is NOT available.`);
    }
  };

  // Add Lead Logic
  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = clientPhone.trim();

    if (!clientName || !cleanPhone) {
      alert('Please fill in client name and phone number.');
      return;
    }

    const existingLead = allSystemLeads.find((l) => l.phone === cleanPhone);
    if (existingLead) {
      alert(
        `⚠️ Lead Protection Alert:\nClient phone (${cleanPhone}) is already registered under marketer: [ ${existingLead.marketerName} ]!`
      );
      return;
    }

    const newLead: Lead = {
      id: Date.now().toString(),
      name: clientName,
      phone: cleanPhone,
      apartmentId: selectedUnitInfo || 'General Inquiry',
      marketerName: 'My Account',
      status: 'New',
      createdAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setLeads([newLead, ...leads]);
    setAllSystemLeads([newLead, ...allSystemLeads]);
    setClientName('');
    setClientPhone('');
    setSelectedUnitInfo('');
    alert('🟢 Lead successfully registered and protected under your name!');
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen text-left" dir="ltr">
      
      {/* 1. Project Selector Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">🏢 Marketer Portal - Real Estate Inventory</h1>
          <p className="text-xs text-gray-500">Select a project to view stock matrix and available units</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Select Project:</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="p-2.5 bg-blue-50 border border-blue-300 font-semibold text-blue-900 text-sm rounded-lg outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. AVAILABLE STOCKS GRID (Replicating Image visual design) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-200 overflow-hidden">
          
          {/* Header Badges matching the image */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="bg-[#f2b827] text-black text-lg sm:text-xl font-extrabold uppercase px-8 py-2 rounded-md shadow-sm tracking-wide border border-amber-500">
              AVAILABLE STOCKS
            </div>
            <div className="bg-[#00474b] text-white text-xs sm:text-sm font-semibold uppercase px-6 py-1.5 rounded-md mt-2 shadow-sm">
              {selectedProject.subtitle}
            </div>
          </div>

          {/* Matrix Stock Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-center text-xs font-sans">
              <thead>
                {/* House Types Main Header */}
                <tr className="bg-[#00474b] text-white">
                  <th rowSpan={2} className="border border-gray-400 p-2 font-bold min-w-[90px]">
                    Floor
                  </th>
                  <th
                    colSpan={selectedProject.unitTypes.length}
                    className="border border-gray-400 p-1.5 font-bold italic text-sm"
                  >
                    Type of Houses
                  </th>
                  <th rowSpan={2} className="border border-gray-400 p-2 font-bold min-w-[80px]">
                    Remark
                  </th>
                </tr>

                {/* Sub-headers for Bed Rooms & Areas */}
                <tr className="bg-[#00474b] text-white">
                  {selectedProject.unitTypes.map((ut) => (
                    <th key={ut.id} className="border border-gray-400 p-2 font-semibold">
                      {ut.title} <br />
                      <span className="font-normal text-[11px]">[area={ut.area}]</span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {selectedProject.floors.map((floor) => {
                  const remark = selectedProject.remarks?.[floor] || '';

                  return (
                    <tr key={floor}>
                      {/* Floor Name Column (Yellow background like reference image) */}
                      <td className="border border-black bg-[#f2b827] text-black font-bold p-2 text-xs">
                        {floor}
                      </td>

                      {/* Dynamic Cells */}
                      {selectedProject.unitTypes.map((ut) => {
                        const key = `${floor}-${ut.id}`;
                        const status = selectedProject.matrix[key] || 'unavailable';
                        const isAvailable = status === 'available';

                        return (
                          <td
                            key={ut.id}
                            onClick={() => handleCellClick(floor, ut, status)}
                            className={`border border-black p-3 font-bold transition-all cursor-pointer ${
                              isAvailable
                                ? 'bg-[#00b050] hover:bg-green-500 text-white shadow-inner' // Bright Green (Available)
                                : 'bg-[#ff0000] hover:bg-red-700'                            // Bright Red (Unavailable)
                            }`}
                            title={
                              isAvailable
                                ? `Click to choose Floor ${floor} - ${ut.title}`
                                : `Floor ${floor} - ${ut.title} (Not Available)`
                            }
                          >
                            {/* Empty inside like reference image, or click indicator */}
                          </td>
                        );
                      })}

                      {/* Remark Column */}
                      <td className="border border-black bg-white text-gray-800 p-1 text-[11px]">
                        {remark}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Legend Box (NB: RED = NOT Available, GREEN = Available) */}
          <div className="flex justify-center mt-6">
            <div className="border-2 border-black rounded-3xl py-2 px-8 text-center text-xs font-bold text-black bg-white shadow-sm">
              NB:- &nbsp;&nbsp;&nbsp;
              <span className="text-red-600 font-extrabold">RED</span> = NOT Available Stocks
              <br />
              <span className="text-emerald-600 font-extrabold">GREEN</span> = Available Stocks
            </div>
          </div>
        </div>

        {/* 3. Lead Registration & WhatsApp Panel */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Quick Lead Form */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-bold text-gray-800 mb-2 text-md">⚡ Lead Protection Entry</h2>
            <p className="text-xs text-gray-500 mb-4">
              Click any green cell in the matrix to auto-fill unit details, then submit to reserve lead ownership.
            </p>

            <form onSubmit={handleAddLead} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Selected Unit / Interest
                </label>
                <input
                  type="text"
                  readOnly
                  placeholder="Click green cell in table..."
                  value={selectedUnitInfo}
                  className="w-full p-2.5 border rounded-lg text-xs bg-gray-50 text-blue-900 font-semibold border-gray-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Client Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Abebe Bikila"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-xs border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="09xxxxxxxx / 05xxxxxxxx"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-xs border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-xs transition shadow-sm"
              >
                Claim & Protect Lead
              </button>
            </form>
          </div>

          {/* Registered Leads */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-bold text-gray-800 mb-3 text-md">
              Your Protected Leads ({leads.length})
            </h2>
            {leads.length === 0 ? (
              <p className="text-gray-400 text-xs">No leads registered for this session yet.</p>
            ) : (
              <div className="space-y-3">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3 border rounded-lg bg-gray-50 flex justify-between items-center text-xs"
                  >
                    <div>
                      <p className="font-bold text-gray-800">{lead.name}</p>
                      <p className="text-gray-500">{lead.phone}</p>
                      <p className="text-[11px] text-blue-700 mt-0.5">{lead.apartmentId}</p>
                    </div>
                    <span className="text-[10px] bg-green-100 text-green-800 font-semibold px-2 py-1 rounded-full">
                      Protected
                    </span>
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