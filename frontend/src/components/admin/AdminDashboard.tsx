'use client';
import React, { useState } from 'react';
import { AdminLayout, AdminSection } from './AdminLayout';
import { DashboardView } from './DashboardView';
import { UsersView } from './UsersView';
import { ClientsView } from './ClientsView';
import { OrganizationsView } from './OrganizationsView';
import { TendersView } from './TendersView';
import { BidsView } from './BidsView';
import { ConnectorsView } from './ConnectorsView';
import { RulesView } from './RulesView';
import { DocumentTypesView } from './DocumentTypesView';
import { AIView } from './AIView';
import { RiskView } from './RiskView';
import { SecurityView } from './SecurityView';
import { AuditLogsView } from './AuditLogsView';
import { ReportsView } from './ReportsView';
import { NotificationsView } from './NotificationsView';
import { SettingsView } from './SettingsView';

interface AdminDashboardProps {
  initialSection?: AdminSection;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialSection = 'dashboard' }) => {
  const [activeSection, setActiveSection] = useState<AdminSection>(initialSection);

  return (
    <AdminLayout currentSection={activeSection} onSelectSection={(sec) => setActiveSection(sec)}>
      {activeSection === 'dashboard' && <DashboardView onNavigate={(sec) => setActiveSection(sec)} />}
      {activeSection === 'users' && <UsersView />}
      {activeSection === 'clients' && <ClientsView />}
      {activeSection === 'organizations' && <OrganizationsView />}
      {activeSection === 'tenders' && <TendersView />}
      {activeSection === 'bids' && <BidsView />}
      {activeSection === 'connectors' && <ConnectorsView />}
      {activeSection === 'rules' && <RulesView />}
      {activeSection === 'document-types' && <DocumentTypesView />}
      {activeSection === 'ai' && <AIView />}
      {activeSection === 'risk' && <RiskView />}
      {activeSection === 'security' && <SecurityView />}
      {activeSection === 'audit' && <AuditLogsView />}
      {activeSection === 'reports' && <ReportsView />}
      {activeSection === 'notifications' && <NotificationsView />}
      {activeSection === 'settings' && <SettingsView />}
    </AdminLayout>
  );
};
