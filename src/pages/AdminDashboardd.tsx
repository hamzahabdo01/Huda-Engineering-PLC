import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  marketer_type?: string;
  marketerType?: string;
  client_name?: string;
  name?: string;
  phone: string;
  project_id?: string;
  project_name?: string;
  unit_title?: string;
  apartment_id?: string;
  apartmentId?: string;
  status?: string;
  source?: string;
  lead_source?: string;
  created_at?: string;
  total_payment?: number | string | null;
  down_payment?: number | string | null;
  payment_type?: string | null;
  installment_plan?: string | null;
  memo?: string | null;
  cpo_image?: string | null;
  cpoImage?: string | null;
  cpo_image_url?: string | null;
  cpoImageUrl?: string | null;
  cpo_file_url?: string | null;
  cpo_url?: string | null;
  cpo_file?: string | null;
}

export interface MarketerAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  marketer_type?: string;
  role?: string;
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

  // --- Clients Search, Filter & Sort States ---
  const [selectedMarketerFilter, setSelectedMarketerFilter] = useState<string>('all');
  const [clientSearch, setClientSearch] = useState<string>('');
  const [clientStatusFilter, setClientStatusFilter] = useState<string>('all');
  const [clientSortField, setClientSortField] = useState<'created_at' | 'name' | 'marketer_name' | 'total_payment'>('created_at');
  const [clientSortOrder, setClientSortOrder] = useState<'asc' | 'desc'>('desc');

  // --- Marketers Search, Filter & Sort States ---
  const [marketerSearch, setMarketerSearch] = useState<string>('');
  const [marketerStatusFilter, setMarketerStatusFilter] = useState<string>('all');
  const [marketerSortField, setMarketerSortField] = useState<'name' | 'email' | 'created_at' | 'status'>('created_at');
  const [marketerSortOrder, setMarketerSortOrder] = useState<'asc' | 'desc'>('desc');

  const [loading, setLoading] = useState<boolean>(true);

  // Floor Form States
  const [newFloorName, setNewFloorName] = useState('');
  const [typicalFloorCount, setTypicalFloorCount] = useState<number | ''>('');

  // Unit Type Form States (بدون السعر الإجمالي)
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [newUnitArea, setNewUnitArea] = useState<number | ''>('');

  const [activeCellKey, setActiveCellKey] = useState<string | null>(null);
  const [customCellText, setCustomCellText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'matrix' | 'pricing' | 'clients' | 'marketers'>('clients');

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

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

    const fetchProjectDetails = async (projectId: string) => {
      setLoading(true);
      await Promise.all([
        fetchFloors(projectId),
        fetchUnitTypes(projectId),
        fetchMatrixData(projectId),
      ]);
      setLoading(false);
    };

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
      .select('*, projects(name, title)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const formattedData = data.map((item: any) => ({
        ...item,
        project_name:
          item.project_name ||
          item.projects?.name ||
          item.projects?.title ||
          null,
      }));
      setMarketerClients(formattedData);
    } else if (error) {
      const { data: rawData } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (rawData) setMarketerClients(rawData);
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

  const handleUpdateClientStatus = async (clientId: string, newStatus: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', clientId);

    if (error) {
      alert(`Error updating status: ${error.message}`);
    } else {
      setMarketerClients((prev) =>
        prev.map((c) => (c.id === clientId ? { ...c, status: newStatus } : c))
      );
      alert(`✅ Client status updated to ${newStatus}`);
    }
  };

  const getCpoFileUrl = (client: MarketerClient & Record<string, any>): string | null => {
    const file =
      client.cpo_image ||
      client.cpoImage ||
      client.cpo_image_url ||
      client.cpoImageUrl ||
      client.cpo_file_url ||
      client.cpo_url ||
      client.cpo_file ||
      client.cpo_path ||
      client.cpo ||
      client.cpo_document;

    if (!file || typeof file !== 'string' || file.trim() === '') {
      return null;
    }

    const cleanFile = file.trim();

    if (
      cleanFile.startsWith('http://') ||
      cleanFile.startsWith('https://') ||
      cleanFile.startsWith('data:image')
    ) {
      return cleanFile;
    }

    const { data } = supabase.storage.from('cpo-files').getPublicUrl(cleanFile);
    return data?.publicUrl || null;
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

  // إضافة نوع شقة جديد بدون Total Price
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
      alert('✅ Unit Type added successfully!');
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

  const getProjectName = useCallback((client: MarketerClient) => {
    if (client.project_name && client.project_name !== '-') {
      return client.project_name;
    }
    if (client.project_id) {
      const match = projects.find((p) => p.id === client.project_id);
      if (match) return match.name || match.title || '-';
    }
    return '-';
  }, [projects]);

  const marketerOptions = Array.from(
    new Set([
      ...marketerAccounts.map((m) => m.name).filter(Boolean),
      ...marketerClients.map((c) => c.marketer_name || c.marketerName || '').filter(Boolean),
    ])
  );

  // --- Sorting & Filtering Logic for CLIENTS ---
  const handleClientSortToggle = (field: typeof clientSortField) => {
    if (clientSortField === field) {
      setClientSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setClientSortField(field);
      setClientSortOrder('asc');
    }
  };

  const filteredAndSortedClients = useMemo(() => {
    return marketerClients
      .filter((c) => {
        if (selectedMarketerFilter !== 'all') {
          const mName = c.marketer_name || c.marketerName || '';
          if (mName !== selectedMarketerFilter) return false;
        }

        if (clientStatusFilter !== 'all') {
          const status = c.status || 'Reserved';
          if (status.toLowerCase() !== clientStatusFilter.toLowerCase()) return false;
        }

        if (clientSearch.trim() !== '') {
          const query = clientSearch.toLowerCase();
          const mName = (c.marketer_name || c.marketerName || '').toLowerCase();
          const cName = (c.name || c.client_name || '').toLowerCase();
          const phone = (c.phone || '').toLowerCase();
          const projName = getProjectName(c).toLowerCase();
          const source = (c.source || c.lead_source || '').toLowerCase();

          const matches =
            mName.includes(query) ||
            cName.includes(query) ||
            phone.includes(query) ||
            projName.includes(query) ||
            source.includes(query);

          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA: any = '';
        let valB: any = '';

        if (clientSortField === 'name') {
          valA = (a.name || a.client_name || '').toLowerCase();
          valB = (b.name || b.client_name || '').toLowerCase();
        } else if (clientSortField === 'marketer_name') {
          valA = (a.marketer_name || a.marketerName || '').toLowerCase();
          valB = (b.marketer_name || b.marketerName || '').toLowerCase();
        } else if (clientSortField === 'total_payment') {
          valA = Number(a.total_payment) || 0;
          valB = Number(b.total_payment) || 0;
        } else {
          valA = a.created_at || '';
          valB = b.created_at || '';
        }

        if (valA < valB) return clientSortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return clientSortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [
    marketerClients,
    selectedMarketerFilter,
    clientStatusFilter,
    clientSearch,
    clientSortField,
    clientSortOrder,
    getProjectName,
  ]);

  // --- Sorting & Filtering Logic for MARKETERS ---
  const handleMarketerSortToggle = (field: typeof marketerSortField) => {
    if (marketerSortField === field) {
      setMarketerSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setMarketerSortField(field);
      setMarketerSortOrder('asc');
    }
  };

  const filteredAndSortedMarketers = useMemo(() => {
    return marketerAccounts
      .filter((m) => {
        if (marketerStatusFilter !== 'all') {
          const st = m.status || 'pending';
          if (st.toLowerCase() !== marketerStatusFilter.toLowerCase()) return false;
        }

        if (marketerSearch.trim() !== '') {
          const query = marketerSearch.toLowerCase();
          const name = (m.name || '').toLowerCase();
          const email = (m.email || '').toLowerCase();
          const phone = (m.phone || '').toLowerCase();

          const matches =
            name.includes(query) || email.includes(query) || phone.includes(query);

          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA: any = '';
        let valB: any = '';

        if (marketerSortField === 'name') {
          valA = (a.name || '').toLowerCase();
          valB = (b.name || '').toLowerCase();
        } else if (marketerSortField === 'email') {
          valA = (a.email || '').toLowerCase();
          valB = (b.email || '').toLowerCase();
        } else if (marketerSortField === 'status') {
          valA = (a.status || 'pending').toLowerCase();
          valB = (b.status || 'pending').toLowerCase();
        } else {
          valA = a.created_at || '';
          valB = b.created_at || '';
        }

        if (valA < valB) return marketerSortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return marketerSortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [marketerAccounts, marketerStatusFilter, marketerSearch, marketerSortField, marketerSortOrder]);

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
          💳 Pricing & Payment Plans ({marketerClients.length})
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'clients' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-200'
          }`}
        >
          👥 Marketers & Clients ({marketerClients.length})
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
                <h2 className="font-bold text-gray-800 text-sm mb-1">
                  📐 1. Add Floors to [{selectedProject?.name || selectedProject?.title}]
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

              {/* تم حذف حقل total payment من هذه الاستمارة بناءً على طلبك */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h2 className="font-bold text-gray-800 text-sm mb-3">🏠 2. Add House Type</h2>
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
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs transition"
                  >
                    + Add House Type Column
                  </button>
                </form>
              </div>

              {/* Selected Cell Panel */}
              {activeCellKey && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-300 shadow-sm space-y-3">
                  <p className="text-xs font-bold text-amber-900">
                    Selected Cell: <span className="underline">{activeCellKey.replace('__', ' / ')}</span>
                  </p>
                  
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
                          const key = `${f.floor_name}__${ut.id}`;
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

      {/* TAB 2: PRICING & PAYMENT PLANS (بيانات الماركتر والخطط) */}
      {activeTab === 'pricing' && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                💳 Marketer Payment Plans & Pricing
              </h2>
              <p className="text-xs text-gray-500">
                View client payment details (Full Payment vs Progressive Payment) entered by marketers
              </p>
            </div>
            <button
              onClick={fetchMarketerClients}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 transition"
            >
              🔄 Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-gray-200">
              <thead className="bg-gray-800 text-white uppercase font-bold">
                <tr>
                  <th className="p-3 border">Project Name</th>
                  <th className="p-3 border">Client Name</th>
                  <th className="p-3 border">Apartment / Unit</th>
                  <th className="p-3 border">Payment Type</th>
                  <th className="p-3 border">Total Price ($)</th>
                  <th className="p-3 border">Down Payment ($)</th>
                  <th className="p-3 border">Installment Plan</th>
                  <th className="p-3 border">Marketer</th>
                  <th className="p-3 border">Date</th>
                </tr>
              </thead>
              <tbody>
                {marketerClients.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-gray-500 font-semibold">
                      No payment or client records submitted by marketers.
                    </td>
                  </tr>
                ) : (
                  marketerClients.map((client) => {
                    const paymentTypeStr = (
                      client.payment_type ||
                      (client.installment_plan ? 'progressive payment' : 'full payment')
                    ).toLowerCase();

                    const isFullPayment = paymentTypeStr.includes('full');

                    return (
                      <tr key={client.id} className="border-b hover:bg-gray-50">
                        {/* اسم المشروع */}
                        <td className="p-3 border font-bold text-gray-800">
                          {getProjectName(client)}
                        </td>

                        {/* اسم العميل */}
                        <td className="p-3 border font-semibold text-blue-900">
                          {client.name || client.client_name || '—'}
                        </td>

                        {/* تفاصيل الشقة */}
                        <td className="p-3 border font-medium text-amber-900">
                          {client.apartment_id || client.apartmentId || '—'}
                        </td>

                        {/* نوع الدفع (Full Payment أو Progressive Payment) */}
                        <td className="p-3 border">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              isFullPayment
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-purple-100 text-purple-800 border border-purple-300'
                            }`}
                          >
                            {isFullPayment ? '💵 Full Payment' : '📅 Progressive Payment'}
                          </span>
                        </td>

                        {/* المباشر / الإجمالي */}
                        <td className="p-3 border font-semibold text-emerald-700">
                          {client.total_payment
                            ? `$${Number(client.total_payment).toLocaleString()}`
                            : '—'}
                        </td>

                        {/* الدفعة الأولى */}
                        <td className="p-3 border font-semibold text-blue-700">
                          {client.down_payment
                            ? `$${Number(client.down_payment).toLocaleString()}`
                            : isFullPayment
                            ? 'N/A'
                            : '—'}
                        </td>

                        {/* خطة الأقساط */}
                        <td className="p-3 border text-gray-700 font-medium">
                          {client.installment_plan || (isFullPayment ? 'Full Cash' : '—')}
                        </td>

                        {/* اسم الماركتر */}
                        <td className="p-3 border font-bold text-gray-700">
                          {client.marketer_name || client.marketerName || '—'}
                        </td>

                        {/* تاريخ الإنشاء */}
                        <td className="p-3 border text-gray-500 whitespace-nowrap">
                          {client.created_at
                            ? new Date(client.created_at).toLocaleDateString('en-US')
                            : '—'}
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

      {/* TAB 3: MARKETERS & CLIENTS FILTER, SEARCH & SORT */}
      {activeTab === 'clients' && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">👥 Marketer Registered Clients</h2>
              <p className="text-xs text-gray-500">
                Search, filter by marketer or lead status, approve qualification requests and view CPO files
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-300">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500">
                <span className="text-gray-400 text-xs">🔍</span>
                <input
                  type="text"
                  placeholder="Search client, phone, project..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="bg-transparent text-xs outline-none w-40 sm:w-48 text-gray-800"
                />
                {clientSearch && (
                  <button
                    onClick={() => setClientSearch('')}
                    className="text-xs text-gray-400 hover:text-gray-600 font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <select
                  value={selectedMarketerFilter}
                  onChange={(e) => setSelectedMarketerFilter(e.target.value)}
                  className="p-1.5 bg-white border border-gray-300 font-bold text-gray-800 text-xs rounded-lg outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">-- All Marketers ({marketerClients.length}) --</option>
                  {marketerOptions.map((name) => {
                    const count = marketerClients.filter(
                      (c) => (c.marketer_name || c.marketerName) === name
                    ).length;
                    return (
                      <option key={name} value={name}>
                        👤 {name} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <select
                  value={clientStatusFilter}
                  onChange={(e) => setClientStatusFilter(e.target.value)}
                  className="p-1.5 bg-white border border-gray-300 font-semibold text-gray-800 text-xs rounded-lg outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="Request for Qualification">Request for Qualification</option>
                  <option value="Qualified">Qualified</option>
                  <option value="New">New</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Closed">Closed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <button
                onClick={fetchMarketerClients}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 transition flex items-center gap-1"
              >
                🔄 Refresh
              </button>

              {(clientSearch || selectedMarketerFilter !== 'all' || clientStatusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setClientSearch('');
                    setSelectedMarketerFilter('all');
                    setClientStatusFilter('all');
                  }}
                  className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs rounded-lg transition"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-gray-200">
              <thead className="bg-gray-100 text-gray-700 uppercase font-bold select-none">
                <tr>
                  <th
                    onClick={() => handleClientSortToggle('marketer_name')}
                    className="p-3 border cursor-pointer hover:bg-gray-200 transition"
                  >
                    Marketer Name {clientSortField === 'marketer_name' ? (clientSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                  </th>
                  <th className="p-3 border">Marketer Type</th>
                  <th
                    onClick={() => handleClientSortToggle('name')}
                    className="p-3 border cursor-pointer hover:bg-gray-200 transition"
                  >
                    Client Name {clientSortField === 'name' ? (clientSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                  </th>
                  <th className="p-3 border">Phone</th>
                  <th className="p-3 border">Project Name</th>
                  <th className="p-3 border">Unit / Details</th>
                  <th className="p-3 border">Source</th>
                  <th className="p-3 border">Status</th>
                  <th className="p-3 border text-center">CPO Document</th>
                  <th
                    onClick={() => handleClientSortToggle('total_payment')}
                    className="p-3 border cursor-pointer hover:bg-gray-200 transition"
                  >
                    Negotiation Details {clientSortField === 'total_payment' ? (clientSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                  </th>
                  <th
                    onClick={() => handleClientSortToggle('created_at')}
                    className="p-3 border cursor-pointer hover:bg-gray-200 transition"
                  >
                    Date & Time {clientSortField === 'created_at' ? (clientSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedClients.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="p-6 text-center text-gray-500 font-semibold">
                      No clients found matching current filter/search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedClients.map((client) => {
                    const cpoUrl = getCpoFileUrl(client);
                    const isRequestForQualification =
                      client.status?.toLowerCase() === 'request for qualification';

                    return (
                      <tr key={client.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 border font-bold text-blue-800">
                          {client.marketer_name || client.marketerName || 'Unknown'}
                        </td>
                        <td className="p-3 border">
                          <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded text-[10px] border border-blue-200">
                            {client.marketer_type || client.marketerType || 'Standard'}
                          </span>
                        </td>
                        <td className="p-3 border font-semibold">
                          {client.name || client.client_name}
                        </td>
                        <td className="p-3 border">{client.phone}</td>
                        <td className="p-3 border font-semibold text-gray-800">
                          {getProjectName(client)}
                        </td>
                        <td className="p-3 border font-medium text-amber-900">
                          {client.apartment_id || client.apartmentId || '-'}
                        </td>
                        <td className="p-3 border">
                          <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            {client.source || client.lead_source || 'Direct'}
                          </span>
                        </td>

                        <td className="p-3 border">
                          <div className="flex flex-col items-start gap-1.5">
                            <span
                              className={`font-bold px-2.5 py-1 rounded-full text-[10px] ${
                                isRequestForQualification
                                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                  : client.status === 'Qualified'
                                  ? 'bg-emerald-100 text-emerald-800 font-extrabold'
                                  : client.status === 'Rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : client.status === 'Negotiation'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {client.status || 'Reserved'}
                            </span>

                            {isRequestForQualification && (
                              <div className="flex items-center gap-1 mt-1">
                                <button
                                  onClick={() => handleUpdateClientStatus(client.id, 'Qualified')}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[10px] shadow-sm transition"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleUpdateClientStatus(client.id, 'Rejected')}
                                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-[10px] shadow-sm transition"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="p-3 border text-center">
                          {cpoUrl ? (
                            <a
                              href={cpoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold text-[10px] shadow-sm transition"
                            >
                              📄 View CPO
                            </a>
                          ) : (
                            <span className="text-gray-400 italic text-[11px]">—</span>
                          )}
                        </td>

                        <td className="p-3 border">
                          {client.total_payment || client.installment_plan || client.memo ? (
                            <div className="bg-slate-50 p-2 rounded border border-slate-200 space-y-1 min-w-[170px] text-[11px]">
                              {client.total_payment && (
                                <div className="font-semibold text-slate-800">
                                  💵 Total: <span className="text-emerald-600">${Number(client.total_payment).toLocaleString()}</span>
                                </div>
                              )}
                              {client.installment_plan && (
                                <div className="text-slate-600">
                                  📅 Plan: <span className="font-medium text-slate-700">{client.installment_plan}</span>
                                </div>
                              )}
                              {client.memo && (
                                <div className="text-slate-500 italic truncate max-w-[200px]" title={client.memo}>
                                  📝 {client.memo}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">—</span>
                          )}
                        </td>

                        <td className="p-3 border text-gray-500 whitespace-nowrap">
                          {client.created_at
                            ? new Date(client.created_at).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'numeric',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                              })
                            : '-'}
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

      {/* TAB 4: MARKETERS & APPROVALS */}
      {activeTab === 'marketers' && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">🔑 Marketer Registration Approvals</h2>
              <p className="text-xs text-gray-500">Search, filter, and manage marketer account requests</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500">
                <span className="text-gray-400 text-xs">🔍</span>
                <input
                  type="text"
                  placeholder="Search name, email, phone..."
                  value={marketerSearch}
                  onChange={(e) => setMarketerSearch(e.target.value)}
                  className="bg-transparent text-xs outline-none w-40 sm:w-48 text-gray-800"
                />
                {marketerSearch && (
                  <button
                    onClick={() => setMarketerSearch('')}
                    className="text-xs text-gray-400 hover:text-gray-600 font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              <select
                value={marketerStatusFilter}
                onChange={(e) => setMarketerStatusFilter(e.target.value)}
                className="p-2 bg-gray-50 border border-gray-300 font-semibold text-gray-800 text-xs rounded-lg outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">All Approval Statuses</option>
                <option value="pending">⏳ Pending</option>
                <option value="approved">✅ Approved</option>
                <option value="rejected">❌ Rejected</option>
              </select>

              <button
                onClick={fetchMarketerAccounts}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border rounded-lg text-xs font-bold text-gray-700 transition"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {marketersFetchError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-800 text-xs rounded">
              ⚠️ <strong>Error Loading Data from Supabase:</strong> {marketersFetchError}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-gray-200">
              <thead className="bg-gray-800 text-white uppercase font-bold select-none">
                <tr>
                  <th
                    onClick={() => handleMarketerSortToggle('name')}
                    className="p-3 border cursor-pointer hover:bg-gray-700 transition"
                  >
                    Marketer Name {marketerSortField === 'name' ? (marketerSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                  </th>
                  <th className="p-3 border">Marketer Type</th>
                  <th
                    onClick={() => handleMarketerSortToggle('email')}
                    className="p-3 border cursor-pointer hover:bg-gray-700 transition"
                  >
                    Email {marketerSortField === 'email' ? (marketerSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                  </th>
                  <th className="p-3 border">Phone</th>
                  <th
                    onClick={() => handleMarketerSortToggle('status')}
                    className="p-3 border cursor-pointer hover:bg-gray-700 transition"
                  >
                    Status {marketerSortField === 'status' ? (marketerSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                  </th>
                  <th
                    onClick={() => handleMarketerSortToggle('created_at')}
                    className="p-3 border cursor-pointer hover:bg-gray-700 transition"
                  >
                    Created At {marketerSortField === 'created_at' ? (marketerSortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                  </th>
                  <th className="p-3 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedMarketers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-gray-500 font-semibold">
                      No marketer accounts found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedMarketers.map((marketer) => {
                    const status = marketer.status || 'pending';
                    return (
                      <tr key={marketer.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 border font-bold text-gray-800">{marketer.name || 'Unnamed'}</td>
                        <td className="p-3 border">
                          <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded text-[10px] border border-indigo-200">
                            {marketer.marketer_type || marketer.role || 'Broker / Agent'}
                          </span>
                        </td>
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
                        <td className="p-3 border text-gray-500 whitespace-nowrap">
                          {marketer.created_at
                            ? new Date(marketer.created_at).toLocaleDateString('en-US')
                            : '-'}
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