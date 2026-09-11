import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Gavel,
  Bell,
  Heart,
  User as UserIcon,
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Search,
  CheckCircle2,
  ExternalLink,
  PlusCircle,
  FolderTree,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ThemeToggle from './ThemeToggle';
import UserAvatar from './UserAvatar';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const userDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
  }, [location.pathname]);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      // Ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      // Ignore
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/auctions?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Gavel className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white block leading-tight font-sans">
              ID <span className="text-amber-500">AUCTION</span>
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase font-semibold tracking-widest text-slate-500 dark:text-slate-400 block -mt-0.5">
              Online Bidding (INR)
            </span>
          </div>
        </Link>

        {/* Search Bar (Desktop) */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden xl:flex flex-1 max-w-xs relative mx-2"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search auctions..."
            className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/80 focus:border-amber-500 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>

        {/* Navigation Links according to specification */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          {user ? (
            isAdmin ? (
              // Admin Navigation: Auctions | Admin Dashboard | Notifications | Profile | Theme
              <>
                <Link
                  to="/auctions"
                  className={`hover:text-amber-500 transition-colors ${
                    location.pathname === '/auctions' ? 'text-amber-500 font-bold' : ''
                  }`}
                >
                  Auctions
                </Link>
                <Link
                  to="/admin/dashboard"
                  className={`flex items-center gap-1 hover:text-amber-500 transition-colors ${
                    location.pathname.startsWith('/admin') ? 'text-amber-500 font-bold' : ''
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>Admin Dashboard</span>
                </Link>
                <Link
                  to="/user/notifications"
                  className={`hover:text-amber-500 transition-colors ${
                    location.pathname === '/user/notifications' ? 'text-amber-500 font-bold' : ''
                  }`}
                >
                  Notifications
                </Link>
                <Link
                  to="/user/profile"
                  className={`hover:text-amber-500 transition-colors ${
                    location.pathname === '/user/profile' ? 'text-amber-500 font-bold' : ''
                  }`}
                >
                  Profile
                </Link>
              </>
            ) : (
              // User Navigation: Auctions | Sell an Item | My Bids | My Auctions | Notifications | Profile | Theme
              <>
                <Link
                  to="/auctions"
                  className={`hover:text-amber-500 transition-colors ${
                    location.pathname === '/auctions' ? 'text-amber-500 font-bold' : ''
                  }`}
                >
                  Auctions
                </Link>
                <Link
                  to="/user/sell"
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 border border-amber-500/30 font-bold transition-all ${
                    location.pathname === '/user/sell' ? 'bg-amber-500 text-slate-950 dark:text-slate-950' : ''
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Sell an Item</span>
                </Link>
                <Link
                  to="/user/bids"
                  className={`hover:text-amber-500 transition-colors ${
                    location.pathname === '/user/bids' ? 'text-amber-500 font-bold' : ''
                  }`}
                >
                  My Bids
                </Link>
                <Link
                  to="/user/auctions"
                  className={`hover:text-amber-500 transition-colors ${
                    location.pathname === '/user/auctions' ? 'text-amber-500 font-bold' : ''
                  }`}
                >
                  My Auctions
                </Link>
                <Link
                  to="/user/notifications"
                  className={`hover:text-amber-500 transition-colors ${
                    location.pathname === '/user/notifications' ? 'text-amber-500 font-bold' : ''
                  }`}
                >
                  Notifications
                </Link>
                <Link
                  to="/user/profile"
                  className={`hover:text-amber-500 transition-colors ${
                    location.pathname === '/user/profile' ? 'text-amber-500 font-bold' : ''
                  }`}
                >
                  Profile
                </Link>
              </>
            )
          ) : (
            // Public Navigation: Home | Auctions | About | Contact
            <>
              <Link to="/" className="hover:text-amber-500 transition-colors">
                Home
              </Link>
              <Link to="/auctions" className="hover:text-amber-500 transition-colors">
                Auctions
              </Link>
              <Link to="/about" className="hover:text-amber-500 transition-colors">
                About
              </Link>
              <Link to="/contact" className="hover:text-amber-500 transition-colors">
                Contact
              </Link>
            </>
          )}
        </nav>

        {/* Right Action Icons: Theme Toggle, Notifications, Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Theme Toggle (Navbar item required by spec) */}
          <ThemeToggle />

          {user ? (
            <>
              {/* Watchlist Quick Link */}
              <Link
                to="/user/watchlist"
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-rose-500 border border-slate-200 dark:border-slate-700/80 transition-colors relative"
                title="My Watchlist"
              >
                <Heart className="w-4 h-4" />
              </Link>

              {/* Notification Bell with Dropdown */}
              <div className="relative" ref={notifDropdownRef}>
                <button
                  type="button"
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-500 border border-slate-200 dark:border-slate-700/80 transition-colors relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 z-50 animate-fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50 my-2">
                      {notifications.length === 0 ? (
                        <p className="text-center py-6 text-xs text-slate-400">
                          No notifications yet
                        </p>
                      ) : (
                        notifications.slice(0, 5).map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => {
                              if (notif.link) navigate(notif.link);
                              setNotifDropdownOpen(false);
                            }}
                            className={`py-3 px-1 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/40 rounded-lg transition-colors ${
                              !notif.isRead ? 'bg-amber-500/5' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                                {notif.title}
                              </span>
                              {!notif.isRead && (
                                <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                              {notif.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    <Link
                      to="/user/notifications"
                      onClick={() => setNotifDropdownOpen(false)}
                      className="block text-center py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline border-t border-slate-200 dark:border-slate-700 pt-3"
                    >
                      View All Notifications
                    </Link>
                  </div>
                )}
              </div>

              {/* User Avatar Dropdown */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-colors"
                >
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate hidden sm:inline-block">
                    {user.name}
                  </span>
                  <UserAvatar
                    src={user.profileImage}
                    name={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-amber-500/50"
                  />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in">
                    <div className="p-3 border-b border-slate-200 dark:border-slate-700 mb-1">
                      <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        {user.role}
                      </span>
                    </div>

                    {isAdmin ? (
                      <>
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors mb-1"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                        <Link
                          to="/admin/auctions"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                        >
                          <Gavel className="w-4 h-4 text-slate-400" />
                          Manage Auctions
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/user/sell"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors mb-1"
                        >
                          <PlusCircle className="w-4 h-4" />
                          Sell an Item
                        </Link>
                        <Link
                          to="/user/auctions"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                        >
                          <FolderTree className="w-4 h-4 text-slate-400" />
                          My Auctions
                        </Link>
                        <Link
                          to="/user/bids"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                        >
                          <Gavel className="w-4 h-4 text-slate-400" />
                          My Bids
                        </Link>
                        <Link
                          to="/user/won"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4 text-slate-400" />
                          Won Auctions
                        </Link>
                      </>
                    )}

                    <Link
                      to="/user/dashboard"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      User Dashboard
                    </Link>

                    <Link
                      to="/user/profile"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      Profile & Picture
                    </Link>

                    <div className="my-1 border-t border-slate-200 dark:border-slate-700" />

                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/login"
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition-all"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 space-y-3 animate-fade-in shadow-xl">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search auctions..."
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-amber-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <nav className="flex flex-col space-y-1 text-sm font-semibold">
            {user ? (
              isAdmin ? (
                <>
                  <Link
                    to="/auctions"
                    className="px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Auctions
                  </Link>
                  <Link
                    to="/admin/dashboard"
                    className="px-3 py-2 rounded-lg font-bold text-amber-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/user/notifications"
                    className="px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Notifications
                  </Link>
                  <Link
                    to="/user/profile"
                    className="px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/auctions"
                    className="px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Auctions
                  </Link>
                  <Link
                    to="/user/sell"
                    className="px-3 py-2 rounded-lg font-bold text-amber-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Sell an Item
                  </Link>
                  <Link
                    to="/user/bids"
                    className="px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    My Bids
                  </Link>
                  <Link
                    to="/user/auctions"
                    className="px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    My Auctions
                  </Link>
                  <Link
                    to="/user/notifications"
                    className="px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Notifications
                  </Link>
                  <Link
                    to="/user/profile"
                    className="px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Profile
                  </Link>
                </>
              )
            ) : (
              <>
                <Link
                  to="/"
                  className="px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Home
                </Link>
                <Link
                  to="/auctions"
                  className="px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  All Auctions
                </Link>
                <Link
                  to="/about"
                  className="px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Contact
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
