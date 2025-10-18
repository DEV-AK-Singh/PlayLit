// src/controllers/spotifyController.ts 
import type { Request, Response } from 'express';
import { SpotifyService } from '../services/spotifyService.js';

export class SpotifyController {
  // For testing - we'll use a hardcoded access token
  // In production, this would come from the database
  private getAccessTokenFromHeader(req: Request): string {
    // First try to get from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Then try from query parameter (for testing)
    const tokenFromQuery = req.query.access_token as string;
    if (tokenFromQuery) {
      return tokenFromQuery;
    }

    throw new Error('Access token required. Use Authorization: Bearer <token> or access_token query parameter');
  }

  async getUserPlaylists(req: Request, res: Response) {
    try {
      const accessToken = this.getAccessTokenFromHeader(req);
      const limit = parseInt(req.query.limit as string) || 50;
      
      const spotifyService = new SpotifyService(accessToken);
      const playlists = await spotifyService.getUserPlaylists(limit);
      
      res.json({
        success: true,
        data: playlists,
        count: playlists.length
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async getPlaylistTracks(req: Request, res: Response) {
    try {
      const accessToken = this.getAccessTokenFromHeader(req);
      const { playlistId } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;
      
      if (!playlistId) {
        return res.status(400).json({
          success: false,
          error: 'Playlist ID is required'
        });
      }

      const spotifyService = new SpotifyService(accessToken);
      const tracks = await spotifyService.getPlaylistTracks(playlistId);
      
      res.json({
        success: true,
        data: tracks,
        count: tracks.length,
        playlistId
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async getLikedSongs(req: Request, res: Response) {
    try {
      const accessToken = this.getAccessTokenFromHeader(req);
      const limit = parseInt(req.query.limit as string) || 50;
      
      const spotifyService = new SpotifyService(accessToken);
      const tracks = await spotifyService.getLikedSongs(limit);
      
      res.json({
        success: true,
        data: tracks,
        count: tracks.length
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async searchTracks(req: Request, res: Response) {
    try {
      const accessToken = this.getAccessTokenFromHeader(req);
      const { q, limit } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Query parameter "q" is required'
        });
      }

      const spotifyService = new SpotifyService(accessToken);
      const tracks = await spotifyService.searchTracks(q as string, parseInt(limit as string) || 10);
      
      res.json({
        success: true,
        data: tracks,
        count: tracks.length,
        query: q
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async getUserProfile(req: Request, res: Response) {
    try {
      const accessToken = this.getAccessTokenFromHeader(req);
      
      const spotifyService = new SpotifyService(accessToken);
      const profile = await spotifyService.getUserProfile();
      
      res.json({
        success: true,
        data: profile
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}