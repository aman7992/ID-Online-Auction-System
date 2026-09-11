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
    // Connect to server (using window.location.origin which proxies through Vite to port 5000)
    const newSocket = io(window.location.origin, {
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
