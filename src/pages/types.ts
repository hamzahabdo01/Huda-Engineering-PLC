// types.ts
export type ApartmentStatus = 'available' | 'reserved' | 'sold';

export interface Apartment {
  id: string;
  unitNumber: string;     // رقم الشقة
  floor: number;          // الدور
  rooms: number;          // عدد الغرف
  price: number;          // السعر
  apartmentType: string;  // نوع الشقة (شقة نموذجية، دوبلكس، بنتهاوس...)
  view: string;           // الإطلالة (أمامي، حديقة، شارع رئيسي...)
  paymentPlan: string;    // خطط الدفع (كاش، أقساط 3 سنوات، أقساط 5 سنوات...)
  status: ApartmentStatus;// التوفر (متاحة، محجوزة، مباعة)}
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  apartmentId?: string;
  marketerName: string;
  status: 'جديد' | 'تم التواصل' | 'معاينة' | 'محجوز' | 'مباع';
  createdAt: string;
}