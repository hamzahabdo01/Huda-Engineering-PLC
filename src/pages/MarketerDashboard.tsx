import React, { useState, useEffect } from 'react';

// --- Types & Interfaces ---
export interface UnitType {
  id: string;
  title: string; // e.g., "One bed room"
  area: number;  // e.g., 90
  totalPrice?: number;         // السعر الإجمالي
  downPayment?: number;        // المقدم / الدفعة الأولى
  installmentYears?: number;   // سنوات التقسيط
  monthlyInstallment?: number; // القسط الشهري
}

export type UnitStatus = 'available' | 'unavailable' | 'reserved';

export interface Project {
  id: string;
  name: string;
  subtitle: string; // e.g., "BOLE 24 AROUND IMPERIAL FEB,2026"
  floors: string[];
  unitTypes: UnitType[];
  matrix: Record<string, UnitStatus>; // Key: "FloorName-UnitTypeId", Value: status
  remarks?: Record<string, string>;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  apartmentId: string;
  unitKey: string; // Floor-UnitTypeId
  projectId: string;
  marketerName: string;
  status: string;
  createdAt: string;
}

export interface Marketer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export function MarketerDashboard() {
  // --- 0. Authentication State ---
  const [currentMarketer, setCurrentMarketer] = useState<Marketer | null>(() => {
    const saved = localStorage.getItem('current_marketer');
    return saved ? JSON.parse(saved) : null;
  });

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- 1. Projects Data State (With Payment Plans) ---
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'proj-1',
      name: 'Bole 24 Imperial Project',
      subtitle: 'BOLE 24 AROUND IMPERIAL FEB,2026',
      unitTypes: [
        { id: '1b-90', title: 'One bed room', area: 90, totalPrice: 120000, downPayment: 20000, installmentYears: 5, monthlyInstallment: 1666 },
        { id: '2b-105', title: 'Two bed room', area: 105, totalPrice: 150000, downPayment: 25000, installmentYears: 5, monthlyInstallment: 2083 },
        { id: '2b-110', title: 'Two bed room', area: 110, totalPrice: 160000, downPayment: 30000, installmentYears: 6, monthlyInstallment: 1805 },
        { id: '3b-140', title: 'Three bed room', area: 140, totalPrice: 210000, downPayment: 35000, installmentYears: 7, monthlyInstallment: 2083 },
        { id: '3b-145', title: 'Three bed room', area: 145, totalPrice: 220000, downPayment: 40000, installmentYears: 7, monthlyInstallment: 2142 },
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
      matrix: {
        'Tenth-1b-90': 'available', // Green cell
        'Eleventh-2b-105': 'reserved', // Example reserved cell
      },
      remarks: {},
    },
    {
      id: 'proj-2',
      name: 'Downtown Towers',
      subtitle: 'DOWNTOWN PLAZA APR,2026',
      unitTypes: [
        { id: 'dt-1b-80', title: '1 Bed Studio', area: 80, totalPrice: 95000, downPayment: 15000, installmentYears: 4, monthlyInstallment: 1666 },
        { id: 'dt-2b-120', title: '2 Bed Luxury', area: 120, totalPrice: 180000, downPayment: 30000, installmentYears: 5, monthlyInstallment: 2500 },
        { id: 'dt-3b-160', title: '3 Bed Family', area: 160, totalPrice: 250000, downPayment: 45000, installmentYears: 6, monthlyInstallment: 2847 },
      ],
      floors: ['First', 'Second', 'Third', 'Fourth', 'Fifth'],
      matrix: {
        'First-dt-1b-80': 'available',
        'Second-dt-2b-120': 'available',
      },
      remarks: {},
    },
  ]);

  // Active Project & Selection State
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0].id);
  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Selected Unit State & Payment Details
  const [selectedUnitKey, setSelectedUnitKey] = useState<string>(''); // Key: "Floor-UnitTypeId"
  const [selectedUnitLabel, setSelectedUnitLabel] = useState<string>('');
  const [selectedUnitDetails, setSelectedUnitDetails] = useState<UnitType | null>(null);

  // Lead Protection & Data State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [allSystemLeads, setAllSystemLeads] = useState<Lead[]>([
    {
      id: '99',
      name: 'Abdullah Al-Salman',
      phone: '0501234567',
      apartmentId: 'Tenth Floor [One bed room (90m²)]',
      unitKey: 'Tenth-1b-90',
      projectId: 'proj-1',
      marketerName: 'Khaled (Other Marketer)',
      status: 'Reserved',
      createdAt: '09:30 AM',
    },
  ]);

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  // Handle Marketer Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter both email and password.');
      return;
    }

    // SIMULATED AUTHENTICATION (Replace with Supabase auth query if connected)
    const loggedInUser: Marketer = {
      id: 'mkt-' + Date.now(),
      name: loginEmail.split('@')[0] || 'Marketer User',
      email: loginEmail,
      phone: '0500000000',
    };

    setCurrentMarketer(loggedInUser);
    localStorage.setItem('current_marketer', JSON.stringify(loggedInUser));
    setLoginError('');
  };

  // Handle Marketer Logout
  const handleLogout = () => {
    setCurrentMarketer(null);
    localStorage.removeItem('current_marketer');
  };

  // Cell Click Handler (Directly selects unit & fetches payment plan)
  const handleCellClick = (floor: string, unitType: UnitType, status: UnitStatus) => {
    const key = `${floor}-${unitType.id}`;
    const label = `${floor} Floor [${unitType.title} (${unitType.area}m²)]`;

    if (status === 'available') {
      setSelectedUnitKey(key);
      setSelectedUnitLabel(label);
      setSelectedUnitDetails(unitType); // Save payment plan info for display
    } else if (status === 'reserved') {
      alert(`🟡 Unit on ${floor} floor (${unitType.title}) is already RESERVED.`);
    } else {
      alert(`🔴 Unit on ${floor} floor (${unitType.title}) is NOT available.`);
    }
  };

  // Reserve Unit & Save Lead Logic
  const handleReserveAndSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = clientPhone.trim();

    if (!selectedUnitKey) {
      alert('Please click on an available GREEN unit in the matrix first.');
      return;
    }

    if (!clientName || !cleanPhone) {
      alert('Please fill in both client name and phone number.');
      return;
    }

    // 1. Duplication & Protection Check
    const existingLead = allSystemLeads.find((l) => l.phone === cleanPhone);
    if (existingLead) {
      alert(
        `⚠️ Lead Protection Alert:\nClient phone (${cleanPhone}) is already registered under marketer: [ ${existingLead.marketerName} ]!`
      );
      return;
    }

    // 2. Update Project Matrix Status to 'reserved' (Yellow)
    setProjects((prevProjects) =>
      prevProjects.map((proj) => {
        if (proj.id === selectedProjectId) {
          return {
            ...proj,
            matrix: {
              ...proj.matrix,
              [selectedUnitKey]: 'reserved', // Changes cell status to reserved!
            },
          };
        }
        return proj;
      })
    );

    // 3. Register New Lead
    const newLead: Lead = {
      id: Date.now().toString(),
      name: clientName,
      phone: cleanPhone,
      apartmentId: selectedUnitLabel,
      unitKey: selectedUnitKey,
      projectId: selectedProjectId,
      marketerName: currentMarketer?.name || 'My Account',
      status: 'Reserved',
      createdAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setLeads([newLead, ...leads]);
    setAllSystemLeads([newLead, ...allSystemLeads]);

    // Reset Form
    setClientName('');
    setClientPhone('');
    setSelectedUnitKey('');
    setSelectedUnitLabel('');
    setSelectedUnitDetails(null);

    alert('🟡 Unit status updated to RESERVED (Yellow) and client protected under your name!');
  };

  // -------------------------------------------------------------
  // SCREEN 1: LOGIN FORM (If no marketer logged in)
  // -------------------------------------------------------------
  if (!currentMarketer) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 text-left" dir="ltr">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-extrabold text-xl mx-auto mb-3">
              🏢
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Marketer Portal Login</h2>
            <p className="text-xs text-gray-500 mt-1">Sign in to view available stocks & payment plans</p>
          </div>

          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-xs mb-4">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="marketer@company.com"
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-sm transition shadow-md"
            >
              Sign In to Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 2: MAIN DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="p-4 bg-gray-100 min-h-screen text-left" dir="ltr">
      
      {/* 1. Top Header Bar & Marketer Profile */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">🏢 Marketer Portal - Real Estate Inventory</h1>
          <p className="text-xs text-gray-500">
            Welcome back, <span className="font-bold text-blue-600">{currentMarketer.name}</span> ({currentMarketer.email})
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-700 whitespace-nowrap">Project:</label>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setSelectedUnitKey('');
                setSelectedUnitLabel('');
                setSelectedUnitDetails(null);
              }}
              className="p-2 bg-blue-50 border border-blue-300 font-semibold text-blue-900 text-xs rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-2 rounded-lg text-xs font-bold transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. AVAILABLE STOCKS GRID */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-200 overflow-hidden">
          
          {/* Header Badges matching image design */}
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
                {/* House Types Header */}
                <tr className="bg-[#00474b] text-white">
                  <th rowSpan={2} className="border border-gray-400 p-2 font-bold min-w-[90px]">
                    Floor
                  </th>
                  <th
                    colSpan={selectedProject.unitTypes.length}
                    className="border border-gray-400 p-1.5 font-bold italic text-sm"
                  >
                    Type of Houses & Price Plans
                  </th>
                  <th rowSpan={2} className="border border-gray-400 p-2 font-bold min-w-[80px]">
                    Remark
                  </th>
                </tr>

                {/* Sub-headers for Room Types + Price */}
                <tr className="bg-[#00474b] text-white">
                  {selectedProject.unitTypes.map((ut) => (
                    <th key={ut.id} className="border border-gray-400 p-2 font-semibold">
                      {ut.title} <br />
                      <span className="font-normal text-[11px] text-amber-300">[{ut.area} m²]</span>
                      {ut.totalPrice && (
                        <div className="text-[10px] text-emerald-300 font-bold mt-0.5">
                          ${ut.totalPrice.toLocaleString()}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {selectedProject.floors.map((floor) => {
                  const remark = selectedProject.remarks?.[floor] || '';

                  return (
                    <tr key={floor}>
                      {/* Floor Name Column (Yellow) */}
                      <td className="border border-black bg-[#f2b827] text-black font-bold p-2 text-xs">
                        {floor}
                      </td>

                      {/* Dynamic Cells */}
                      {selectedProject.unitTypes.map((ut) => {
                        const key = `${floor}-${ut.id}`;
                        const status = selectedProject.matrix[key] || 'unavailable';
                        const isSelected = selectedUnitKey === key;

                        // Dynamic styling based on status
                        let bgClass = 'bg-[#ff0000] cursor-not-allowed'; // Unavailable (Red)
                        if (status === 'available') {
                          bgClass = 'bg-[#00b050] hover:bg-green-600 cursor-pointer'; // Available (Green)
                        } else if (status === 'reserved') {
                          bgClass = 'bg-[#f2b827] hover:bg-amber-500 cursor-pointer'; // Reserved (Yellow)
                        }

                        return (
                          <td
                            key={ut.id}
                            onClick={() => handleCellClick(floor, ut, status)}
                            className={`border border-black p-3 font-bold transition-all ${bgClass} ${
                              isSelected ? 'ring-4 ring-blue-600 scale-95' : ''
                            }`}
                            title={`Floor ${floor} - ${ut.title} (${status.toUpperCase()})`}
                          >
                            {isSelected && (
                              <span className="text-[10px] bg-black text-white px-1 py-0.5 rounded">
                                Selected
                              </span>
                            )}
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

          {/* Footer Legend Box */}
          <div className="flex justify-center mt-6">
            <div className="border-2 border-black rounded-3xl py-2 px-8 text-center text-xs font-bold text-black bg-white shadow-sm flex flex-wrap justify-center gap-4">
              <span>NB:-</span>
              <span className="text-red-600 font-extrabold">RED = NOT Available</span>
              <span className="text-emerald-600 font-extrabold">GREEN = Available</span>
              <span className="text-amber-500 font-extrabold">YELLOW = Reserved</span>
            </div>
          </div>
        </div>

        {/* 3. Direct Unit Reservation & Payment Plan Details Side Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-bold text-gray-800 mb-2 text-md">📌 Reserve Unit & Claim Lead</h2>
            <p className="text-xs text-gray-500 mb-4">
              Click any green cell in the matrix to view its <span className="font-semibold text-blue-600">Payment Plan</span> and reserve it.
            </p>

            {/* PAYMENT PLAN CARD DISPLAY */}
            {selectedUnitDetails && (
              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 mb-4 text-xs space-y-2">
                <div className="font-bold text-blue-900 border-b border-blue-200 pb-1.5 flex justify-between">
                  <span>💳 PAYMENT PLAN DETAILS</span>
                  <span className="text-blue-700">{selectedUnitDetails.area} m²</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-gray-700">
                  <div>
                    <span className="block text-[10px] text-gray-500">Total Price:</span>
                    <strong className="text-gray-900">${selectedUnitDetails.totalPrice?.toLocaleString() || 0}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500">Down Payment:</span>
                    <strong className="text-emerald-700">${selectedUnitDetails.downPayment?.toLocaleString() || 0}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500">Installment Period:</span>
                    <strong className="text-gray-900">{selectedUnitDetails.installmentYears || 1} Years</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500">Monthly Installment:</span>
                    <strong className="text-blue-700">${selectedUnitDetails.monthlyInstallment?.toLocaleString() || 0}/mo</strong>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleReserveAndSaveLead} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Selected Unit *
                </label>
                <input
                  type="text"
                  readOnly
                  placeholder="← Click a GREEN cell in table"
                  value={selectedUnitLabel}
                  className="w-full p-2.5 border rounded-lg text-xs bg-amber-50 text-amber-900 font-bold border-amber-300 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Client Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
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
                  placeholder="05xxxxxxxx / 09xxxxxxxx"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-xs border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-extrabold py-2.5 rounded-lg text-xs transition shadow-sm"
              >
                🔒 Save & Mark as Reserved (Yellow)
              </button>
            </form>
          </div>

          {/* List of Marketer's Reserved Leads */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-bold text-gray-800 mb-3 text-md">
              Your Reserved Units ({leads.length})
            </h2>
            {leads.length === 0 ? (
              <p className="text-gray-400 text-xs">No reserved units yet.</p>
            ) : (
              <div className="space-y-3">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3 border rounded-lg bg-amber-50/50 border-amber-200 flex justify-between items-center text-xs"
                  >
                    <div>
                      <p className="font-bold text-gray-800">{lead.name}</p>
                      <p className="text-gray-500">{lead.phone}</p>
                      <p className="text-[11px] text-amber-800 font-medium mt-0.5">{lead.apartmentId}</p>
                    </div>
                    <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-2 py-1 rounded-full">
                      RESERVED
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