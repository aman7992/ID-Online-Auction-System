import express from 'express';
import {
  getAuctions,
  getAuctionById,
  createAuction,
  updateAuction,
  deleteAuction,
  updateAuctionStatus,
  placeBid,
  toggleWatchlist,
  getMyWatchlist,
  getMySellerAuctions,
} from '../controllers/auctionController.js';
import { protect, adminOnly, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getAuctions)
  .post(protect, createAuction);

router.get('/watchlist', protect, getMyWatchlist);
router.get('/my-auctions', protect, getMySellerAuctions);

router.route('/:id')

  .get(optionalAuth, getAuctionById)
  .put(protect, updateAuction)
  .delete(protect, deleteAuction);

router.put('/:id/status', protect, adminOnly, updateAuctionStatus);
router.post('/:id/bid', protect, placeBid);
router.post('/:id/watchlist', protect, toggleWatchlist);

export default router;
