// src/pages/types.ts

export interface Marketer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  approved?: boolean;
  status?: 'approved' | 'pending' | 'rejected' | string; // تم إضافتها لحل مشكلة Login.tsx
}

export interface UnitType {
  id: string;
  title: string;
  area: number;
  totalPrice?: number;
  downPayment?: number;
  installmentYears?: number;
  monthlyInstallment?: number;
}

export type UnitStatus = 'available' | 'unavailable' | 'reserved';

export interface Project {
  id: string;
  name: string;
  subtitle: string;
  floors: string[];
  unitTypes: UnitType[];
  matrix: Record<string, UnitStatus>;
  remarks?: Record<string, string>;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  apartmentId?: string;
  unitKey?: string;
  projectId?: string;
  marketerName?: string;
  status?: string;
  createdAt?: string;
}