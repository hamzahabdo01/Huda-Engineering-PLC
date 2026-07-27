import React, { useState } from 'react';
import { Apartment, Lead } from './types';

export const AdminDashboard: React.FC = () => {
  // بيانات افتراضية للشقق
  const [apartments] = useState<Apartment[]>([
    { id: '1', unitNumber: '101', floor: 1, rooms: 3, price: 450000, status: 'available' },
    { id: '2', unitNumber: '102', floor: 1, rooms: 4, price: 550000, status: 'reserved' },
    { id: '3', unitNumber: '201', floor: 2, rooms: 3, price: 460000, status: 'sold' },
    { id: '4', unitNumber: '202', floor: 2, rooms: 5, price: 680000, status: 'available' },
  ]);

  const getStatusColor = (status: Apartment['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-400';
      case 'reserved': return 'bg-yellow-100 text-yellow-800 border-yellow-400';
      case 'sold': return 'bg-red-100 text-red-800 border-red-400';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-right" dir="rtl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">لوحة تحكم الإدارة - مبيعات الشقق</h1>

      {/* 1. كروت الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border-r-4 border-blue-500">
          <p className="text-gray-500 text-sm">إجمالي الشقق</p>
          <p className="text-2xl font-bold">{apartments.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-r-4 border-green-500">
          <p className="text-gray-500 text-sm">الشقق المتاحة</p>
          <p className="text-2xl font-bold">{apartments.filter(a => a.status === 'available').length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-r-4 border-yellow-500">
          <p className="text-gray-500 text-sm">المحجوزة مؤقتاً</p>
          <p className="text-2xl font-bold">{apartments.filter(a => a.status === 'reserved').length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-r-4 border-red-500">
          <p className="text-gray-500 text-sm">المباعة</p>
          <p className="text-2xl font-bold">{apartments.filter(a => a.status === 'sold').length}</p>
        </div>
      </div>

      {/* 2. المخطط التفاعلي للشقق (Stacking Plan) */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-bold mb-4">حالة الشقق والمخزون</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {apartments.map((apt) => (
            <div 
              key={apt.id} 
              className={`p-4 rounded-lg border ${getStatusColor(apt.status)} flex flex-col justify-between`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">شقة {apt.unitNumber}</span>
                <span className="text-xs px-2 py-1 rounded bg-white font-medium">الدور {apt.floor}</span>
              </div>
              <p className="text-sm text-gray-600">{apt.rooms} غرف - {apt.price.toLocaleString()} ريال</p>
              <div className="mt-3 text-xs font-semibold">
                {apt.status === 'available' && '🟢 متاحة'}
                {apt.status === 'reserved' && '🟡 محجوزة'}
                {apt.status === 'sold' && '🔴 مباعة'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};