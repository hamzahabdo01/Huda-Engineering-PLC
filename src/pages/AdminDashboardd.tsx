import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import {
  Building2,
  LayoutGrid,
  CreditCard,
  Users,
  KeyRound,
  ChevronDown,
  Layers,
  Home,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Clock3,
  Check,
  X,
  DollarSign,
  CalendarDays,
  StickyNote,
  Tag,
  AlertTriangle,
  Loader2,
  MousePointerClick,
  Briefcase,
  Building,
  Store,
} from 'lucide-react';

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
  total_payment?: number | string | null;
  installment_plan?: string | null;
  memo?: string | null;
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

  // State for filtering clients by marketer name
  const [selectedMarketerFilter, setSelectedMarketerFilter] = useState<string>('all');

  const [loading, setLoading] = useState<boolean>(true);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        const key = `${item.floor_name}__${item.unit_type_id}`;
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

  const handleEditUnitClick = (ut: UnitType) => {
    setEditingUnitId(ut.id);
    setEditUnitForm(ut);
  };

  const handleCancelEdit = () => {
    setEditingUnitId(null);
    setEditUnitForm({});
  };

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
    const key = `${floorName}__${unitTypeId}`;

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
      alert('Could not update status on server: ' + error.message);
      fetchMatrixData(selectedProjectId);
    }
  };

  const handleCellClick = (floorName: string, unitTypeId: string) => {
    const key = `${floorName}__${unitTypeId}`;
    const currentStatus = matrix[key] || 'unavailable';

    let nextStatus: UnitStatus = 'available';
    if (currentStatus === 'available') nextStatus = 'reserved';
    else if (currentStatus === 'reserved') nextStatus = 'unavailable';
    else if (currentStatus === 'unavailable') nextStatus = 'available';
    else nextStatus = 'available';

    setActiveCellKey(key);
    if (!['available', 'reserved', 'unavailable'].includes(currentStatus)) {
      setCustomCellText(currentStatus);
    } else {
      setCustomCellText('');
    }

    saveStatusToSupabase(floorName, unitTypeId, nextStatus);
  };

  const handleExplicitStatusChange = (status: UnitStatus) => {
    if (!activeCellKey) return;
    const [floorName, unitTypeId] = activeCellKey.split('__');
    if (floorName && unitTypeId) {
      saveStatusToSupabase(floorName, unitTypeId, status);
    }
  };

  const handleApplyCustomText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCellKey || !customCellText.trim()) return;
    handleExplicitStatusChange(customCellText.trim());
  };

  // Extract unique marketer names from accounts and leads
  const marketerOptions = Array.from(
    new Set([
      ...marketerAccounts.map((m) => m.name).filter(Boolean),
      ...marketerClients.map((c) => c.marketer_name || c.marketerName || '').filter(Boolean),
    ])
  );

  // Filter clients based on selected marketer
  const filteredClients =
    selectedMarketerFilter === 'all'
      ? marketerClients
      : marketerClients.filter(
          (c) => (c.marketer_name || c.marketerName) === selectedMarketerFilter
        );

  // Stats
  const totalCells = floors.length * unitTypes.length;
  let availableCount = 0;
  let reservedCount = 0;
  let unavailableCount = 0;

  floors.forEach((f) => {
    unitTypes.forEach((ut) => {
      const key = `${f.floor_name}__${ut.id}`;
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
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading matrix data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen text-left" dir="ltr">
      {/* Title Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Admin Portal <span className="text-slate-400 font-semibold">— Real Estate Manager</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage floors, unit types, pricing & payment plans, and manage marketer requests
            </p>
          </div>
        </div>

        {/* Project Selector Switcher */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:block">
            Active Project
          </label>
          <div className="relative w-full md:w-auto">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full appearance-none pl-3 pr-9 py-2.5 bg-indigo-50 border border-indigo-200 font-semibold text-indigo-900 text-sm rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name || p.title || 'Untitled Project'}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-indigo-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="inline-flex flex-wrap gap-1 mb-6 bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'matrix' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          Matrix &amp; Floors Stock
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'pricing' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Pricing &amp; Payment Plans
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'clients' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          Marketers &amp; Clients
          <span className={`inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'clients' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {marketerClients.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('marketers')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'marketers' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          Marketers &amp; Approvals
          <span className={`inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'marketers' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {marketerAccounts.length}
          </span>
          {pendingMarketersCount > 0 && (
            <span className="bg-amber-400 text-slate-900 text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
              {pendingMarketersCount} Pending
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: MATRIX & FLOORS STOCK */}
      {activeTab === 'matrix' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wide">Total Matrix Units</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tabular-nums">{totalCells}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <LayoutGrid className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between">
              <div>
                <p className="text-emerald-600 text-[11px] font-semibold uppercase tracking-wide">Available</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tabular-nums">{availableCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between">
              <div>
                <p className="text-amber-600 text-[11px] font-semibold uppercase tracking-wide">Reserved</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tabular-nums">{reservedCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <Clock3 className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between">
              <div>
                <p className="text-rose-600 text-[11px] font-semibold uppercase tracking-wide">Sold / Unavailable</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tabular-nums">{unavailableCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5 text-rose-600" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-slate-500" />
                  <h2 className="font-bold text-slate-800 text-sm">
                    Add Floors <span className="font-normal text-slate-400">to {selectedProject?.name || selectedProject?.title}</span>
                  </h2>
                </div>
                <form onSubmit={handleAddFloors} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Single Floor Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Ground / First"
                        value={newFloorName}
                        onChange={(e) => {
                          setNewFloorName(e.target.value);
                          if (e.target.value) setTypicalFloorCount('');
                        }}
                        className="w-full p-2 border border-slate-200 bg-slate-50 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-indigo-600 uppercase tracking-wide mb-1">Typical Count</label>
                      <input
                        type="number"
                        placeholder="e.g. 10"
                        value={typicalFloorCount}
                        onChange={(e) => {
                          setTypicalFloorCount(e.target.value ? Number(e.target.value) : '');
                          if (e.target.value) setNewFloorName('');
                        }}
                        className="w-full p-2 border border-indigo-200 bg-indigo-50 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg text-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {typicalFloorCount ? `Generate ${typicalFloorCount} Typical Floors` : 'Add Single Floor'}
                  </button>
                </form>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <Home className="w-4 h-4 text-slate-500" />
                  <h2 className="font-bold text-slate-800 text-sm">Add House Type &amp; Pricing</h2>
                </div>
                <form onSubmit={handleAddUnitType} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">House Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. 3 Bed Room"
                      value={newUnitTitle}
                      onChange={(e) => setNewUnitTitle(e.target.value)}
                      className="w-full p-2 border border-slate-200 bg-slate-50 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Area (m²) *</label>
                      <input
                        type="number"
                        placeholder="e.g. 120"
                        value={newUnitArea}
                        onChange={(e) => setNewUnitArea(e.target.value ? Number(e.target.value) : '')}
                        className="w-full p-2 border border-slate-200 bg-slate-50 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Total Price ($)</label>
                      <input
                        type="number"
                        placeholder="e.g. 150000"
                        value={newUnitPrice}
                        onChange={(e) => setNewUnitPrice(e.target.value ? Number(e.target.value) : '')}
                        className="w-full p-2 border border-slate-200 bg-slate-50 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add House Type Column
                  </button>
                </form>
              </div>

              {/* Selected Cell Panel */}
              {activeCellKey && (
                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-1.5">
                    <MousePointerClick className="w-3.5 h-3.5 text-indigo-600" />
                    <p className="text-xs font-bold text-indigo-900">
                      Selected Cell: <span className="underline decoration-indigo-400">{activeCellKey.replace('__', ' / ')}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleExplicitStatusChange('available')}
                      className="inline-flex items-center justify-center gap-1 bg-emerald-500 text-white py-1.5 rounded-lg text-[10px] font-bold shadow-sm hover:bg-emerald-600 transition"
                    >
                      <Check className="w-3 h-3" /> Available
                    </button>
                    <button
                      onClick={() => handleExplicitStatusChange('reserved')}
                      className="inline-flex items-center justify-center gap-1 bg-amber-400 text-slate-900 py-1.5 rounded-lg text-[10px] font-bold shadow-sm hover:bg-amber-500 transition"
                    >
                      <Clock className="w-3 h-3" /> Reserved
                    </button>
                    <button
                      onClick={() => handleExplicitStatusChange('unavailable')}
                      className="inline-flex items-center justify-center gap-1 bg-rose-500 text-white py-1.5 rounded-lg text-[10px] font-bold shadow-sm hover:bg-rose-600 transition"
                    >
                      <X className="w-3 h-3" /> Sold/Off
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-indigo-200">
                    <button
                      onClick={() => handleExplicitStatusChange('Business')}
                      className="inline-flex items-center justify-center gap-1 bg-slate-700 text-white py-1.5 rounded-lg text-[10px] font-bold shadow-sm hover:bg-slate-800 transition"
                    >
                      <Briefcase className="w-3 h-3" /> Business
                    </button>
                    <button
                      onClick={() => handleExplicitStatusChange('office')}
                      className="inline-flex items-center justify-center gap-1 bg-slate-700 text-white py-1.5 rounded-lg text-[10px] font-bold shadow-sm hover:bg-slate-800 transition"
                    >
                      <Building className="w-3 h-3" /> Office
                    </button>
                    <button
                      onClick={() => handleExplicitStatusChange('Shops')}
                      className="inline-flex items-center justify-center gap-1 bg-slate-700 text-white py-1.5 rounded-lg text-[10px] font-bold shadow-sm hover:bg-slate-800 transition"
                    >
                      <Store className="w-3 h-3" /> Shops
                    </button>
                  </div>

                  <form onSubmit={handleApplyCustomText} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Or enter custom text (e.g. Gym)"
                      value={customCellText}
                      onChange={(e) => setCustomCellText(e.target.value)}
                      className="flex-1 p-1.5 text-xs border border-indigo-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-700 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-indigo-800 transition"
                    >
                      Apply Text
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Matrix Render Table */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 pb-4 border-b border-slate-100">
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <div className="inline-flex items-center gap-2 bg-slate-900 text-white text-sm sm:text-base font-bold uppercase px-6 py-2 rounded-lg tracking-wide">
                    <LayoutGrid className="w-4 h-4" />
                    Available Stocks — Admin Matrix
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wide">
                    {selectedProject?.subtitle || 'Project Details'}
                  </p>
                  <div className="flex items-center gap-4 pt-1">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Reserved
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Sold / Off
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-center text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th rowSpan={2} className="sticky left-0 z-10 bg-slate-900 border border-slate-700 p-2 font-bold min-w-[100px]">
                        Floor
                      </th>
                      <th colSpan={unitTypes.length || 1} className="border border-slate-700 p-1.5 font-bold text-sm">
                        Type of Houses
                      </th>
                      <th rowSpan={2} className="border border-slate-700 p-2 font-bold min-w-[80px]">Remark</th>
                    </tr>
                    <tr className="bg-slate-800 text-white">
                      {unitTypes.map((ut) => (
                        <th key={ut.id} className="border border-slate-700 p-2 font-semibold min-w-[90px]">
                          {ut.title} <br />
                          <span className="font-normal text-[10px] text-slate-300">area = {ut.area}m²</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {floors.map((f) => (
                      <tr key={f.id}>
                        <td className="sticky left-0 z-10 bg-slate-50 border border-slate-200 text-slate-800 font-bold p-2 text-xs">
                          {f.floor_name}
                        </td>
                        {unitTypes.map((ut) => {
                          const key = `${f.floor_name}__${ut.id}`;
                          const status = matrix[key] || 'unavailable';
                          const isActive = activeCellKey === key;

                          let bgClass = 'bg-rose-500 hover:bg-rose-600 text-white';
                          let cellContent: React.ReactNode = <X className="w-3.5 h-3.5 mx-auto" />;

                          if (status === 'available') {
                            bgClass = 'bg-emerald-500 hover:bg-emerald-600 text-white';
                            cellContent = <Check className="w-3.5 h-3.5 mx-auto" />;
                          } else if (status === 'reserved') {
                            bgClass = 'bg-amber-400 hover:bg-amber-500 text-slate-900';
                            cellContent = <Clock className="w-3.5 h-3.5 mx-auto" />;
                          } else if (status === 'unavailable') {
                            bgClass = 'bg-rose-500 hover:bg-rose-600 text-white';
                            cellContent = <X className="w-3.5 h-3.5 mx-auto" />;
                          } else {
                            bgClass = 'bg-slate-700 hover:bg-slate-800 text-white font-extrabold';
                            cellContent = (
                              <span className="text-[10px] uppercase tracking-wider font-black break-words">
                                {status}
                              </span>
                            );
                          }

                          return (
                            <td
                              key={ut.id}
                              onClick={() => handleCellClick(f.floor_name, ut.id)}
                              className={`border border-slate-200 p-2 font-bold transition-all cursor-pointer select-none ${bgClass} ${
                                isActive ? 'ring-2 ring-inset ring-indigo-500' : ''
                              }`}
                            >
                              {cellContent}
                            </td>
                          );
                        })}
                        <td className="border border-slate-200 bg-white text-slate-400 p-1 text-[11px]">—</td>
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
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                Pricing &amp; Payment Plans
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedProject?.name || selectedProject?.title} — edit prices, down payments, and installment duration dynamically
              </p>
            </div>
          </div>

          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wide">
                  <th className="p-3 border-b border-slate-200">House Title</th>
                  <th className="p-3 border-b border-slate-200">Area (m²)</th>
                  <th className="p-3 border-b border-slate-200">Total Price ($)</th>
                  <th className="p-3 border-b border-slate-200">Down Payment ($)</th>
                  <th className="p-3 border-b border-slate-200">Installment Years</th>
                  <th className="p-3 border-b border-slate-200">Est. Monthly Payment</th>
                  <th className="p-3 border-b border-slate-200 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {unitTypes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
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
                        <tr key={ut.id} className="bg-indigo-50/70 border-b border-indigo-100">
                          <td className="p-2 border-b border-indigo-100">
                            <input
                              type="text"
                              value={editUnitForm.title || ''}
                              onChange={(e) => setEditUnitForm({ ...editUnitForm, title: e.target.value })}
                              className="w-full p-1.5 border border-slate-200 rounded-md text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            />
                          </td>
                          <td className="p-2 border-b border-indigo-100">
                            <input
                              type="number"
                              value={editUnitForm.area || ''}
                              onChange={(e) => setEditUnitForm({ ...editUnitForm, area: Number(e.target.value) })}
                              className="w-20 p-1.5 border border-slate-200 rounded-md text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            />
                          </td>
                          <td className="p-2 border-b border-indigo-100">
                            <input
                              type="number"
                              value={editUnitForm.total_price || ''}
                              onChange={(e) => setEditUnitForm({ ...editUnitForm, total_price: Number(e.target.value) })}
                              className="w-28 p-1.5 border border-slate-200 rounded-md text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-emerald-700 bg-white"
                            />
                          </td>
                          <td className="p-2 border-b border-indigo-100">
                            <input
                              type="number"
                              value={editUnitForm.down_payment || ''}
                              onChange={(e) => setEditUnitForm({ ...editUnitForm, down_payment: Number(e.target.value) })}
                              className="w-28 p-1.5 border border-slate-200 rounded-md text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            />
                          </td>
                          <td className="p-2 border-b border-indigo-100">
                            <input
                              type="number"
                              value={editUnitForm.installment_years || ''}
                              onChange={(e) => setEditUnitForm({ ...editUnitForm, installment_years: Number(e.target.value) })}
                              className="w-16 p-1.5 border border-slate-200 rounded-md text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            />
                          </td>
                          <td className="p-2 border-b border-indigo-100 font-bold text-indigo-700">
                            ${calcMonthly.toLocaleString()} / mo
                          </td>
                          <td className="p-2 border-b border-indigo-100 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleSaveUnitPricing(ut.id)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md text-[11px] transition"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-md text-[11px] transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={ut.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                        <td className="p-3 font-bold text-slate-800">{ut.title}</td>
                        <td className="p-3 text-slate-600">{ut.area} m²</td>
                        <td className="p-3 font-semibold text-emerald-700">${ut.total_price?.toLocaleString() || 0}</td>
                        <td className="p-3 text-slate-600">${ut.down_payment?.toLocaleString() || 0}</td>
                        <td className="p-3 text-slate-600">{ut.installment_years || 0} Years</td>
                        <td className="p-3 font-bold text-indigo-700">${ut.monthly_installment?.toLocaleString() || 0} / mo</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleEditUnitClick(ut)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md font-semibold text-[11px] transition"
                            >
                              <Pencil className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUnitType(ut.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-md font-semibold text-[11px] transition"
                            >
                              <Trash2 className="w-3 h-3" />
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

      {/* TAB 3: MARKETERS & CLIENTS FILTER */}
      {activeTab === 'clients' && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Marketer Registered Clients
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Filter clients by selecting a specific marketer</p>
            </div>

            {/* Marketer Selector Dropdown */}
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
              <label className="text-xs font-semibold text-slate-600 whitespace-nowrap pl-1">Select Marketer:</label>
              <div className="relative">
                <select
                  value={selectedMarketerFilter}
                  onChange={(e) => setSelectedMarketerFilter(e.target.value)}
                  className="appearance-none pl-2 pr-7 py-1.5 bg-white border border-slate-200 font-semibold text-slate-800 text-xs rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="all">All Marketers ({marketerClients.length} clients)</option>
                  {marketerOptions.map((name) => {
                    const count = marketerClients.filter(
                      (c) => (c.marketer_name || c.marketerName) === name
                    ).length;
                    return (
                      <option key={name} value={name}>
                        {name} ({count} clients)
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wide">
                  <th className="p-3 border-b border-slate-200">Marketer Name</th>
                  <th className="p-3 border-b border-slate-200">Client Name</th>
                  <th className="p-3 border-b border-slate-200">Phone</th>
                  <th className="p-3 border-b border-slate-200">Unit / Details</th>
                  <th className="p-3 border-b border-slate-200">Source</th>
                  <th className="p-3 border-b border-slate-200">Status</th>
                  <th className="p-3 border-b border-slate-200">Negotiation Details</th>
                  <th className="p-3 border-b border-slate-200">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                      {selectedMarketerFilter === 'all'
                        ? 'No client leads found.'
                        : `No client leads found for marketer "${selectedMarketerFilter}".`}
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="p-3 font-bold text-indigo-700">
                        {client.marketer_name || client.marketerName || 'Unknown'}
                      </td>
                      <td className="p-3 font-semibold text-slate-800">
                        {client.name || client.client_name}
                      </td>
                      <td className="p-3 text-slate-600">{client.phone}</td>
                      <td className="p-3 font-medium text-amber-800">
                        {client.apartment_id || client.apartmentId || '-'}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                          <Tag className="w-2.5 h-2.5" />
                          {client.source || client.lead_source || 'Direct'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`font-bold px-2.5 py-1 rounded-full text-[10px] ${
                          client.status === 'Negotiation' ? 'bg-orange-100 text-orange-800' :
                          client.status === 'Qualified' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {client.status || 'Reserved'}
                        </span>
                      </td>

                      <td className="p-3">
                        {client.total_payment || client.installment_plan || client.memo ? (
                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 space-y-1 min-w-[170px] text-[11px]">
                            {client.total_payment && (
                              <div className="flex items-center gap-1 font-semibold text-slate-700">
                                <DollarSign className="w-3 h-3 text-emerald-600" />
                                Total: <span className="text-emerald-600">${Number(client.total_payment).toLocaleString()}</span>
                              </div>
                            )}
                            {client.installment_plan && (
                              <div className="flex items-center gap-1 text-slate-600">
                                <CalendarDays className="w-3 h-3 text-slate-400" />
                                Plan: <span className="font-medium text-slate-700">{client.installment_plan}</span>
                              </div>
                            )}
                            {client.memo && (
                              <div className="flex items-center gap-1 text-slate-500 italic truncate max-w-[200px]" title={client.memo}>
                                <StickyNote className="w-3 h-3 shrink-0 text-slate-400" />
                                {client.memo}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300 italic">—</span>
                        )}
                      </td>

                      <td className="p-3 text-slate-400">
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
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                Marketer Registration Approvals
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Approve or Reject new marketer signup requests</p>
            </div>
            <button
              onClick={fetchMarketerAccounts}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Requests
            </button>
          </div>

          {marketersFetchError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Error Loading Data from Supabase:</strong> {marketersFetchError}
              </div>
            </div>
          )}

          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wide">
                  <th className="p-3 border-b border-slate-200">Marketer Name</th>
                  <th className="p-3 border-b border-slate-200">Email</th>
                  <th className="p-3 border-b border-slate-200">Phone</th>
                  <th className="p-3 border-b border-slate-200">Status</th>
                  <th className="p-3 border-b border-slate-200 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {marketerAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                      No marketer accounts found in database.
                    </td>
                  </tr>
                ) : (
                  marketerAccounts.map((marketer) => {
                    const status = marketer.status || 'pending';
                    return (
                      <tr key={marketer.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {(marketer.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-800">{marketer.name || 'Unnamed'}</span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600">{marketer.email}</td>
                        <td className="p-3 text-slate-600">{marketer.phone || '-'}</td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                              status === 'approved'
                                ? 'bg-emerald-100 text-emerald-700'
                                : status === 'rejected'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {status === 'approved' && (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> Approved
                              </>
                            )}
                            {status === 'rejected' && (
                              <>
                                <XCircle className="w-3 h-3" /> Rejected
                              </>
                            )}
                            {status === 'pending' && (
                              <>
                                <Clock3 className="w-3 h-3 animate-pulse" /> Pending Approval
                              </>
                            )}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleUpdateMarketerStatus(marketer.id, 'approved')}
                              disabled={status === 'approved'}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition ${
                                status === 'approved'
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateMarketerStatus(marketer.id, 'rejected')}
                              disabled={status === 'rejected'}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition ${
                                status === 'rejected'
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : 'bg-rose-600 hover:bg-rose-700 text-white'
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
