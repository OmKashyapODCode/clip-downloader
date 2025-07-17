import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import clipRoutes from './routes/clipRoutes.js';
import './jobs/cleanupClips.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// __dirname fix for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:5500', 'https://youtube-clip-downloader-q9hj.onrender.com']
}));

app.use(express.json());

// Serve frontend from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve clips statically if needed
app.use('/clips', express.static(path.join(__dirname, 'clips')));

// API routes
app.use('/api', clipRoutes);

// Fallback route for any unknown routes (single page app support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handlers
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err.message);
});

process.on('unhandledRejection', err => {
  console.error('Unhandled Promise Rejection:', err);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
