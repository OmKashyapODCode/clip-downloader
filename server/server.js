import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import clipRoutes from './routes/clipRoutes.js';
import './jobs/cleanupClips.js'; // background job

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// __dirname fix for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from /clips (if used)
app.use('/clips', express.static(path.join(__dirname, 'clips')));

// API routes
app.use('/api', clipRoutes);

// Handle errors globally
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
