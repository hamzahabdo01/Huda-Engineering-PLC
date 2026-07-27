// types.ts
export type ApartmentStatus = 'available' | 'reserved' | 'sold';

export interface Apartment {
  id: string;
  unitNumber: string;
  floor: number;
  rooms: number;
  price: number;
  status: ApartmentStatus;
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