// src/services/spotifyService.ts
import axios from 'axios';

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string }>;
  };
  duration_ms: number;
  external_urls: { spotify: string };
  uri: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  tracks: {
    total: number;
    items: Array<{
      track: SpotifyTrack;
    }>;
  };
  images: Array<{ url: string }>;
  owner: { display_name: string };
}

export interface SimplifiedTrack {
  id: string;
  title: string;
  artists: string[];
  album: string;
  duration: number;
  imageUrl?: string;
  spotifyUrl: string;
  uri: string;
}

export interface SimplifiedPlaylist {
  id: string;
  name: string;
  description: string;
  trackCount: number;
  imageUrl?: string;
  owner: string;
}

export class SpotifyService {
  private baseURL = 'https://api.spotify.com/v1';

  constructor(private accessToken: string) {}

  private async makeRequest(endpoint: string) {
    try {
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Spotify API Error:', error.response?.data || error.message);
      throw new Error(`Spotify API failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Get user's playlists
  async getUserPlaylists(limit: number = 50): Promise<SimplifiedPlaylist[]> {
    const data = await this.makeRequest(`/users/zgbxhbdl4q4a1aws32p4f87qa/playlists?limit=${limit}`);
    
    return data.items.map((playlist: any) => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description || '',
      trackCount: playlist.tracks.total,
      imageUrl: playlist.images?.[0]?.url,
      owner: playlist.owner.display_name
    }));
  }

  // Get specific playlist with tracks
  async getPlaylistTracks(playlistId: string): Promise<SimplifiedTrack[]> {
    const data = await this.makeRequest(`/playlists/${playlistId}/tracks`);
    
    const tracks: SimplifiedTrack[] = data.items
      .filter((item: any) => item.track) // Filter out null tracks
      .map((item: any) => {
        const track = item.track;
        return {
          id: track.id,
          title: track.name,
          artists: track.artists.map((artist: any) => artist.name),
          album: track.album.name,
          duration: track.duration_ms,
          imageUrl: track.album.images?.[0]?.url,
          spotifyUrl: track.external_urls.spotify,
          uri: track.uri
        };
      });

    return tracks;
  }

  // Get user's liked songs
  async getLikedSongs(limit: number = 50): Promise<SimplifiedTrack[]> {
    const data = await this.makeRequest(`/me/tracks?limit=${limit}`);
    
    const tracks: SimplifiedTrack[] = data.items.map((item: any) => {
      const track = item.track;
      return {
        id: track.id,
        title: track.name,
        artists: track.artists.map((artist: any) => artist.name),
        album: track.album.name,
        duration: track.duration_ms,
        imageUrl: track.album.images?.[0]?.url,
        spotifyUrl: track.external_urls.spotify,
        uri: track.uri
      };
    });

    return tracks;
  }

  // Search for tracks (useful for matching later)
  async searchTracks(query: string, limit: number = 10): Promise<SimplifiedTrack[]> {
    const encodedQuery = encodeURIComponent(query);
    const data = await this.makeRequest(`/search?q=${encodedQuery}&type=track&limit=${limit}`);
    
    const tracks: SimplifiedTrack[] = data.tracks.items.map((track: any) => ({
      id: track.id,
      title: track.name,
      artists: track.artists.map((artist: any) => artist.name),
      album: track.album.name,
      duration: track.duration_ms,
      imageUrl: track.album.images?.[0]?.url,
      spotifyUrl: track.external_urls.spotify,
      uri: track.uri
    }));

    return tracks;
  }

  // Get user's profile
  async getUserProfile() {
    return await this.makeRequest('/users/zgbxhbdl4q4a1aws32p4f87qa');
  }
}