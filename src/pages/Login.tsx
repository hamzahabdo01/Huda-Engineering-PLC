import React, { useState } from 'react';
import { Marketer } from './types';

interface LoginProps {
  onLoginSuccess: (marketer: Marketer) => void;
  onNavigateToSignUp: () => void;
}

export function Login({ onLoginSuccess, onNavigateToSignUp }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const storedMarketers: Marketer[] = JSON.parse(
      localStorage.getItem('system_marketers') || '[]'
    );

    const targetUser = storedMarketers.find(
      (m) => m.email.toLowerCase() === email.toLowerCase()
    );

    if (!targetUser || targetUser.password !== password) {
      setError('Invalid email or password.');
      return;
    }

    // Check Admin Approval Status
    if (targetUser.status === 'pending') {
      setError(' Your registration is still pending Admin approval.');
      return;
    }

    if (targetUser.status === 'rejected') {
      setError(' Your registration request was declined by the Admin.');
      return;
    }

    // Approved -> Log In
    onLoginSuccess(targetUser);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4" dir="ltr">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-extrabold text-xl mx-auto mb-3">
            🏢
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Marketer Portal Login</h2>
          <p className="text-xs text-gray-500 mt-1">Sign in to access stock inventory & plans</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-xs mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="marketer@company.com"
              className="w-full p-3 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-sm transition shadow-md"
          >
            Sign In
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-gray-500">
          Need an account?{' '}
          <button
            onClick={onNavigateToSignUp}
            className="text-blue-600 font-bold hover:underline"
          >
            Request Sign-Up
          </button>
        </div>
      </div>
    </div>
  );
}