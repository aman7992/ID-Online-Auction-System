import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Direct model imports for deep validation
import User from '../models/User.js';
import Category from '../models/Category.js';
import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';
import Notification from '../models/Notification.js';
import { checkExpiredAuctions } from '../services/auctionService.js';

const BASE_URL = 'http://localhost:5000/api';

async function runVerification() {
  console.log('--- Starting Comprehensive System Verification ---');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/id_auction_db';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB.');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // 1. Verify Users & Passwords
  console.log('\n1. Verifying Seed Users...');
  const admin = await User.findOne({ email: 'admin@auction.com' });
  assert(admin && admin.role === 'admin', 'Admin user exists with admin role');

  const john = await User.findOne({ email: 'john@example.com' });
  const sarah = await User.findOne({ email: 'sarah@example.com' });
  assert(john && sarah, 'Normal collectors exist in database');

  // 2. Test Currency & INR Format
  console.log('\n2. Verifying INR Currency & Indian Number Formatting...');
  const sampleAuction = await Auction.findOne({ status: 'active' });
  assert(sampleAuction.startingPrice > 0, `Auction starting price in INR: ₹${sampleAuction.startingPrice.toLocaleString('en-IN')}`);
  assert(sampleAuction.minimumIncrement > 0, `Auction min increment in INR: ₹${sampleAuction.minimumIncrement.toLocaleString('en-IN')}`);

  // 3. Test Authentication API
  console.log('\n3. Testing Auth API & Tokens...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'john@example.com', password: 'User@12345' }),
  });
  const loginData = await loginRes.json();
  assert(loginRes.ok && loginData.token, 'User John can log in and receives valid JWT');
  const johnToken = loginData.token;

  const sarahLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sarah@example.com', password: 'User@12345' }),
  });
  const sarahLoginData = await sarahLoginRes.json();
  assert(sarahLoginRes.ok && sarahLoginData.token, 'User Sarah can log in');
  const sarahToken = sarahLoginData.token;

  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@auction.com', password: 'Admin@12345' }),
  });
  const adminLoginData = await adminLoginRes.json();
  assert(adminLoginRes.ok && adminLoginData.token, 'Admin can log in');
  const adminToken = adminLoginData.token;

  // 4. Test Avatar Upload & Update Profile
  console.log('\n4. Testing Profile & Avatar Upload System...');
  // Update John's profileImage to an empty string (remove picture test)
  const removeAvatarRes = await fetch(`${BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${johnToken}`,
    },
    body: JSON.stringify({ profileImage: '' }),
  });
  const removeAvatarData = await removeAvatarRes.json();
  assert(removeAvatarRes.ok && removeAvatarData.profileImage === '', 'User can remove profile picture');

  // Restore avatar
  const restoreAvatarRes = await fetch(`${BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${johnToken}`,
    },
    body: JSON.stringify({ profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80' }),
  });
  const restoreAvatarData = await restoreAvatarRes.json();
  assert(restoreAvatarRes.ok && restoreAvatarData.profileImage.includes('unsplash'), 'User can update/change profile picture');

  // 5. Test User-Created Auction (Sell an Item)
  console.log('\n5. Testing User-Created Auction ("Sell an Item")...');
  const category = await Category.findOne({});
  assert(category, 'Category exists for creating lot');

  const createAuctionRes = await fetch(`${BASE_URL}/auctions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${johnToken}`,
    },
    body: JSON.stringify({
      title: 'Audemars Piguet Royal Oak Jumbo Extra-Thin Ref. 16202ST',
      description: 'Iconic stainless steel Petite Tapisserie dial luxury timepiece in pristine mint condition.',
      category: category._id,
      startingPrice: 6500000, // ₹65,00,000
      minimumIncrement: 100000, // ₹1,00,000
      startTime: new Date(),
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'],
    }),
  });
  const createdAuction = await createAuctionRes.json();
  assert(createAuctionRes.ok && createdAuction._id, `User John created auction ID: ${createdAuction._id}`);
  const sellerId = createdAuction.seller?._id || createdAuction.seller;
  assert(sellerId.toString() === john._id.toString(), 'Auction correctly records John as seller');
  assert(createdAuction.startingPrice === 6500000, 'Starting price stored correctly in INR');

  // 6. Test Ownership & Security: Self-Bidding Prevention
  console.log('\n6. Testing Security: Self-Bidding Prevention...');
  const selfBidRes = await fetch(`${BASE_URL}/auctions/${createdAuction._id}/bid`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${johnToken}`,
    },
    body: JSON.stringify({ amount: 6600000 }),
  });
  assert(selfBidRes.status === 400, 'Server blocked seller from placing bid on own auction (HTTP 400)');

  // 7. Test Bidding by Another User (Sarah)
  console.log('\n7. Testing Bidding Flow with Valid Increment...');
  const validBidRes = await fetch(`${BASE_URL}/auctions/${createdAuction._id}/bid`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sarahToken}`,
    },
    body: JSON.stringify({ amount: 6600000 }), // ₹66,00,000
  });
  const validBidData = await validBidRes.json();
  assert(validBidRes.ok && validBidData.currentBid === 6600000, `User Sarah placed valid bid of ₹${validBidData.currentBid.toLocaleString('en-IN')}`);
  assert(validBidData.bidCount === 1, 'Auction bidCount incremented to 1');

  // 8. Test Terms Lock When Bids Placed
  console.log('\n8. Testing Auction Terms Lock on Active Bids...');
  const lockUpdateRes = await fetch(`${BASE_URL}/auctions/${createdAuction._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${johnToken}`,
    },
    body: JSON.stringify({
      startingPrice: 7000000, // Try to alter starting price
    }),
  });
  assert(lockUpdateRes.status === 400, 'Server blocked altering starting price once bids are placed (HTTP 400)');

  // Test Non-Admin Delete Lock when Bids Placed
  const lockDeleteRes = await fetch(`${BASE_URL}/auctions/${createdAuction._id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${johnToken}`,
    },
  });
  assert(lockDeleteRes.status === 400, 'Server blocked non-admin deleting auction with active bids (HTTP 400)');

  // 9. Test Minimum Bid Validation with Indian Rupee Error Message
  console.log('\n9. Testing Minimum Bid Validation & Rupee Notification...');
  const invalidBidRes = await fetch(`${BASE_URL}/auctions/${createdAuction._id}/bid`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sarahToken}`,
    },
    body: JSON.stringify({ amount: 6650000 }), // Less than ₹67,00,000 required
  });
  const invalidBidData = await invalidBidRes.json();
  assert(invalidBidRes.status === 400, 'Server rejected under-increment bid');
  assert(invalidBidData.message.includes('₹'), `Error message uses Indian Rupee symbol: "${invalidBidData.message}"`);

  // 10. Test Notifications in INR
  console.log('\n10. Testing Notifications Created in INR...');
  const johnNotifications = await Notification.find({ user: john._id }).sort({ createdAt: -1 });
  assert(johnNotifications.length > 0, `Seller John received ${johnNotifications.length} notification(s)`);
  const recentNotif = johnNotifications[0];
  assert(recentNotif.message.includes('₹'), `Notification message includes INR symbol: "${recentNotif.message}"`);

  // 11. Test My Auctions API for Seller
  console.log('\n11. Testing Seller "My Auctions" Endpoint...');
  const myAuctionsRes = await fetch(`${BASE_URL}/auctions/my-auctions`, {
    headers: { Authorization: `Bearer ${johnToken}` },
  });
  const myAuctionsData = await myAuctionsRes.json();
  assert(myAuctionsRes.ok && myAuctionsData.length > 0, `Seller John retrieved ${myAuctionsData.length} auctions from /my-auctions`);
  const foundCreated = myAuctionsData.find((a) => a._id === createdAuction._id);
  assert(foundCreated !== undefined, 'Created lot appears in Seller My Auctions list');

  // 12. Test Auction Expiration Background Worker
  console.log('\n12. Testing Auction Expiration Worker & Winner Resolution...');
  // Create an expired auction
  const expiredLot = await Auction.create({
    title: 'Rare Vintage Moncler Down Jacket (Archive 1988)',
    description: 'Archive piece with verified authenticity certificate.',
    category: category._id,
    startingPrice: 85000,
    currentBid: 95000,
    minimumIncrement: 5000,
    startTime: new Date(Date.now() - 3 * 24 * 3600 * 1000),
    endTime: new Date(Date.now() - 1000), // Already passed
    status: 'active',
    seller: john._id,
    bidCount: 1,
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80'],
  });

  await Bid.create({
    auction: expiredLot._id,
    bidder: sarah._id,
    amount: 95000,
  });

  // Run the background service function directly
  await checkExpiredAuctions();

  const refreshedLot = await Auction.findById(expiredLot._id);
  assert(refreshedLot.status === 'ended', 'Expired auction status transitioned to "ended"');
  assert(refreshedLot.winner && refreshedLot.winner.toString() === sarah._id.toString(), 'Highest bidder Sarah declared as winner');

  // Verify Sarah got winning notification
  const sarahNotifs = await Notification.find({ user: sarah._id, link: `/auctions/${expiredLot._id}` });
  assert(sarahNotifs.length > 0, 'Winner received notification of victory in INR');
  assert(sarahNotifs[0].message.includes('₹95,000'), `Winner notification includes ₹95,000: "${sarahNotifs[0].message}"`);

  // 13. Test Admin Analytics & Gross Hammer Value
  console.log('\n13. Testing Admin Analytics & Dashboard Data...');
  const analyticsRes = await fetch(`${BASE_URL}/analytics/dashboard`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const analyticsData = await analyticsRes.json();
  assert(analyticsRes.ok && analyticsData.kpis, 'Admin successfully fetched analytics dashboard data');
  assert(analyticsData.kpis.totalAuctionValue > 0, `Platform gross hammer value in INR: ₹${analyticsData.kpis.totalAuctionValue.toLocaleString('en-IN')}`);

  // 14. Test Block User Security
  console.log('\n14. Testing Block User Security...');
  await User.updateOne({ email: 'alex@example.com' }, { isBlocked: false });
  const alex = await User.findOne({ email: 'alex@example.com' });
  
  // Alex logs in before being blocked to get a token
  const alexPreLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alex@example.com', password: 'User@12345' }),
  });
  const alexPreLogin = await alexPreLoginRes.json();
  assert(alexPreLoginRes.ok && alexPreLogin.token, 'Alex can log in before being blocked');

  // Admin blocks Alex
  const blockRes = await fetch(`${BASE_URL}/users/${alex._id}/block`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const blockData = await blockRes.json();
  assert(blockRes.ok && blockData.isBlocked === true, 'Admin successfully blocked user Alex');

  // Alex attempts to bid using existing token
  const blockedBidRes = await fetch(`${BASE_URL}/auctions/${createdAuction._id}/bid`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${alexPreLogin.token}`,
    },
    body: JSON.stringify({ amount: 7000000 }),
  });
  assert(blockedBidRes.status === 403, 'Active token of blocked user is rejected with HTTP 403');

  // Alex attempts to login while blocked
  const alexBlockedLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alex@example.com', password: 'User@12345' }),
  });
  assert(alexBlockedLoginRes.status === 403, 'Blocked user cannot log in (HTTP 403)');

  // Unblock Alex
  await fetch(`${BASE_URL}/users/${alex._id}/block`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  // Clean up test auctions
  await Auction.findByIdAndDelete(createdAuction._id);
  await Auction.findByIdAndDelete(expiredLot._id);
  await Bid.deleteMany({ auction: { $in: [createdAuction._id, expiredLot._id] } });

  console.log(`\n==============================================`);
  console.log(`ALL TESTS PASSED: ${passedTests} / ${totalTests} checks verified!`);
  console.log(`==============================================`);

  await mongoose.disconnect();
  process.exit(0);
}

runVerification().catch((err) => {
  console.error('Verification failed with error:', err);
  process.exit(1);
});
