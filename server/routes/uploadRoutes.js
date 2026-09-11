import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

// File filter for image types only
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|webp/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, JPG, PNG, and WebP image formats are permitted'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max file size
  fileFilter,
});

// Single avatar image upload
router.post('/avatar', protect, upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please select an image file to upload' });
  }

  // Construct URL
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    message: 'Avatar uploaded successfully',
    url: fileUrl,
  });
});

// Multiple auction images upload
router.post('/auction-images', protect, upload.array('images', 8), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'Please select at least one image file' });
  }

  const urls = req.files.map((file) => `/uploads/${file.filename}`);
  res.json({
    message: `${urls.length} images uploaded successfully`,
    urls,
  });
});

export default router;
