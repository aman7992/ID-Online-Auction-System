# ID Online Auction System

A modern, production-grade real-time online auction platform built with **React.js, Vite, Tailwind CSS, Node.js, Express.js, MongoDB, and Socket.IO**.

---

## Key Features

- **Live Real-Time Bidding**: Instantaneous bid streaming via Socket.IO without page reload.
- **Dynamic Auction Countdown**: Synchronized server-validated countdown timers with automatic auction completion and winner determination.
- **Role-Based Portals**:
  - **Public / Bidder**: Explore live auctions, multi-filter search, watchlists, bid history, outbid alerts, won auctions tracker.
  - **Admin**: Executive analytics with Recharts, full auction CRUD with pause/resume/end controls, user moderation & blocking, global bids audit log, category management, winners registry, and financial reports.
- **Automated Expiration Engine**: Background scheduler that automatically closes ended auctions, awards the winning bidder, updates statuses, and dispatches real-time notifications.
- **Curated Luxury Aesthetic**: Rich slate and gold luxury color palette, glassmorphism panels, interactive galleries, and responsive design across desktop, tablet, and mobile.
- **Instant Demo Logins**: One-click demo credentials buttons on the login screen for immediate evaluation.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Recharts, Axios, Socket.IO Client |
| **Backend** | Node.js (ES Modules), Express.js, Socket.IO Server, Mongoose ODM |
| **Database** | MongoDB |
| **Security** | JWT (JSON Web Tokens), bcryptjs password hashing, role-based authorization |

---

## Demo Credentials

The database comes pre-seeded with rich realistic auctions, categories, bids, and demo users.

| Role | Email | Password |
|---|---|---|
| **Platform Administrator** | `admin@auction.com` | `Admin@12345` |
| **Standard User (John Doe)** | `john@example.com` | `User@12345` |
| **Standard User (Sarah Connor)** | `sarah@example.com` | `User@12345` |
| **Standard User (Alex Rivera)** | `alex@example.com` | `User@12345` |

*Tip: The Login page features one-click quick login buttons to sign in instantly as Admin or User!*

---

## Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **MongoDB**: Running locally on `mongodb://127.0.0.1:27017`

### 2. Installation

Install server dependencies:
```bash
cd server
npm install
```

Install client dependencies:
```bash
cd ../client
npm install
```

### 3. Environment Variables

Create `.env` in the `server` directory (already configured in `server/.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/id_auction_db
JWT_SECRET=super_secret_id_auction_jwt_key_2026_!@#$%^
CLIENT_URL=http://localhost:5173
```

### 4. Seed Demo Data

Populate categories, 12+ luxury auction lots with high-res photos, sample bids, watchlists, and notifications:
```bash
cd server
npm run seed
```

### 5. Running the Application

In terminal 1 (Backend Server):
```bash
cd server
npm start
```
*Backend runs on `http://localhost:5000`*

In terminal 2 (Frontend Client):
```bash
cd client
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## Architecture & API Endpoints

### Authentication
- `POST /api/auth/register` - Create new collector account
- `POST /api/auth/login` - Sign in and receive JWT token
- `GET /api/auth/me` - Get current session profile
- `PUT /api/auth/profile` - Update name, phone, shipping address, avatar
- `PUT /api/auth/password` - Change security password

### Auctions & Bidding
- `GET /api/auctions` - Search, filter by category, price, and status, sort, paginate
- `GET /api/auctions/:id` - Full auction lot details with image gallery and bid history
- `POST /api/auctions` - Create new auction (Consignor/Admin)
- `PUT /api/auctions/:id` - Update auction item details
- `DELETE /api/auctions/:id` - Remove auction item
- `PUT /api/auctions/:id/status` - Pause, resume, or end auction (Admin)
- `POST /api/auctions/:id/bid` - Place validated real-time bid
- `POST /api/auctions/:id/watchlist` - Toggle auction in user's watchlist
- `GET /api/auctions/watchlist` - Retrieve user's watchlisted items

### Bids & User History
- `GET /api/bids/my` - User's placed bids with standing status (`winning`, `outbid`, `won`, `lost`)
- `GET /api/bids/won` - Completed auctions won by current user
- `GET /api/bids/auction/:auctionId` - Bid history for specific lot
- `GET /api/bids/admin` - Global bids audit log (Admin)

### Administration & Analytics
- `GET /api/analytics/dashboard` - Platform KPIs, Recharts volume data, recent feeds
- `GET /api/analytics/winners` - Full registry of auction winners and settlement prices
- `GET /api/users` - User directory with role and status filters (Admin)
- `PUT /api/users/:id/block` - Toggle user account block/unblock (Admin)
- `GET /api/categories` - Category list with auction lot counts
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)
