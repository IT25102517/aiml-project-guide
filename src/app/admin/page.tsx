'use client';

import React from 'react';
import AdminDashboard from '@/components/AdminDashboard'; // Assume implemented

export default function AdminPage() {
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
  
  return (
    <div className="min-h-screen p-8 bg-slate-950">
      <AdminDashboard adminPassword={adminPassword} />
    </div>
  );
}
