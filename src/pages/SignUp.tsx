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

    // 1️⃣ إنشاء حساب في Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone },
      },
    });

    if (authError) {
      setMessage(`❌ خطأ: ${authError.message}`);
      setLoading(false);
      return;
    }

    // 2️⃣ حفظ المسوق في جدول marketers لتظهر للأدمن بحالة 'pending'
    if (authData.user) {
      const { error: dbError } = await supabase.from('marketers').insert([
        {
          id: authData.user.id,
          name: name,
          email: email,
          phone: phone,
          status: 'pending', // حالة الانتظار حتى يوافق الأدمن
        },
      ]);

      if (dbError) {
        console.error('Error inserting marketer:', dbError);
        setMessage(`⚠️ تم إنشاء الحساب لكن فشل إرساله للأدمن: ${dbError.message}`);
      } else {
        setMessage('✅ تم تقديم الطلب بنجاح! حسابك الآن بانتظار موافقة الأدمن.');
        setName('');
        setEmail('');
        setPassword('');
        setPhone('');
      }
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-xl shadow-md border" dir="rtl">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">إنشاء حساب مسوق جديد</h2>
      
      {message && (
        <div className="mb-4 p-3 rounded text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
          {message}
        </div>
      )}

      <form onSubmit={handleSignUp} className="space-y-4 text-right">
        <div>
          <label className="block text-xs font-bold mb-1">الاسم الكامل *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded text-xs outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="أدخل اسمك"
          />
        </div>

        <div>
          <label className="block text-xs font-bold mb-1">البريد الإلكتروني *</label>
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
          <label className="block text-xs font-bold mb-1">رقم الهاتف *</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2 border rounded text-xs outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="0912345678"
          />
        </div>

        <div>
          <label className="block text-xs font-bold mb-1">كلمة المرور *</label>
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
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded transition"
        >
          {loading ? 'جاري التسجيل...' : 'إرسال طلب التسجيل'}
        </button>
      </form>
    </div>
  );
}