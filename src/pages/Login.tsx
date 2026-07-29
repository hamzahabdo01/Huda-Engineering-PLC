import React, { useState } from 'react';
import { supabase } from '../integrations/supabase/client';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1️⃣ تسجيل الدخول بـ Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      alert(`❌ خطأ في كلمة المرور أو البريد الإلكتروني: ${authError.message}`);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // 2️⃣ الاستعلام عن حالة المسوق في جدول marketers
      const { data: marketer, error: marketerError } = await supabase
        .from('marketers')
        .select('status')
        .eq('email', authData.user.email)
        .maybeSingle();

      if (marketerError || !marketer) {
        alert('⚠️ لم يتم العثور على بيانات هذا المسوق في النظام.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // 3️⃣ التحقق من قبول الأدمن
      if (marketer.status === 'pending') {
        alert('⏳ حسابك قيد المراجعة حالياً من قبل الإدارة. يرجى الانتظار لحين القبول.');
        await supabase.auth.signOut(); // تسجيل خروج لمنع الدخول
      } else if (marketer.status === 'rejected') {
        alert('❌ للأسف، تم رفض طلب تسجيل حسابك من قبل الإدارة.');
        await supabase.auth.signOut();
      } else if (marketer.status === 'approved') {
        alert('✅ مرحباً بك! تم تسجيل الدخول بنجاح.');
        // هنا يمكنك التوجيه إلى لوحة المسوق مثلاً:
        // window.location.href = '/marketer-dashboard';
      } else {
        alert('⚠️ حالة الحساب غير معروفة.');
        await supabase.auth.signOut();
      }
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-xl shadow-md border" dir="rtl">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">تسجيل دخول المسوقين</h2>
      
      <form onSubmit={handleLogin} className="space-y-4 text-right">
        <div>
          <label className="block text-xs font-bold mb-1">البريد الإلكتروني</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded text-xs outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold mb-1">كلمة المرور</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded text-xs outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded transition"
        >
          {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
        </button>
      </form>
    </div>
  );
}