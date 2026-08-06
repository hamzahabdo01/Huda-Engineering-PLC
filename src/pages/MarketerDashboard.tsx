import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../integrations/supabase/client';

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

// قائمة مفاتيح الدول الشهيرة
const COUNTRY_CODES = [
  { code: '+251', label: '🇪🇹 Ethiopia (+251)' },
  { code: '+966', label: '🇸🇦 Saudi Arabia (+966)' },
  { code: '+971', label: '🇦🇪 UAE (+971)' },
  { code: '+965', label: '🇰🇼 Kuwait (+965)' },
  { code: '+974', label: '🇶🇦 Qatar (+974)' },
  { code: '+20', label: '🇪🇬 Egypt (+20)' },
  { code: '+1', label: '🇺🇸 USA/Canada (+1)' },
  { code: '+44', label: '🇬🇧 UK (+44)' },
];

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

  // Auth Inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
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

  // Dynamic Selection States (Multiple Units Support)
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

  // 🛠️ دالة لتنسيق اسم الطابق وتفادي تكرار كلمة Floor
  const formatFloorName = (name: string) => {
    const clean = (name || '').trim();
    if (!clean) return '';
    return clean.toLowerCase().endsWith('floor') ? clean : `${clean} Floor`;
  };

  // 1️⃣ Check Active Session & Handle Recovery
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
  }, []);

  // 2️⃣ Fetch Project Details & Listen for Realtime Cell Changes
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
  }, [selectedProjectId]);

  const fetchProjects = async () => {
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
  };

  const fetchProjectDetails = async (projectId: string) => {
    setLoadingDetails(true);
    await Promise.all([
      fetchFloors(projectId),
      fetchUnitTypes(projectId),
      fetchMatrixData(projectId),
    ]);
    setLoadingDetails(false);
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
  };

  const fetchMatrixData = async (projectId: string) => {
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
  };

  const fetchMarketerProfile = async (userId: string) => {
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
  };

  const fetchLeadsForMarketer = async (marketerId: string, marketerName: string) => {
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
  };

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

    setAuthLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: { name: signupName, phone: signupPhone },
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
            phone: signupPhone,
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

  // 🟢 تفريغ جميع حقول النموذج
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

  // ✏️ إرجاع بيانات الـ Lead للحقول للتعديل
  const handleEditLead = (lead: Lead) => {
    setEditingLeadId(lead.id);
    setClientName(lead.name || '');

    // استخراج مفتاح الدولة ورقم الهاتف
    let phoneNum = lead.phone || '';
    const matchedCountry = COUNTRY_CODES.find((c) => phoneNum.startsWith(c.code));
    if (matchedCountry) {
      setCountryCode(matchedCountry.code);
      phoneNum = phoneNum.replace(matchedCountry.code, '').trim();
    } else {
      setCountryCode('+251');
    }
    setClientPhone(phoneNum);

    setClientSource(lead.source || 'Facebook boost');
    setActionStatus((lead.status as any) || 'New');
    setTotalPayment(lead.total_payment ? lead.total_payment.toString() : '');
    setInstallmentPlan(lead.installment_plan || '');
    setMemo(lead.memo || '');

    // استرجاع الوحدات المحجوزة للـ Lead إذا وجدت
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

    // التمرير السلس لأعلى الصفحة نحو النموذج
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 🟢 النقر على الخلية مع دعم اختيار وحدات متعددة وإصلاح تكرار Floor
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

  // 🟢 معالجة الحفظ والتحديث مع دمج مفتاح الدولة
  const handleSaveLeadWithAction = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = clientPhone.trim();

    if (!clientName || !cleanPhone) {
      alert('Please fill in both client name and phone number.');
      return;
    }

    if (!selectedProjectId) {
      alert('No active project selected.');
      return;
    }

    if (actionStatus !== 'New' && selectedUnits.length === 0) {
      alert(`Please select at least one available GREEN unit for status "${actionStatus}".`);
      return;
    }

    const fullPhoneNumber = `${countryCode} ${cleanPhone}`;
    const apartmentLabels = selectedUnits.map((u) => u.label).join(' | ');
    const unitKeys = selectedUnits.map((u) => u.key).join(' | ');

    const leadPayload: any = {
      name: clientName,
      phone: fullPhoneNumber,
      source: clientSource,
      apartment_id: apartmentLabels || null,
      unit_key: unitKeys || null,
      project_id: selectedProjectId,
      marketer_id: currentMarketer?.id,
      marketer_name: currentMarketer?.name,
      status: actionStatus,
      total_payment: actionStatus === 'Negotiation' && totalPayment ? parseFloat(totalPayment) : null,
      installment_plan: actionStatus === 'Negotiation' && installmentPlan ? installmentPlan : null,
      memo: actionStatus === 'Negotiation' && memo ? memo : null,
    };

    if (editingLeadId) {
      // 🔄 1️⃣ وضع التحديث (EDIT MODE)
      const { data: updatedData, error: updateError } = await supabase
        .from('leads')
        .update(leadPayload)
        .eq('id', editingLeadId)
        .select();

      if (updateError) {
        alert(`❌ Failed to update lead! Database error: ${updateError.message}`);
        return;
      }

      if (updatedData && updatedData[0]) {
        setLeads((prev) => prev.map((l) => (l.id === editingLeadId ? updatedData[0] : l)));
      }
    } else {
      // ➕ 2️⃣ وضع الإضافة (NEW LEAD MODE)
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

    // 3️⃣ تحويل حالة الوحدات في الماتريكس إلى reserved إذا تم اختيار وحدات
    if (selectedUnits.length > 0 && actionStatus !== 'New') {
      for (const unit of selectedUnits) {
        const { error: matrixError } = await supabase.from('srm_matrix_cells').upsert(
          {
            project_id: selectedProjectId,
            floor_name: unit.floorName,
            unit_type_id: unit.unitTypeId,
            status: 'reserved',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'project_id,floor_name,unit_type_id' }
        );

        if (matrixError) {
          console.error(`⚠️ Failed to update cell ${unit.label}:`, matrixError.message);
        }
      }
      await fetchMatrixData(selectedProjectId);
    }

    alert(`✅ Lead successfully ${editingLeadId ? 'updated' : 'saved'} as "${actionStatus}"!`);
    resetForm();
  };

  // تصفية العملاء حسب التبويب المحدد
  const filteredLeads = leadTab === 'All'
    ? leads
    : leads.filter((l) => (l.status || '').toLowerCase() === leadTab.toLowerCase());

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs">Loading application...</p>
        </div>
      </div>
    );
  }

  // SCREEN 1: AUTHENTICATION FORMS
  if (!currentMarketer || isUpdatePassword) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4" dir="ltr">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl mx-auto mb-3 shadow-lg shadow-blue-500/30">
              🏢
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {isUpdatePassword
                ? 'Set New Password'
                : isForgotPassword
                ? 'Reset Password'
                : isSignUp
                ? 'Create Marketer Account'
                : 'Marketer Portal - Login'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {isUpdatePassword
                ? 'Enter your new password. Changes require Admin re-approval.'
                : isForgotPassword
                ? 'Enter your email address to receive a password reset link'
                : isSignUp
                ? 'Enter your details to submit an account request for admin review'
                : 'Enter your credentials to access the sales portal'}
            </p>
          </div>

          {!isForgotPassword && !isUpdatePassword && (
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setIsForgotPassword(false);
                  setAuthError('');
                  setAuthSuccess('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  !isSignUp ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
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
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  isSignUp ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {authError && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-lg text-xs mb-4">
              {authError}
            </div>
          )}

          {authSuccess && (
            <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 p-3 rounded-lg text-xs mb-4">
              {authSuccess}
            </div>
          )}

          {isUpdatePassword ? (
            <form onSubmit={handleSetNewPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl text-sm transition shadow-lg shadow-emerald-600/30 disabled:opacity-50"
              >
                {authLoading ? 'Updating...' : '🔒 Update & Submit for Admin Approval'}
              </button>
            </form>
          ) : isForgotPassword ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="marketer@company.com"
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-extrabold py-3.5 rounded-xl text-sm transition shadow-lg shadow-amber-500/30 disabled:opacity-50"
              >
                {authLoading ? 'Sending link...' : '📩 Send Reset Link'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setAuthError('');
                  setAuthSuccess('');
                }}
                className="w-full text-center text-xs font-bold text-gray-600 hover:text-blue-600 pt-2 transition"
              >
                ← Back to Sign In
              </button>
            </form>
          ) : !isSignUp ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="marketer@company.com"
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-gray-700">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setAuthError('');
                      setAuthSuccess('');
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition shadow-lg shadow-blue-600/30 disabled:opacity-50"
              >
                {authLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  required
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm transition shadow-lg shadow-emerald-600/30 mt-2 disabled:opacity-50"
              >
                {authLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // SCREEN 2: MAIN DASHBOARD
  return (
    <div className="p-4 bg-gray-100 min-h-screen text-left" dir="ltr">
      {/* Header Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">🏢 Marketer Portal - Real Estate Inventory</h1>
          <p className="text-xs text-gray-500">
            Welcome back, <span className="font-bold text-blue-600">{currentMarketer.name}</span> (
            {currentMarketer.email})
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {projects.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-700 whitespace-nowrap">Project:</label>
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  setSelectedUnits([]);
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
          )}

          <button
            onClick={handleLogout}
            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-2 rounded-lg text-xs font-bold transition"
          >
            Logout
          </button>
        </div>
      </div>

      {loadingProjects ? (
        <div className="bg-white p-12 rounded-xl shadow-md text-center text-gray-500">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-semibold">Loading projects from Database...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-md text-center text-gray-500">
          <p className="text-lg font-bold text-gray-700">No Projects Available</p>
          <p className="text-xs text-gray-500 mt-1">
            There are no projects added by Admin yet. Please check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AVAILABLE STOCKS GRID */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="bg-[#f2b827] text-black text-lg sm:text-xl font-extrabold uppercase px-8 py-2 rounded-md shadow-sm tracking-wide border border-amber-500">
                AVAILABLE STOCKS
              </div>
              {selectedProject?.subtitle && (
                <div className="bg-[#00474b] text-white text-xs sm:text-sm font-semibold uppercase px-6 py-1.5 rounded-md mt-2 shadow-sm">
                  {selectedProject.subtitle}
                </div>
              )}
            </div>

            {loadingDetails ? (
              <div className="p-12 text-center text-gray-400">
                <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs">Loading matrix data...</p>
              </div>
            ) : (
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
                        Type of Houses & Price Plans
                      </th>
                      <th rowSpan={2} className="border border-gray-400 p-2 font-bold min-w-[80px]">
                        Remark
                      </th>
                    </tr>

                    <tr className="bg-[#00474b] text-white">
                      {unitTypes.map((ut) => (
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
                    {floors.map((floorObj) => (
                      <tr key={floorObj.id}>
                        <td className="border border-black bg-[#f2b827] text-black font-bold p-2 text-xs">
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

                          let bgClass = 'bg-[#ff0000] text-white cursor-not-allowed';
                          let cellContent: React.ReactNode = null;

                          if (statusLower === 'available') {
                            bgClass = 'bg-[#00b050] hover:bg-green-600 cursor-pointer text-white';
                            if (isSelected) {
                              cellContent = (
                                <span className="text-[10px] bg-black text-amber-300 px-1 py-0.5 rounded font-extrabold shadow">
                                  ✓ Selected
                                </span>
                              );
                            }
                          } else if (statusLower === 'reserved') {
                            bgClass = 'bg-[#f2b827] hover:bg-amber-500 cursor-pointer text-black';
                            cellContent = <span className="font-bold text-[10px] uppercase">RESERVED</span>;
                          } else if (statusLower === 'unavailable' || !rawStatus) {
                            bgClass = 'bg-[#ff0000] text-white cursor-not-allowed';
                            cellContent = null;
                          } else {
                            bgClass = 'bg-[#ff0000] text-white font-extrabold text-[11px] uppercase tracking-wider cursor-not-allowed';
                            cellContent = rawStatus.toUpperCase();
                          }

                          return (
                            <td
                              key={ut.id}
                              onClick={() => handleCellClick(floorObj.floor_name, ut, rawStatus)}
                              className={`border border-black p-3 font-bold transition-all ${bgClass} ${
                                isSelected ? 'ring-4 ring-blue-600 scale-95' : ''
                              }`}
                              title={`Floor ${floorObj.floor_name} - ${ut.title} (${rawStatus.toUpperCase()})`}
                            >
                              {cellContent}
                            </td>
                          );
                        })}

                        <td className="border border-black bg-white text-gray-800 p-1 text-[11px]">-</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-center mt-6">
              <div className="border-2 border-black rounded-3xl py-2 px-8 text-center text-xs font-bold text-black bg-white shadow-sm flex flex-wrap justify-center gap-4">
                <span>NB:-</span>
                <span className="text-red-600 font-extrabold">RED = NOT Available</span>
                <span className="text-emerald-600 font-extrabold">GREEN = Available</span>
                <span className="text-amber-500 font-extrabold">YELLOW = Reserved</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC ACTION FORM COLUMN & TABS */}
          <div className="lg:col-span-1 space-y-6">
            <div className={`p-5 rounded-xl shadow-sm border transition-all ${editingLeadId ? 'bg-amber-50/60 border-amber-300' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-800 text-md flex items-center gap-2">
                  <span>{editingLeadId ? '✏️ Edit Lead Record' : '📌 Add Lead & Take Action'}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 font-extrabold px-2.5 py-0.5 rounded-full">
                    {actionStatus}
                  </span>
                </h2>

                {editingLeadId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-2 py-1 rounded transition"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveLeadWithAction} className="space-y-4">
                {/* 🔵 ACTION BUTTON DROPDOWN MENU */}
                <div>
                  <label className="block text-xs font-bold text-blue-900 mb-1">
                    Action / Status *
                  </label>
                  <select
                    value={actionStatus}
                    onChange={(e: any) => {
                      setActionStatus(e.target.value);
                      if (e.target.value === 'New') {
                        setSelectedUnits([]);
                      }
                    }}
                    className="w-full p-2.5 bg-blue-50 border-2 border-blue-500 rounded-lg text-xs font-bold text-blue-900 focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
                  >
                    <option value="New">🟢 New (Save Lead without Unit)</option>
                    <option value="Qualified">🟡 Qualified (Reserve Units - Single/Multiple)</option>
                    <option value="Negotiation">🔵 Negotiation (Extra Fields: Payment/Plan/Memo)</option>
                    <option value="Closed">🔴 Closed (Completed Deal)</option>
                  </select>
                </div>

                {/* SHOW SELECTED UNITS SUMMARY IF NOT "NEW" */}
                {actionStatus !== 'New' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Selected Units ({selectedUnits.length}) *
                    </label>
                    {selectedUnits.length === 0 ? (
                      <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs font-semibold text-center">
                        ← Click any GREEN cell in table to select units
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {selectedUnits.map((u, idx) => (
                          <div
                            key={idx}
                            className="bg-emerald-50 border border-emerald-300 rounded-lg p-2 text-xs flex justify-between items-center"
                          >
                            <div>
                              <span className="font-bold text-emerald-900">{u.label}</span>
                              {u.details.totalPrice && (
                                <span className="block text-[10px] text-emerald-700">
                                  Price: ${u.details.totalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedUnits((prev) => prev.filter((item) => item.key !== u.key))}
                              className="text-red-500 font-bold hover:text-red-700 text-xs"
                            >
                              ✕ Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

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

                {/* 📞 COUNTRY CODE + PHONE INPUT */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="p-2.5 border border-gray-300 rounded-lg text-xs bg-gray-50 font-medium text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>

                    <input
                      type="tel"
                      placeholder="9xxxxxxx / 5xxxxxxx"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="flex-1 p-2.5 border rounded-lg text-xs border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Lead Source *
                  </label>
                  <select
                    value={clientSource}
                    onChange={(e) => setClientSource(e.target.value)}
                    className="w-full p-2.5 border rounded-lg text-xs border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium text-gray-800"
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

                {/* 🔵 EXTRA FIELDS SPECIFICALLY FOR "NEGOTIATION" STATUS */}
                {actionStatus === 'Negotiation' && (
                  <div className="bg-blue-50/70 p-3.5 border border-blue-200 rounded-xl space-y-3">
                    <h3 className="font-extrabold text-blue-900 text-xs border-b border-blue-200 pb-1">
                      📝 Negotiation Details
                    </h3>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Total Payment ($)
                      </label>
                      <input
                        type="number"
                        placeholder="Agreed Total Payment"
                        value={totalPayment}
                        onChange={(e) => setTotalPayment(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Installment Plan
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 20% down, balance over 3 years"
                        value={installmentPlan}
                        onChange={(e) => setInstallmentPlan(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Memo / Notes
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Write extra details or custom negotiation terms..."
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className={`w-full font-extrabold py-3 rounded-lg text-xs transition shadow-md text-white ${
                    editingLeadId
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : actionStatus === 'New'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : actionStatus === 'Qualified'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : actionStatus === 'Negotiation'
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {editingLeadId ? `Update Lead Record` : `Save Lead as "${actionStatus}"`}
                </button>
              </form>
            </div>

            {/* LEADS LIST DISPLAY WITH TABS */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <h2 className="font-bold text-gray-800 mb-3 text-md">
                Your Recorded Leads ({leads.length})
              </h2>

              {/* 📑 TAB NAVIGATION */}
              <div className="flex border-b border-gray-200 mb-4 overflow-x-auto gap-1">
                {(['All', 'New', 'Qualified', 'Negotiation', 'Closed'] as const).map((tab) => {
                  const count = tab === 'All'
                    ? leads.length
                    : leads.filter((l) => (l.status || '').toLowerCase() === tab.toLowerCase()).length;

                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setLeadTab(tab)}
                      className={`py-1.5 px-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                        leadTab === tab
                          ? 'border-blue-600 text-blue-600 bg-blue-50/60 rounded-t-lg'
                          : 'border-transparent text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      {tab} ({count})
                    </button>
                  );
                })}
              </div>

              {filteredLeads.length === 0 ? (
                <p className="text-gray-400 text-xs py-4 text-center">No leads found in "{leadTab}".</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {filteredLeads.map((lead) => {
                    const matchedProj = projects.find((p) => p.id === lead.project_id) || selectedProject;

                    return (
                      <div
                        key={lead.id}
                        className={`p-3 border rounded-lg flex flex-col gap-1.5 text-xs transition ${
                          editingLeadId === lead.id
                            ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400'
                            : 'bg-gray-50/80 border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-gray-800">{lead.name}</p>
                            <p className="text-gray-500 font-mono text-[11px]">{lead.phone}</p>
                          </div>
                          
                          {/* 🟢 DYNAMIC STATUS BADGE */}
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
                              lead.status === 'New'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : lead.status === 'Qualified'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : lead.status === 'Negotiation'
                                ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                                : lead.status === 'Closed'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            {lead.status}
                          </span>
                        </div>

                        {/* 🏗️ DISPLAY PROJECT NAME */}
                        {matchedProj && (
                          <span className="inline-block bg-blue-50 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200 w-fit">
                            🏗️ Project: {matchedProj.name}
                          </span>
                        )}

                        {lead.source && (
                          <span className="inline-block bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded w-fit">
                            📍 Source: {lead.source}
                          </span>
                        )}

                        {lead.apartment_id && (
                          <p className="text-[11px] text-amber-800 font-semibold">
                            🏢 Units: {lead.apartment_id}
                          </p>
                        )}

                        {lead.status === 'Negotiation' && (
                          <div className="mt-1 p-2 bg-white rounded border border-gray-200 text-[11px] space-y-0.5">
                            {lead.total_payment && (
                              <p>
                                <strong>Total Payment:</strong> ${lead.total_payment.toLocaleString()}
                              </p>
                            )}
                            {lead.installment_plan && (
                              <p>
                                <strong>Plan:</strong> {lead.installment_plan}
                              </p>
                            )}
                            {lead.memo && (
                              <p className="text-gray-600 italic">
                                <strong>Memo:</strong> "{lead.memo}"
                              </p>
                            )}
                          </div>
                        )}

                        {/* ✏️ BUTTON TO TRIGGER EDIT */}
                        <div className="mt-1 pt-2 border-t border-gray-200 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleEditLead(lead)}
                            className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-[11px] font-bold px-2.5 py-1 rounded transition flex items-center gap-1 shadow-sm"
                          >
                            ✏️ Edit Lead / Change Status
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