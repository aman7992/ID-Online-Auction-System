import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  toggleBlockUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/', getAllUsers);
router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);
router.put('/:id/block', toggleBlockUser);

export default router;
