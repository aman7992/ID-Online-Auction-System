import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_id_auction_jwt_key_2026_!@#$%^', {
    expiresIn: '30d',
  });
};

export const registerUser = async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    phone: phone || '',
    address: address || '',
    role: 'user',
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      phone: user.phone,
      address: user.address,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data provided' });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (user.isBlocked) {
    return res.status(403).json({ message: 'Your account has been blocked by an administrator' });
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage,
    phone: user.phone,
    address: user.address,
    token: generateToken(user._id),
  });
};

export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      phone: user.phone,
      address: user.address,
      createdAt: user.createdAt,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

export const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.address = req.body.address !== undefined ? req.body.address : user.address;
    if (req.body.profileImage !== undefined) {
      user.profileImage = req.body.profileImage;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profileImage: updatedUser.profileImage,
      phone: updatedUser.phone,
      address: updatedUser.address,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Please provide current and new password' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }

  const user = await User.findById(req.user._id).select('+password');

  if (!user || !(await user.matchPassword(currentPassword))) {
    return res.status(400).json({ message: 'Incorrect current password' });
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: 'Password updated successfully' });
};
