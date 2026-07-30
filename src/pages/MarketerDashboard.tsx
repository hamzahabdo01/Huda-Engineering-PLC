import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

// --- Types & Interfaces ---
export interface UnitType {
  id: string;
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
  name: string;
  subtitle: string;
  floors: string[];
  unitTypes: UnitType[];
  matrix: Record<string, UnitStatus>;
  remarks?: Record<string, string>;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  apartmentId?: string;
  apartment_id?: string;
  unitKey?: string;
  projectId?: string;
  marketerName?: string;
  status: string;
  createdAt?: string;
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
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Auth Inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // --- Dynamic Projects State ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  
  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const [selectedUnitKey, setSelectedUnitKey] = useState<string>('');
  const [selectedUnitLabel, setSelectedUnitLabel] = useState<string>('');
  const [selectedUnitDetails, setSelectedUnitDetails] = useState<UnitType | null>(null);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  // 1️⃣ Check Active Session & Fetch Dynamic Projects on Mount
  useEffect(() => {
    checkCurrentUser();
    fetchProjects();

    // ⚡ Realtime subscriptions for projects and leads updates
    const projectsChannel = supabase
      .channel('realtime-projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchProjects();
      })
      .subscribe();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchMarketerProfile(session.user.id);
      } else {
        setCurrentMarketer(null);
        setLoadingUser(false);
      }
    });

    return () => {
      supabase.removeChannel(projectsChannel);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkCurrentUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchMarketerProfile(session.user.id);
      } else {
        setCurrentMarketer(null);
      }
    } catch (err) {
      console.error("Auth check error:", err);
    } finally {
      setLoadingUser(false);
    }
  };

  // 2️⃣ Fetch Dynamic Projects from Supabase Database
  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedProjects: Project[] = data.map((p: any) => ({
          id: p.id,
          name: p.name || 'Untitled Project',
          subtitle: p.subtitle || '',
          floors: Array.isArray(p.floors) ? p.floors : (typeof p.floors === 'string' ? JSON.parse(p.floors) : []),
          unitTypes: p.unit_types || p.unitTypes || [],
          matrix: p.matrix || {},
          remarks: p.remarks || {},
        }));

        setProjects(formattedProjects);
        
        // Auto-select first project if none selected
        setSelectedProjectId((prev) => {
          if (!prev || !formattedProjects.some((p) => p.id === prev)) {
            return formattedProjects[0].id;
          }
          return prev;
        });
      } else {
        setProjects([]);
      }
    } catch (err: any) {
      console.error('Error fetching dynamic projects:', err.message);
    } finally {
      setLoadingProjects(false);
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
        
        if (!isApproved) {
          setAuthError('⏳ Your account is pending admin approval. Access is restricted.');
          setCurrentMarketer(null);
          await supabase.auth.signOut();
        } else {
          setCurrentMarketer(data);
          fetchLeadsForMarketer(data.id, data.name);
        }
      } else {
        setAuthError('❌ Profile record not found in marketers table.');
        setCurrentMarketer(null);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoadingUser(false);
    }
  };

  // Fetch Leads for Current Marketer
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

  // Login Handler
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

  // Sign Up Handler
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

  // Cell Click Handler
  const handleCellClick = (floor: string, unitType: UnitType, status: UnitStatus) => {
    const key = `${floor}-${unitType.id}`;
    const label = `${floor} Floor [${unitType.title} (${unitType.area}m²)]`;

    if (status === 'available') {
      setSelectedUnitKey(key);
      setSelectedUnitLabel(label);
      setSelectedUnitDetails(unitType);
    } else if (status === 'reserved') {
      alert(`🟡 Unit on ${floor} floor (${unitType.title}) is already RESERVED.`);
    } else {
      alert(`🔴 Unit on ${floor} floor (${unitType.title}) is NOT available.`);
    }
  };

  // Reserve Unit & Save Lead with Database Sync
  const handleReserveAndSaveLead = async (e: React.FormEvent) => {
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

    if (!selectedProject) {
      alert('No active project selected.');
      return;
    }

    // 1️⃣ Save Lead to Supabase `leads` Table
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .insert([
        {
          name: clientName,
          phone: cleanPhone,
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

    // 2️⃣ Update Project Matrix Status to 'reserved' in Supabase `projects` Table
    const updatedMatrix = {
      ...(selectedProject.matrix || {}),
      [selectedUnitKey]: 'reserved',
    };

    const { error: projUpdateError } = await supabase
      .from('projects')
      .update({ matrix: updatedMatrix })
      .eq('id', selectedProjectId);

    if (projUpdateError) {
      console.error('Error updating project matrix:', projUpdateError);
    }

    // 3️⃣ Update Local State UI
    setProjects((prevProjects) =>
      prevProjects.map((proj) => {
        if (proj.id === selectedProjectId) {
          return {
            ...proj,
            matrix: updatedMatrix,
          };
        }
        return proj;
      })
    );

    if (leadData && leadData[0]) {
      setLeads([leadData[0], ...leads]);
    }

    // Reset Input Fields
    setClientName('');
    setClientPhone('');
    setSelectedUnitKey('');
    setSelectedUnitLabel('');
    setSelectedUnitDetails(null);

    alert('✅ Unit reserved and client saved successfully in database!');
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

  // -------------------------------------------------------------
  // SCREEN 1: LOGIN / SIGN UP SCREEN
  // -------------------------------------------------------------
  if (!currentMarketer) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4" dir="ltr">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
          
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl mx-auto mb-3 shadow-lg shadow-blue-500/30">
              🏢
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {isSignUp ? 'Create Marketer Account' : 'Marketer Portal - Login'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {isSignUp
                ? 'Enter your details to submit an account request for admin review'
                : 'Enter your credentials to access the sales portal'}
            </p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setAuthError(''); setAuthSuccess(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                !isSignUp ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setAuthError(''); setAuthSuccess(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                isSignUp ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Register
            </button>
          </div>

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

          {!isSignUp ? (
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
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

  // -------------------------------------------------------------
  // SCREEN 2: MAIN DASHBOARD
  // -------------------------------------------------------------
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

            {selectedProject && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-center text-xs font-sans">
                  <thead>
                    <tr className="bg-[#00474b] text-white">
                      <th rowSpan={2} className="border border-gray-400 p-2 font-bold min-w-[90px]">
                        Floor
                      </th>
                      <th
                        colSpan={selectedProject.unitTypes?.length || 1}
                        className="border border-gray-400 p-1.5 font-bold italic text-sm"
                      >
                        Type of Houses & Price Plans
                      </th>
                      <th rowSpan={2} className="border border-gray-400 p-2 font-bold min-w-[80px]">
                        Remark
                      </th>
                    </tr>

                    <tr className="bg-[#00474b] text-white">
                      {(selectedProject.unitTypes || []).map((ut) => (
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
                    {(selectedProject.floors || []).map((floor) => {
                      const remark = selectedProject.remarks?.[floor] || '';

                      return (
                        <tr key={floor}>
                          <td className="border border-black bg-[#f2b827] text-black font-bold p-2 text-xs">
                            {floor}
                          </td>

                          {(selectedProject.unitTypes || []).map((ut) => {
                            const key = `${floor}-${ut.id}`;
                            const status = selectedProject.matrix?.[key] || 'unavailable';
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

                          <td className="border border-black bg-white text-gray-800 p-1 text-[11px]">
                            {remark}
                          </td>
                        </tr>
                      );
                    })}
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

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-extrabold py-2.5 rounded-lg text-xs transition shadow-sm"
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
                      className="p-3 border rounded-lg bg-amber-50/50 border-amber-200 flex justify-between items-center text-xs"
                    >
                      <div>
                        <p className="font-bold text-gray-800">{lead.name}</p>
                        <p className="text-gray-500">{lead.phone}</p>
                        <p className="text-[11px] text-amber-800 font-medium mt-0.5">
                          {lead.apartment_id || lead.apartmentId}
                        </p>
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
      )}
    </div>
  );
}

export default MarketerDashboard;