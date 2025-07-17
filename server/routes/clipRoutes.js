// routes/clipRoutes.js
import express from 'express';
import { generateClip, downloadAndDelete } from '../controllers/clipController.js';

const router = express.Router();

router.post('/clip', generateClip);
router.get('/clip/download/:id', downloadAndDelete); // 👈 new route

export default router;
