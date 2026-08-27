'use client';

import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import GemComplianceEngine from '@/components/admin/GemComplianceEngine';

export default function ComplianceEnginePage() {
  return (
    // @ts-ignore - bypassing strict type for the new section
    <AdminLayout currentSection="compliance">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <GemComplianceEngine />
      </div>
    </AdminLayout>
  );
}
