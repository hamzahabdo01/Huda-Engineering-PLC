import React, { useState, useEffect } from 'react';
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

export type UnitStatus = 'available' | 'unavailable' | 'reserved';

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
  created_at?: string;
}

export interface MarketerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status?: string;
  approved?: boolean;
}

export function MarketerDashboard() {
  // --- Auth & User State ---
  const [currentMarketer, setCurrentMarketer] = useState<MarketerProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isUpdatePassword, setIsUpdatePassword] = useState(false); // 👈 واجهة إدخال كلمة المرور الجديدة
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
  const [matrix, setMatrix] = useState<Record<string, UnitStatus>>({});

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Selection States
  const [selectedUnitKey, setSelectedUnitKey] = useState<string>('');
  const [selectedFloorName, setSelectedFloorName] = useState<string>('');
  const [selectedUnitTypeId, setSelectedUnitTypeId] = useState<string>('');
  const [selectedUnitLabel, setSelectedUnitLabel] = useState<string>('');
  const [selectedUnitDetails, setSelectedUnitDetails] = useState<UnitType | null>(null);

  // Leads State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientSource, setClientSource] = useState('Facebook boost');

  // 1️⃣ Check Active Session & Listen to Auth Change (Including Password Recovery Protection)
  useEffect(() => {
    // 👈 التحقق مما إذا كان الرابط القادم من الإيميل يحتوي على توكن الاستعادة
    const isRecoveryUrl = window.location.hash.includes('type=recovery') || 
                          window.location.href.includes('type=recovery');

    if (isRecoveryUrl) {
      setIsUpdatePassword(true);
      setIsForgotPassword(false);
      setIsSignUp(false);
      setLoadingUser(false);
    } else {
      checkCurrentUser();
    }

    fetchProjects();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsUpdatePassword(true);
        setIsForgotPassword(false);
        setIsSignUp(false);
        setLoadingUser(false);
      } else if (session?.user && !isUpdatePassword && !isRecoveryUrl) {
        fetchMarketerProfile(session.user.id);
      } else if (!session) {
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

  const checkCurrentUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && !isUpdatePassword) {
        await fetchMarketerProfile(session.user.id);
      } else {
        setCurrentMarketer(null);
      }
    } catch (err) {
      console.error('Auth check error:', err);
    } finally {
      setLoadingUser(false);
    }
  };

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
      const matrixMap: Record<string, UnitStatus> = {};
      data.forEach((item: any) => {
        const key = `${item.floor_name}___${item.unit_type_id}`;
        matrixMap[key] = item.status as UnitStatus;
      });
      setMatrix(matrixMap);
    }
  };

  const fetchMarketerProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('marketers')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const isApproved = data.status === 'approved' || data.approved === true;

        // 👈 حماية: عدم عمل signOut إذا كنا في وضع استعادة كلمة المرور
        if (!isApproved && !isUpdatePassword) {
          setAuthError('⏳ Your account is pending admin approval. Access is restricted.');
          setCurrentMarketer(null);
          await supabase.auth.signOut();
        } else if (isApproved) {
          setCurrentMarketer(data);
          fetchLeadsForMarketer(data.id, data.name);
        }
      } else {
        if (!isUpdatePassword) {
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

  // 👈 إرسال رابط استعادة كلمة المرور
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
    // ❌ القديم (كان يجبر التحويل لـ /marketer-dashboard):
    // const redirectUrl = `${window.location.origin}/marketer-dashboard`; 

    // ✅ الجديد (يحافظ على اسم الصفحة الحالية التي يتواجد فيها المستخدم ديناميكياً):
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
  // 👈 حفظ كلمة المرور الجديدة وتحويل الحساب لانتظار موافقة الأدمن
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
      // 1️⃣ تحديث كلمة المرور في Supabase Auth
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setAuthError(`❌ ${error.message}`);
        setAuthLoading(false);
        return;
      }

      if (data.user) {
        // 2️⃣ تغيير حالة المسوق إلى pending لإجبار الأدمن على الموافقة من جديد
        const { error: dbError } = await supabase
          .from('marketers')
          .update({ status: 'pending', approved: false })
          .eq('id', data.user.id);

        if (dbError) {
          console.error('Error updating status:', dbError);
        }

        // 3️⃣ تسجيل الخروج وإظهار التنبيه
        await supabase.auth.signOut();
        setIsUpdatePassword(false);
        setNewPassword('');
        setConfirmNewPassword('');
        setAuthSuccess('✅ Password updated successfully! Your account is now awaiting Admin re-approval before you can login.');
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
          console.error('Error inserting marketer:', dbError);
          setAuthError(`⚠️ Account created, but database record failed: ${dbError.message}`);
        } else {
          setAuthSuccess('✅ Registration successful! Your account is now awaiting admin approval.');
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

  const handleCellClick = (floorName: string, unitType: UnitType, status: UnitStatus) => {
    const key = `${floorName}___${unitType.id}`;
    const label = `${floorName} Floor [${unitType.title} (${unitType.area}m²)]`;

    if (status === 'available') {
      setSelectedUnitKey(key);
      setSelectedFloorName(floorName);
      setSelectedUnitTypeId(unitType.id);
      setSelectedUnitLabel(label);
      setSelectedUnitDetails(unitType);
    } else if (status === 'reserved') {
      alert(`🟡 Unit on ${floorName} floor (${unitType.title}) is already RESERVED.`);
    } else {
      alert(`🔴 Unit on ${floorName} floor (${unitType.title}) is NOT available.`);
    }
  };

  // Reserve Unit & Save Lead
  const handleReserveAndSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = clientPhone.trim();

    if (!selectedUnitKey || !selectedFloorName || !selectedUnitTypeId) {
      alert('Please click on an available GREEN unit in the matrix first.');
      return;
    }

    if (!clientName || !cleanPhone) {
      alert('Please fill in both client name and phone number.');
      return;
    }

    if (!selectedProjectId) {
      alert('No active project selected.');
      return;
    }

    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .insert([
        {
          name: clientName,
          phone: cleanPhone,
          source: clientSource,
          apartment_id: selectedUnitLabel,
          unit_key: selectedUnitKey,
          project_id: selectedProjectId,
          marketer_id: currentMarketer?.id,
          marketer_name: currentMarketer?.name,
          status: 'Reserved',
        },
      ])
      .select();

    if (leadError) {
      console.error('Error saving lead:', leadError);
      alert(`❌ Failed to save lead! Database error: ${leadError.message}`);
      return;
    }

    const { error: matrixError } = await supabase.from('srm_matrix_cells').upsert(
      {
        project_id: selectedProjectId,
        floor_name: selectedFloorName,
        unit_type_id: selectedUnitTypeId,
        status: 'reserved',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'project_id,floor_name,unit_type_id' }
    );

    if (matrixError) {
      console.error('Error updating unit cell status:', matrixError);
      alert(`⚠️ Lead saved, but unit status update failed: ${matrixError.message}`);
    } else {
      await fetchMatrixData(selectedProjectId);
    }

    if (leadData && leadData[0]) {
      setLeads((prev) => [leadData[0], ...prev]);
    }

    setClientName('');
    setClientPhone('');
    setClientSource('Facebook boost');
    setSelectedUnitKey('');
    setSelectedFloorName('');
    setSelectedUnitTypeId('');
    setSelectedUnitLabel('');
    setSelectedUnitDetails(null);

    alert('✅ Unit reserved and lead saved successfully!');
  };

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

  // SCREEN 1: LOGIN / SIGN UP / FORGOT PASSWORD / NEW PASSWORD FORM
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

          {/* 🔑 1️⃣ UPDATE PASSWORD FORM (عند فتح الرابط من الإيميل) */}
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
            /* 2️⃣ FORGOT PASSWORD FORM */
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
            /* 3️⃣ LOGIN FORM */
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
            /* 4️⃣ REGISTER FORM */
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
            Welcome back, <span className="font-bold text-blue-600">{currentMarketer.name}</span> ({currentMarketer.email})
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
                  setSelectedUnitKey('');
                  setSelectedFloorName('');
                  setSelectedUnitTypeId('');
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
                          const key = `${floorObj.floor_name}___${ut.id}`;
                          const status = matrix[key] || 'unavailable';
                          const isSelected = selectedUnitKey === key;

                          let bgClass = 'bg-[#ff0000] cursor-not-allowed';
                          if (status === 'available') {
                            bgClass = 'bg-[#00b050] hover:bg-green-600 cursor-pointer';
                          } else if (status === 'reserved') {
                            bgClass = 'bg-[#f2b827] hover:bg-amber-500 cursor-pointer';
                          }

                          return (
                            <td
                              key={ut.id}
                              onClick={() => handleCellClick(floorObj.floor_name, ut, status)}
                              className={`border border-black p-3 font-bold transition-all ${bgClass} ${
                                isSelected ? 'ring-4 ring-blue-600 scale-95' : ''
                              }`}
                              title={`Floor ${floorObj.floor_name} - ${ut.title} (${status.toUpperCase()})`}
                            >
                              {isSelected && (
                                <span className="text-[10px] bg-black text-white px-1 py-0.5 rounded">
                                  Selected
                                </span>
                              )}
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

          {/* Direct Unit Reservation Form */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <h2 className="font-bold text-gray-800 mb-2 text-md">📌 Reserve Unit & Claim Lead</h2>
              <p className="text-xs text-gray-500 mb-4">
                Click any green cell in the matrix to view its <span className="font-semibold text-blue-600">Payment Plan</span> and reserve it.
              </p>

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

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-extrabold py-2.5 rounded-lg text-xs transition shadow-sm mt-2"
                >
                  🔒 Save & Mark as Reserved (Yellow)
                </button>
              </form>
            </div>

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
                      className="p-3 border rounded-lg bg-amber-50/50 border-amber-200 flex justify-between items-start text-xs"
                    >
                      <div>
                        <p className="font-bold text-gray-800">{lead.name}</p>
                        <p className="text-gray-500">{lead.phone}</p>

                        {lead.source && (
                          <span className="inline-block bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded mt-1">
                            📍 Source: {lead.source}
                          </span>
                        )}

                        <p className="text-[11px] text-amber-800 font-medium mt-1">
                          {lead.apartment_id}
                        </p>
                      </div>
                      <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-2 py-1 rounded-full whitespace-nowrap">
                        RESERVED
                      </span>
                    </div>
                  ))}
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