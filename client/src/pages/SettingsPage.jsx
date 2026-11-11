import React from 'react';
import { Sliders, Shield, Database, Server } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">System Settings & Portal Info</h1>
        <p className="text-xs text-slate-400 mt-1">Platform environment setup, system parameters, and architecture configuration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center">
            <Server className="w-4 h-4 mr-2 text-brand-400" /> Application Environment
          </h3>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between py-1.5 border-b border-slate-850">
              <span className="text-slate-500 font-semibold">Application Name:</span>
              <strong className="text-white">Drisu Compliance Operations Portal</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-850">
              <span className="text-slate-500 font-semibold">Technology Stack:</span>
              <strong className="text-brand-400">Pure JavaScript (React + Vite + Express)</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-850">
              <span className="text-slate-500 font-semibold">Database Engine:</span>
              <strong className="text-emerald-400 font-mono">PostgreSQL via Prisma ORM</strong>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 font-semibold">Authentication Strategy:</span>
              <strong className="text-purple-400 font-mono">JWT + bcrypt Password Hashing</strong>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center">
            <Shield className="w-4 h-4 mr-2 text-emerald-400" /> Security & Data Isolation
          </h3>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between py-1.5 border-b border-slate-850">
              <span className="text-slate-500 font-semibold">Role Based Access (RBAC):</span>
              <strong className="text-emerald-400">Enforced (ADMIN, MANAGER, STAFF, CLIENT)</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-850">
              <span className="text-slate-500 font-semibold">Client Tenant Isolation:</span>
              <strong className="text-teal-400">Strict Backend Database Query Scoping</strong>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 font-semibold">File Storage:</span>
              <strong className="text-slate-200">Local Disk Storage with Safe Name Hashing</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
