import React, { useState } from 'react';
import { Lead } from './types';

export const MarketerDashboard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [unit, setUnit] = useState('');

  // نموذج إضافة عميل سريع
  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newLead: Lead = {
      id: Date.now().toString(),
      name,
      phone,
      apartmentId: unit,
      marketerName: 'أحمد (حسابي)',
      status: 'جديد',
      createdAt: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };

    setLeads([newLead, ...leads]);
    setName('');
    setPhone('');
    setUnit('');
    alert('تم تسجيل العميل باسمك وحمايته في النظام!');
  };

  const sendWhatsAppOffer = (phone: string, unitNumber: string) => {
    const message = `أهلاً بك! تفاصيل الشقة رقم ${unitNumber || 'المطلوبة'} الموضحة بالفيديو: ...`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen text-right" dir="rtl">
      {/* 1. رابط البايو الخاص بالمسوق */}
      <div className="bg-blue-900 text-white p-4 rounded-lg shadow mb-6">
        <h2 className="font-bold text-lg mb-1">رابط التسويق الخاص بك (Bio Link)</h2>
        <p className="text-xs text-blue-200 mb-2">انسخ هذا الرابط وضعه في بايو تيك توك / انستغرام ليتم تسجيل العملاء باسمك تلقائياً:</p>
        <div className="bg-blue-800 p-2 rounded text-sm font-mono flex justify-between items-center dir-ltr">
          <button className="bg-blue-600 text-xs text-white px-3 py-1 rounded hover:bg-blue-500">نسخ</button>
          <span>https://yoursite.com/m/ahmed</span>
        </div>
      </div>

      {/* 2. نموذج الإدخال السريع للعملاء (بعد الاتصال المباشر) */}
      <div className="bg-white p-5 rounded-lg shadow mb-6">
        <h2 className="font-bold text-gray-800 mb-4 text-md">⚡ إدخال سريع لمتصل جديد</h2>
        <form onSubmit={handleAddLead} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">اسم العميل</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: عبد الله محمد"
              className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">رقم الجوال</label>
            <input 
              type="tel" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05xxxxxxxx"
              className="w-full p-2 border rounded-md text-sm text-left dir-ltr"
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">رقم الشقة المهتم بها (اختياري)</label>
            <input 
              type="text" 
              value={unit} 
              onChange={(e) => setUnit(e.target.value)}
              placeholder="مثال: 101"
              className="w-full p-2 border rounded-md text-sm"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-green-600 text-white font-bold py-2 rounded-md hover:bg-green-700 text-sm"
          >
            حفظ وتأكيد ملكية العميل
          </button>
        </form>
      </div>

      {/* 3. قائمة عملائي الجدد والمتابعة السريعة */}
      <div className="bg-white p-5 rounded-lg shadow">
        <h2 className="font-bold text-gray-800 mb-3 text-md">عملاؤك المسجلون مؤخراً</h2>
        {leads.length === 0 ? (
          <p className="text-gray-400 text-sm">لم تقم بإضافة عملاء اليوم بعد.</p>
        ) : (
          <div className="space-y-3">
            {leads.map((lead) => (
              <div key={lead.id} className="p-3 border rounded-md flex justify-between items-center bg-gray-50">
                <div>
                  <p className="font-bold text-sm text-gray-800">{lead.name}</p>
                  <p className="text-xs text-gray-500">{lead.phone} | الشقة: {lead.apartmentId || 'غير محدد'}</p>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded mt-1 inline-block">
                    {lead.status} ({lead.createdAt})
                  </span>
                </div>
                <button 
                  onClick={() => sendWhatsAppOffer(lead.phone, lead.apartmentId || '')}
                  className="bg-green-500 text-white text-xs px-3 py-2 rounded font-medium hover:bg-green-600 flex items-center gap-1"
                >
                  💬 إرسال واتساب
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default MarketerDashboard;