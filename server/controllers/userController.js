import User from '../models/User.js';
import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';

// Admin: Get all users with search and pagination
export const getAllUsers = async (req, res) => {
  const { keyword, role, isBlocked, page = 1, limit = 15 } = req.query;
  const query = {};

  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { email: { $regex: keyword, $options: 'i' } },
    ];
  }

  if (role && role !== 'all') {
    query.role = role;
  }

  if (isBlocked !== undefined && isBlocked !== 'all') {
    query.isBlocked = isBlocked === 'true';
  }

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.json({
    users,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    total,
  });
};

// Admin: Get user by ID with summary of activity
export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const auctionsListed = await Auction.countDocuments({ seller: user._id });
  const totalBids = await Bid.countDocuments({ bidder: user._id });
  const auctionsWon = await Auction.countDocuments({ winner: user._id, status: 'ended' });

  res.json({
    ...user.toObject(),
    stats: {
      auctionsListed,
      totalBids,
      auctionsWon,
    },
  });
};

// Admin: Update user details or role
export const updateUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.role = req.body.role || user.role;
  user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
  user.address = req.body.address !== undefined ? req.body.address : user.address;

  const updatedUser = await user.save();
  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    phone: updatedUser.phone,
    address: updatedUser.address,
    isBlocked: updatedUser.isBlocked,
  });
};

// Admin: Toggle block / unblock user
export const toggleBlockUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Prevent blocking self
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: 'You cannot block your own admin account' });
  }

  user.isBlocked = !user.isBlocked;
  await user.save();

  res.json({
    message: `User successfully ${user.isBlocked ? 'blocked' : 'unblocked'}`,
    isBlocked: user.isBlocked,
  });
};

// Admin: Delete user
export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: 'You cannot delete your own admin account' });
  }

  await user.deleteOne();
  res.json({ message: 'User deleted successfully' });
};
