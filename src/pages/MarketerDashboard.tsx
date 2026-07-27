import React, { useState } from 'react';
import { Apartment, Lead, ApartmentStatus } from './types';

export function MarketerDashboard() {
  // 1. مخزون الشقق (يمثل الشقق المعروضة من الإدارة بتفاصيلها الكاملة)
  const [apartments] = useState<Apartment[]>([
    {
      id: '1',
      unitNumber: '101',
      floor: 1,
      rooms: 3,
      price: 450000,
      apartmentType: 'شقة سكنية',
      view: 'واجهة أمامية - شارع رئيسي',
      paymentPlan: 'تقسيط على 3 سنوات (15% مقدم)',
      status: 'available',
    },
    {
      id: '2',
      unitNumber: '102',
      floor: 1,
      rooms: 4,
      price: 580000,
      apartmentType: 'دوبلكس',
      view: 'إطلالة على حديقة',
      paymentPlan: 'كاش فقط',
      status: 'reserved',
    },
    {
      id: '3',
      unitNumber: '201',
      floor: 2,
      rooms: 5,
      price: 720000,
      apartmentType: 'بنتهاوس / روف',
      view: 'إطلالة بانورامية علوية',
      paymentPlan: 'تقسيط على 5 سنوات (15% مقدم)',
      status: 'available',
    },
  ]);

  // 2. حالة الفلترة والبحث لشاشة المسوق
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchRooms, setSearchRooms] = useState<string>('all');

  // 3. حالة إدخال عميل جديد
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');

  // أتمتة الفلترة للشقق المتاحة والمطلوبة
  const filteredApartments = apartments.filter((apt) => {
    const matchesStatus =
      filterStatus === 'all' || apt.status === filterStatus;
    const matchesRooms =
      searchRooms === 'all' || apt.rooms.toString() === searchRooms;
    return matchesStatus && matchesRooms;
  });

  // إضافة عميل جديد وتسجيل ملكيته
  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) return;

    const newLead: Lead = {
      id: Date.now().toString(),
      name: clientName,
      phone: clientPhone,
      apartmentId: selectedUnit,
      marketerName: 'حسابي المسوّق',
      status: 'جديد',
      createdAt: new Date().toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setLeads([newLead, ...leads]);
    setClientName('');
    setClientPhone('');
    setSelectedUnit('');
    alert('تم تسجيل العميل وحمايته باسمك في النظام!');
  };

  // 💬 توليد وأرسال عرض سعر شامل للتفاصيل عبر الواتساب
  const sendWhatsAppOffer = (phone: string, apt: Apartment) => {
    const statusText =
      apt.status === 'available'
        ? '🟢 متاحة للبيع'
        : apt.status === 'reserved'
        ? '🟡 محجوزة مؤقتاً'
        : '🔴 مباعة';

    const message = `أهلاً بك! 🏢
تفاصيل الشقة التي استفسرت عنها:

• رقم الشقة: ${apt.unitNumber}
• نوع الشقة: ${apt.apartmentType}
• الدور: ${apt.floor}
• عدد الغرف: ${apt.rooms} غرف
• الإطلالة والواجهة: ${apt.view || 'غير محددة'}
• السعر المطلوب: ${apt.price.toLocaleString()} ريال
• خطة الدفع: ${apt.paymentPlan}
• حالة التوفر: ${statusText}

للمزيد من الصور والمعاينة الميدانية يسعدني تواصلك معي مباشرة!`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getStatusBadge = (status: ApartmentStatus) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'sold':
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen text-right" dir="rtl">
      {/* 🔗 1. رابط البايو الخاص بالمسوق */}
      <div className="bg-blue-900 text-white p-4 rounded-xl shadow mb-6">
        <h2 className="font-bold text-lg mb-1">رابط التسويق الشخصي (Bio Link)</h2>
        <p className="text-xs text-blue-200 mb-2">
          ضع هذا الرابط في بايو حساباتك (تيك توك / انستغرام) لتسجيل العملاء القادمين من فيديوهاتك تلقائياً باسمك:
        </p>
        <div className="bg-blue-800 p-2.5 rounded-lg text-sm font-mono flex justify-between items-center dir-ltr">
          <button
            onClick={() => alert('تم نسخ الرابط!')}
            className="bg-blue-600 text-xs text-white px-3 py-1.5 rounded-md hover:bg-blue-500 transition"
          >
            نسخ
          </button>
          <span className="text-blue-100 text-xs">https://yoursite.com/m/ahmed</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 🏢 2. عرض الشقق والمخزون والتفاصيل المتاحة للمسوق */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <h2 className="font-bold text-gray-800 text-lg">
                🏬 شقق المخزون المتاحة للبيع ({filteredApartments.length})
              </h2>

              {/* أدوات البحث والفلترة السريعة للمسوق */}
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-xs p-2 border rounded-lg bg-gray-50 focus:outline-none"
                >
                  <option value="all">كل الحالات</option>
                  <option value="available">🟢 المتاحة فقط</option>
                  <option value="reserved">🟡 المحجوزة</option>
                  <option value="sold">🔴 المباعة</option>
                </select>

                <select
                  value={searchRooms}
                  onChange={(e) => setSearchRooms(e.target.value)}
                  className="text-xs p-2 border rounded-lg bg-gray-50 focus:outline-none"
                >
                  <option value="all">كل عدد الغرف</option>
                  <option value="3">3 غرف</option>
                  <option value="4">4 غرف</option>
                  <option value="5">5 غرف</option>
                </select>
              </div>
            </div>

            {/* بطاقات عرض تفاصيل الشقق */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredApartments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-400 transition flex flex-col justify-between"
                >
                  <div>
                    {/* العنوان والحالة */}
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-900 text-base">
                        شقة {apt.unitNumber}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getStatusBadge(
                          apt.status
                        )}`}
                      >
                        {apt.status === 'available' && '🟢 متاحة'}
                        {apt.status === 'reserved' && '🟡 محجوزة'}
                        {apt.status === 'sold' && '🔴 مباعة'}
                      </span>
                    </div>

                    {/* التفاصيل المضافة حديثاً */}
                    <div className="space-y-1.5 text-xs text-gray-600 mb-4">
                      <div className="flex justify-between border-b border-gray-100 pb-1">
                        <span>نوع الشقة والدور:</span>
                        <span className="font-semibold text-gray-800">
                          {apt.apartmentType} (الدور {apt.floor})
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-1">
                        <span>عدد الغرف:</span>
                        <span className="font-semibold text-gray-800">{apt.rooms} غرف</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-1">
                        <span>الإطلالة:</span>
                        <span className="font-semibold text-gray-800">
                          {apt.view || 'غير محددة'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-1">
                        <span>خطة الدفع:</span>
                        <span className="font-semibold text-gray-800">{apt.paymentPlan}</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span>السعر:</span>
                        <span className="font-bold text-blue-700 text-sm">
                          {apt.price.toLocaleString()} ريال
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* إرسال عرض سريع ببيانات هذه الشقة للعميل */}
                  <button
                    onClick={() => {
                      const phone = prompt('أدخل رقم جوال العميل للواتساب (مثال: 05xxxx):');
                      if (phone) sendWhatsAppOffer(phone, apt);
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-2 rounded-lg font-bold flex items-center justify-center gap-1 shadow-sm transition"
                  >
                    💬 إرسال تفاصيل الشقة عبر الواتساب
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ⚡ 3. نموذج الإدخال السريع للعميل الذي اتصل هاتفياً */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-bold text-gray-800 mb-3 text-md">⚡ إدخال سريع لمتصل جديد</h2>
            <p className="text-xs text-gray-500 mb-4">
              سجل بيانات المتصل فوراً بعد المكالمة لحماية ملكيتك للعميل في النظام.
            </p>

            <form onSubmit={handleAddLead} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  اسم العميل *
                </label>
                <input
                  type="text"
                  placeholder="مثال: عبد الله محمد"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-sm border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  رقم الجوال *
                </label>
                <input
                  type="tel"
                  placeholder="05xxxxxxxx"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-sm border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none dir-ltr text-left"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  الشقة المهتم بها (اختر من الشقق المتاحة)
                </label>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-sm border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">-- اختر رقم الشقة --</option>
                  {apartments.map((apt) => (
                    <option key={apt.id} value={apt.unitNumber}>
                      شقة {apt.unitNumber} - {apt.apartmentType} ({apt.price.toLocaleString()} ريال)
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-sm transition"
              >
                حفظ وتأكيد ملكية العميل
              </button>
            </form>
          </div>

          {/* قائمة العملاء المسجلين مؤخراً للمسوق */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-bold text-gray-800 mb-3 text-md">
              عملاؤك المسجلون ({leads.length})
            </h2>
            {leads.length === 0 ? (
              <p className="text-gray-400 text-xs">لم تسجل عملاء اليوم حتى الآن.</p>
            ) : (
              <div className="space-y-3">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3 border rounded-lg bg-gray-50 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold text-sm text-gray-800">{lead.name}</p>
                      <p className="text-xs text-gray-500">
                        {lead.phone} | الشقة: {lead.apartmentId || 'غير محددة'}
                      </p>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full mt-1 inline-block">
                        {lead.status} ({lead.createdAt})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 👈 تصدير افتراضي للتوافق مع lazyLoad
export default MarketerDashboard;