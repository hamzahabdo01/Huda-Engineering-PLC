import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  UserPlus,
  Phone,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  KeyRound,
} from 'lucide-react';

// --- Types & Interfaces ---
export interface Floor {
  id: string;
  project_id: string;
  floor_name: string;
}

export interface UnitType {
  id: string;
  project_id: string;
  title: string;
  area: number;
  totalPrice?: number;
  downPayment?: number;
  installmentYears?: number;
  monthlyInstallment?: number;
}

export type UnitStatus = 'available' | 'unavailable' | 'reserved' | string;

export interface Project {
  id: string;
  name?: string;
  title?: string;
  subtitle?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  source?: string;
  apartment_id?: string;
  unit_key?: string;
  project_id?: string;
  marketer_id?: string;
  marketer_name?: string;
  status: string;
  total_payment?: number;
  installment_plan?: string;
  memo?: string;
  created_at?: string;
}

export interface MarketerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status?: string;
}

export interface SelectedUnit {
  key: string;
  floorName: string;
  unitTypeId: string;
  label: string;
  details: UnitType;
}

// قائمة الدول ومفاتيح الاتصال
const COUNTRY_CODES = [
  { code: '+251', label: '🇪🇹 Ethiopia (+251)' },
  { code: '+966', label: '🇸🇦 Saudi Arabia (+966)' },
  { code: '+971', label: '🇦🇪 UAE (+971)' },
  { code: '+965', label: '🇰🇼 Kuwait (+965)' },
  { code: '+974', label: '🇶🇦 Qatar (+974)' },
  { code: '+20', label: '🇪🇬 Egypt (+20)' },
  { code: '+1', label: '🇺🇸 USA/Canada (+1)' },
  { code: '+44', label: '🇬🇧 UK (+44)' },
  { code: '+212', label: '🇲🇦 Morocco (+212)' },
  { code: '+213', label: '🇩🇿 Algeria (+213)' },
  { code: '+216', label: '🇹🇳 Tunisia (+216)' },
  { code: '+249', label: '🇸🇩 Sudan (+249)' },
  { code: '+962', label: '🇯🇴 Jordan (+962)' },
  { code: '+961', label: '🇱🇧 Lebanon (+961)' },
  { code: '+968', label: '🇴🇲 Oman (+968)' },
  { code: '+973', label: '🇧🇭 Bahrain (+973)' },
  { code: '+964', label: '🇮🇶 Iraq (+964)' },
  { code: '+90', label: '🇹🇷 Turkey (+90)' },
  { code: '+49', label: '🇩🇪 Germany (+49)' },
  { code: '+33', label: '🇫🇷 France (+33)' },
  { code: '+39', label: '🇮🇹 Italy (+39)' },
  { code: '+86', label: '🇨🇳 China (+86)' },
  { code: '+91', label: '🇮🇳 India (+91)' },
];

// 🔍 مكوّن البحث لاختيار الدولة (Searchable Dropdown Component)
function SearchableCountrySelect({
  value,
  onChange,
  isDark = false,
}: {
  value: string;
  onChange: (code: string) => void;
  isDark?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = COUNTRY_CODES.find((c) => c.code === value) || COUNTRY_CODES[0];

  const filtered = COUNTRY_CODES.filter(
    (c) =>
      c.label.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2.5 border rounded-lg text-xs font-semibold outline-none flex items-center justify-between min-w-[120px] transition-all ${
          isDark
            ? 'bg-slate-950/60 border-slate-800 text-white focus:border-teal-500'
            : 'bg-white border-gray-300 text-gray-800 focus:ring-1 focus:ring-[#00474b]'
        }`}
      >
        <span className="truncate">{selected.label}</span>
        <span className={`ml-1 text-[9px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>▼</span>
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 mt-1 w-60 border rounded-lg shadow-2xl p-2 max-h-56 overflow-y-auto left-0 ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-800'
          }`}
        >
          <input
            type="text"
            placeholder="🔍 Search country or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full p-2 border rounded text-xs mb-2 outline-none ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-teal-500'
                : 'bg-gray-50 border-gray-300 text-gray-800 focus:ring-1 focus:ring-[#00474b]'
            }`}
            autoFocus
          />
          <div className="space-y-0.5">
            {filtered.length > 0 ? (
              filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    onChange(c.code);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded transition ${
                    value === c.code
                      ? 'bg-[#00474b] text-white font-bold'
                      : isDark
                      ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'text-gray-700 hover:bg-teal-50'
                  }`}
                >
                  {c.label}
                </button>
              ))
            ) : (
              <div className={`text-xs p-2 text-center ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                No country found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function MarketerDashboard() {
  // --- Auth & User State ---
  const [currentMarketer, setCurrentMarketer] = useState<MarketerProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isUpdatePassword, setIsUpdatePassword] = useState(false);
  const isUpdatePasswordRef = useRef(false);

  const setUpdatePasswordMode = (val: boolean) => {
    isUpdatePasswordRef.current = val;
    setIsUpdatePassword(val);
  };

  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Auth Inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupCountryCode, setSignupCountryCode] = useState('+251');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Password Reset Inputs
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // --- Dynamic Relational Database States ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [floors, setFloors] = useState<Floor[]>([]);
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [matrix, setMatrix] = useState<Record<string, string>>({});

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Dynamic Selection States
  const [selectedUnits, setSelectedUnits] = useState<SelectedUnit[]>([]);

  // Action / Status Dropdown State
  const [actionStatus, setActionStatus] = useState<'New' | 'Qualified' | 'Negotiation' | 'Closed'>('New');

  // Negotiation Extra Fields State
  const [totalPayment, setTotalPayment] = useState<string>('');
  const [installmentPlan, setInstallmentPlan] = useState<string>('');
  const [memo, setMemo] = useState<string>('');

  // Leads State & Country Code State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clientName, setClientName] = useState('');
  const [countryCode, setCountryCode] = useState('+251');
  const [clientPhone, setClientPhone] = useState('');
  const [clientSource, setClientSource] = useState('Facebook boost');

  // Leads Filter Tabs State
  const [leadTab, setLeadTab] = useState<'All' | 'New' | 'Qualified' | 'Negotiation' | 'Closed'>('All');

  // ✏️ Edit Mode State
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);

  // 🛠️ دالة لتنسيق اسم الطابق
  const formatFloorName = (name: string) => {
    const clean = (name || '').trim();
    if (!clean) return '';
    return clean.toLowerCase().endsWith('floor') ? clean : `${clean} Floor`;
  };

  // 🛠️ دالة توحيد صيغ الحالات
  const normalizeStatus = (statusStr?: string): 'New' | 'Qualified' | 'Negotiation' | 'Closed' => {
    if (!statusStr) return 'New';
    const s = statusStr.trim().toLowerCase();
    if (s === 'qualified') return 'Qualified';
    if (s === 'negotiation') return 'Negotiation';
    if (s === 'closed') return 'Closed';
    return 'New';
  };

  // 📱 دالة تنظيف وتجهيز رقم الهاتف
  const formatCleanPhone = (code: string, phone: string) => {
    const rawNumber = phone.replace(/[^0-9]/g, '').replace(/^0+/, '');
    return {
      fullPhone: `${code} ${rawNumber}`,
      numericPhone: `${code.replace(/[^0-9]/g, '')}${rawNumber}`,
    };
  };

  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const formatted: Project[] = data.map((p: any) => ({
          id: p.id,
          name: p.name || p.title || 'Untitled Project',
          subtitle: p.subtitle || '',
        }));

        setProjects(formatted);

        setSelectedProjectId((prev) => {
          if (!prev || !formatted.some((p) => p.id === prev)) {
            return formatted[0].id;
          }
          return prev;
        });
      } else {
        setProjects([]);
      }
    } catch (err: any) {
      console.error('Error fetching projects:', err.message);
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  const fetchFloors = useCallback(async (projectId: string) => {
    const { data, error } = await supabase
      .from('srm_floors')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setFloors(data);
    }
  }, []);

  const fetchUnitTypes = useCallback(async (projectId: string) => {
    const { data, error } = await supabase
      .from('srm_unit_types')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      const formatted: UnitType[] = data.map((ut: any) => ({
        id: ut.id,
        project_id: ut.project_id,
        title: ut.title,
        area: ut.area,
        totalPrice: ut.total_price || ut.totalPrice,
        downPayment: ut.down_payment || ut.downPayment,
        installmentYears: ut.installment_years || ut.installmentYears,
        monthlyInstallment: ut.monthly_installment || ut.monthlyInstallment,
      }));
      setUnitTypes(formatted);
    }
  }, []);

  const fetchMatrixData = useCallback(async (projectId: string) => {
    const { data, error } = await supabase
      .from('srm_matrix_cells')
      .select('*')
      .eq('project_id', projectId);

    if (!error && data) {
      const matrixMap: Record<string, string> = {};
      data.forEach((item: any) => {
        const floorClean = (item.floor_name || '').trim();
        const uId = item.unit_type_id || item.unit_id || '';
        const uTitle = (item.unit_type_title || item.unit_title || item.title || '').trim();

        if (floorClean) {
          if (uId) {
            matrixMap[`${floorClean}___${uId}`] = item.status;
            if (item.floor_name) matrixMap[`${item.floor_name}___${uId}`] = item.status;
          }
          if (uTitle) {
            matrixMap[`${floorClean}___${uTitle}`] = item.status;
            if (item.floor_name) matrixMap[`${item.floor_name}___${uTitle}`] = item.status;
          }
        }
      });
      setMatrix(matrixMap);
    }
  }, []);

  const fetchProjectDetails = useCallback(async (projectId: string) => {
    setLoadingDetails(true);
    await Promise.all([
      fetchFloors(projectId),
      fetchUnitTypes(projectId),
      fetchMatrixData(projectId),
    ]);
    setLoadingDetails(false);
  }, [fetchFloors, fetchUnitTypes, fetchMatrixData]);

  const fetchLeadsForMarketer = useCallback(async (marketerId: string, marketerName: string) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .or(`marketer_id.eq.${marketerId},marketer_name.eq.${marketerName}`)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setLeads(data);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    }
  }, []);

  const fetchMarketerProfile = useCallback(async (userId: string) => {
    if (isUpdatePasswordRef.current) return;

    try {
      const { data, error } = await supabase
        .from('marketers')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const isApproved = data.status === 'approved';

        if (!isApproved && !isUpdatePasswordRef.current) {
          setAuthError('⏳ Your account is pending admin approval. Access is restricted.');
          setCurrentMarketer(null);
          await supabase.auth.signOut();
        } else if (isApproved && !isUpdatePasswordRef.current) {
          setCurrentMarketer(data);
          fetchLeadsForMarketer(data.id, data.name);
        }
      } else {
        if (!isUpdatePasswordRef.current) {
          setAuthError('❌ Profile record not found in marketers table.');
          setCurrentMarketer(null);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoadingUser(false);
    }
  }, [fetchLeadsForMarketer]);

  useEffect(() => {
    fetchProjects();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setUpdatePasswordMode(true);
        setIsForgotPassword(false);
        setIsSignUp(false);
        setCurrentMarketer(null);
        setLoadingUser(false);
        return;
      }

      if (isUpdatePasswordRef.current) {
        setLoadingUser(false);
        return;
      }

      if (session?.user) {
        fetchMarketerProfile(session.user.id);
      } else {
        setCurrentMarketer(null);
        setLoadingUser(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchProjects, fetchMarketerProfile]);

  useEffect(() => {
    if (!selectedProjectId) return;

    fetchProjectDetails(selectedProjectId);

    const matrixChannel = supabase
      .channel(`realtime-matrix-${selectedProjectId}`)
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
      supabase.removeChannel(matrixChannel);
    };
  }, [selectedProjectId, fetchProjectDetails, fetchMatrixData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        setAuthError(`❌ Login failed: ${error.message}`);
        setAuthLoading(false);
        return;
      }

      if (data.user) {
        await fetchMarketerProfile(data.user.id);
      }
    } catch (err: any) {
      setAuthError(`❌ An unexpected error occurred: ${err.message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!loginEmail.trim()) {
      setAuthError('❌ Please enter your email address first.');
      return;
    }

    setAuthLoading(true);

    try {
      const redirectUrl = `${window.location.origin}${window.location.pathname}`;

      const { error } = await supabase.auth.resetPasswordForEmail(loginEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        setAuthError(`❌ ${error.message}`);
      } else {
        setAuthSuccess('✅ Password reset link has been sent to your email inbox!');
      }
    } catch (err: any) {
      setAuthError(`❌ ${err.message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (newPassword !== confirmNewPassword) {
      setAuthError('❌ Passwords do not match.');
      return;
    }

    setAuthLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (authError) {
        setAuthError(`❌ Auth error: ${authError.message}`);
        setAuthLoading(false);
        return;
      }

      if (authData?.user) {
        const { error: dbError } = await supabase
          .from('marketers')
          .update({
            status: 'pending',
          })
          .eq('id', authData.user.id);

        if (dbError) {
          setAuthError(`❌ Failed to update status in Database: ${dbError.message}`);
          setAuthLoading(false);
          return;
        }

        window.history.replaceState(null, '', window.location.pathname);
        await supabase.auth.signOut();

        setUpdatePasswordMode(false);
        setCurrentMarketer(null);
        setNewPassword('');
        setConfirmNewPassword('');
        setAuthSuccess(
          '✅ Password updated successfully! Your account status is now PENDING and awaiting Admin re-approval.'
        );
      }
    } catch (err: any) {
      setAuthError(`❌ ${err.message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (signupPassword !== signupConfirmPassword) {
      setAuthError('❌ Passwords do not match.');
      return;
    }

    const { fullPhone } = formatCleanPhone(signupCountryCode, signupPhone);

    setAuthLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: { name: signupName, phone: fullPhone },
        },
      });

      if (authError) {
        setAuthError(`❌ ${authError.message}`);
        setAuthLoading(false);
        return;
      }

      if (authData.user) {
        const { error: dbError } = await supabase.from('marketers').insert([
          {
            id: authData.user.id,
            name: signupName,
            email: signupEmail,
            phone: fullPhone,
            status: 'pending',
          },
        ]);

        if (dbError) {
          setAuthError(`⚠️ Account created, but database record failed: ${dbError.message}`);
        } else {
          setAuthSuccess(
            '✅ Registration successful! Your account is now awaiting admin approval.'
          );
          setSignupName('');
          setSignupEmail('');
          setSignupPhone('');
          setSignupPassword('');
          setSignupConfirmPassword('');
        }
      }
    } catch (err: any) {
      setAuthError(`❌ ${err.message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentMarketer(null);
  };

  const resetForm = () => {
    setEditingLeadId(null);
    setClientName('');
    setClientPhone('');
    setCountryCode('+251');
    setClientSource('Facebook boost');
    setActionStatus('New');
    setSelectedUnits([]);
    setTotalPayment('');
    setInstallmentPlan('');
    setMemo('');
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLeadId(lead.id);
    setClientName(lead.name || '');

    let phoneNum = (lead.phone || '').trim();
    const matchedCountry = COUNTRY_CODES.find((c) => phoneNum.startsWith(c.code));

    if (matchedCountry) {
      setCountryCode(matchedCountry.code);
      phoneNum = phoneNum.slice(matchedCountry.code.length).trim().replace(/^0+/, '');
    } else {
      setCountryCode('+251');
      phoneNum = phoneNum.replace(/^\+251/, '').trim().replace(/^0+/, '');
    }
    setClientPhone(phoneNum);

    setClientSource(lead.source || 'Facebook boost');
    setActionStatus(normalizeStatus(lead.status));

    setTotalPayment(lead.total_payment ? lead.total_payment.toString() : '');
    setInstallmentPlan(lead.installment_plan || '');
    setMemo(lead.memo || '');

    if (lead.unit_key) {
      const keys = lead.unit_key.split(' | ');
      const restoredUnits: SelectedUnit[] = [];

      keys.forEach((k) => {
        const parts = k.split('___');
        if (parts.length === 2) {
          const floorName = parts[0];
          const unitTypeId = parts[1];
          const matchedUt = unitTypes.find((ut) => ut.id === unitTypeId);

          if (matchedUt) {
            restoredUnits.push({
              key: k,
              floorName,
              unitTypeId,
              label: `${formatFloorName(floorName)} [${matchedUt.title} (${matchedUt.area}m²)]`,
              details: matchedUt,
            });
          }
        }
      });
      setSelectedUnits(restoredUnits);
    } else {
      setSelectedUnits([]);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 🗑️ دالة حذف العميل
  const handleDeleteLead = async (leadId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this client/lead?');
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) {
        alert(`❌ Failed to delete lead! Database error: ${error.message}`);
        return;
      }

      setLeads((prev) => prev.filter((l) => l.id !== leadId));

      if (editingLeadId === leadId) {
        resetForm();
      }

      alert('✅ Client deleted successfully!');
    } catch (err: any) {
      alert(`❌ Unexpected Error: ${err.message}`);
    }
  };

  const handleCellClick = (floorName: string, unitType: UnitType, status: string) => {
    if (actionStatus === 'New') {
      alert('ℹ️ Action Status is set to "New". Unit selection is not required for New leads.');
      return;
    }

    const key = `${floorName}___${unitType.id}`;
    const formattedFloor = formatFloorName(floorName);
    const label = `${formattedFloor} [${unitType.title} (${unitType.area}m²)]`;
    const statusLower = (status || '').toLowerCase().trim();

    if (statusLower === 'available') {
      setSelectedUnits((prev) => {
        const exists = prev.some((u) => u.key === key);
        if (exists) {
          return prev.filter((u) => u.key !== key);
        } else {
          if (actionStatus === 'Qualified') {
            return [...prev, { key, floorName, unitTypeId: unitType.id, label, details: unitType }];
          } else {
            return [{ key, floorName, unitTypeId: unitType.id, label, details: unitType }];
          }
        }
      });
    } else if (statusLower === 'reserved') {
      alert(`🟡 Unit on ${formattedFloor} (${unitType.title}) is already RESERVED.`);
    } else {
      alert(`🔴 Unit on ${formattedFloor} (${unitType.title}) is marked as "${status.toUpperCase()}" and is NOT available.`);
    }
  };

  const handleSaveLeadWithAction = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = clientPhone.trim();

    if (!clientName || !cleanPhone) {
      alert('⚠️ Please fill in both client name and phone number.');
      return;
    }

    if (!selectedProjectId) {
      alert('⚠️ No active project selected.');
      return;
    }

    const targetStatus = normalizeStatus(actionStatus);

    if (targetStatus !== 'New' && selectedUnits.length === 0) {
      alert(
        `⚠️ To change status to "${targetStatus}", please select at least one available GREEN unit from the inventory table first!`
      );
      return;
    }

    const { fullPhone } = formatCleanPhone(countryCode, cleanPhone);

    const apartmentLabels = selectedUnits.map((u) => u.label).join(' | ');
    const unitKeys = selectedUnits.map((u) => u.key).join(' | ');

    const leadPayload: any = {
      name: clientName,
      phone: fullPhone,
      source: clientSource,
      apartment_id: apartmentLabels || null,
      unit_key: unitKeys || null,
      project_id: selectedProjectId,
      marketer_id: currentMarketer?.id,
      marketer_name: currentMarketer?.name,
      status: targetStatus,
      total_payment: targetStatus === 'Negotiation' && totalPayment ? parseFloat(totalPayment) : null,
      installment_plan: targetStatus === 'Negotiation' && installmentPlan ? installmentPlan : null,
      memo: targetStatus === 'Negotiation' && memo ? memo : null,
    };

    try {
      if (editingLeadId) {
        const { data: updatedData, error: updateError } = await supabase
          .from('leads')
          .update(leadPayload)
          .eq('id', editingLeadId)
          .select();

        if (updateError) {
          alert(`❌ Failed to update lead! Database error: ${updateError.message}`);
          return;
        }

        if (!updatedData || updatedData.length === 0) {
          alert('❌ Database update failed! Check Supabase RLS policies for UPDATE on the "leads" table.');
          return;
        }

        const savedLead = updatedData[0];
        setLeads((prev) => prev.map((l) => (l.id === editingLeadId ? savedLead : l)));

      } else {
        const { data: leadData, error: leadError } = await supabase
          .from('leads')
          .insert([leadPayload])
          .select();

        if (leadError) {
          alert(`❌ Failed to save lead! Database error: ${leadError.message}`);
          return;
        }

        if (leadData && leadData[0]) {
          setLeads((prev) => [leadData[0], ...prev]);
        }
      }

      if (selectedUnits.length > 0 && targetStatus !== 'New') {
        for (const unit of selectedUnits) {
          await supabase.from('srm_matrix_cells').upsert(
            {
              project_id: selectedProjectId,
              floor_name: unit.floorName,
              unit_type_id: unit.unitTypeId,
              status: 'reserved',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'project_id,floor_name,unit_type_id' }
          );
        }
        await fetchMatrixData(selectedProjectId);
      }

      alert(`✅ Lead successfully ${editingLeadId ? 'updated' : 'saved'} as "${targetStatus}"!`);
      setLeadTab(targetStatus);
      resetForm();
    } catch (err: any) {
      alert(`❌ Unexpected Error: ${err.message}`);
    }
  };

  const filteredLeads = leadTab === 'All'
    ? leads
    : leads.filter((l) => normalizeStatus(l.status) === leadTab);

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold text-slate-400">Loading application...</p>
        </div>
      </div>
    );
  }

  // SCREEN 1: LUXURY DARK AUTHENTICATION SCREEN
  if (!currentMarketer || isUpdatePassword) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4 sm:p-6 lg:p-8 font-sans" dir="ltr">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80">
          
          {/* Left Side: Visual Branding & Hero Panel */}
          <div className="relative hidden lg:flex lg:col-span-5 flex-col justify-between p-10 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1200&auto=format&fit=crop"
              alt="Luxury Architecture"
              className="absolute inset-0 h-full w-full object-cover scale-105 transition-transform duration-1000 hover:scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-teal-950/80 to-teal-900/40" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-teal-500/20 backdrop-blur-md border border-teal-400/30 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-6">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Premium Sales Portal
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-400/20">
                  H
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight leading-tight">
                    Marketer<span className="text-amber-400">Portal</span>
                  </h2>
                  <p className="text-xs text-teal-200/70 font-medium">Real Estate Intelligence</p>
                </div>
              </div>
            </div>

            <div className="relative z-10 bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Trusted Ecosystem</span>
              </div>
              <p className="text-slate-200 text-sm font-medium leading-relaxed">
                "Empowering real estate marketers with real-time analytics, inventory management, and seamless deal closing."
              </p>
            </div>
          </div>

          {/* Right Side: Dynamic Form Panel */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-slate-900">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                {isUpdatePassword
                  ? 'Set New Password'
                  : isForgotPassword
                  ? 'Reset Password'
                  : isSignUp
                  ? 'Create Marketer Account'
                  : 'Welcome Back'}
              </h1>
              <p className="text-slate-400 text-sm mt-2">
                {isUpdatePassword
                  ? 'Enter your new password. Changes require Admin re-approval.'
                  : isForgotPassword
                  ? 'Enter your email address to receive a password reset link.'
                  : isSignUp
                  ? 'Register now to join our exclusive marketer network'
                  : 'Enter your credentials to access your sales workspace'}
              </p>
            </div>

            {!isForgotPassword && !isUpdatePassword && (
              <div className="grid grid-cols-2 gap-1 p-1.5 bg-slate-950 rounded-2xl mb-8 border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setIsForgotPassword(false);
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
                    !isSignUp
                      ? 'bg-[#00474b] text-white shadow-lg shadow-teal-900/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setIsForgotPassword(false);
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
                    isSignUp
                      ? 'bg-[#00474b] text-white shadow-lg shadow-teal-900/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </button>
              </div>
            )}

            {authError && (
              <div className="bg-red-500/10 border-l-4 border-red-500 text-red-300 p-3.5 rounded-xl text-xs mb-6 font-medium">
                {authError}
              </div>
            )}

            {authSuccess && (
              <div className="bg-emerald-500/10 border-l-4 border-emerald-500 text-emerald-300 p-3.5 rounded-xl text-xs mb-6 font-medium">
                {authSuccess}
              </div>
            )}

            {isUpdatePassword ? (
              <form onSubmit={handleSetNewPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    New Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full mt-2 py-4 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-400/10 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{authLoading ? 'Updating...' : 'Update & Submit for Admin Approval'}</span>
                </button>
              </form>
            ) : isForgotPassword ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="marketer@company.com"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-4 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-400/10 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>{authLoading ? 'Sending link...' : 'Send Reset Link'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                  className="w-full text-center text-xs font-bold text-slate-400 hover:text-teal-400 pt-2 transition"
                >
                  ← Back to Sign In
                </button>
              </form>
            ) : !isSignUp ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="marketer@company.com"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                      className="text-xs text-teal-400 font-semibold hover:text-teal-300 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full mt-2 py-4 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-400/10 flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  <span>{authLoading ? 'Signing in...' : 'Sign In to Workspace'}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Phone Number *
                  </label>
                  <div className="flex gap-2">
                    <SearchableCountrySelect
                      value={signupCountryCode}
                      onChange={(code) => setSignupCountryCode(code)}
                      isDark={true}
                    />
                    <div className="relative flex-1">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="tel"
                        required
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        placeholder="9xxxxxxx"
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full mt-2 py-4 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-400/10 flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  <span>{authLoading ? 'Submitting Request...' : 'Submit Registration'}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    );
  }

  // SCREEN 2: MAIN DASHBOARD (CUSTOM DESIGN MATCHING IMAGE)
  return (
    <div className="p-3 sm:p-5 bg-[#eef2f5] min-h-screen text-left font-sans" dir="ltr">
      
      {/* 🟢 TOP HEADER BAR (Matching Exact Dark Teal Theme - NO Profile Pic) */}
      <div className="bg-[#00474b] text-white px-5 py-3 rounded-md shadow-sm mb-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Side: Brand Logo & User Welcome Text (NO PROFILE PIC) */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-400 rounded-sm flex items-center justify-center font-black text-[#00474b] text-xs">
              H
            </div>
            <span className="font-bold text-sm sm:text-base tracking-wide text-white">
              Marketer <span className="text-amber-400 font-normal">Portal</span>
            </span>
          </div>

          <div className="h-4 w-[1px] bg-teal-600/60 hidden sm:block" />

          {/* Welcome Text Without Profile Avatar */}
          <div className="text-xs">
            <span className="text-teal-100">Welcome Back, </span>
            <span className="font-semibold text-white">{currentMarketer.name}</span>
            <span className="text-teal-200/80 text-[11px]">({currentMarketer.email})</span>
          </div>
        </div>

        {/* Right Side: Project Dropdown & Logout Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end text-xs">
          {projects.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-teal-100 font-medium whitespace-nowrap">Project:</span>
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  setSelectedUnits([]);
                }}
                className="px-2 py-1 bg-[#00383b] border border-teal-600/80 font-bold text-amber-300 rounded text-xs outline-none focus:ring-1 focus:ring-amber-400"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="bg-transparent hover:bg-teal-900/80 text-teal-100 border border-teal-600/60 px-2.5 py-1 rounded text-xs font-medium transition"
          >
            Logout
          </button>
        </div>
      </div>

      {loadingProjects ? (
        <div className="bg-white p-12 rounded-lg shadow-sm text-center text-gray-500">
          <div className="w-8 h-8 border-4 border-[#00474b] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold">Loading projects from Database...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm text-center text-gray-500">
          <p className="text-base font-bold text-gray-700">No Projects Available</p>
          <p className="text-xs text-gray-500 mt-1">
            There are no projects added by Admin yet. Please check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* 📊 LEFT: AVAILABLE STOCKS TABLE (Matching Image Theme) */}
          <div className="lg:col-span-7 xl:col-span-8 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            
            {/* Title Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-amber-500 text-lg">🟡</span>
              <h2 className="text-sm font-black text-[#00474b] uppercase tracking-wider">
                AVAILABLE STOCKS
              </h2>
            </div>

            {loadingDetails ? (
              <div className="p-12 text-center text-gray-400">
                <div className="w-6 h-6 border-2 border-[#00474b] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs">Loading matrix data...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-center text-xs font-sans border border-gray-300">
                  <thead>
                    {/* Header Row 1 */}
                    <tr className="bg-[#00474b] text-white">
                      <th rowSpan={2} className="border border-teal-800 p-2 font-bold min-w-[80px]">
                        Floor
                      </th>
                      <th
                        colSpan={unitTypes.length || 1}
                        className="border border-teal-800 p-1.5 font-semibold text-xs"
                      >
                        Type of Houses & Price Plans
                      </th>
                      <th rowSpan={2} className="border border-teal-800 p-2 font-bold min-w-[70px]">
                        Remark
                      </th>
                    </tr>

                    {/* Header Row 2 */}
                    <tr className="bg-[#00474b] text-white">
                      {unitTypes.map((ut) => (
                        <th key={ut.id} className="border border-teal-800 p-2 font-semibold">
                          <div>{ut.title}</div>
                          <div className="font-medium text-[10px] text-teal-200">{ut.area} m²</div>
                          {ut.totalPrice && (
                            <div className="text-[10px] text-amber-300 font-bold mt-0.5">
                              ${ut.totalPrice.toLocaleString()}
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {floors.map((floorObj) => (
                      <tr key={floorObj.id} className="hover:bg-gray-50">
                        {/* Floor Name Column: White bg with bold dark text */}
                        <td className="border border-gray-300 bg-white text-gray-800 font-semibold p-2 text-left px-3 text-xs">
                          {floorObj.floor_name}
                        </td>

                        {unitTypes.map((ut) => {
                          const fName = (floorObj.floor_name || '').trim();
                          const utId = ut.id;
                          const utTitle = (ut.title || '').trim();

                          const rawStatus =
                            matrix[`${fName}___${utId}`] ||
                            matrix[`${fName}___${utTitle}`] ||
                            matrix[`${floorObj.floor_name}___${ut.id}`] ||
                            matrix[`${floorObj.floor_name}___${ut.title}`] ||
                            'unavailable';

                          const statusLower = (rawStatus || '').toLowerCase().trim();
                          const isSelected = selectedUnits.some((u) => u.key === `${fName}___${utId}`);

                          let bgClass = 'bg-[#d92525] text-white cursor-not-allowed';
                          let cellContent: React.ReactNode = null;

                          if (statusLower === 'available') {
                            bgClass = 'bg-[#00b050] hover:bg-emerald-600 cursor-pointer text-white';
                            if (isSelected) {
                              cellContent = (
                                <span className="text-[9px] bg-black text-amber-300 px-1 py-0.5 rounded font-black shadow">
                                  ✓ Selected
                                </span>
                              );
                            }
                          } else if (statusLower === 'reserved') {
                            bgClass = 'bg-[#f2b827] hover:bg-amber-500 cursor-pointer text-black font-semibold';
                            cellContent = <span className="text-[10px] uppercase">RESERVED</span>;
                          } else if (statusLower === 'shop' || statusLower === 'business') {
                            bgClass = 'bg-[#d92525] text-white font-bold cursor-not-allowed';
                            cellContent = <span className="text-[10px] uppercase">{rawStatus}</span>;
                          } else if (statusLower === 'unavailable' || !rawStatus) {
                            bgClass = 'bg-[#d92525] text-white cursor-not-allowed';
                            cellContent = null;
                          } else {
                            bgClass = 'bg-[#d92525] text-white font-extrabold text-[10px] uppercase cursor-not-allowed';
                            cellContent = rawStatus.toUpperCase();
                          }

                          return (
                            <td
                              key={ut.id}
                              onClick={() => handleCellClick(floorObj.floor_name, ut, rawStatus)}
                              className={`border border-gray-300 p-2.5 transition-all text-center ${bgClass} ${
                                isSelected ? 'ring-2 ring-blue-600' : ''
                              }`}
                              title={`Floor ${floorObj.floor_name} - ${ut.title} (${rawStatus.toUpperCase()})`}
                            >
                              {cellContent}
                            </td>
                          );
                        })}

                        <td className="border border-gray-300 bg-white text-gray-500 p-1 text-[11px]">-</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 📝 RIGHT: ACTION FORM & LEADS SECTION */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-5">
            
            {/* 1. Add Lead & Take Action Card */}
            <div className={`p-4 rounded-lg shadow-sm border ${editingLeadId ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-gray-200'}`}>
              
              {/* Card Header with Yellow Accent Line */}
              <div className="flex items-center justify-between mb-3 border-l-4 border-amber-400 pl-2.5">
                <h2 className="font-bold text-gray-800 text-xs sm:text-sm">
                  {editingLeadId ? '✏️ Edit Lead Record' : 'Add Lead & Take Action'}
                </h2>

                {editingLeadId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-[10px] bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-2 py-0.5 rounded"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveLeadWithAction} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Action / Status *
                  </label>
                  <select
                    value={actionStatus}
                    onChange={(e: any) => {
                      setActionStatus(normalizeStatus(e.target.value));
                      if (e.target.value === 'New') {
                        setSelectedUnits([]);
                      }
                    }}
                    className="w-full p-2 bg-white border border-gray-300 rounded text-xs font-semibold text-gray-800 focus:ring-1 focus:ring-[#00474b] outline-none cursor-pointer"
                  >
                    <option value="New">Now (Save Lead without Unit)</option>
                    <option value="Qualified">Qualified (Reserve Unit)</option>
                    <option value="Negotiation">Negotiation (Payment Terms)</option>
                    <option value="Closed">Closed (Completed Deal)</option>
                  </select>
                </div>

                {actionStatus !== 'New' && (
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">
                      Selected Units ({selectedUnits.length}) *
                    </label>
                    {selectedUnits.length === 0 ? (
                      <div className="p-2 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px] font-medium text-center">
                        ← Click any GREEN cell in table to select
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {selectedUnits.map((u, idx) => (
                          <div
                            key={idx}
                            className="bg-emerald-50 border border-emerald-300 rounded p-1.5 text-[11px] flex justify-between items-center"
                          >
                            <div>
                              <span className="font-bold text-emerald-900">{u.label}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedUnits((prev) => prev.filter((item) => item.key !== u.key))}
                              className="text-red-500 font-bold hover:text-red-700 text-[10px]"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-xs outline-none focus:ring-1 focus:ring-[#00474b]"
                    required
                  />
                </div>

                {/* Country Dropdown & Phone Input */}
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="flex gap-1.5">
                    <SearchableCountrySelect
                      value={countryCode}
                      onChange={(code) => setCountryCode(code)}
                      isDark={false}
                    />
                    <input
                      type="tel"
                      placeholder="9xxxxxxx / 5xxxxxxx"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded text-xs outline-none focus:ring-1 focus:ring-[#00474b]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Lead Source *
                  </label>
                  <select
                    value={clientSource}
                    onChange={(e) => setClientSource(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-xs bg-white outline-none focus:ring-1 focus:ring-[#00474b]"
                    required
                  >
                    <option value="Facebook boost">Facebook boost</option>
                    <option value="telegram">telegram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Instagram">Instagram</option>
                    <option value="survey">survey</option>
                    <option value="called call">called call</option>
                    <option value="purchased leads">purchased leads</option>
                    <option value="walk in">walk in</option>
                    <option value="company lead">company lead</option>
                    <option value="linkedin">linkedin</option>
                    <option value="company boost">company boost</option>
                  </select>
                </div>

                {actionStatus === 'Negotiation' && (
                  <div className="bg-teal-50/60 p-3 border border-teal-200 rounded space-y-2">
                    <h3 className="font-bold text-[#00474b] text-[11px] border-b border-teal-200 pb-1">
                      📝 Negotiation Details
                    </h3>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
                        Total Payment ($)
                      </label>
                      <input
                        type="number"
                        placeholder="Agreed Total Payment"
                        value={totalPayment}
                        onChange={(e) => setTotalPayment(e.target.value)}
                        className="w-full p-1.5 border border-gray-300 rounded text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
                        Installment Plan
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 20% down, 3 years"
                        value={installmentPlan}
                        onChange={(e) => setInstallmentPlan(e.target.value)}
                        className="w-full p-1.5 border border-gray-300 rounded text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
                        Memo / Notes
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Write extra details..."
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        className="w-full p-1.5 border border-gray-300 rounded text-xs outline-none resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button in Dark Teal Header Color */}
                <button
                  type="submit"
                  className="w-full font-bold py-2.5 rounded text-xs text-white transition bg-[#00474b] hover:bg-[#00383b] shadow-sm mt-2"
                >
                  {editingLeadId ? `Update Lead Record` : `Save Lead as "${actionStatus}"`}
                </button>
              </form>
            </div>

            {/* 2. Your Recorded Leads Card with Tabs */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h2 className="font-bold text-gray-800 mb-2.5 text-xs sm:text-sm">
                Your Recorded Leads ({leads.length})
              </h2>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-3 overflow-x-auto gap-2 text-[11px]">
                {(['All', 'New', 'Qualified', 'Negotiation', 'Closed'] as const).map((tab) => {
                  const count = tab === 'All'
                    ? leads.length
                    : leads.filter((l) => normalizeStatus(l.status) === tab).length;

                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setLeadTab(tab)}
                      className={`pb-1.5 font-semibold whitespace-nowrap border-b-2 transition-all ${
                        leadTab === tab
                          ? 'border-[#00474b] text-[#00474b]'
                          : 'border-transparent text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      {tab} ({count})
                    </button>
                  );
                })}
              </div>

              {filteredLeads.length === 0 ? (
                <p className="text-gray-400 text-xs py-3 text-center">No leads found in "{leadTab}".</p>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {filteredLeads.map((lead) => {
                    const matchedProj = projects.find((p) => p.id === lead.project_id) || selectedProject;
                    const normalizedLeadStatus = normalizeStatus(lead.status);
                    const rawDigits = (lead.phone || '').replace(/[^0-9]/g, '');

                    return (
                      <div
                        key={lead.id}
                        className={`p-3 border rounded-md flex flex-col gap-1 text-xs transition ${
                          editingLeadId === lead.id
                            ? 'bg-amber-50 border-amber-400'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-gray-900">{lead.name}</p>
                            
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-gray-600 text-[11px]">{lead.phone}</span>
                              {rawDigits && (
                                <div className="flex items-center gap-1">
                                  <a
                                    href={`tel:+${rawDigits}`}
                                    className="text-[10px] text-gray-500 hover:text-black"
                                    title="Call Phone"
                                  >
                                    📞
                                  </a>
                                  <a
                                    href={`https://wa.me/${rawDigits}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] text-emerald-600 hover:text-emerald-800"
                                    title="WhatsApp"
                                  >
                                    💬
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Status Badge */}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap ${
                              normalizedLeadStatus === 'New'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : normalizedLeadStatus === 'Qualified'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : normalizedLeadStatus === 'Negotiation'
                                ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            }`}
                          >
                            {normalizedLeadStatus}
                          </span>
                        </div>

                        {matchedProj && (
                          <p className="text-[10px] text-gray-500">
                            Project: <span className="font-medium text-gray-700">{matchedProj.name}</span>
                          </p>
                        )}

                        {lead.source && (
                          <p className="text-[10px] text-gray-500">
                            Source: <span className="font-medium text-gray-700">{lead.source}</span>
                          </p>
                        )}

                        {lead.apartment_id && (
                          <p className="text-[10px] text-amber-800 font-semibold">
                            Units: {lead.apartment_id}
                          </p>
                        )}

                        {/* Action Buttons Matching Image (Pink/Red Delete, Soft Yellow Edit) */}
                        <div className="mt-1 pt-1.5 border-t border-gray-100 flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDeleteLead(lead.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[10px] font-medium px-2 py-0.5 rounded transition"
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditLead(lead)}
                            className="bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 text-[10px] font-medium px-2 py-0.5 rounded transition"
                          >
                            Edit Lead / Change Status
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MarketerDashboard;