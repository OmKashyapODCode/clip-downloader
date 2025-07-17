import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import clipRoutes from './routes/clipRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import './jobs/cleanupClips.js'; // ✅ Start auto-delete cron job

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/clips', express.static(path.join(__dirname, 'clips')));
app.use('/api', clipRoutes);


process.on('uncaughtException', err => {
  console.error('🔥 Uncaught Exception:', err.message);
});

process.on('unhandledRejection', err => {
  console.error('🔥 Unhandled Promise Rejection:', err);
});


// Server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
