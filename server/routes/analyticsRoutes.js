import express from 'express';
import {
  getAdminDashboardStats,
  getAllWinners,
} from '../controllers/analyticsController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/dashboard', getAdminDashboardStats);
router.get('/winners', getAllWinners);

export default router;
