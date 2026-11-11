import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  FileCheck,
  CreditCard,
  RefreshCw,
  User,
  Sparkles,
  FilePlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function ClientSidebar() {
  const { user } = useAuth();

  const navItems = [
    { to: '/client/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/client/cases', label: 'My Cases', icon: Briefcase },
    { to: '/client/requests', label: 'Request New Service', icon: FilePlus },
    { to: '/client/documents', label: 'Documents', icon: FileCheck },
    { to: '/client/payments', label: 'Payments', icon: CreditCard },
    { to: '/client/renewals', label: 'Renewals', icon: RefreshCw },
    { to: '/client/profile', label: 'Profile', icon: User }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center space-x-3 border-b border-slate-800 bg-slate-950/40">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-white text-base tracking-tight leading-none">DRISU</h1>
            <span className="text-[10px] text-teal-400 tracking-wider font-semibold uppercase">Client Portal</span>
          </div>
        </div>

        {/* Client Profile Box */}
        <div className="p-4 mx-3 my-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-0.5">Connected Entity</span>
          <p className="font-bold text-slate-200 truncate">{user?.clientProfile?.companyName || user?.name}</p>
        </div>

        {/* Navigation Menu */}
        <nav className="px-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
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

      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
        Client Self-Service Portal
      </div>
    </aside>
  );
}
