import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';
import Notification from '../models/Notification.js';
import Watchlist from '../models/Watchlist.js';

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/id_auction_db';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding INR data...');

    // Clear existing collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await Auction.deleteMany({});
    await Bid.deleteMany({});
    await Notification.deleteMany({});
    await Watchlist.deleteMany({});
    console.log('Cleared existing database records.');

    // 1. Create Users
    const adminPassword = 'Admin@12345';
    const userPassword = 'User@12345';

    const users = await User.create([
      {
        name: 'Platform Administrator',
        email: 'admin@auction.com',
        password: adminPassword,
        role: 'admin',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
        phone: '+91 98200 12345',
        address: 'Bandra Kurla Complex, Tower 4, Mumbai, Maharashtra',
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: userPassword,
        role: 'user',
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
        phone: '+91 98331 45678',
        address: 'Indiranagar 100ft Road, Bengaluru, Karnataka',
      },
      {
        name: 'Sarah Connor',
        email: 'sarah@example.com',
        password: userPassword,
        role: 'user',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
        phone: '+91 98450 78910',
        address: 'Jubilee Hills, Road No 36, Hyderabad, Telangana',
      },
      {
        name: 'Alex Rivera',
        email: 'alex@example.com',
        password: userPassword,
        role: 'user',
        profileImage: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=250&q=80',
        phone: '+91 98112 34567',
        address: 'Defence Colony, Block C, New Delhi, Delhi',
      },
    ]);

    const admin = users[0];
    const john = users[1];
    const sarah = users[2];
    const alex = users[3];

    console.log('Created Users.');

    // 2. Create Categories
    const categories = await Category.create([
      {
        name: 'Luxury Watches & Jewelry',
        description: 'Timepieces from Rolex, Patek Philippe, Audemars Piguet, and high fine jewelry.',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Classic & Exotic Vehicles',
        description: 'Vintage muscle cars, historic motorsports legends, and bespoke exotics.',
        image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Rare Collectibles & Art',
        description: 'Limited edition cards, vintage memorabilia, signed artwork, and museum pieces.',
        image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Electronics & Tech',
        description: 'Top-tier cameras, audio equipment, custom workstations, and premium gear.',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Antique Furniture & Decor',
        description: 'Authentic mid-century modern pieces, handcrafted oak desks, and Persian carpets.',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Designer Fashion & Bags',
        description: 'Hermès, Chanel, Louis Vuitton archival items, and haute couture pieces.',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
      },
    ]);

    console.log('Created Categories.');

    // 3. Create Auctions with realistic time offsets and INR prices
    const now = Date.now();
    const hr = 60 * 60 * 1000;
    const day = 24 * hr;

    const auctionData = [
      {
        title: 'Vintage Rolex Submariner Date 1680 (1974) "Red Sub"',
        description: 'An iconic vintage Rolex Submariner Ref. 1680 featuring the coveted single red line of text on the matte tritium dial. Original matching patina, stainless steel Oyster bracelet with diver extension, pristine unpolished bevels, and serviced caliber 1570 automatic movement. Comes with original inner and outer presentation box and archive papers.',
        images: [
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=800&q=80',
        ],
        category: categories[0]._id,
        startingPrice: 1250000, // ₹12,50,000
        currentBid: 1420000,    // ₹14,20,000
        minimumIncrement: 25000, // ₹25,000
        seller: admin._id,
        startTime: new Date(now - 2 * day),
        endTime: new Date(now + 3 * day),
        status: 'active',
        featured: true,
        bidCount: 4,
      },
      {
        title: '1967 Shelby GT500 Fastback - 428 Police Interceptor',
        description: 'Authentic 1967 Shelby GT500 finished in Nightmist Blue with Wimbledon White Le Mans stripes. Verified in the Shelby World Registry. Factory equipped with dual Holley four-barrel carburetors, Toploader 4-speed manual transmission, and power front disc brakes. Frame-off rotisserie restoration completed with full documentation.',
        images: [
          'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
        ],
        category: categories[1]._id,
        startingPrice: 14000000, // ₹1,40,00,000
        currentBid: 16500000,    // ₹1,65,00,000
        minimumIncrement: 250000,// ₹2,50,000
        seller: john._id, // John is seller!
        startTime: new Date(now - 1 * day),
        endTime: new Date(now + 4 * hr), // Ending soon!
        status: 'active',
        featured: true,
        bidCount: 5,
      },
      {
        title: 'Sony Alpha 1 Mirrorless Camera + FE 24-70mm f/2.8 GM II Kit',
        description: 'Flagship 50.1MP full-frame Exmor RS BSI CMOS sensor capable of 30 fps blackout-free continuous shooting and 8K 30p / 4K 120p 10-bit video. Includes the ultra-sharp G Master 24-70mm mark II zoom lens, two original batteries, dual charger, and 160GB CFexpress Type A card. Mint condition with under 2,000 shutter actuations.',
        images: [
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
        ],
        category: categories[3]._id,
        startingPrice: 380000,  // ₹3,80,000
        currentBid: 445000,     // ₹4,45,000
        minimumIncrement: 5000, // ₹5,000
        seller: sarah._id, // Sarah is seller!
        startTime: new Date(now - 3 * day),
        endTime: new Date(now + 1.5 * hr), // Ending very soon!
        status: 'active',
        featured: true,
        bidCount: 5,
      },
      {
        title: '1999 Pokémon Base Set 1st Edition Shadowless Charizard Holo PSA 9',
        description: 'The holy grail of Pokémon trading card collecting. Graded PSA 9 (Mint) condition. Crisp clean foil with vivid holographic star pattern, sharp corners, pristine edges, and excellent centering. Encapsulated in the tamper-evident PSA sonic welded holder with certification verification.',
        images: [
          'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
        ],
        category: categories[2]._id,
        startingPrice: 1450000, // ₹14,50,000
        currentBid: 1800000,    // ₹18,00,000
        minimumIncrement: 50000, // ₹50,000
        seller: john._id, // John is seller!
        startTime: new Date(now - 2 * day),
        endTime: new Date(now + 2 * day),
        status: 'active',
        featured: true,
        bidCount: 5,
      },
      {
        title: 'Hermès Birkin 30 Togo Leather in Gold with Palladium Hardware',
        description: 'Iconic Hermès Birkin 30 in highly sought-after Gold Togo calfskin leather with polished palladium hardware. Features tonal stitching, dual rolled handles, clochette, lock, two keys, raincoat, dustbag, and original orange box with ribbon. Stamp U (2022). Flawless condition, plastic seals still intact on hardware.',
        images: [
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
        ],
        category: categories[5]._id,
        startingPrice: 1350000, // ₹13,50,000
        currentBid: 1580000,    // ₹15,80,000
        minimumIncrement: 25000, // ₹25,000
        seller: admin._id,
        startTime: new Date(now - 12 * hr),
        endTime: new Date(now + 4 * day),
        status: 'active',
        featured: false,
        bidCount: 4,
      },
      {
        title: 'Antique 19th Century Hand-Knotted Silk Tabriz Persian Rug (9x12 ft)',
        description: 'Exquisite museum-grade antique Persian Tabriz masterwork from circa 1890. Woven with pure natural vegetable-dyed silk on silk foundation with over 600 knots per square inch. Central floral medallion surrounded by intricate Arabesque palmettes and a cobalt blue border. Exceptional condition with complete original fringes.',
        images: [
          'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
        ],
        category: categories[4]._id,
        startingPrice: 550000,  // ₹5,50,000
        currentBid: 620000,     // ₹6,20,000
        minimumIncrement: 10000,// ₹10,000
        seller: alex._id, // Alex is seller!
        startTime: new Date(now - 1 * day),
        endTime: new Date(now + 5 * day),
        status: 'active',
        featured: false,
        bidCount: 3,
      },
      {
        title: 'Leica M11 Rangefinder Digital Camera - Silver Chrome Finish',
        description: 'Triple Resolution full-frame BSI CMOS sensor (60MP / 36MP / 18MP) in classic silver chrome with brass top plate. Features Maestro III processor, 64GB internal storage, electronic shutter up to 1/16000s, USB-C tethering, and iconic optical rangefinder with 0.73x magnification. Like new in box with all accessories.',
        images: [
          'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
        ],
        category: categories[3]._id,
        startingPrice: 580000,  // ₹5,80,000
        currentBid: 640000,     // ₹6,40,000
        minimumIncrement: 10000,// ₹10,000
        seller: sarah._id, // Sarah is seller!
        startTime: new Date(now - 6 * hr),
        endTime: new Date(now + 3 * day),
        status: 'active',
        featured: false,
        bidCount: 2,
      },
      {
        title: 'Patek Philippe Nautilus 5711/1A-010 Stainless Steel Blue Dial',
        description: 'The legendary luxury sports watch designed by Gérald Genta. 40mm stainless steel case with the graduated horizontal embossed blue dial and luminescent white gold hour markers. Powered by caliber 324 S C with 21K gold rotor. Full collector set including Certificate of Origin, wooden case, and all booklets.',
        images: [
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
        ],
        category: categories[0]._id,
        startingPrice: 6800000, // ₹68,00,000
        currentBid: 7900000,    // ₹79,00,000
        minimumIncrement: 100000,// ₹1,00,000
        seller: admin._id,
        startTime: new Date(now - 4 * day),
        endTime: new Date(now + 1 * day),
        status: 'active',
        featured: true,
        bidCount: 5,
      },
      {
        title: 'Original Signed Oil on Canvas by Post-Impressionist Master',
        description: 'Authentic 1912 landscape painting rendered in rich impasto oils depicting the southern French coastline at dusk. Signed lower right, with gallery provenance labels from Paris and Zurich on the stretcher. Custom gilded 22-karat gold leaf carved wood frame.',
        images: [
          'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
        ],
        category: categories[2]._id,
        startingPrice: 750000,  // ₹7,50,000
        currentBid: 880000,     // ₹8,80,000
        minimumIncrement: 20000,// ₹20,000
        seller: john._id, // John is seller!
        startTime: new Date(now - 3 * day),
        endTime: new Date(now + 6 * day),
        status: 'active',
        featured: false,
        bidCount: 3,
      },
      {
        title: '1973 Porsche 911 Carrera RS 2.7 Lightweight (Tribute)',
        description: 'Meticulously engineered tribute to the fabled 1973 Ducktail Carrera RS. Built on a rust-free 1973 tub with lightweight body panels, mechanically injected 2.7L flat-six engine delivering 210 hp, 915 5-speed transmission, Fuchs wheels, and lightweight sport bucket seats in tartan upholstery.',
        images: [
          'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
        ],
        category: categories[1]._id,
        startingPrice: 5200000, // ₹52,00,000
        currentBid: 6150000,    // ₹61,50,000
        minimumIncrement: 75000,// ₹75,000
        seller: alex._id, // Alex is seller!
        startTime: new Date(now - 1 * day),
        endTime: new Date(now + 45 * 60 * 1000), // 45 minutes left!
        status: 'active',
        featured: true,
        bidCount: 7,
      },
      // Completed / Ended Auctions (to populate Won Auctions and Winners report)
      {
        title: 'Audemars Piguet Royal Oak Chronograph "Panda" 26331ST',
        description: 'Superb 41mm stainless steel Royal Oak Chronograph featuring silver-toned "Grande Tapisserie" dial with black counters. Powered by self-winding caliber 2385 with 40-hour power reserve. Winner received all boxes, warranty card, and additional rubber strap.',
        images: [
          'https://images.unsplash.com/photo-1547996160-71dfabbce5ed?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
        ],
        category: categories[0]._id,
        startingPrice: 3100000, // ₹31,00,000
        currentBid: 3650000,    // ₹36,50,000
        minimumIncrement: 50000,// ₹50,000
        seller: admin._id,
        startTime: new Date(now - 10 * day),
        endTime: new Date(now - 2 * day), // Ended 2 days ago
        status: 'ended',
        winner: john._id, // John won this!
        featured: false,
        bidCount: 5,
      },
      {
        title: 'Mid-Century Eames Lounge Chair & Ottoman in Santos Palisander',
        description: 'Authentic Herman Miller production Charles & Ray Eames lounge chair and matching ottoman. Configured with premium Santos Palisander wood veneer shell and supple black Edelman leather cushions. Mint showroom condition with authentic certificate medallion.',
        images: [
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
        ],
        category: categories[4]._id,
        startingPrice: 390000,  // ₹3,90,000
        currentBid: 460000,     // ₹4,60,000
        minimumIncrement: 5000, // ₹5,000
        seller: sarah._id, // Sarah is seller!
        startTime: new Date(now - 8 * day),
        endTime: new Date(now - 1 * day), // Ended yesterday
        status: 'ended',
        winner: alex._id, // Alex won this!
        featured: false,
        bidCount: 4,
      },
    ];

    const createdAuctions = await Auction.create(auctionData);
    console.log(`Created ${createdAuctions.length} Auctions in INR.`);

    // 4. Create Sample Bids for active and ended auctions
    const rolexAuction = createdAuctions[0];
    const shelbyAuction = createdAuctions[1];
    const cameraAuction = createdAuctions[2];
    const charizardAuction = createdAuctions[3];
    const porscheAuction = createdAuctions[9];
    const apAuction = createdAuctions[10]; // Ended, won by John
    const eamesAuction = createdAuctions[11]; // Ended, won by Alex

    // Bids on Rolex (seller is admin)
    await Bid.create([
      { auction: rolexAuction._id, bidder: john._id, amount: 1250000, createdAt: new Date(now - 36 * hr) },
      { auction: rolexAuction._id, bidder: sarah._id, amount: 1300000, createdAt: new Date(now - 24 * hr) },
      { auction: rolexAuction._id, bidder: alex._id, amount: 1375000, createdAt: new Date(now - 12 * hr) },
      { auction: rolexAuction._id, bidder: john._id, amount: 1420000, createdAt: new Date(now - 2 * hr) },
    ]);
    rolexAuction.winner = john._id;
    await rolexAuction.save();

    // Bids on Shelby (seller is john)
    await Bid.create([
      { auction: shelbyAuction._id, bidder: alex._id, amount: 14000000, createdAt: new Date(now - 20 * hr) },
      { auction: shelbyAuction._id, bidder: sarah._id, amount: 14500000, createdAt: new Date(now - 16 * hr) },
      { auction: shelbyAuction._id, bidder: alex._id, amount: 15250000, createdAt: new Date(now - 10 * hr) },
      { auction: shelbyAuction._id, bidder: sarah._id, amount: 15800000, createdAt: new Date(now - 6 * hr) },
      { auction: shelbyAuction._id, bidder: alex._id, amount: 16500000, createdAt: new Date(now - 1 * hr) },
    ]);
    shelbyAuction.winner = alex._id;
    await shelbyAuction.save();

    // Bids on Camera (seller is sarah)
    await Bid.create([
      { auction: cameraAuction._id, bidder: alex._id, amount: 390000, createdAt: new Date(now - 40 * hr) },
      { auction: cameraAuction._id, bidder: john._id, amount: 410000, createdAt: new Date(now - 20 * hr) },
      { auction: cameraAuction._id, bidder: alex._id, amount: 445000, createdAt: new Date(now - 3 * hr) },
    ]);
    cameraAuction.winner = alex._id;
    await cameraAuction.save();

    // Bids on Charizard (seller is john)
    await Bid.create([
      { auction: charizardAuction._id, bidder: sarah._id, amount: 1500000, createdAt: new Date(now - 30 * hr) },
      { auction: charizardAuction._id, bidder: alex._id, amount: 1650000, createdAt: new Date(now - 18 * hr) },
      { auction: charizardAuction._id, bidder: sarah._id, amount: 1800000, createdAt: new Date(now - 5 * hr) },
    ]);
    charizardAuction.winner = sarah._id;
    await charizardAuction.save();

    // Bids on Porsche (seller is alex)
    await Bid.create([
      { auction: porscheAuction._id, bidder: john._id, amount: 5350000, createdAt: new Date(now - 18 * hr) },
      { auction: porscheAuction._id, bidder: sarah._id, amount: 5650000, createdAt: new Date(now - 10 * hr) },
      { auction: porscheAuction._id, bidder: john._id, amount: 6150000, createdAt: new Date(now - 20 * 60 * 1000) },
    ]);
    porscheAuction.winner = john._id;
    await porscheAuction.save();

    // Bids on Ended AP Watch (John won)
    await Bid.create([
      { auction: apAuction._id, bidder: alex._id, amount: 3200000, createdAt: new Date(now - 7 * day) },
      { auction: apAuction._id, bidder: sarah._id, amount: 3400000, createdAt: new Date(now - 5 * day) },
      { auction: apAuction._id, bidder: john._id, amount: 3650000, createdAt: new Date(now - 3 * day) },
    ]);

    // Bids on Ended Eames Chair (Alex won, seller is sarah)
    await Bid.create([
      { auction: eamesAuction._id, bidder: john._id, amount: 400000, createdAt: new Date(now - 6 * day) },
      { auction: eamesAuction._id, bidder: alex._id, amount: 460000, createdAt: new Date(now - 2 * day) },
    ]);

    console.log('Created Bids.');

    // 5. Create Watchlist Entries
    await Watchlist.create([
      { user: john._id, auction: shelbyAuction._id },
      { user: john._id, auction: rolexAuction._id },
      { user: sarah._id, auction: cameraAuction._id },
      { user: sarah._id, auction: charizardAuction._id },
      { user: alex._id, auction: porscheAuction._id },
    ]);
    console.log('Created Watchlists.');

    // 6. Create Notifications in INR
    await Notification.create([
      {
        user: john._id,
        title: '🎉 Congratulations! You Won an Auction',
        message: 'You won the "Audemars Piguet Royal Oak Chronograph Panda" with a winning bid of ₹36,50,000.',
        type: 'won',
        link: `/auctions/${apAuction._id}`,
        isRead: false,
      },
      {
        user: sarah._id,
        title: 'You have been outbid!',
        message: `Alex placed a higher bid of ₹1,65,00,000 on "1967 Shelby GT500 Fastback".`,
        type: 'outbid',
        link: `/auctions/${shelbyAuction._id}`,
        isRead: false,
      },
      {
        user: alex._id,
        title: 'You are currently the highest bidder!',
        message: 'Your bid of ₹1,65,00,000 on "1967 Shelby GT500 Fastback" is in the lead.',
        type: 'bid',
        link: `/auctions/${shelbyAuction._id}`,
        isRead: true,
      },
      {
        user: alex._id,
        title: '🎉 Congratulations! You Won an Auction',
        message: 'You won the "Mid-Century Eames Lounge Chair & Ottoman" with a winning bid of ₹4,60,000.',
        type: 'won',
        link: `/auctions/${eamesAuction._id}`,
        isRead: false,
      },
    ]);
    console.log('Created Notifications in INR.');

    console.log('\n=============================================');
    console.log('SEEDING (INR) COMPLETED SUCCESSFULLY!');
    console.log('---------------------------------------------');
    console.log('Admin Account:');
    console.log('  Email:    admin@auction.com   | Password: Admin@12345');
    console.log('Normal User Accounts:');
    console.log('  Email:    john@example.com    | Password: User@12345');
    console.log('  Email:    sarah@example.com   | Password: User@12345');
    console.log('  Email:    alex@example.com    | Password: User@12345');
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
