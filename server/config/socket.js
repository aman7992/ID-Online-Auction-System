import { Server } from 'socket.io';

let io = null;

export const initSocket = (httpServer, clientOrigin) => {
  io = new Server(httpServer, {
    cors: {
      origin: clientOrigin || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Join an auction room for live bid updates
    socket.on('join_auction', (auctionId) => {
      if (auctionId) {
        socket.join(`auction:${auctionId}`);
      }
    });

    socket.on('leave_auction', (auctionId) => {
      if (auctionId) {
        socket.leave(`auction:${auctionId}`);
      }
    });

    // Join user room for targeted notifications
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean up if needed
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
};

export const broadcastBidUpdate = (auctionId, payload) => {
  if (io) {
    io.to(`auction:${auctionId}`).emit('bid_update', payload);
  }
};

export const broadcastAuctionEnded = (auctionId, payload) => {
  if (io) {
    io.to(`auction:${auctionId}`).emit('auction_ended', payload);
  }
};

export const sendUserNotification = (userId, payload) => {
  if (io) {
    io.to(`user:${userId}`).emit('notification', payload);
  }
};
