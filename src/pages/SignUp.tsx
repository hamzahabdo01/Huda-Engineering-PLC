// src/pages/SignUp.tsx
import React, { useState } from 'react';
import { Marketer } from './types'; // 👈 تم التعديل إلى ../types

interface SignUpProps {
  onNavigateToLogin: () => void;
  onSignUpSuccess?: (newMarketer: Marketer) => void;
}

export function SignUp({ onNavigateToLogin, onSignUpSuccess }: SignUpProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !phone || !password) {
      setError('Please fill out all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // جلب القائمة المسجلة مسبقاً من local storage
    const saved = localStorage.getItem('registered_marketers');
    const registered: Marketer[] = saved ? JSON.parse(saved) : [];

    const exists = registered.some((m) => m.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      setError('This email is already registered.');
      return;
    }

    // إنشاء الحساب بحالة approved: false
    const newMarketer: Marketer = {
      id: 'mkt-' + Date.now(),
      name,
      email,
      phone,
      password,
      approved: false, // بانتظار موافقة الأدمن
    };

    registered.push(newMarketer);
    localStorage.setItem('registered_marketers', JSON.stringify(registered));

    setSubmitted(true);
    if (onSignUpSuccess) {
      onSignUpSuccess(newMarketer);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-gray-100" dir="rtl">
        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
          ⏳
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">طلبك قيد المراجعة</h3>
        <p className="text-xs text-gray-600 mb-6 leading-relaxed">
          تم إرسال بيانات حسابك بنجاح. الحساب بانتظار تفعيل وموافقة المسئول (Admin) قبل أن تتمكن من تسجيل الدخول.
        </p>
        <button
          onClick={onNavigateToLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs transition"
        >
          العودة لتسجيل الدخول
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100" dir="rtl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">إنشاء حساب مسوق جديد</h2>
        <p className="text-xs text-gray-500 mt-1">سجل بياناتك للتقديم على اعتماد حسابك</p>
      </div>

      {error && (
        <div className="bg-red-50 border-r-4 border-red-500 text-red-700 p-3 rounded-lg text-xs mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSignUp} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">الاسم الكامل</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="أحمد علي"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">البريد الإلكتروني</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="marketer@company.com"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">رقم الهاتف</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0500000000"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">كلمة المرور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">تأكيد كلمة المرور</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2.5 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-md shadow-emerald-600/20 mt-2"
        >
          تقديم طلب التسجيل
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={onNavigateToLogin}
          className="text-xs text-blue-600 hover:underline font-semibold"
        >
          لديك حساب بالفعل؟ تسجيل الدخول
        </button>
      </div>
    </div>
  );
}

export default SignUp;