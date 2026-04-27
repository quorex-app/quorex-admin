import { useState } from 'react';
import Sidebar, { HamburgerButton } from './Sidebar';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <HamburgerButton onClick={() => setSidebarOpen(true)} />
          <span className="text-sm font-semibold text-slate-900">Quorex Admin</span>
        </div>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
