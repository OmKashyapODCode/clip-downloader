import express from 'express';
import {
  generateClip,
  downloadAndDelete
} from '../controllers/clipController.js';

const router = express.Router();

// Generate a new clip
router.post('/clip', generateClip);

// Download and delete by ID (⚠️ ensure no colon is missing!)
router.get('/clip/download/:id', downloadAndDelete);

export default router;
