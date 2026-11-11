import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ClientSidebar } from '../components/ClientSidebar';
import { Navbar } from '../components/Navbar';

export function ClientLayout() {
  const [globalSearch, setGlobalSearch] = useState('');

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <ClientSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onSearchChange={setGlobalSearch} />
        <main className="p-8 flex-1 overflow-y-auto bg-slate-950">
          <Outlet context={{ globalSearch }} />
        </main>
      </div>
    </div>
  );
}
