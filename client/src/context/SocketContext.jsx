import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    // Determine Socket.IO server URL:
    // 1. Use VITE_SOCKET_URL if set
    // 2. Use VITE_API_URL origin if set (without /api suffix)
    // 3. Default to deployed Render backend in production
    // 4. Fallback to window.location.origin in development (proxied by Vite to port 5000)
    const getSocketUrl = () => {
      const explicitSocketUrl = import.meta.env.VITE_SOCKET_URL;
      if (explicitSocketUrl && explicitSocketUrl.trim()) {
        return explicitSocketUrl.trim().replace(/\/+$/, '');
      }

      const envApiUrl = import.meta.env.VITE_API_URL;
      if (envApiUrl && envApiUrl.trim()) {
        return envApiUrl.trim().replace(/\/api\/?$/, '').replace(/\/+$/, '');
      }

      if (import.meta.env.PROD) {
        return 'https://id-online-auction-system.onrender.com';
      }

      return window.location.origin;
    };

    const socketUrl = getSocketUrl();
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      // console.log('Socket connected:', newSocket.id);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Join user room when user changes
  useEffect(() => {
    if (socket && user?._id) {
      socket.emit('join_user', user._id);

      // Listen for personal notifications (outbid, won, etc.)
      const handleNotification = (notif) => {
        if (notif.type === 'outbid') {
          showToast(`⚠️ ${notif.title}: ${notif.message}`, 'warning', 6000);
        } else if (notif.type === 'won') {
          showToast(`🏆 ${notif.title}: ${notif.message}`, 'success', 8000);
        } else {
          showToast(notif.message, 'info');
        }
      };

      socket.on('notification', handleNotification);

      return () => {
        socket.off('notification', handleNotification);
      };
    }
  }, [socket, user, showToast]);

  const joinAuction = (auctionId) => {
    if (socket && auctionId) {
      socket.emit('join_auction', auctionId);
    }
  };

  const leaveAuction = (auctionId) => {
    if (socket && auctionId) {
      socket.emit('leave_auction', auctionId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, joinAuction, leaveAuction }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
