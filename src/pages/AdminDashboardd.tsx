import React, { useState } from 'react';
import { Apartment, ApartmentStatus } from "./types";

export function AdminDashboardd() {
  // 1. قائمة الشقق الافتراضية
  const [apartments, setApartments] = useState<Apartment[]>([
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
  ]);

  // 2. حالة نموذج الإضافة (Form State)
  const [unitNumber, setUnitNumber] = useState('');
  const [floor, setFloor] = useState<number | ''>('');
  const [rooms, setRooms] = useState<number | ''>('');
  const [price, setPrice] = useState<number | ''>('');
  const [apartmentType, setApartmentType] = useState('شقة سكنية');
  const [view, setView] = useState('');
  const [paymentPlan, setPaymentPlan] = useState('كاش');
  const [status, setStatus] = useState<ApartmentStatus>('available');

  // 3. إضافة شقة جديدة
  const handleAddApartment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!unitNumber || floor === '' || rooms === '' || price === '') {
      alert('يرجى ملء جميع الحقول الأساسية!');
      return;
    }

    const newApartment: Apartment = {
      id: Date.now().toString(),
      unitNumber,
      floor: Number(floor),
      rooms: Number(rooms),
      price: Number(price),
      apartmentType,
      view,
      paymentPlan,
      status,
    };

    setApartments([newApartment, ...apartments]);

    // إعادة ضبط النموذج
    setUnitNumber('');
    setFloor('');
    setRooms('');
    setPrice('');
    setView('');
    alert('تمت إضافة الشقة بنجاح إلى المخزون!');
  };

  // 4. تغيير حالة التوفر بسرعة
  const handleStatusChange = (id: string, newStatus: ApartmentStatus) => {
    setApartments(
      apartments.map((apt) =>
        apt.id === id ? { ...apt, status: newStatus } : apt
      )
    );
  };

  // 5. حذف شقة
  const handleDelete = (id: string) => {
    if (confirm('هل أنت تأكد من حذف هذه الشقة؟')) {
      setApartments(apartments.filter((apt) => apt.id !== id));
    }
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
    <div className="p-6 bg-gray-50 min-h-screen text-right" dir="rtl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        🏢 لوحة إدارة العقارات - إضافة وتعديل الشقق
      </h1>

      {/* 📊 إحصائيات المخزون */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border-r-4 border-blue-500">
          <p className="text-gray-500 text-xs font-medium">إجمالي الشقق</p>
          <p className="text-2xl font-bold">{apartments.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-r-4 border-green-500">
          <p className="text-gray-500 text-xs font-medium">🟢 المتاحة للبيع</p>
          <p className="text-2xl font-bold">
            {apartments.filter((a) => a.status === 'available').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-r-4 border-yellow-500">
          <p className="text-gray-500 text-xs font-medium">🟡 المحجوزة مؤقتاً</p>
          <p className="text-2xl font-bold">
            {apartments.filter((a) => a.status === 'reserved').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-r-4 border-red-500">
          <p className="text-gray-500 text-xs font-medium">🔴 المباعة</p>
          <p className="text-2xl font-bold">
            {apartments.filter((a) => a.status === 'sold').length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 📝 نموذج إضافة شقة جديدة */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold mb-4 text-blue-900 flex items-center gap-2">
            ➕ إضافة شقة جديدة للمخزون
          </h2>

          <form onSubmit={handleAddApartment} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                رقم الشقة / الوحدة *
              </label>
              <input
                type="text"
                placeholder="مثال: 101 أو A-12"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                className="w-full p-2.5 border rounded-lg text-sm border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  الدور *
                </label>
                <input
                  type="number"
                  placeholder="مثال: 2"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value ? Number(e.target.value) : '')}
                  className="w-full p-2.5 border rounded-lg text-sm border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  عدد الغرف *
                </label>
                <input
                  type="number"
                  placeholder="مثال: 3"
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value ? Number(e.target.value) : '')}
                  className="w-full p-2.5 border rounded-lg text-sm border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                السعر (ريال) *
              </label>
              <input
                type="number"
                placeholder="مثال: 500000"
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full p-2.5 border rounded-lg text-sm border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                نوع الشقة
              </label>
              <select
                value={apartmentType}
                onChange={(e) => setApartmentType(e.target.value)}
                className="w-full p-2.5 border rounded-lg text-sm border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="شقة سكنية">شقة سكنية نموذجية</option>
                <option value="دوبلكس">دوبلكس</option>
                <option value="بنتهاوس">بنتهاوس / روف</option>
                <option value="شقة مع حديقة">شقة مع حديقة (أرضي)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                الإطلالة والواجهة
              </label>
              <input
                type="text"
                placeholder="مثال: واجهة أمامية على الشارع الرئيسي"
                value={view}
                onChange={(e) => setView(e.target.value)}
                className="w-full p-2.5 border rounded-lg text-sm border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                خطة الدفع المتاحة
              </label>
              <select
                value={paymentPlan}
                onChange={(e) => setPaymentPlan(e.target.value)}
                className="w-full p-2.5 border rounded-lg text-sm border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="كاش">كاش فقط</option>
                <option value="تقسيط على 3 سنوات (10% مقدم)">تقسيط على 3 سنوات (10% مقدم)</option>
                <option value="تقسيط على 5 سنوات (15% مقدم)">تقسيط على 5 سنوات (15% مقدم)</option>
                <option value="تمويل عقاري بنكي">يدعم التمويل العقاري البنكي</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                حالة التوفر الحالية
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApartmentStatus)}
                className="w-full p-2.5 border rounded-lg text-sm border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="available">🟢 متاحة</option>
                <option value="reserved">🟡 محجوزة مؤقتاً</option>
                <option value="sold">🔴 مباعة</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-sm transition shadow-md"
            >
              حفظ الشقة في النظام
            </button>
          </form>
        </div>

        {/* 🏬 عرض قائمة الشقق والمخزون الحالي */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              قائمة الشقق المسجلة ({apartments.length})
            </h2>

            {apartments.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                لا توجد شقق في المخزون حالياً. قم بإضافة أول شقة من النموذج.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {apartments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      {/* الهيدر: رقم الشقة + حالة التوفر */}
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-900 text-base">
                          شقة {apt.unitNumber}
                        </span>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${getStatusBadge(
                            apt.status
                          )}`}
                        >
                          {apt.status === 'available' && '🟢 متاحة'}
                          {apt.status === 'reserved' && '🟡 محجوزة'}
                          {apt.status === 'sold' && '🔴 مباعة'}
                        </span>
                      </div>

                      {/* التفاصيل المعروضة */}
                      <div className="space-y-1 text-xs text-gray-600 mb-3">
                        <p>
                          <strong>النوع والدور:</strong> {apt.apartmentType} - الدور {apt.floor}
                        </p>
                        <p>
                          <strong>عدد الغرف:</strong> {apt.rooms} غرف
                        </p>
                        <p>
                          <strong>السعر:</strong>{' '}
                          <span className="text-blue-700 font-bold text-sm">
                            {apt.price.toLocaleString()} ريال
                          </span>
                        </p>
                        <p>
                          <strong>الإطلالة:</strong> {apt.view || 'غير محددة'}
                        </p>
                        <p>
                          <strong>خطة الدفع:</strong> {apt.paymentPlan}
                        </p>
                      </div>
                    </div>

                    {/* التحكم السريع بالحالة */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <select
                        value={apt.status}
                        onChange={(e) =>
                          handleStatusChange(apt.id, e.target.value as ApartmentStatus)
                        }
                        className="text-xs p-1.5 border rounded bg-gray-50 focus:outline-none"
                      >
                        <option value="available">تغيير لـ: متاحة</option>
                        <option value="reserved">تغيير لـ: محجوزة</option>
                        <option value="sold">تغيير لـ: مباعة</option>
                      </select>

                      <button
                        onClick={() => handleDelete(apt.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1"
                      >
                        حذف
                      </button>
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

// 👈 التصدير الافتراضي لحل مشكلة lazyLoad
export default AdminDashboardd;