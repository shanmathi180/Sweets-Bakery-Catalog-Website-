import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Ticket,
  BarChart3,
  LogOut,
  Cake,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

export default function AdminLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex w-64 flex-col bg-neutral-900 text-neutral-300 fixed inset-y-0 left-0 z-40">
        <SidebarContent onSignOut={handleSignOut} profileName={profile?.full_name ?? 'Admin'} />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-neutral-900 text-neutral-300 h-full overflow-y-auto animate-slide-down">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-neutral-800">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent onSignOut={handleSignOut} profileName={profile?.full_name ?? 'Admin'} onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-neutral-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="font-display text-lg font-bold text-neutral-900">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-brand-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> View Store
              </Link>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white text-sm font-bold">
                {profile?.full_name?.charAt(0).toUpperCase() ?? 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  onSignOut,
  profileName,
  onNavigate,
}: {
  onSignOut: () => void;
  profileName: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-neutral-800">
        <Link to="/admin" className="flex items-center gap-2" onClick={onNavigate}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
            <Cake className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-display text-lg font-bold text-white">Shan's</span>
            <span className="font-display text-lg font-bold text-accent-400"> Admin</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                ? 'bg-brand-600 text-white'
                : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-neutral-800">
        <div className="px-4 py-2 mb-2">
          <p className="text-sm font-medium text-white truncate">{profileName}</p>
          <p className="text-xs text-neutral-500">Administrator</p>
        </div>
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors w-full"
        >
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </div>
    </div>
  );
}
