import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, TrendingUp, Mail, Users, LogOut, X, Menu,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/todos', label: 'Todo List', icon: CheckSquare },
  { to: '/scale', label: 'Scale Plan', icon: TrendingUp },
  { to: '/emails', label: 'Email Sequences', icon: Mail },
  { to: '/team', label: 'Team', icon: Users, superadminOnly: true },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-white w-64">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
        <div>
          <div className="text-sm font-bold text-white tracking-tight">Quorex</div>
          <div className="text-xs text-slate-400 font-medium">Admin</div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded text-slate-400 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon, superadminOnly }) => {
          if (superadminOnly && user?.role !== 'superadmin') return null;
          return (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-slate-700">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-sm font-medium text-white truncate">{user?.name}</div>
            <div className="text-xs text-slate-400 capitalize">{user?.role}</div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-30">
        {content}
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={onClose} />
          <div className="relative z-50">
            {content}
          </div>
        </div>
      )}
    </>
  );
}

export function HamburgerButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-gray-100"
    >
      <Menu size={20} />
    </button>
  );
}
