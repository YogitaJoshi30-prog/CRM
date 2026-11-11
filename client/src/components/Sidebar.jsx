import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  FileCheck,
  CreditCard,
  RefreshCw,
  BarChart3,
  Sliders,
  History,
  ShieldAlert,
  Sparkles,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/leads', label: 'Leads', icon: Users },
    { to: '/clients', label: 'Clients', icon: Building2 },
    { to: '/service-requests', label: 'Service Requests', icon: FileText },
    { to: '/cases', label: 'Cases', icon: Briefcase },
    { to: '/documents', label: 'Documents', icon: FileCheck },
    { to: '/payments', label: 'Payments', icon: CreditCard },
    { to: '/renewals', label: 'Renewals', icon: RefreshCw },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
    { to: '/services', label: 'Services & Checklists', icon: Sliders },
    ...(isAdmin ? [{ to: '/audit-logs', label: 'Audit Logs', icon: History }] : []),
    { to: '/settings', label: 'Settings', icon: ShieldAlert }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center space-x-3 border-b border-slate-800 bg-slate-950/40">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-white text-base tracking-tight leading-none">DRISU</h1>
            <span className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase">Compliance Ops</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`
                }
              >
                <Icon className="w-4 h-4 mr-3 shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
        Drisu Portal v1.0 • Academic Build
      </div>
    </aside>
  );
}
