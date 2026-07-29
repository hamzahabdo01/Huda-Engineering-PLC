import React, { useState } from 'react';
import { supabase } from '../integrations/supabase/client';

export function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // 1️⃣ Create user account in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone },
      },
    });

    if (authError) {
      setMessage(`❌ Error: ${authError.message}`);
      setLoading(false);
      return;
    }

    // 2️⃣ Save marketer details to 'marketers' table with 'pending' status for admin review
    if (authData.user) {
      const { error: dbError } = await supabase.from('marketers').insert([
        {
          id: authData.user.id,
          name: name,
          email: email,
          phone: phone,
          status: 'pending', // Awaiting admin approval
        },
      ]);

      if (dbError) {
        console.error('Error inserting marketer:', dbError);
        setMessage(`⚠️ Account created, but failed to notify admin: ${dbError.message}`);
      } else {
        setMessage('✅ Request submitted successfully! Your account is currently awaiting admin approval.');
        setName('');
        setEmail('');
        setPassword('');
        setPhone('');
      }
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-xl shadow-md border" dir="ltr">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Create Marketer Account</h2>
      
      {message && (
        <div className="mb-4 p-3 rounded text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
          {message}
        </div>
      )}

      <form onSubmit={handleSignUp} className="space-y-4 text-left">
        <div>
          <label className="block text-xs font-bold mb-1">Full Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded text-xs outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-xs font-bold mb-1">Email Address *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded text-xs outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="example@mail.com"
          />
        </div>

        <div>
          <label className="block text-xs font-bold mb-1">Phone Number *</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2 border rounded text-xs outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="+1234567890"
          />
        </div>

        <div>
          <label className="block text-xs font-bold mb-1">Password *</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded text-xs outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded transition disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Registration Request'}
        </button>
      </form>
    </div>
  );
}