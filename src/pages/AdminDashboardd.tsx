import React, { useState } from 'react';

// --- Types & Interfaces ---
export type UnitStatus = 'available' | 'reserved' | 'unavailable';

export interface UnitType {
  id: string;
  title: string; // e.g., "One bed room"
  area: number;  // e.g., 90
}

export interface Project {
  id: string;
  name: string;
  subtitle: string; // e.g., "BOLE 24 AROUND IMPERIAL FEB,2026"
  floors: string[];
  unitTypes: UnitType[];
  matrix: Record<string, UnitStatus>; // Key: "FloorName-UnitTypeId"
  remarks?: Record<string, string>;
}

export function AdminDashboardd() {
  // 1. Initial Projects Inventory State
  const [projects, setProjects] = useState<Project[]>([
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
        'Tenth',
        'Eleventh',
        'Twelfth',
        'Thirteenth',
        'Fourteenth',
        'Fifteenth',
      ],
      matrix: {
        'Tenth-1b-90': 'available',
        'Eleventh-2b-105': 'reserved',
        'Twelfth-3b-140': 'unavailable',
      },
      remarks: {
        'Tenth': 'Main Road View',
      },
    },
  ]);

  // Selected Active Project
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Forms Input States
  // A. Create New Project
  const [newProjName, setNewProjName] = useState('');
  const [newProjSubtitle, setNewProjSubtitle] = useState('');

  // B. Add Floor
  const [newFloorName, setNewFloorName] = useState('');

  // C. Add House Type
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [newUnitArea, setNewUnitArea] = useState<number | ''>('');

  // D. Selected Cell Status Controller
  const [activeCellKey, setActiveCellKey] = useState<string | null>(null);

  // --- Handlers ---

  // 1. Create Project
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return alert('Please enter project name');

    const created: Project = {
      id: `proj-${Date.now()}`,
      name: newProjName,
      subtitle: newProjSubtitle || 'PROJECT RELEASE 2026',
      floors: ['First', 'Second', 'Third'],
      unitTypes: [
        { id: '1b-80', title: 'One bed room', area: 80 },
        { id: '2b-120', title: 'Two bed room', area: 120 },
      ],
      matrix: {},
      remarks: {},
    };

    setProjects([...projects, created]);
    setSelectedProjectId(created.id);
    setNewProjName('');
    setNewProjSubtitle('');
    alert('✅ New Project created successfully!');
  };

  // 2. Add Floor to Selected Project
  const handleAddFloor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFloorName.trim() || !selectedProject) return;

    if (selectedProject.floors.includes(newFloorName.trim())) {
      alert('Floor already exists in this project!');
      return;
    }

    setProjects(
      projects.map((proj) =>
        proj.id === selectedProjectId
          ? { ...proj, floors: [...proj.floors, newFloorName.trim()] }
          : proj
      )
    );
    setNewFloorName('');
  };

  // 3. Add Type of House (Unit Type) to Selected Project
  const handleAddUnitType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitTitle.trim() || !newUnitArea || !selectedProject) return;

    const newUnit: UnitType = {
      id: `ut-${Date.now()}`,
      title: newUnitTitle,
      area: Number(newUnitArea),
    };

    setProjects(
      projects.map((proj) =>
        proj.id === selectedProjectId
          ? { ...proj, unitTypes: [...proj.unitTypes, newUnit] }
          : proj
      )
    );
    setNewUnitTitle('');
    setNewUnitArea('');
  };

  // 4. Toggle/Change Cell Status in Table Matrix
  const handleCellClick = (floor: string, unitTypeId: string) => {
    const key = `${floor}-${unitTypeId}`;
    const currentStatus = selectedProject.matrix[key] || 'unavailable';

    // Cycle Status: available (Green) -> reserved (Yellow) -> unavailable (Red) -> available
    let nextStatus: UnitStatus = 'available';
    if (currentStatus === 'available') nextStatus = 'reserved';
    else if (currentStatus === 'reserved') nextStatus = 'unavailable';
    else if (currentStatus === 'unavailable') nextStatus = 'available';

    setProjects(
      projects.map((proj) => {
        if (proj.id === selectedProjectId) {
          return {
            ...proj,
            matrix: {
              ...proj.matrix,
              [key]: nextStatus,
            },
          };
        }
        return proj;
      })
    );
  };

  // Explicitly Set Status for Active Cell
  const handleExplicitStatusChange = (status: UnitStatus) => {
    if (!activeCellKey) return;
    setProjects(
      projects.map((proj) => {
        if (proj.id === selectedProjectId) {
          return {
            ...proj,
            matrix: {
              ...proj.matrix,
              [activeCellKey]: status,
            },
          };
        }
        return proj;
      })
    );
  };

  // Helper Stats Calculation
  const totalCells = selectedProject
    ? selectedProject.floors.length * selectedProject.unitTypes.length
    : 0;

  let availableCount = 0;
  let reservedCount = 0;
  let unavailableCount = 0;

  if (selectedProject) {
    selectedProject.floors.forEach((f) => {
      selectedProject.unitTypes.forEach((ut) => {
        const key = `${f}-${ut.id}`;
        const st = selectedProject.matrix[key] || 'unavailable';
        if (st === 'available') availableCount++;
        else if (st === 'reserved') reservedCount++;
        else unavailableCount++;
      });
    });
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
                {p.name}
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
              📐 2. Add Floor to [{selectedProject?.name}]
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
              {selectedProject?.floors.map((fl) => (
                <span key={fl} className="bg-amber-100 text-amber-900 text-[10px] px-2 py-0.5 rounded font-bold">
                  {fl}
                </span>
              ))}
            </div>
          </div>

          {/* 3. Add Type of Houses (Unit Type) */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-1">
              🏠 3. Add Type of House to [{selectedProject?.name}]
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
              {selectedProject?.subtitle}
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
                    colSpan={selectedProject?.unitTypes.length || 1}
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
                  {selectedProject?.unitTypes.map((ut) => (
                    <th key={ut.id} className="border border-gray-400 p-2 font-semibold">
                      {ut.title} <br />
                      <span className="font-normal text-[11px]">[area={ut.area}]</span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {selectedProject?.floors.map((floor) => {
                  const remark = selectedProject.remarks?.[floor] || '';

                  return (
                    <tr key={floor}>
                      {/* Floor Column (Yellow) */}
                      <td className="border border-black bg-[#f2b827] text-black font-bold p-2 text-xs">
                        {floor}
                      </td>

                      {/* Matrix Status Cells */}
                      {selectedProject.unitTypes.map((ut) => {
                        const key = `${floor}-${ut.id}`;
                        const status = selectedProject.matrix[key] || 'unavailable';
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
                            onClick={() => {
                              setActiveCellKey(key);
                              handleCellClick(floor, ut.id);
                            }}
                            className={`border border-black p-3 font-bold transition-all cursor-pointer hover:opacity-80 select-none ${bgClass} ${
                              isActive ? 'ring-4 ring-blue-600 scale-95' : ''
                            }`}
                            title={`Click to change status for Floor ${floor} - ${ut.title}`}
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
                        {remark}
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

// Export Component
export default AdminDashboardd;