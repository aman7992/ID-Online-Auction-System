import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';
import Notification from '../models/Notification.js';
import { broadcastAuctionEnded, sendUserNotification } from '../config/socket.js';

export const checkExpiredAuctions = async () => {
  try {
    const now = new Date();
    // Find all auctions that are still marked 'active' but their endTime has passed
    const expiredAuctions = await Auction.find({
      status: 'active',
      endTime: { $lte: now },
    });

    for (const auction of expiredAuctions) {
      auction.status = 'ended';

      // Find the winning bid (highest bid)
      const winningBid = await Bid.findOne({ auction: auction._id })
        .sort({ amount: -1 })
        .populate('bidder', 'name email profileImage');

      if (winningBid && winningBid.bidder) {
        auction.winner = winningBid.bidder._id;
        await auction.save();

        // Broadcast to auction room
        broadcastAuctionEnded(auction._id.toString(), {
          auctionId: auction._id,
          status: 'ended',
          winner: {
            _id: winningBid.bidder._id,
            name: winningBid.bidder.name,
            profileImage: winningBid.bidder.profileImage,
          },
          winningBid: winningBid.amount,
        });

        // Notify winner
        const winNotif = await Notification.create({
          user: winningBid.bidder._id,
          title: '🎉 You Won the Auction!',
          message: `Congratulations! You won "${auction.title}" with a winning bid of ₹${winningBid.amount.toLocaleString('en-IN')}.`,
          type: 'won',
          link: `/auctions/${auction._id}`,
        });
        sendUserNotification(winningBid.bidder._id.toString(), winNotif);

        // Notify seller
        const sellerNotif = await Notification.create({
          user: auction.seller,
          title: 'Auction Ended with Winner',
          message: `Your auction "${auction.title}" ended with a winning bid of ₹${winningBid.amount.toLocaleString('en-IN')} by ${winningBid.bidder.name}.`,
          type: 'ended',
          link: `/auctions/${auction._id}`,
        });
        sendUserNotification(auction.seller.toString(), sellerNotif);
      } else {
        // Ended with no bids
        await auction.save();

        broadcastAuctionEnded(auction._id.toString(), {
          auctionId: auction._id,
          status: 'ended',
          winner: null,
          winningBid: 0,
        });

        // Notify seller of no bids
        const sellerNotif = await Notification.create({
          user: auction.seller,
          title: 'Auction Ended with No Bids',
          message: `Your auction "${auction.title}" has closed with no bids placed.`,
          type: 'ended',
          link: `/auctions/${auction._id}`,
        });
        sendUserNotification(auction.seller.toString(), sellerNotif);
      }
    }
  } catch (error) {
    console.error('Error in checkExpiredAuctions background worker:', error);
  }
};

export const startAuctionScheduler = (intervalMs = 15000) => {
  // Run immediately on boot, then every interval
  checkExpiredAuctions();
  const interval = setInterval(checkExpiredAuctions, intervalMs);
  console.log(`Auction expiration worker active (checking every ${intervalMs / 1000}s)`);
  return interval;
};
