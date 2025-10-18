// src/routes/spotify.ts
import { Router } from 'express';
import { SpotifyController } from '../controllers/spotifyController.js';

const router = Router();
const spotifyController = new SpotifyController();

// Get user's playlists
router.get('/playlists', (req, res) => spotifyController.getUserPlaylists(req, res));

// Get specific playlist tracks
router.get('/playlists/:playlistId/tracks', (req, res) => spotifyController.getPlaylistTracks(req, res));

// Get user's liked songs
router.get('/liked-songs', (req, res) => spotifyController.getLikedSongs(req, res));

// Search tracks
router.get('/search', (req, res) => spotifyController.searchTracks(req, res));

// Get user profile
router.get('/profile', (req, res) => spotifyController.getUserProfile(req, res));

export default router;