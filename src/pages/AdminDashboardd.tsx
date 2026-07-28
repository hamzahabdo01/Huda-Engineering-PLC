import React, { useState, useEffect } from 'react';
// ⚠️ تأكد من ضبط مسار استيراد supabase حسب مجلد مشروعك
import { supabase } from '../integrations/supabase/client'; 

// --- Types & Interfaces ---
export type UnitStatus = 'available' | 'reserved' | 'unavailable';

export interface UnitType {
  id: string;
  project_id: string;
  title: string;
  area: number;
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

export function AdminDashboardd() {
  // --- States ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  
  const [floors, setFloors] = useState<Floor[]>([]);
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [matrix, setMatrix] = useState<Record<string, UnitStatus>>({}); // Key: "floorName-unitTypeId"

  const [loading, setLoading] = useState<boolean>(true);

  // Forms Input States
  const [newProjName, setNewProjName] = useState('');
  const [newProjSubtitle, setNewProjSubtitle] = useState('');

  const [newFloorName, setNewFloorName] = useState('');

  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [newUnitArea, setNewUnitArea] = useState<number | ''>('');

  const [activeCellKey, setActiveCellKey] = useState<string | null>(null);

  // Selected Active Project Object
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // 1. Fetch All Projects on Mount
  useEffect(() => {
    fetchProjects();
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

  // --- Form Handlers ---

  // 1. Create Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return alert('Please enter project name');

    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          name: newProjName, // استخدم title إذا كان اسم العمود في جدولك القديم كذلك
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

  // 2. Add Floor to Selected Project
  const handleAddFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFloorName.trim() || !selectedProjectId) return;

    if (floors.some((f) => f.floor_name.toLowerCase() === newFloorName.trim().toLowerCase())) {
      alert('Floor already exists in this project!');
      return;
    }

    const { data, error } = await supabase
      .from('srm_floors')
      .insert([
        {
          project_id: selectedProjectId,
          floor_name: newFloorName.trim(),
        },
      ])
      .select();

    if (error) {
      alert('Error adding floor: ' + error.message);
    } else if (data) {
      setFloors([...floors, data[0]]);
      setNewFloorName('');
    }
  };

  // 3. Add House Type (Unit Type)
  const handleAddUnitType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitTitle.trim() || !newUnitArea || !selectedProjectId) return;

    const { data, error } = await supabase
      .from('srm_unit_types')
      .insert([
        {
          project_id: selectedProjectId,
          title: newUnitTitle.trim(),
          area: Number(newUnitArea),
        },
      ])
      .select();

    if (error) {
      alert('Error adding unit type: ' + error.message);
    } else if (data) {
      setUnitTypes([...unitTypes, data[0]]);
      setNewUnitTitle('');
      setNewUnitArea('');
    }
  };

  // 4. Update Status in Supabase Matrix
  const saveStatusToSupabase = async (floorName: string, unitTypeId: string, newStatus: UnitStatus) => {
    const key = `${floorName}-${unitTypeId}`;

    // Optimistic UI update
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
      fetchMatrixData(selectedProjectId); // Rollback on fail
    }
  };

  // Toggle Status via Cell Click
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

  // Explicit Change via Panel Buttons
  const handleExplicitStatusChange = (status: UnitStatus) => {
    if (!activeCellKey) return;
    const [floorName, unitTypeId] = activeCellKey.split('-');
    if (floorName && unitTypeId) {
      saveStatusToSupabase(floorName, unitTypeId, status);
    }
  };

  // Helper Stats Calculation
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
          <h1 className="text-2xl font-bold text-gray-800">⚙️ Admin Portal - Inventory & Matrix Manager</h1>
          <p className="text-xs text-gray-500">
            Manage projects, add floors and house types, and click matrix cells to toggle status (🟢 Available / 🟡 Reserved / 🔴 Sold)
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

          {/* 2. Add Floor to Current Project */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-1">
              📐 2. Add Floor to [{selectedProject?.name || selectedProject?.title}]
            </h2>
            <form onSubmit={handleAddFloor} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Eighteenth"
                value={newFloorName}
                onChange={(e) => setNewFloorName(e.target.value)}
                className="flex-1 p-2 border rounded-lg text-xs border-gray-300 outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="bg-gray-800 hover:bg-black text-white font-bold px-4 py-2 rounded-lg text-xs transition"
              >
                + Add Floor
              </button>
            </form>
            <div className="mt-3 flex flex-wrap gap-1">
              {floors.map((fl) => (
                <span key={fl.id} className="bg-amber-100 text-amber-900 text-[10px] px-2 py-0.5 rounded font-bold">
                  {fl.floor_name}
                </span>
              ))}
            </div>
          </div>

          {/* 3. Add Type of Houses (Unit Type) */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-1">
              🏠 3. Add Type of House to [{selectedProject?.name || selectedProject?.title}]
            </h2>
            <form onSubmit={handleAddUnitType} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">House Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Four bed room / Studio"
                  value={newUnitTitle}
                  onChange={(e) => setNewUnitTitle(e.target.value)}
                  className="w-full p-2 border rounded-lg text-xs border-gray-300 outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">Area (m²) *</label>
                <input
                  type="number"
                  placeholder="e.g. 150"
                  value={newUnitArea}
                  onChange={(e) => setNewUnitArea(e.target.value ? Number(e.target.value) : '')}
                  className="w-full p-2 border rounded-lg text-xs border-gray-300 outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs transition"
              >
                + Add House Type Column
              </button>
            </form>
          </div>

          {/* 4. Quick Cell Status Switcher Panel */}
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
              💡 Tip: Click on any matrix cell to cycle its status (Green 🟢 Available ➔ Yellow 🟡 Reserved ➔ Red 🔴 Sold)
            </p>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-center text-xs font-sans">
              <thead>
                {/* House Types Header */}
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

                {/* Sub-headers for Room Types */}
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
                      {/* Floor Column (Yellow) */}
                      <td className="border border-black bg-[#f2b827] text-black font-bold p-2 text-xs">
                        {f.floor_name}
                      </td>

                      {/* Matrix Status Cells */}
                      {unitTypes.map((ut) => {
                        const key = `${f.floor_name}-${ut.id}`;
                        const status = matrix[key] || 'unavailable';
                        const isActive = activeCellKey === key;

                        let bgClass = 'bg-[#ff0000]'; // Unavailable / Sold (Red)
                        if (status === 'available') {
                          bgClass = 'bg-[#00b050]'; // Available (Green)
                        } else if (status === 'reserved') {
                          bgClass = 'bg-[#f2b827]'; // Reserved (Yellow)
                        }

                        return (
                          <td
                            key={ut.id}
                            onClick={() => handleCellClick(f.floor_name, ut.id)}
                            className={`border border-black p-3 font-bold transition-all cursor-pointer hover:opacity-80 select-none ${bgClass} ${
                              isActive ? 'ring-4 ring-blue-600 scale-95' : ''
                            }`}
                            title={`Click to change status for Floor ${f.floor_name} - ${ut.title}`}
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
    </div>
  );
}

export default AdminDashboardd;