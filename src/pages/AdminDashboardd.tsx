import React, { useState, useEffect } from 'react';
// ⚠️ تأكد من ضبط مسار استيراد supabase حسب مجلد مشروعك
import { supabase } from '../integrations/supabase/client'; 

// --- Types & Interfaces ---
export type UnitStatus = 'available' | 'reserved' | 'unavailable';

export interface PaymentPlan {
  total_price?: number;
  down_payment?: number;
  installment_years?: number;
  monthly_installment?: number;
}

export interface UnitType {
  id: string;
  project_id: string;
  title: string;
  area: number;
  total_price?: number;
  down_payment?: number;
  installment_years?: number;
  monthly_installment?: number;
}

export interface Floor {
  id: string;
  project_id: string;
  floor_name: string;
}

export interface Project {
  id: string;
  name?: string;
  title?: string;
  subtitle?: string;
}

export interface MarketerClient {
  id: string;
  marketer_name: string;
  client_name: string;
  phone: string;
  project_name?: string;
  unit_title?: string;
  status?: string;
  created_at?: string;
}

export function AdminDashboardd() {
  // --- States ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  
  const [floors, setFloors] = useState<Floor[]>([]);
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [matrix, setMatrix] = useState<Record<string, UnitStatus>>({}); // Key: "floorName-unitTypeId"
  const [marketerClients, setMarketerClients] = useState<MarketerClient[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  // Forms Input States
  const [newProjName, setNewProjName] = useState('');
  const [newProjSubtitle, setNewProjSubtitle] = useState('');

  // Floor Form States (Single or Typical Bulk Creation)
  const [newFloorName, setNewFloorName] = useState('');
  const [typicalFloorCount, setTypicalFloorCount] = useState<number | ''>('');

  // Unit Type & Pricing Form States
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [newUnitArea, setNewUnitArea] = useState<number | ''>('');
  const [newUnitPrice, setNewUnitPrice] = useState<number | ''>('');
  const [newUnitDownPayment, setNewUnitDownPayment] = useState<number | ''>('');
  const [newUnitYears, setNewUnitYears] = useState<number | ''>(5);

  const [activeCellKey, setActiveCellKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'matrix' | 'pricing' | 'clients'>('matrix');

  // Selected Active Project Object
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // 1. Fetch All Data on Mount
  useEffect(() => {
    fetchProjects();
    fetchMarketerClients();
  }, []);

  // 2. Fetch Project Specific Data (Floors, Unit Types, Matrix)
  useEffect(() => {
    if (!selectedProjectId) return;

    fetchProjectDetails(selectedProjectId);

    // ⚡ Realtime Listener for matrix updates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'srm_matrix_cells',
          filter: `project_id=eq.${selectedProjectId}`,
        },
        () => {
          fetchMatrixData(selectedProjectId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedProjectId]);

  // --- Supabase API Calls ---

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('projects').select('*');
    if (error) {
      console.error('Error fetching projects:', error);
    } else if (data && data.length > 0) {
      setProjects(data);
      setSelectedProjectId(data[0].id);
    }
    setLoading(false);
  };

  const fetchProjectDetails = async (projectId: string) => {
    setLoading(true);
    await Promise.all([
      fetchFloors(projectId),
      fetchUnitTypes(projectId),
      fetchMatrixData(projectId),
    ]);
    setLoading(false);
  };

  const fetchFloors = async (projectId: string) => {
    const { data, error } = await supabase
      .from('srm_floors')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setFloors(data);
    }
  };

  const fetchUnitTypes = async (projectId: string) => {
    const { data, error } = await supabase
      .from('srm_unit_types')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setUnitTypes(data);
    }
  };

  const fetchMatrixData = async (projectId: string) => {
    const { data, error } = await supabase
      .from('srm_matrix_cells')
      .select('*')
      .eq('project_id', projectId);

    if (!error && data) {
      const matrixMap: Record<string, UnitStatus> = {};
      data.forEach((item) => {
        const key = `${item.floor_name}-${item.unit_type_id}`;
        matrixMap[key] = item.status as UnitStatus;
      });
      setMatrix(matrixMap);
    }
  };

  const fetchMarketerClients = async () => {
    const { data, error } = await supabase
      .from('marketer_clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMarketerClients(data);
    }
  };

  // --- Form Handlers ---

  // 1. Create Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return alert('Please enter project name');

    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          name: newProjName,
          title: newProjName,
          subtitle: newProjSubtitle || 'PROJECT RELEASE 2026',
        },
      ])
      .select();

    if (error) {
      alert('Error creating project: ' + error.message);
    } else if (data && data.length > 0) {
      setProjects([...projects, data[0]]);
      setSelectedProjectId(data[0].id);
      setNewProjName('');
      setNewProjSubtitle('');
      alert('✅ New Project created successfully!');
    }
  };

  // 2. Add Floors (Single OR Bulk/Typical Floors creation e.g. 10 floors)
  const handleAddFloors = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;

    let floorsToCreate: { project_id: string; floor_name: string }[] = [];

    // Case A: Typical Floors Count (e.g. user entered 10)
    if (typicalFloorCount && Number(typicalFloorCount) > 0) {
      const count = Number(typicalFloorCount);
      for (let i = 1; i <= count; i++) {
        const name = `Floor ${i}`;
        if (!floors.some((f) => f.floor_name.toLowerCase() === name.toLowerCase())) {
          floorsToCreate.push({
            project_id: selectedProjectId,
            floor_name: name,
          });
        }
      }
    } 
    // Case B: Single Custom Floor Name
    else if (newFloorName.trim()) {
      const name = newFloorName.trim();
      if (floors.some((f) => f.floor_name.toLowerCase() === name.toLowerCase())) {
        return alert('Floor already exists in this project!');
      }
      floorsToCreate.push({
        project_id: selectedProjectId,
        floor_name: name,
      });
    } else {
      return alert('Please enter floor name or typical count (e.g., 10)');
    }

    if (floorsToCreate.length === 0) {
      return alert('No new floors were added (they might already exist).');
    }

    const { data, error } = await supabase
      .from('srm_floors')
      .insert(floorsToCreate)
      .select();

    if (error) {
      alert('Error adding floor(s): ' + error.message);
    } else if (data) {
      setFloors([...floors, ...data]);
      setNewFloorName('');
      setTypicalFloorCount('');
      alert(`✅ Successfully created ${data.length} floor(s)!`);
    }
  };

  // 3. Add House Type (Unit Type) + Pricing & Payment Plan
  const handleAddUnitType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitTitle.trim() || !newUnitArea || !selectedProjectId) return;

    const totalPrice = Number(newUnitPrice) || 0;
    const downPayment = Number(newUnitDownPayment) || 0;
    const years = Number(newUnitYears) || 1;
    const remaining = Math.max(0, totalPrice - downPayment);
    const monthlyInstallment = years > 0 ? Math.round(remaining / (years * 12)) : 0;

    const { data, error } = await supabase
      .from('srm_unit_types')
      .insert([
        {
          project_id: selectedProjectId,
          title: newUnitTitle.trim(),
          area: Number(newUnitArea),
          total_price: totalPrice,
          down_payment: downPayment,
          installment_years: years,
          monthly_installment: monthlyInstallment,
        },
      ])
      .select();

    if (error) {
      alert('Error adding unit type: ' + error.message);
    } else if (data) {
      setUnitTypes([...unitTypes, data[0]]);
      setNewUnitTitle('');
      setNewUnitArea('');
      setNewUnitPrice('');
      setNewUnitDownPayment('');
      setNewUnitYears(5);
      alert('✅ Unit Type & Payment Plan saved successfully!');
    }
  };

  // 4. Update Status in Supabase Matrix
  const saveStatusToSupabase = async (floorName: string, unitTypeId: string, newStatus: UnitStatus) => {
    const key = `${floorName}-${unitTypeId}`;

    setMatrix((prev) => ({ ...prev, [key]: newStatus }));

    const { error } = await supabase.from('srm_matrix_cells').upsert(
      {
        project_id: selectedProjectId,
        floor_name: floorName,
        unit_type_id: unitTypeId,
        status: newStatus,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'project_id,floor_name,unit_type_id' }
    );

    if (error) {
      console.error('Failed to update matrix status:', error);
      alert('Could not update status on server.');
      fetchMatrixData(selectedProjectId);
    }
  };

  const handleCellClick = (floorName: string, unitTypeId: string) => {
    const key = `${floorName}-${unitTypeId}`;
    const currentStatus = matrix[key] || 'unavailable';

    let nextStatus: UnitStatus = 'available';
    if (currentStatus === 'available') nextStatus = 'reserved';
    else if (currentStatus === 'reserved') nextStatus = 'unavailable';
    else if (currentStatus === 'unavailable') nextStatus = 'available';

    setActiveCellKey(key);
    saveStatusToSupabase(floorName, unitTypeId, nextStatus);
  };

  const handleExplicitStatusChange = (status: UnitStatus) => {
    if (!activeCellKey) return;
    const [floorName, unitTypeId] = activeCellKey.split('-');
    if (floorName && unitTypeId) {
      saveStatusToSupabase(floorName, unitTypeId, status);
    }
  };

  // Stats Calculation
  const totalCells = floors.length * unitTypes.length;
  let availableCount = 0;
  let reservedCount = 0;
  let unavailableCount = 0;

  floors.forEach((f) => {
    unitTypes.forEach((ut) => {
      const key = `${f.floor_name}-${ut.id}`;
      const st = matrix[key] || 'unavailable';
      if (st === 'available') availableCount++;
      else if (st === 'reserved') reservedCount++;
      else unavailableCount++;
    });
  });

  if (loading && projects.length === 0) {
    return <div className="p-10 text-center font-bold text-gray-600">⏳ Loading Matrix Data...</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen text-left" dir="ltr">
      {/* Title Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">⚙️ Admin Portal - Real Estate Manager</h1>
          <p className="text-xs text-gray-500">
            Manage floors, unit types, pricing & payment plans, and monitor marketer registrations
          </p>
        </div>

        {/* Project Selector Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-700 whitespace-nowrap">Active Project:</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="p-2 bg-blue-50 border border-blue-300 font-bold text-blue-900 text-xs rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name || p.title || 'Untitled Project'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-300 pb-2">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'matrix' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-200'
          }`}
        >
          📊 Matrix & Floors Stock
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'pricing' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-200'
          }`}
        >
          💳 Pricing & Payment Plans
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'clients' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-200'
          }`}
        >
          👥 Marketer Clients ({marketerClients.length})
        </button>
      </div>

      {/* TAB 1: MATRIX & FLOORS STOCK */}
      {activeTab === 'matrix' && (
        <>
          {/* Stats Widget */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
              <p className="text-gray-500 text-xs font-semibold">Total Matrix Units</p>
              <p className="text-2xl font-bold text-gray-800">{totalCells}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-emerald-500">
              <p className="text-emerald-600 text-xs font-semibold">🟢 Available (Mataha)</p>
              <p className="text-2xl font-bold text-emerald-700">{availableCount}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-amber-500">
              <p className="text-amber-600 text-xs font-semibold">🟡 Reserved (Mahjouza)</p>
              <p className="text-2xl font-bold text-amber-700">{reservedCount}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500">
              <p className="text-red-600 text-xs font-semibold">🔴 Sold / Unavailable (Mubaa)</p>
              <p className="text-2xl font-bold text-red-700">{unavailableCount}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN: Controls & Form Inputs */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* 1. Create New Project Form */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h2 className="font-bold text-blue-900 text-sm mb-3 flex items-center gap-1">
                  🏢 1. Add New Project
                </h2>
                <form onSubmit={handleCreateProject} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 mb-1">Project Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Imperial Plaza"
                      value={newProjName}
                      onChange={(e) => setNewProjName(e.target.value)}
                      className="w-full p-2 border rounded-lg text-xs border-gray-300 outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 mb-1">Subtitle / Sub-Header *</label>
                    <input
                      type="text"
                      placeholder="e.g. BOLE 24 AROUND IMPERIAL FEB,2026"
                      value={newProjSubtitle}
                      onChange={(e) => setNewProjSubtitle(e.target.value)}
                      className="w-full p-2 border rounded-lg text-xs border-gray-300 outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs transition"
                  >
                    + Create Project
                  </button>
                </form>
              </div>

              {/* 2. Add Floor / Typical Floors (Generate 10 Floors automatically) */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h2 className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-1">
                  📐 2. Add Floors to [{selectedProject?.name || selectedProject?.title}]
                </h2>
                <p className="text-[10px] text-gray-500 mb-3">
                  Enter a floor name OR write count (e.g. 10) to generate 10 typical floors automatically.
                </p>
                <form onSubmit={handleAddFloors} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">Single Floor Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Ground"
                        value={newFloorName}
                        onChange={(e) => {
                          setNewFloorName(e.target.value);
                          if (e.target.value) setTypicalFloorCount('');
                        }}
                        className="w-full p-2 border rounded-lg text-xs border-gray-300 outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-blue-700 mb-1">⚡ Typical Count (e.g. 10)</label>
                      <input
                        type="number"
                        placeholder="e.g. 10"
                        value={typicalFloorCount}
                        onChange={(e) => {
                          setTypicalFloorCount(e.target.value ? Number(e.target.value) : '');
                          if (e.target.value) setNewFloorName('');
                        }}
                        className="w-full p-2 border border-blue-400 bg-blue-50 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gray-800 hover:bg-black text-white font-bold py-2 rounded-lg text-xs transition"
                  >
                    + {typicalFloorCount ? `Generate ${typicalFloorCount} Typical Floors` : 'Add Single Floor'}
                  </button>
                </form>
                <div className="mt-3 flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                  {floors.map((fl) => (
                    <span key={fl.id} className="bg-amber-100 text-amber-900 text-[10px] px-2 py-0.5 rounded font-bold">
                      {fl.floor_name}
                    </span>
                  ))}
                </div>
              </div>

              {/* 3. Add Type of Houses (Unit Type) + Price */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h2 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-1">
                  🏠 3. Add House Type & Pricing
                </h2>
                <form onSubmit={handleAddUnitType} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 mb-1">House Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. 3 Bed Room / Studio"
                      value={newUnitTitle}
                      onChange={(e) => setNewUnitTitle(e.target.value)}
                      className="w-full p-2 border rounded-lg text-xs border-gray-300 outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-700 mb-1">Area (m²) *</label>
                      <input
                        type="number"
                        placeholder="e.g. 120"
                        value={newUnitArea}
                        onChange={(e) => setNewUnitArea(e.target.value ? Number(e.target.value) : '')}
                        className="w-full p-2 border rounded-lg text-xs border-gray-300 outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-700 mb-1">Total Price ($)</label>
                      <input
                        type="number"
                        placeholder="e.g. 150000"
                        value={newUnitPrice}
                        onChange={(e) => setNewUnitPrice(e.target.value ? Number(e.target.value) : '')}
                        className="w-full p-2 border rounded-lg text-xs border-gray-300 outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs transition"
                  >
                    + Add House Type Column
                  </button>
                </form>
              </div>

              {/* Quick Cell Status Switcher Panel */}
              {activeCellKey && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-300 shadow-sm">
                  <p className="text-xs font-bold text-amber-900 mb-2">
                    Selected Cell: <span className="underline">{activeCellKey}</span>
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleExplicitStatusChange('available')}
                      className="bg-[#00b050] text-white py-1.5 rounded text-[11px] font-bold shadow-sm"
                    >
                      🟢 Available
                    </button>
                    <button
                      onClick={() => handleExplicitStatusChange('reserved')}
                      className="bg-[#f2b827] text-black py-1.5 rounded text-[11px] font-bold shadow-sm"
                    >
                      🟡 Reserved
                    </button>
                    <button
                      onClick={() => handleExplicitStatusChange('unavailable')}
                      className="bg-[#ff0000] text-white py-1.5 rounded text-[11px] font-bold shadow-sm"
                    >
                      🔴 Sold/Off
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: Interactive Stock Grid Matrix Table */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-200 overflow-hidden">
              
              {/* Header Badges matching matrix layout */}
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="bg-[#f2b827] text-black text-lg sm:text-xl font-extrabold uppercase px-8 py-2 rounded-md shadow-sm tracking-wide border border-amber-500">
                  AVAILABLE STOCKS (ADMIN MATRIX)
                </div>
                <div className="bg-[#00474b] text-white text-xs sm:text-sm font-semibold uppercase px-6 py-1.5 rounded-md mt-2 shadow-sm">
                  {selectedProject?.subtitle || 'PROJECT DETAILS'}
                </div>
                <p className="text-[11px] text-gray-500 mt-2 font-medium">
                  💡 Tip: Click on any matrix cell to cycle status (🟢 Available ➔ 🟡 Reserved ➔ 🔴 Sold)
                </p>
              </div>

              {/* Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-center text-xs font-sans">
                  <thead>
                    <tr className="bg-[#00474b] text-white">
                      <th rowSpan={2} className="border border-gray-400 p-2 font-bold min-w-[90px]">
                        Floor
                      </th>
                      <th
                        colSpan={unitTypes.length || 1}
                        className="border border-gray-400 p-1.5 font-bold italic text-sm"
                      >
                        Type of Houses
                      </th>
                      <th rowSpan={2} className="border border-gray-400 p-2 font-bold min-w-[80px]">
                        Remark
                      </th>
                    </tr>

                    <tr className="bg-[#00474b] text-white">
                      {unitTypes.map((ut) => (
                        <th key={ut.id} className="border border-gray-400 p-2 font-semibold">
                          {ut.title} <br />
                          <span className="font-normal text-[11px]">[area={ut.area}]</span>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {floors.map((f) => {
                      return (
                        <tr key={f.id}>
                          {/* Floor Column */}
                          <td className="border border-black bg-[#f2b827] text-black font-bold p-2 text-xs">
                            {f.floor_name}
                          </td>

                          {/* Matrix Status Cells */}
                          {unitTypes.map((ut) => {
                            const key = `${f.floor_name}-${ut.id}`;
                            const status = matrix[key] || 'unavailable';
                            const isActive = activeCellKey === key;

                            let bgClass = 'bg-[#ff0000]';
                            if (status === 'available') bgClass = 'bg-[#00b050]';
                            else if (status === 'reserved') bgClass = 'bg-[#f2b827]';

                            return (
                              <td
                                key={ut.id}
                                onClick={() => handleCellClick(f.floor_name, ut.id)}
                                className={`border border-black p-3 font-bold transition-all cursor-pointer hover:opacity-80 select-none ${bgClass} ${
                                  isActive ? 'ring-4 ring-blue-600 scale-95' : ''
                                }`}
                                title={`Click to change status for ${f.floor_name} - ${ut.title}`}
                              >
                                <span className="text-[10px] uppercase font-extrabold text-black drop-shadow-sm">
                                  {status === 'available' && '🟢'}
                                  {status === 'reserved' && '🟡'}
                                  {status === 'unavailable' && '🔴'}
                                </span>
                              </td>
                            );
                          })}

                          {/* Remark Column */}
                          <td className="border border-black bg-white text-gray-800 p-1 text-[11px]">
                            -
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Legend Footer */}
              <div className="flex justify-center mt-6">
                <div className="border-2 border-black rounded-3xl py-2 px-8 text-center text-xs font-bold text-black bg-white shadow-sm flex flex-wrap justify-center gap-4">
                  <span>NB:-</span>
                  <span className="text-red-600 font-extrabold">RED = NOT Available / Sold</span>
                  <span className="text-emerald-600 font-extrabold">GREEN = Available</span>
                  <span className="text-amber-500 font-extrabold">YELLOW = Reserved</span>
                </div>
              </div>

            </div>
          </div>
        </>
      )}

      {/* TAB 2: PRICING & PAYMENT PLAN MANAGER (الأسعار وخطة الدفع) */}
      {activeTab === 'pricing' && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
            💳 Manager Control: Pricing & Payment Plans for [{selectedProject?.name || selectedProject?.title}]
          </h2>
          <p className="text-xs text-gray-500 mb-6">
            Configure total unit prices, down payment amounts, and repayment durations for each unit type.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Plan Form */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 className="font-bold text-sm text-blue-900 mb-4">➕ Add / Update Payment Plan</h3>
              <form onSubmit={handleAddUnitType} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Unit / House Type Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. 3 Bed Room (150 m²)"
                    value={newUnitTitle}
                    onChange={(e) => setNewUnitTitle(e.target.value)}
                    className="w-full p-2 border rounded-lg text-xs bg-white border-gray-300"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Area (m²)</label>
                    <input
                      type="number"
                      placeholder="150"
                      value={newUnitArea}
                      onChange={(e) => setNewUnitArea(e.target.value ? Number(e.target.value) : '')}
                      className="w-full p-2 border rounded-lg text-xs bg-white border-gray-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Total Price ($) *</label>
                    <input
                      type="number"
                      placeholder="e.g. 120000"
                      value={newUnitPrice}
                      onChange={(e) => setNewUnitPrice(e.target.value ? Number(e.target.value) : '')}
                      className="w-full p-2 border rounded-lg text-xs bg-white border-gray-300"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Down Payment ($)</label>
                    <input
                      type="number"
                      placeholder="e.g. 20000"
                      value={newUnitDownPayment}
                      onChange={(e) => setNewUnitDownPayment(e.target.value ? Number(e.target.value) : '')}
                      className="w-full p-2 border rounded-lg text-xs bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Installment Duration (Years)</label>
                    <input
                      type="number"
                      placeholder="5"
                      value={newUnitYears}
                      onChange={(e) => setNewUnitYears(e.target.value ? Number(e.target.value) : '')}
                      className="w-full p-2 border rounded-lg text-xs bg-white border-gray-300"
                    />
                  </div>
                </div>

                {/* Auto Calculated Monthly Installment Preview */}
                {Number(newUnitPrice) > 0 && (
                  <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-xs text-emerald-900">
                    <p className="font-bold">💡 Estimated Monthly Installment:</p>
                    <p className="text-lg font-extrabold mt-1">
                      ${Math.round(Math.max(0, Number(newUnitPrice) - Number(newUnitDownPayment || 0)) / ((Number(newUnitYears) || 1) * 12)).toLocaleString()} / month
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-xs transition shadow-sm"
                >
                  💾 Save Payment Plan
                </button>
              </form>
            </div>

            {/* Existing Payment Plans List */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-gray-800">📋 Active Payment Plans</h3>
              {unitTypes.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No pricing plans created yet for this project.</p>
              ) : (
                unitTypes.map((ut) => (
                  <div key={ut.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-gray-800">{ut.title} ({ut.area} m²)</span>
                      <span className="bg-blue-100 text-blue-900 font-extrabold text-xs px-2.5 py-1 rounded-full">
                        ${ut.total_price ? ut.total_price.toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-600 bg-gray-50 p-2 rounded-lg mt-1">
                      <div>
                        <span className="block text-gray-400">Down Payment</span>
                        <span className="font-bold text-gray-800">${ut.down_payment ? ut.down_payment.toLocaleString() : 0}</span>
                      </div>
                      <div>
                        <span className="block text-gray-400">Years</span>
                        <span className="font-bold text-gray-800">{ut.installment_years || 0} Years</span>
                      </div>
                      <div>
                        <span className="block text-gray-400">Monthly</span>
                        <span className="font-bold text-emerald-700">${ut.monthly_installment ? ut.monthly_installment.toLocaleString() : 0}/mo</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MARKETER CLIENTS REGISTRY (عملاء المسوقين) */}
      {activeTab === 'clients' && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                👥 Marketer Registered Clients (سجل عملاء المسوقين)
              </h2>
              <p className="text-xs text-gray-500">
                Track all clients entered by marketers, their interested units, and deal statuses.
              </p>
            </div>
            <button
              onClick={fetchMarketerClients}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-300"
            >
              🔄 Refresh List
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="p-3 border">#</th>
                  <th className="p-3 border">Marketer Name (المسوق)</th>
                  <th className="p-3 border">Client Name (العميل)</th>
                  <th className="p-3 border">Phone Number</th>
                  <th className="p-3 border">Project / Unit</th>
                  <th className="p-3 border">Status</th>
                  <th className="p-3 border">Registration Date</th>
                </tr>
              </thead>
              <tbody>
                {marketerClients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-gray-400 italic">
                      No marketer clients registered yet.
                    </td>
                  </tr>
                ) : (
                  marketerClients.map((client, index) => (
                    <tr key={client.id || index} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-bold text-gray-500">{index + 1}</td>
                      <td className="p-3 font-bold text-blue-900">{client.marketer_name || 'N/A'}</td>
                      <td className="p-3 font-semibold text-gray-800">{client.client_name}</td>
                      <td className="p-3 text-gray-600">{client.phone}</td>
                      <td className="p-3 text-gray-700">{client.project_name} - {client.unit_title || '-'}</td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          {client.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500 text-[11px]">
                        {client.created_at ? new Date(client.created_at).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboardd;