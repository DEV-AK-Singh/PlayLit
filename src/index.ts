// Update src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';

// Load environment variables
dotenv.config();

// Import routes
// import authRoutes from './routes/auth';
// import playlistRoutes from './routes/playlists';
// import syncRoutes from './routes/sync';
import spotifyRoutes from './routes/spotify.js'; // Add this line

// Import middleware
// import { errorHandler } from './middleware/errorHandler';
// import { logger } from './middleware/logger';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
// app.use(logger);

// Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/playlists', playlistRoutes);
// app.use('/api/sync', syncRoutes);
app.use('/api/spotify', spotifyRoutes); // Add this line

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Spotify API endpoints are ready! Use /api/spotify/*'
  });
});

// Error handling
// app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🎵 Spotify API endpoints available at /api/spotify`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});

export default app;

// curl -X POST "https://accounts.spotify.com/api/token" -H "Content-Type: application/x-www-form-urlencoded" -d "grant_type=client_credentials&client_id=efa6d134f2c14cdb8ecaf0c61dfc42fd&client_secret=611023fc18d24d72a727aca85090cb24"