import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import AuctionsPage from './pages/public/AuctionsPage';
import AuctionDetailsPage from './pages/public/AuctionDetailsPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';

// User Dashboard Pages
import UserDashboard from './pages/user/UserDashboard';
import MyProfilePage from './pages/user/MyProfilePage';
import MyBidsPage from './pages/user/MyBidsPage';
import WonAuctionsPage from './pages/user/WonAuctionsPage';
import WatchlistPage from './pages/user/WatchlistPage';
import NotificationsPage from './pages/user/NotificationsPage';
import SettingsPage from './pages/user/SettingsPage';
import CreateAuctionPage from './pages/user/CreateAuctionPage';
import MyAuctionsPage from './pages/user/MyAuctionsPage';
import EditUserAuctionPage from './pages/user/EditUserAuctionPage';

// Admin Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageAuctionsPage from './pages/admin/ManageAuctionsPage';
import AddAuctionPage from './pages/admin/AddAuctionPage';
import EditAuctionPage from './pages/admin/EditAuctionPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ManageBidsPage from './pages/admin/ManageBidsPage';
import ManageCategoriesPage from './pages/admin/ManageCategoriesPage';
import WinnersPage from './pages/admin/WinnersPage';
import ReportsPage from './pages/admin/ReportsPage';

// Protected Route components
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return null;
  if (!user || !isAdmin) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <SocketProvider>
              <Routes>
                {/* Public Routes under MainLayout */}
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="auctions" element={<AuctionsPage />} />
                  <Route path="auctions/:id" element={<AuctionDetailsPage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="sell" element={<Navigate to="/user/sell" replace />} />
                </Route>

                {/* User Dashboard Routes */}
                <Route
                  path="/user"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout role="user" />
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<UserDashboard />} />
                  <Route path="sell" element={<CreateAuctionPage />} />
                  <Route path="auctions" element={<MyAuctionsPage />} />
                  <Route path="auctions/create" element={<CreateAuctionPage />} />
                  <Route path="auctions/edit/:id" element={<EditUserAuctionPage />} />
                  <Route path="profile" element={<MyProfilePage />} />
                  <Route path="bids" element={<MyBidsPage />} />
                  <Route path="won" element={<WonAuctionsPage />} />
                  <Route path="watchlist" element={<WatchlistPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* Admin Dashboard Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <DashboardLayout role="admin" />
                    </AdminRoute>
                  }
                >
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="auctions" element={<ManageAuctionsPage />} />
                  <Route path="auctions/add" element={<AddAuctionPage />} />
                  <Route path="auctions/edit/:id" element={<EditAuctionPage />} />
                  <Route path="users" element={<ManageUsersPage />} />
                  <Route path="bids" element={<ManageBidsPage />} />
                  <Route path="categories" element={<ManageCategoriesPage />} />
                  <Route path="winners" element={<WinnersPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                </Route>

                {/* 404 Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </SocketProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
