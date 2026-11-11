import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import { StaffLayout } from './layouts/StaffLayout';
import { ClientLayout } from './layouts/ClientLayout';

import { LoginPage } from './pages/LoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ClientDashboardPage } from './pages/ClientDashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { ClientsPage } from './pages/ClientsPage';
import { ClientDetailPage } from './pages/ClientDetailPage';
import { CasesPage } from './pages/CasesPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { RenewalsPage } from './pages/RenewalsPage';
import { ReportsPage } from './pages/ReportsPage';
import { ServicesPage } from './pages/ServicesPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ServiceRequestsPage } from './pages/ServiceRequestsPage';
import { ClientRequestServicePage } from './pages/ClientRequestServicePage';
import { LoadingSpinner } from './components/LoadingSpinner';

// Route Guard for Staff/Admin
function StaffRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner text="Authenticating session..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'CLIENT') return <Navigate to="/client/dashboard" replace />;
  return children;
}

// Route Guard for Clients
function ClientRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner text="Authenticating session..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'CLIENT') return <Navigate to="/dashboard" replace />;
  return children;
}

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Staff & Admin Routes */}
          <Route path="/" element={<StaffRoute><StaffLayout /></StaffRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="clients/:id" element={<ClientDetailPage />} />
            <Route path="service-requests" element={<ServiceRequestsPage />} />
            <Route path="cases" element={<CasesPage />} />
            <Route path="cases/:id" element={<CaseDetailPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="renewals" element={<RenewalsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Client Portal Routes */}
          <Route path="/client" element={<ClientRoute><ClientLayout /></ClientRoute>}>
            <Route index element={<Navigate to="/client/dashboard" replace />} />
            <Route path="dashboard" element={<ClientDashboardPage />} />
            <Route path="cases" element={<CasesPage />} />
            <Route path="cases/:id" element={<CaseDetailPage />} />
            <Route path="requests" element={<ClientRequestServicePage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="renewals" element={<RenewalsPage />} />
            <Route path="profile" element={<SettingsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
