import Bid from '../models/Bid.js';
import Auction from '../models/Auction.js';

// Get current user's bids
export const getMyBids = async (req, res) => {
  const userId = req.user._id;

  // Find all distinct auctions user has bid on
  const userBids = await Bid.find({ bidder: userId })
    .populate({
      path: 'auction',
      populate: [
        { path: 'category', select: 'name' },
        { path: 'winner', select: 'name email profileImage' },
      ],
    })
    .sort({ createdAt: -1 });

  // Map to group by auction with user's highest bid and status
  const auctionMap = new Map();

  for (const bid of userBids) {
    if (!bid.auction) continue;
    const auctionId = bid.auction._id.toString();

    if (!auctionMap.has(auctionId)) {
      const isWinner =
        bid.auction.winner &&
        bid.auction.winner._id.toString() === userId.toString();

      let bidStatus = 'outbid';
      if (bid.auction.status === 'ended') {
        bidStatus = isWinner ? 'won' : 'lost';
      } else if (isWinner) {
        bidStatus = 'winning';
      }

      auctionMap.set(auctionId, {
        auction: bid.auction,
        myHighestBid: bid.amount,
        currentBid: bid.auction.currentBid,
        bidStatus, // 'winning', 'outbid', 'won', 'lost'
        lastBidTime: bid.createdAt,
        totalUserBidsOnItem: 1,
      });
    } else {
      const existing = auctionMap.get(auctionId);
      if (bid.amount > existing.myHighestBid) {
        existing.myHighestBid = bid.amount;
      }
      existing.totalUserBidsOnItem += 1;
    }
  }

  res.json(Array.from(auctionMap.values()));
};

// Get won auctions for logged in user
export const getWonAuctions = async (req, res) => {
  const userId = req.user._id;

  const wonAuctions = await Auction.find({
    status: 'ended',
    winner: userId,
  })
    .populate('category', 'name')
    .populate('seller', 'name email phone')
    .sort({ endTime: -1 });

  res.json(wonAuctions);
};

// Get bid history for a single auction
export const getAuctionBids = async (req, res) => {
  const bids = await Bid.find({ auction: req.params.auctionId })
    .populate('bidder', 'name email profileImage')
    .sort({ createdAt: -1 });

  res.json(bids);
};

// Admin: Get all bids with pagination and filters
export const getAllBidsAdmin = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const total = await Bid.countDocuments();
  const bids = await Bid.find()
    .populate('auction', 'title startingPrice currentBid status')
    .populate('bidder', 'name email profileImage')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.json({
    bids,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    total,
  });
};
