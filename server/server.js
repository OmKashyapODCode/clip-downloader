import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './src/config/db.js';
import clipRoutes from './src/routes/clipRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import './src/jobs/cleanupClips.js';

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

// Serve static clips (if used)
app.use('/clips', express.static(path.join(__dirname, 'clips')));

// API routes
app.use('/api', clipRoutes);

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling
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
