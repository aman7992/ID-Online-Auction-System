import React from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Gavel,
  CheckCircle2,
  Heart,
  Bell,
  Settings,
  User as UserIcon,
  ShieldCheck,
  PlusCircle,
  Users,
  FolderTree,
  Trophy,
  BarChart3,
  LogOut,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/common/ThemeToggle';
import UserAvatar from '../components/common/UserAvatar';

const DashboardLayout = ({ role = 'user' }) => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const userNavItems = [
    { to: '/user/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/user/sell', label: 'Sell an Item', icon: PlusCircle },
    { to: '/user/auctions', label: 'My Auctions', icon: FolderTree },
    { to: '/user/bids', label: 'My Bids', icon: Gavel },
    { to: '/user/won', label: 'Won Auctions', icon: CheckCircle2 },
    { to: '/user/watchlist', label: 'Watchlist', icon: Heart },
    { to: '/user/notifications', label: 'Notifications', icon: Bell },
    { to: '/user/profile', label: 'My Profile', icon: UserIcon },
    { to: '/user/settings', label: 'Settings', icon: Settings },
  ];

  const adminNavItems = [
    { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { to: '/admin/auctions', label: 'Manage Auctions', icon: Gavel },
    { to: '/admin/auctions/add', label: 'Add Auction', icon: PlusCircle },
    { to: '/admin/users', label: 'Manage Users', icon: Users },
    { to: '/admin/bids', label: 'Manage Bids', icon: ShieldCheck },
    { to: '/admin/categories', label: 'Categories', icon: FolderTree },
    { to: '/admin/winners', label: 'Winners', icon: Trophy },
    { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  ];

  const navItems = role === 'admin' ? adminNavItems : userNavItems;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Logo & Portal Info */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
                <Gavel className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white block">
                  ID AUCTION
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400 block">
                  {role === 'admin' ? 'Admin Portal' : 'User Portal'}
                </span>
              </div>
            </Link>
          </div>

          {/* User mini card */}
          {user && (
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800/60 flex items-center gap-3">
              <UserAvatar
                src={user.profileImage}
                name={user.name}
                className="w-10 h-10 rounded-full object-cover border border-amber-500/50"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          )}

          {/* Navigation links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/user/dashboard' || item.to === '/admin/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom utility links */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
          {role === 'admin' ? (
            <Link
              to="/user/dashboard"
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Switch to User View
            </Link>
          ) : (
            isAdmin && (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )
          )}

          <Link
            to="/"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Topbar Header */}
        <header className="h-16 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="capitalize">{role} Portal</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
            <span className="text-slate-800 dark:text-slate-200 font-semibold capitalize">
              {location.pathname.split('/').pop().replace(/-/g, ' ') || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/auctions"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              Browse Auctions
            </Link>
          </div>
        </header>

        {/* Page Content Container */}
        <div className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
