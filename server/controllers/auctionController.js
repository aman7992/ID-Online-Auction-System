import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';
import Watchlist from '../models/Watchlist.js';
import Notification from '../models/Notification.js';
import { broadcastBidUpdate, sendUserNotification } from '../config/socket.js';

// Get auctions with search, filter, sorting, pagination
export const getAuctions = async (req, res) => {
  const {
    keyword,
    category,
    status,
    minPrice,
    maxPrice,
    sort,
    featured,
    page = 1,
    limit = 12,
  } = req.query;

  const query = {};

  // Search keyword in title or description
  if (keyword) {
    query.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
    ];
  }

  // Category filter
  if (category && category !== 'all') {
    query.category = category;
  }

  // Status filter
  const now = new Date();
  if (status) {
    if (status === 'active') {
      query.status = 'active';
      query.endTime = { $gt: now };
    } else if (status === 'endingSoon') {
      const soon = new Date(Date.now() + 24 * 60 * 60 * 1000); // within 24 hours
      query.status = 'active';
      query.endTime = { $gt: now, $lte: soon };
    } else if (status === 'ended') {
      query.$or = [{ status: 'ended' }, { endTime: { $lte: now } }];
    } else if (status === 'upcoming') {
      query.startTime = { $gt: now };
    } else if (status !== 'all') {
      query.status = status;
    }
  }

  // Price range
  if (minPrice || maxPrice) {
    query.currentBid = {};
    if (minPrice) query.currentBid.$gte = Number(minPrice);
    if (maxPrice) query.currentBid.$lte = Number(maxPrice);
  }

  // Featured
  if (featured === 'true') {
    query.featured = true;
  }

  // Sorting
  let sortOption = { createdAt: -1 };
  if (sort === 'endingSoon') {
    sortOption = { endTime: 1 };
  } else if (sort === 'highestPrice') {
    sortOption = { currentBid: -1 };
  } else if (sort === 'lowestPrice') {
    sortOption = { currentBid: 1 };
  } else if (sort === 'mostBids') {
    sortOption = { bidCount: -1 };
  } else if (sort === 'newest') {
    sortOption = { createdAt: -1 };
  }

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const total = await Auction.countDocuments(query);
  const auctions = await Auction.find(query)
    .populate('category', 'name image')
    .populate('seller', 'name email profileImage')
    .populate('winner', 'name email profileImage')
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum);

  res.json({
    auctions,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    total,
  });
};

// Get single auction details by ID
export const getAuctionById = async (req, res) => {
  const auction = await Auction.findById(req.params.id)
    .populate('category', 'name description image')
    .populate('seller', 'name profileImage createdAt')
    .populate('winner', 'name profileImage');

  if (!auction) {
    return res.status(404).json({ message: 'Auction item not found' });
  }

  // Count total auctions created by this seller
  let sellerAuctionsCount = 1;
  if (auction.seller?._id) {
    sellerAuctionsCount = await Auction.countDocuments({ seller: auction.seller._id });
  }

  // Fetch bid history for this auction
  const bids = await Bid.find({ auction: auction._id })
    .populate('bidder', 'name profileImage')
    .sort({ createdAt: -1 })
    .limit(50);

  // Check if current user watchlisted this item
  let isWatchlisted = false;
  if (req.user) {
    const watchItem = await Watchlist.findOne({
      user: req.user._id,
      auction: auction._id,
    });
    if (watchItem) isWatchlisted = true;
  }

  // Fetch related auctions from same category
  const related = await Auction.find({
    category: auction.category._id,
    _id: { $ne: auction._id },
    status: 'active',
  })
    .limit(4)
    .populate('category', 'name');

  const auctionObj = auction.toObject();
  if (auctionObj.seller) {
    auctionObj.seller = {
      _id: auctionObj.seller._id,
      name: auctionObj.seller.name,
      profileImage: auctionObj.seller.profileImage,
      createdAt: auctionObj.seller.createdAt,
      auctionsCount: sellerAuctionsCount,
      rating: 4.9,
      reviewsCount: 16,
    };
  }

  res.json({
    ...auctionObj,
    bids,
    isWatchlisted,
    related,
  });
};

// Get auctions listed by logged in user (Seller Dashboard)
export const getMySellerAuctions = async (req, res) => {
  const { status } = req.query;
  const query = { seller: req.user._id };

  if (status && status !== 'all') {
    if (status === 'completed') {
      query.status = 'ended';
    } else {
      query.status = status;
    }
  }

  const auctions = await Auction.find(query)
    .populate('category', 'name image')
    .populate('winner', 'name email profileImage')
    .sort({ createdAt: -1 });

  res.json(auctions);
};


// Create new auction
export const createAuction = async (req, res) => {
  const {
    title,
    description,
    images,
    category,
    startingPrice,
    minimumIncrement,
    startTime,
    endTime,
    featured,
  } = req.body;

  if (!title || !description || !category || !startingPrice || !endTime) {
    return res.status(400).json({ message: 'Please provide all required auction fields' });
  }

  const numStartingPrice = Number(startingPrice);
  const numMinIncrement = Number(minimumIncrement) || 500;

  if (isNaN(numStartingPrice) || numStartingPrice <= 0) {
    return res.status(400).json({ message: 'Starting price must be greater than zero' });
  }

  if (isNaN(numMinIncrement) || numMinIncrement <= 0) {
    return res.status(400).json({ message: 'Minimum bid increment must be greater than zero' });
  }

  const start = startTime ? new Date(startTime) : new Date();
  const end = new Date(endTime);

  if (isNaN(end.getTime()) || end <= start) {
    return res.status(400).json({ message: 'End time must be in the future after start time' });
  }

  const auction = await Auction.create({
    title: title.trim(),
    description: description.trim(),
    images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
    category,
    startingPrice: numStartingPrice,
    currentBid: numStartingPrice,
    minimumIncrement: numMinIncrement,
    seller: req.user._id,
    startTime: start,
    endTime: end,
    status: req.body.status && ['active', 'draft', 'pending'].includes(req.body.status) ? req.body.status : 'active',
    featured: (req.user.role === 'admin') && (featured === true || featured === 'true'),
  });

  const populatedAuction = await Auction.findById(auction._id)
    .populate('category', 'name image')
    .populate('seller', 'name email profileImage');

  res.status(201).json(populatedAuction);
};

// Update auction
export const updateAuction = async (req, res) => {
  const auction = await Auction.findById(req.params.id);

  if (!auction) {
    return res.status(404).json({ message: 'Auction item not found' });
  }

  // Authorization: must be seller or admin
  if (
    auction.seller.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({ message: 'Not authorized to modify this auction' });
  }

  if (auction.status === 'ended') {
    return res.status(400).json({ message: 'Cannot edit an auction that has already ended' });
  }

  // If bids have already been placed, prevent changing startingPrice or other critical terms
  if (auction.bidCount > 0 && req.user.role !== 'admin') {
    if (req.body.startingPrice && Number(req.body.startingPrice) !== auction.startingPrice) {
      return res.status(400).json({ message: 'Cannot alter starting price once bids have been placed' });
    }
    if (req.body.minimumIncrement && Number(req.body.minimumIncrement) !== auction.minimumIncrement) {
      return res.status(400).json({ message: 'Cannot alter minimum bid increment once bids have been placed' });
    }
    if (req.body.category && req.body.category.toString() !== auction.category.toString()) {
      return res.status(400).json({ message: 'Cannot change auction category once bids have been placed' });
    }
    if (req.body.endTime && new Date(req.body.endTime).getTime() !== new Date(auction.endTime).getTime()) {
      return res.status(400).json({ message: 'Cannot alter auction end time once bids have been placed' });
    }
  }

  auction.title = req.body.title || auction.title;
  auction.description = req.body.description || auction.description;
  if (req.body.images && req.body.images.length > 0) auction.images = req.body.images;
  if (req.body.category && (auction.bidCount === 0 || req.user.role === 'admin')) auction.category = req.body.category;
  if (req.body.minimumIncrement && (auction.bidCount === 0 || req.user.role === 'admin')) auction.minimumIncrement = Number(req.body.minimumIncrement);
  if (req.body.endTime && (auction.bidCount === 0 || req.user.role === 'admin')) auction.endTime = new Date(req.body.endTime);
  if (req.body.featured !== undefined && req.user.role === 'admin') auction.featured = req.body.featured;
  if (req.body.status) {
    if (req.user.role === 'admin') {
      auction.status = req.body.status;
    } else if (['active', 'paused', 'cancelled', 'draft'].includes(req.body.status)) {
      auction.status = req.body.status;
    }
  }

  const updatedAuction = await auction.save();
  const populated = await Auction.findById(updatedAuction._id)
    .populate('category', 'name image')
    .populate('seller', 'name email profileImage');

  res.json(populated);
};

// Delete auction
export const deleteAuction = async (req, res) => {
  const auction = await Auction.findById(req.params.id);

  if (!auction) {
    return res.status(404).json({ message: 'Auction not found' });
  }

  // Only admin or seller if no bids
  if (req.user.role !== 'admin' && auction.seller.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to delete this auction' });
  }

  if (auction.bidCount > 0 && req.user.role !== 'admin') {
    return res.status(400).json({ message: 'Auctions with active bids can only be deleted by an administrator' });
  }

  await Bid.deleteMany({ auction: auction._id });
  await Watchlist.deleteMany({ auction: auction._id });
  await auction.deleteOne();

  res.json({ message: 'Auction removed successfully' });
};

// Admin status update (pause, start, end, cancel)
export const updateAuctionStatus = async (req, res) => {
  const { status } = req.body;
  const auction = await Auction.findById(req.params.id);

  if (!auction) {
    return res.status(404).json({ message: 'Auction not found' });
  }

  if (!['active', 'paused', 'ended', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  auction.status = status;
  if (status === 'ended' && !auction.winner && auction.bidCount > 0) {
    const highestBid = await Bid.findOne({ auction: auction._id }).sort({ amount: -1 });
    if (highestBid) {
      auction.winner = highestBid.bidder;
    }
  }

  await auction.save();

  const populated = await Auction.findById(auction._id)
    .populate('category', 'name image')
    .populate('seller', 'name email profileImage')
    .populate('winner', 'name email profileImage');

  res.json(populated);
};

// Place a bid on an auction
export const placeBid = async (req, res) => {
  const { amount } = req.body;
  const bidAmount = Number(amount);

  if (isNaN(bidAmount) || bidAmount <= 0) {
    return res.status(400).json({ message: 'Please provide a valid bid amount' });
  }

  const auction = await Auction.findById(req.params.id);

  if (!auction) {
    return res.status(404).json({ message: 'Auction not found' });
  }

  // Validate auction is active
  if (auction.status !== 'active') {
    return res.status(400).json({ message: `Auction is currently ${auction.status}` });
  }

  // Validate not expired
  if (new Date() >= new Date(auction.endTime)) {
    auction.status = 'ended';
    await auction.save();
    return res.status(400).json({ message: 'This auction has already ended' });
  }

  // Prevent seller from bidding on their own auction
  if (auction.seller.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: 'You cannot place a bid on your own auction' });
  }

  // Calculate required minimum bid
  let minimumRequired;
  if (auction.bidCount === 0) {
    minimumRequired = auction.startingPrice;
  } else {
    minimumRequired = auction.currentBid + auction.minimumIncrement;
  }

  if (bidAmount < minimumRequired) {
    return res.status(400).json({
      message: `Bid must be at least ₹${minimumRequired.toLocaleString('en-IN')} (Minimum increment: +₹${auction.minimumIncrement.toLocaleString('en-IN')})`,
    });
  }

  const previousWinnerId = auction.winner;

  // Create new bid record
  const newBid = await Bid.create({
    auction: auction._id,
    bidder: req.user._id,
    amount: bidAmount,
  });

  // Update auction state
  auction.currentBid = bidAmount;
  auction.winner = req.user._id;
  auction.bidCount += 1;
  await auction.save();

  // Populate new bid details
  const populatedBid = await Bid.findById(newBid._id).populate('bidder', 'name profileImage');

  // Broadcast real-time bid to auction room
  broadcastBidUpdate(auction._id.toString(), {
    auctionId: auction._id,
    currentBid: bidAmount,
    bidCount: auction.bidCount,
    winner: {
      _id: req.user._id,
      name: req.user.name,
      profileImage: req.user.profileImage,
    },
    bid: populatedBid,
  });

  // Notify previous highest bidder that they have been outbid in INR
  if (previousWinnerId && previousWinnerId.toString() !== req.user._id.toString()) {
    const outbidNotification = await Notification.create({
      user: previousWinnerId,
      title: 'You were outbid!',
      message: `Someone placed a higher bid of ₹${bidAmount.toLocaleString('en-IN')} on "${auction.title}".`,
      type: 'outbid',
      link: `/auctions/${auction._id}`,
    });

    sendUserNotification(previousWinnerId.toString(), outbidNotification);
  }

  // Create confirmation notification for current bidder in INR
  await Notification.create({
    user: req.user._id,
    title: 'Bid Placed Successfully',
    message: `You placed a bid of ₹${bidAmount.toLocaleString('en-IN')} on "${auction.title}".`,
    type: 'bid',
    link: `/auctions/${auction._id}`,
  });

  res.status(201).json({
    message: 'Bid placed successfully!',
    bid: populatedBid,
    currentBid: bidAmount,
    bidCount: auction.bidCount,
  });
};

// Toggle Watchlist
export const toggleWatchlist = async (req, res) => {
  const auctionId = req.params.id;
  const userId = req.user._id;

  const auction = await Auction.findById(auctionId);
  if (!auction) {
    return res.status(404).json({ message: 'Auction not found' });
  }

  const existing = await Watchlist.findOne({ user: userId, auction: auctionId });

  if (existing) {
    await existing.deleteOne();
    return res.json({ isWatchlisted: false, message: 'Removed from watchlist' });
  } else {
    await Watchlist.create({ user: userId, auction: auctionId });
    return res.json({ isWatchlisted: true, message: 'Added to watchlist' });
  }
};

// Get user's watchlist
export const getMyWatchlist = async (req, res) => {
  const items = await Watchlist.find({ user: req.user._id })
    .populate({
      path: 'auction',
      populate: [
        { path: 'category', select: 'name' },
        { path: 'winner', select: 'name' },
      ],
    })
    .sort({ createdAt: -1 });

  const validAuctions = items
    .filter((item) => item.auction !== null)
    .map((item) => item.auction);

  res.json(validAuctions);
};
