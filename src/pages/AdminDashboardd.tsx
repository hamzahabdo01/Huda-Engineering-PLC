import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

// --- Types & Interfaces ---
export type UnitStatus =
  | 'available'
  | 'reserved'
  | 'unavailable'
  | 'office'
  | 'business'
  | 'shop'
  | string;

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
  marketer_name?: string;
  marketerName?: string;
  client_name?: string;
  name?: string;
  phone: string;
  project_name?: string;
  unit_title?: string;
  apartment_id?: string;
  apartmentId?: string;
  status?: string;
  source?: string;
  lead_source?: string;
  created_at?: string;
}

export interface MarketerAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'pending' | 'approved' | 'rejected' | string;
  created_at?: string;
}

export function AdminDashboardd() {
  // --- States ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const [floors, setFloors] = useState<Floor[]>([]);
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [matrix, setMatrix] = useState<Record<string, UnitStatus>>({});
  const [marketerClients, setMarketerClients] = useState<MarketerClient[]>([]);
  const [marketerAccounts, setMarketerAccounts] = useState<MarketerAccount[]>([]);
  const [marketersFetchError, setMarketersFetchError] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  // Forms Input States
  const [newProjName, setNewProjName] = useState('');
  const [newProjSubtitle, setNewProjSubtitle] = useState('');

  // Floor Form States
  const [newFloorName, setNewFloorName] = useState('');
  const [typicalFloorCount, setTypicalFloorCount] = useState<number | ''>('');

  // Unit Type & Pricing Form States
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [newUnitArea, setNewUnitArea] = useState<number | ''>('');
  const [newUnitPrice, setNewUnitPrice] = useState<number | ''>('');
  const [newUnitDownPayment, setNewUnitDownPayment] = useState<number | ''>('');
  const [newUnitYears, setNewUnitYears] = useState<number | ''>(5);

  const [activeCellKey, setActiveCellKey] = useState<string | null>(null);
  const [customCellText, setCustomCellText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'matrix' | 'pricing' | 'clients' | 'marketers'>('matrix');

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // --- Pricing Edit States ---
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [editUnitForm, setEditUnitForm] = useState<Partial<UnitType>>({});

  // 1. Fetch Initial Data and Setup Realtime Listeners
  useEffect(() => {
    fetchProjects();
    fetchMarketerClients();
    fetchMarketerAccounts();

    const leadsChannel = supabase
      .channel('realtime-leads-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        () => {
          fetchMarketerClients();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(leadsChannel);
    };
  }, []);

  // 2. Fetch Project Specific Data
  useEffect(() => {
    if (!selectedProjectId) return;

    fetchProjectDetails(selectedProjectId);

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
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMarketerClients(data);
    } else if (error) {
      console.error('Error fetching leads:', error.message);
    }
  };

  const fetchMarketerAccounts = async () => {
    setMarketersFetchError(null);
    const { data, error } = await supabase
      .from('marketers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching marketer accounts:', error);
      setMarketersFetchError(error.message);
    } else if (data) {
      setMarketerAccounts(data);
    }
  };

  const handleUpdateMarketerStatus = async (marketerId: string, newStatus: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('marketers')
      .update({ status: newStatus })
      .eq('id', marketerId);

    if (error) {
      alert(`Error updating marketer status: ${error.message}`);
    } else {
      setMarketerAccounts((prev) =>
        prev.map((m) => (m.id === marketerId ? { ...m, status: newStatus } : m))
      );
      alert(`✅ Marketer status updated to ${newStatus}`);
    }
  };

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

  // 1. لبدء وضع التعديل
  const handleEditUnitClick = (ut: UnitType) => {
    setEditingUnitId(ut.id);
    setEditUnitForm(ut);
  };

  // 2. إلغاء التعديل
  const handleCancelEdit = () => {
    setEditingUnitId(null);
    setEditUnitForm({});
  };

  // 3. حفظ التعديل في Supabase
  const handleSaveUnitPricing = async (unitId: string) => {
    const totalPrice = Number(editUnitForm.total_price) || 0;
    const downPayment = Number(editUnitForm.down_payment) || 0;
    const years = Number(editUnitForm.installment_years) || 1;
    const remaining = Math.max(0, totalPrice - downPayment);
    const monthlyInstallment = years > 0 ? Math.round(remaining / (years * 12)) : 0;

    const updatedData = {
      title: editUnitForm.title?.trim() || '',
      area: Number(editUnitForm.area) || 0,
      total_price: totalPrice,
      down_payment: downPayment,
      installment_years: years,
      monthly_installment: monthlyInstallment,
    };

    const { error } = await supabase
      .from('srm_unit_types')
      .update(updatedData)
      .eq('id', unitId);

    if (error) {
      alert('Error updating pricing: ' + error.message);
    } else {
      setUnitTypes((prev) =>
        prev.map((ut) => (ut.id === unitId ? { ...ut, ...updatedData } : ut))
      );
      setEditingUnitId(null);
      alert('✅ Unit Pricing updated successfully!');
    }
  };

  // 4. حذف نوع الوحدة
  const handleDeleteUnitType = async (unitId: string) => {
    if (!confirm('Are you sure you want to delete this unit type?')) return;

    const { error } = await supabase.from('srm_unit_types').delete().eq('id', unitId);

    if (error) {
      alert('Error deleting unit type: ' + error.message);
    } else {
      setUnitTypes((prev) => prev.filter((ut) => ut.id !== unitId));
      alert('🗑️ Unit type deleted successfully!');
    }
  };

  // 🔹 دالة تحويل رقم الطابق إلى اسم ترتيبي (First Floor, Second Floor...)
  const getOrdinalFloorName = (num: number): string => {
    const ordinals = [
      'First', 'Second', 'Third', 'Fourth', 'Fifth',
      'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth',
      'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth',
      'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth', 'Twentieth',
      'Twenty-First', 'Twenty-Second', 'Twenty-Third', 'Twenty-Fourth', 'Twenty-Fifth',
      'Twenty-Sixth', 'Twenty-Seventh', 'Twenty-Eighth', 'Twenty-Ninth', 'Thirtieth'
    ];

    if (num <= ordinals.length) {
      return `${ordinals[num - 1]} Floor`;
    }

    const j = num % 10, k = num % 100;
    if (j === 1 && k !== 11) return `${num}st Floor`;
    if (j === 2 && k !== 12) return `${num}nd Floor`;
    if (j === 3 && k !== 13) return `${num}rd Floor`;
    return `${num}th Floor`;
  };

  const handleAddFloors = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;

    const floorsToCreate: { project_id: string; floor_name: string }[] = [];

    if (typicalFloorCount && Number(typicalFloorCount) > 0) {
      const count = Number(typicalFloorCount);
      for (let i = 1; i <= count; i++) {
        const name = getOrdinalFloorName(i);

        if (!floors.some((f) => f.floor_name.toLowerCase() === name.toLowerCase())) {
          floorsToCreate.push({
            project_id: selectedProjectId,
            floor_name: name,
          });
        }
      }
    } else if (newFloorName.trim()) {
      const name = newFloorName.trim();
      if (floors.some((f) => f.floor_name.toLowerCase() === name.toLowerCase())) {
        return alert('Floor already exists in this project!');
      }
      floorsToCreate.push({
        project_id: selectedProjectId,
        floor_name: name,
      });
    } else {
      return alert('Please enter floor name or typical count (e.g., 20)');
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

    // 1️⃣ تحديد الحالة التالية بالتناوب عند الضغط المباشر
    let nextStatus: UnitStatus = 'available';
    if (currentStatus === 'available') nextStatus = 'reserved';
    else if (currentStatus === 'reserved') nextStatus = 'unavailable';
    else if (currentStatus === 'unavailable') nextStatus = 'available';
    else nextStatus = 'available';

    // 2️⃣ تحديد الخلية الحالية وتحديث النص
    setActiveCellKey(key);
    if (!['available', 'reserved', 'unavailable'].includes(currentStatus)) {
      setCustomCellText(currentStatus);
    } else {
      setCustomCellText('');
    }

    // 3️⃣ حفظ التغيير فوراً في Supabase
    saveStatusToSupabase(floorName, unitTypeId, nextStatus);
  };

  const handleExplicitStatusChange = (status: UnitStatus) => {
    if (!activeCellKey) return;
    const [floorName, unitTypeId] = activeCellKey.split('-');
    if (floorName && unitTypeId) {
      saveStatusToSupabase(floorName, unitTypeId, status);
    }
  };

  const handleApplyCustomText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCellKey || !customCellText.trim()) return;
    handleExplicitStatusChange(customCellText.trim());
  };

  // Stats
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

  const pendingMarketersCount = marketerAccounts.filter(
    (m) => m.status === 'pending' || !m.status
  ).length;

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
            Manage floors, unit types, pricing & payment plans, and manage marketer requests
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
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-300 pb-2">
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
        <button
          onClick={() => setActiveTab('marketers')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'marketers' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-200'
          }`}
        >
          🔑 Marketers & Approvals ({marketerAccounts.length})
          {pendingMarketersCount > 0 && (
            <span className="bg-amber-500 text-black text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
              {pendingMarketersCount} Pending
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: MATRIX & FLOORS STOCK */}
      {activeTab === 'matrix' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
              <p className="text-gray-500 text-xs font-semibold">Total Matrix Units</p>
              <p className="text-2xl font-bold text-gray-800">{totalCells}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-emerald-500">
              <p className="text-emerald-600 text-xs font-semibold">🟢 Available</p>
              <p className="text-2xl font-bold text-emerald-700">{availableCount}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-amber-500">
              <p className="text-amber-600 text-xs font-semibold">🟡 Reserved</p>
              <p className="text-2xl font-bold text-amber-700">{reservedCount}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500">
              <p className="text-red-600 text-xs font-semibold">🔴 Sold / Unavailable</p>
              <p className="text-2xl font-bold text-red-700">{unavailableCount}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h2 className="font-bold text-blue-900 text-sm mb-3">🏢 1. Add New Project</h2>
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
                    <label className="block text-[11px] font-medium text-gray-700 mb-1">Subtitle / Sub-Header</label>
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

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h2 className="font-bold text-gray-800 text-sm mb-1">
                  📐 2. Add Floors to [{selectedProject?.name || selectedProject?.title}]
                </h2>
                <form onSubmit={handleAddFloors} className="space-y-3 mt-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">Single Floor Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Ground / First"
                        value={newFloorName}
                        onChange={(e) => {
                          setNewFloorName(e.target.value);
                          if (e.target.value) setTypicalFloorCount('');
                        }}
                        className="w-full p-2 border rounded-lg text-xs border-gray-300 outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-blue-700 mb-1">Typical Count</label>
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
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h2 className="font-bold text-gray-800 text-sm mb-3">🏠 3. Add House Type & Pricing</h2>
                <form onSubmit={handleAddUnitType} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 mb-1">House Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. 3 Bed Room"
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

              {/* لوحة التحكم بالخلية المحددة */}
              {activeCellKey && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-300 shadow-sm space-y-3">
                  <p className="text-xs font-bold text-amber-900">
                    Selected Cell: <span className="underline">{activeCellKey}</span>
                  </p>
                  
                  {/* أزرار الحالات العادية */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleExplicitStatusChange('available')}
                      className="bg-[#00b050] text-white py-1.5 rounded text-[10px] font-bold shadow-sm hover:opacity-90 transition"
                    >
                      🟢 Available
                    </button>
                    <button
                      onClick={() => handleExplicitStatusChange('reserved')}
                      className="bg-[#f2b827] text-black py-1.5 rounded text-[10px] font-bold shadow-sm hover:opacity-90 transition"
                    >
                      🟡 Reserved
                    </button>
                    <button
                      onClick={() => handleExplicitStatusChange('unavailable')}
                      className="bg-[#ff0000] text-white py-1.5 rounded text-[10px] font-bold shadow-sm hover:opacity-90 transition"
                    >
                      🔴 Sold/Off
                    </button>
                  </div>

                  {/* أزرار الأنشطة والتجارية */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-amber-200">
                    <button
                      onClick={() => handleExplicitStatusChange('Business')}
                      className="bg-[#ff0000] text-white py-1.5 rounded text-[10px] font-bold shadow-sm hover:opacity-90 transition"
                    >
                      🏢 Business
                    </button>
                    <button
                      onClick={() => handleExplicitStatusChange('office')}
                      className="bg-[#ff0000] text-white py-1.5 rounded text-[10px] font-bold shadow-sm hover:opacity-90 transition"
                    >
                      💼 Office
                    </button>
                    <button
                      onClick={() => handleExplicitStatusChange('Shops')}
                      className="bg-[#ff0000] text-white py-1.5 rounded text-[10px] font-bold shadow-sm hover:opacity-90 transition"
                    >
                      🛍️ Shops
                    </button>
                  </div>

                  {/* نص حر */}
                  <form onSubmit={handleApplyCustomText} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Or enter custom text (e.g. Gym)"
                      value={customCellText}
                      onChange={(e) => setCustomCellText(e.target.value)}
                      className="flex-1 p-1.5 text-xs border border-amber-400 rounded outline-none focus:ring-1 focus:ring-amber-600 bg-white"
                    />
                    <button
                      type="submit"
                      className="bg-amber-800 text-white px-3 py-1 rounded text-xs font-bold hover:bg-amber-900 transition"
                    >
                      Apply Text
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Matrix Render Table */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="bg-[#f2b827] text-black text-lg sm:text-xl font-extrabold uppercase px-8 py-2 rounded-md shadow-sm tracking-wide border border-amber-500">
                  AVAILABLE STOCKS (ADMIN MATRIX)
                </div>
                <div className="bg-[#00474b] text-white text-xs sm:text-sm font-semibold uppercase px-6 py-1.5 rounded-md mt-2 shadow-sm">
                  {selectedProject?.subtitle || 'PROJECT DETAILS'}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-center text-xs font-sans">
                  <thead>
                    <tr className="bg-[#00474b] text-white">
                      <th rowSpan={2} className="border border-gray-400 p-2 font-bold min-w-[90px]">Floor</th>
                      <th colSpan={unitTypes.length || 1} className="border border-gray-400 p-1.5 font-bold italic text-sm">
                        Type of Houses
                      </th>
                      <th rowSpan={2} className="border border-gray-400 p-2 font-bold min-w-[80px]">Remark</th>
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
                    {floors.map((f) => (
                      <tr key={f.id}>
                        <td className="border border-black bg-[#f2b827] text-black font-bold p-2 text-xs">
                          {f.floor_name}
                        </td>
                        {unitTypes.map((ut) => {
                          const key = `${f.floor_name}-${ut.id}`;
                          const status = matrix[key] || 'unavailable';
                          const isActive = activeCellKey === key;

                          let bgClass = 'bg-[#ff0000] text-white';
                          let cellContent: React.ReactNode = null;

                          if (status === 'available') {
                            bgClass = 'bg-[#00b050] text-black';
                            cellContent = '🟢';
                          } else if (status === 'reserved') {
                            bgClass = 'bg-[#f2b827] text-black';
                            cellContent = '🟡';
                          } else if (status === 'unavailable') {
                            bgClass = 'bg-[#ff0000] text-white';
                            cellContent = '🔴';
                          } else {
                            // نصوص مخصصة مثل Business أو Office بخلفية حمراء ونشطة
                            bgClass = 'bg-[#ff0000] text-white font-extrabold';
                            cellContent = status;
                          }

                          return (
                            <td
                              key={ut.id}
                              onClick={() => handleCellClick(f.floor_name, ut.id)}
                              className={`border border-black p-2 font-bold transition-all cursor-pointer hover:opacity-80 select-none ${bgClass} ${
                                isActive ? 'ring-4 ring-blue-600 scale-95 z-10' : ''
                              }`}
                            >
                              <span className="text-[11px] uppercase tracking-wider font-black break-words">
                                {cellContent}
                              </span>
                            </td>
                          );
                        })}
                        <td className="border border-black bg-white text-gray-800 p-1 text-[11px]">-</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: PRICING & PAYMENT PLAN MANAGER */}
      {activeTab === 'pricing' && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                💳 Pricing & Payment Plans for [{selectedProject?.name || selectedProject?.title}]
              </h2>
              <p className="text-xs text-gray-500">Edit prices, down payments, and installment duration dynamically</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-gray-200">
              <thead className="bg-gray-800 text-white uppercase font-bold">
                <tr>
                  <th className="p-3 border">House Title</th>
                  <th className="p-3 border">Area (m²)</th>
                  <th className="p-3 border">Total Price ($)</th>
                  <th className="p-3 border">Down Payment ($)</th>
                  <th className="p-3 border">Installment Years</th>
                  <th className="p-3 border">Est. Monthly Payment</th>
                  <th className="p-3 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {unitTypes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-gray-500 font-semibold">
                      No unit types found for this project.
                    </td>
                  </tr>
                ) : (
                  unitTypes.map((ut) => {
                    const isEditing = editingUnitId === ut.id;

                    if (isEditing) {
                      const currentPrice = Number(editUnitForm.total_price) || 0;
                      const currentDown = Number(editUnitForm.down_payment) || 0;
                      const currentYears = Number(editUnitForm.installment_years) || 1;
                      const rem = Math.max(0, currentPrice - currentDown);
                      const calcMonthly = currentYears > 0 ? Math.round(rem / (currentYears * 12)) : 0;

                      return (
                        <tr key={ut.id} className="bg-blue-50 border-b border-blue-200">
                          <td className="p-2 border">
                            <input
                              type="text"
                              value={editUnitForm.title || ''}
                              onChange={(e) => setEditUnitForm({ ...editUnitForm, title: e.target.value })}
                              className="w-full p-1.5 border rounded text-xs outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-2 border">
                            <input
                              type="number"
                              value={editUnitForm.area || ''}
                              onChange={(e) => setEditUnitForm({ ...editUnitForm, area: Number(e.target.value) })}
                              className="w-20 p-1.5 border rounded text-xs outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-2 border">
                            <input
                              type="number"
                              value={editUnitForm.total_price || ''}
                              onChange={(e) => setEditUnitForm({ ...editUnitForm, total_price: Number(e.target.value) })}
                              className="w-28 p-1.5 border rounded text-xs outline-none focus:ring-1 focus:ring-blue-500 font-bold text-emerald-700"
                            />
                          </td>
                          <td className="p-2 border">
                            <input
                              type="number"
                              value={editUnitForm.down_payment || ''}
                              onChange={(e) => setEditUnitForm({ ...editUnitForm, down_payment: Number(e.target.value) })}
                              className="w-28 p-1.5 border rounded text-xs outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-2 border">
                            <input
                              type="number"
                              value={editUnitForm.installment_years || ''}
                              onChange={(e) => setEditUnitForm({ ...editUnitForm, installment_years: Number(e.target.value) })}
                              className="w-16 p-1.5 border rounded text-xs outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-2 border font-bold text-blue-700">
                            ${calcMonthly.toLocaleString()} / mo
                          </td>
                          <td className="p-2 border text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleSaveUnitPricing(ut.id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px]"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-2.5 py-1 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded text-[11px]"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={ut.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 border font-bold">{ut.title}</td>
                        <td className="p-3 border">{ut.area} m²</td>
                        <td className="p-3 border font-semibold text-emerald-700">${ut.total_price?.toLocaleString() || 0}</td>
                        <td className="p-3 border">${ut.down_payment?.toLocaleString() || 0}</td>
                        <td className="p-3 border">{ut.installment_years || 0} Years</td>
                        <td className="p-3 border font-bold text-blue-700">${ut.monthly_installment?.toLocaleString() || 0} / mo</td>
                        <td className="p-3 border text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditUnitClick(ut)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-[11px]"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUnitType(ut.id)}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-[11px]"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MARKETER CLIENTS LIST */}
      {activeTab === 'clients' && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4">👥 Marketer Registered Clients</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-gray-200">
              <thead className="bg-gray-100 text-gray-700 uppercase font-bold">
                <tr>
                  <th className="p-3 border">Marketer Name</th>
                  <th className="p-3 border">Client Name</th>
                  <th className="p-3 border">Phone</th>
                  <th className="p-3 border">Unit / Details</th>
                  <th className="p-3 border">Source</th>
                  <th className="p-3 border">Status</th>
                  <th className="p-3 border">Date</th>
                </tr>
              </thead>
              <tbody>
                {marketerClients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-gray-500 font-semibold">
                      No client leads found.
                    </td>
                  </tr>
                ) : (
                  marketerClients.map((client) => (
                    <tr key={client.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 border font-bold text-blue-800">
                        {client.marketer_name || client.marketerName || 'Unknown'}
                      </td>
                      <td className="p-3 border font-semibold">
                        {client.name || client.client_name}
                      </td>
                      <td className="p-3 border">{client.phone}</td>
                      <td className="p-3 border font-medium text-amber-900">
                        {client.apartment_id || client.apartmentId || '-'}
                      </td>
                      <td className="p-3 border">
                        <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          {client.source || client.lead_source || 'Direct'}
                        </span>
                      </td>
                      <td className="p-3 border">
                        <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          {client.status || 'Reserved'}
                        </span>
                      </td>
                      <td className="p-3 border text-gray-500">
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

      {/* TAB 4: MARKETERS & APPROVALS */}
      {activeTab === 'marketers' && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">🔑 Marketer Registration Approvals</h2>
              <p className="text-xs text-gray-500">Approve or Reject new marketer signup requests</p>
            </div>
            <button
              onClick={fetchMarketerAccounts}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 border rounded text-xs font-bold text-gray-700 transition"
            >
              🔄 Refresh Requests
            </button>
          </div>

          {marketersFetchError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-800 text-xs rounded">
              ⚠️ <strong>Error Loading Data from Supabase:</strong> {marketersFetchError}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-gray-200">
              <thead className="bg-gray-800 text-white uppercase font-bold">
                <tr>
                  <th className="p-3 border">Marketer Name</th>
                  <th className="p-3 border">Email</th>
                  <th className="p-3 border">Phone</th>
                  <th className="p-3 border">Status</th>
                  <th className="p-3 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {marketerAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500 font-semibold">
                      No marketer accounts found in database.
                    </td>
                  </tr>
                ) : (
                  marketerAccounts.map((marketer) => {
                    const status = marketer.status || 'pending';
                    return (
                      <tr key={marketer.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 border font-bold text-gray-800">{marketer.name || 'Unnamed'}</td>
                        <td className="p-3 border text-gray-600">{marketer.email}</td>
                        <td className="p-3 border">{marketer.phone || '-'}</td>
                        <td className="p-3 border">
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800 animate-pulse'
                            }`}
                          >
                            {status === 'approved' && '✅ Approved'}
                            {status === 'rejected' && '❌ Rejected'}
                            {status === 'pending' && '⏳ Pending Approval'}
                          </span>
                        </td>
                        <td className="p-3 border text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleUpdateMarketerStatus(marketer.id, 'approved')}
                              disabled={status === 'approved'}
                              className={`px-3 py-1 rounded text-xs font-bold transition ${
                                status === 'approved'
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateMarketerStatus(marketer.id, 'rejected')}
                              disabled={status === 'rejected'}
                              className={`px-3 py-1 rounded text-xs font-bold transition ${
                                status === 'rejected'
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'bg-red-600 hover:bg-red-700 text-white'
                              }`}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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