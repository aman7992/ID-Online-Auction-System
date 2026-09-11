import express from 'express';
import {
  getMyBids,
  getWonAuctions,
  getAuctionBids,
  getAllBidsAdmin,
} from '../controllers/bidController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my', protect, getMyBids);
router.get('/won', protect, getWonAuctions);
router.get('/auction/:auctionId', getAuctionBids);
router.get('/admin', protect, adminOnly, getAllBidsAdmin);

export default router;
