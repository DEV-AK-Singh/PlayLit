import waitList from './waitlistUsers.json' with { type: 'json' };

import express, { raw } from 'express';
import cors from 'cors';
import axios from 'axios';
import { configDotenv } from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';

import { fileURLToPath } from 'url';

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;


// Middleware
configDotenv();
app.use(helmet({
    contentSecurityPolicy: false, // Adjust based on your needs
}));
app.use(compression());
app.use(morgan('combined')); // Use 'common' for production
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://playlit.space', 'https://playlit.space'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../frontend/dist')));
}

// Store tokens (in production, use a database)
let userTokens: Record<string, { access_token: string, refresh_token: string, expires_in: number, platform: string }> = {};

// Utility function to parse ISO 8601 duration
const parseDuration = (isoDuration: string): number => {
    if (!isoDuration || typeof isoDuration !== 'string') {
        return 0;
    }
    // Regex to capture the time components (hours, minutes, seconds)
    // The 'T' separates date and time, so we focus on the time part.
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = isoDuration.match(regex);
    if (!matches) {
        return 0; // Return a default for an invalid format
    }
    // Parse matched groups to integers, defaulting to 0 if not present
    const hours = parseInt(matches[1] || '0', 10);
    const minutes = parseInt(matches[2] || '0', 10);
    const seconds = parseInt(matches[3] || '0', 10);
    // Calculate the total duration in seconds
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    // In milliseconds
    return totalSeconds * 1000;
};

// Y1. Get YouTube Auth URL
app.get('/api/auth/youtube', (req, res) => {
    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const redirectUri = `${process.env.BACKEND_URL}/api/auth/youtube/callback`;
    const scopes = [
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtube.force-ssl',
        'https://www.googleapis.com/auth/youtubepartner'
    ].join(' ');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}&access_type=offline&prompt=consent`;
    res.json({
        success: true,
        authUrl
    });
});

// Y2. Handle YouTube Callback
app.get('/api/auth/youtube/callback', async (req, res) => {
    try {
        const { code, error } = req.query;
        if (error) {
            return res.redirect(`${process.env.FRONTEND_URL}?error=` + error);
        }
        if (!code) {
            return res.redirect(`${process.env.FRONTEND_URL}?error=no_code`);
        }
        const clientId = process.env.YOUTUBE_CLIENT_ID;
        const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token' +
            `?code=${code}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${process.env.BACKEND_URL}/api/auth/youtube/callback&grant_type=authorization_code`,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        const { access_token, refresh_token, expires_in } = tokenResponse.data;
        const tokenId = `yt_${Math.random().toString(36).substring(7)}`;
        userTokens[tokenId] = { access_token, refresh_token, expires_in, platform: 'youtube' };
        console.log(userTokens);
        res.redirect(`${process.env.FRONTEND_URL}?token=${tokenId}&platform=youtube`);
    } catch (error: any) {
        console.error('YouTube Auth error:', error.response?.data || error.message);
        res.redirect(`${process.env.FRONTEND_URL}?error=auth_error`);
    }
});

// Y3. Get YouTube Current User Profile
app.get('/api/youtube/me', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }
        const accessToken = userTokens[tokenId].access_token;
        const response = await axios.get('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        if (!response.data.items || response.data.items.length === 0) {
            return res.status(404).json({ error: 'No YouTube channel found' });
        }
        console.log(response.data);
        const channel = response.data.items[0];
        res.json({
            success: true,
            user: {
                id: channel.id,
                display_name: channel.snippet.title,
                description: channel.snippet.description,
                image: channel.snippet.thumbnails?.high?.url,
                subscribers: channel.statistics?.subscriberCount,
                video_count: channel.statistics?.videoCount,
                view_count: channel.statistics?.viewCount
            },
            raw_data: response.data
        });
    } catch (error: any) {
        console.error('YouTube API error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.error?.message || 'Failed to fetch user data'
        });
    }
});

// Y4. Get YouTube Current User Playlists
app.get('/api/youtube/me/playlists', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }
        const accessToken = userTokens[tokenId].access_token;
        const response = await axios.get('https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails,status&mine=true&maxResults=50',
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        console.log(response.data);
        const playlistsItems = response.data.items;
        const playlists = playlistsItems.map((item: any) => ({
            id: item.id,
            name: item.snippet.title,
            description: item.snippet.description,
            tracks: item.contentDetails.itemCount,
            image: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
            owner: item.snippet.channelTitle,
            privacy: item.status.privacyStatus,
            platform: 'youtube'
        }));
        res.json({
            success: true,
            data: playlists,
            raw_data: response.data,
            total: response.data.pageInfo.totalResults
        });
    } catch (error: any) {
        console.error('YouTube API error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.error?.message || 'Failed to fetch playlists'
        });
    }
});

// Y5. Get YouTube Playlist Tracks by ID
app.get('/api/youtube/me/playlists/:playlistId/tracks', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        const { playlistId } = req.params;
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }
        const accessToken = userTokens[tokenId].access_token;
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } });
        const tracks = await Promise.all(
            response.data.items.map(async (item: any) => {
                const video = item.snippet;
                let duration;
                try {
                    const videoResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${video.resourceId.videoId}`,
                        { headers: { 'Authorization': `Bearer ${accessToken}` } });
                    if (videoResponse.data.items[0]) {
                        const durationStr = videoResponse.data.items[0].contentDetails.duration;
                        duration = parseDuration(durationStr);
                    }
                } catch (error: any) {
                    console.error('Error fetching video duration:', error.message);
                }
                return {
                    id: video.resourceId.videoId,
                    name: video.title,
                    album: 'YouTube Music',
                    artist: video.videoOwnerChannelTitle || video.channelTitle || 'Unknown Artist',
                    image: video.thumbnails?.high?.url || video.thumbnails?.default?.url,
                    duration: duration,
                    platform: 'youtube',
                    platformUrl: `https://www.youtube.com/watch?v=${video.resourceId.videoId}`
                };
            })
        );
        res.json({
            success: true,
            data: tracks,
            total: response.data.pageInfo.totalResults,
            playlistId: playlistId,
            raw_data: response.data
        });
    } catch (error: any) {
        console.error('YouTube API error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.error?.message || 'Failed to fetch playlist tracks'
        });
    }
});

// Y6. Get YouTube Liked Tracks
app.get('/api/youtube/me/liked', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }
        const accessToken = userTokens[tokenId].access_token;
        const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=LM&maxResults=50', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const tracks = await Promise.all(
            response.data.items.map(async (item: any) => {
                const video = item.snippet;
                let duration;
                try {
                    const videoResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${video.resourceId.videoId}`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    });
                    if (videoResponse.data.items[0]) {
                        const durationStr = videoResponse.data.items[0].contentDetails.duration;
                        duration = parseDuration(durationStr);
                    }
                } catch (error: any) {
                    console.error('Error fetching video duration:', error.message);
                }
                return {
                    id: video.resourceId.videoId,
                    name: video.title,
                    album: 'YouTube Music',
                    artist: video.videoOwnerChannelTitle || video.channelTitle || 'Unknown Artist',
                    image: video.thumbnails?.high?.url || video.thumbnails?.default?.url,
                    duration: duration,
                    platform: 'youtube',
                    platformUrl: `https://www.youtube.com/watch?v=${video.resourceId.videoId}`
                };
            })
        );
        res.json({
            success: true,
            data: tracks,
            total: response.data.pageInfo.totalResults
        });
    } catch (error: any) {
        console.error('YouTube API error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.error?.message || 'Failed to fetch liked videos'
        });
    }
});

// Y7. Search YouTube Music
app.get('/api/youtube/me/search', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        const { q, limit: maxResults = 20 } = req.query;
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }
        if (!q) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }
        const accessToken = userTokens[tokenId].access_token;
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(q as string)}+music&maxResults=${maxResults}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const tracks = await Promise.all(
            response.data.items.map(async (item: any) => {
                const video = item.snippet;
                let duration;
                try {
                    const videoResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${item.id.videoId}`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    });
                    if (videoResponse.data.items[0]) {
                        const durationStr = videoResponse.data.items[0].contentDetails.duration;
                        duration = parseDuration(durationStr);
                    }
                } catch (error: any) {
                    console.error('Error fetching video duration:', error.message);
                }
                return {
                    id: item.id.videoId,
                    name: video.title,
                    album: 'YouTube Music',
                    artist: video.channelTitle,
                    image: video.thumbnails?.high?.url || video.thumbnails?.default?.url,
                    duration: duration,
                    platform: 'youtube',
                    platformUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
                };
            })
        );
        res.json({
            success: true,
            data: tracks,
            query: q,
            total: response.data.pageInfo.totalResults,
            raw_data: response.data
        });
    } catch (error: any) {
        console.error('YouTube API error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.error?.message || 'Failed to search videos'
        });
    }
});

// Y8. Create YouTube Playlist
app.post('/api/youtube/me/playlists', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        const { name, description = '', privacy = 'private' } = req.body;
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }
        if (!name) {
            return res.status(400).json({ error: 'Playlist name is required' });
        }
        const accessToken = userTokens[tokenId].access_token;
        const response = await axios.post('https://www.googleapis.com/youtube/v3/playlists?part=snippet,status',
            {
                snippet: {
                    title: name,
                    description: description
                },
                status: {
                    privacyStatus: privacy
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        const playlist = response.data;
        res.json({
            success: true,
            data: {
                id: playlist.id,
                name: playlist.snippet.title,
                description: playlist.snippet.description,
                tracks: 0,
                image: playlist.snippet.thumbnails?.default?.url,
                owner: playlist.snippet.channelTitle,
                privacy: playlist.status.privacyStatus,
                platform: 'youtube'
            },
            raw_data: response.data
        });
    } catch (error: any) {
        console.error('YouTube API error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.error?.message || 'Failed to create playlist'
        });
    }
});

// Y9. Add Track to YouTube Playlist
app.post('/api/youtube/me/playlists/:playlistId/track', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        const { playlistId } = req.params;
        const { videoId } = req.body;
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }
        if (!videoId) {
            return res.status(400).json({ error: 'Video ID is required' });
        }
        const accessToken = userTokens[tokenId].access_token;
        const response = await axios.post('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet',
            {
                snippet: {
                    playlistId: playlistId,
                    resourceId: {
                        kind: 'youtube#video',
                        videoId: videoId
                    }
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        res.json({
            success: true,
            data: response.data,
            message: 'Track added to playlist successfully!'
        });
    } catch (error: any) {
        console.error('YouTube API error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.error?.message || 'Failed to add track to playlist'
        });
    }
});

// Y10. Add Tracks to YouTube Playlist
app.post('/api/youtube/me/playlists/:playlistId/tracks', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        const { playlistId } = req.params;
        const { videoIds }: { videoIds: string[] } = req.body;
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }
        if (!videoIds) {
            return res.status(400).json({ error: 'Video IDs is required' });
        }
        const accessToken = userTokens[tokenId].access_token;
        const results = [];
        try {
            for (let i = 0; i < videoIds.length; i++) {
                const videoId = videoIds[i];
                const response = await axios.post('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet',
                    {
                        snippet: {
                            playlistId: playlistId,
                            resourceId: {
                                kind: 'youtube#video',
                                videoId: videoId
                            }
                        }
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                const trackData = response.data;
                results.push({ videoId, success: true, data: trackData });
                if (i < videoIds.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
            }
        } catch (error) {
            console.log(error);
            results.push({ success: false, error });
        }
        console.log(results);
        res.json({
            success: true,
            data: results,
            message: 'Tracks added to playlist successfully!'
        });
    } catch (error: any) {
        console.error('YouTube API error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.error?.message || 'Failed to add track to playlist'
        });
    }
});

// Y11. Delete Track from YouTube Playlist
app.delete('/api/youtube/me/playlists/:playlistId/tracks/:itemId', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        const { playlistId, itemId } = req.params;
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }
        const accessToken = userTokens[tokenId].access_token;
        await axios.delete(`https://www.googleapis.com/youtube/v3/playlistItems?id=${itemId}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        res.json({
            success: true,
            message: 'Track removed from playlist successfully!'
        });
    } catch (error: any) {
        console.error('YouTube API error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.error?.message || 'Failed to remove track from playlist'
        });
    }
});

// Y12. Delete Playlist
app.delete('/api/youtube/me/playlists/:id', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        const { id } = req.params;
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }
        const accessToken = userTokens[tokenId].access_token;
        await axios.delete(`https://www.googleapis.com/youtube/v3/playlists?id=${id}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        res.json({
            success: true,
            message: 'Playlist deleted successfully!'
        });
    } catch (error: any) {
        console.error('YouTube API error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.error?.message || 'Failed to delete playlist'
        });
    }
});

// S1. Get Spotify Auth URL
app.get('/api/auth/spotify', (req, res) => {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const redirectUri = `${process.env.BACKEND_URL}/api/auth/spotify/callback`;
    const scopes = [
        'user-read-private',
        'user-read-email',
        'user-library-modify',
        'user-library-read',
        'playlist-read-private',
        'playlist-read-collaborative',
        'playlist-modify-public',
        'playlist-modify-private'
    ].join(' ');
    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    res.json({
        success: true,
        authUrl
    });
});

// S2. Handle Spotify Callback
app.get('/api/auth/spotify/callback', async (req, res) => {
    try {
        const { code, error } = req.query;
        if (error) {
            return res.redirect(`${process.env.FRONTEND_URL}?error=${error}`);
        }
        if (!code) {
            return res.redirect(`${process.env.FRONTEND_URL}?error=no_code`);
        }
        const clientId = process.env.SPOTIFY_CLIENT_ID;
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
        const tokenResponse = await axios.post('https://accounts.spotify.com/api/token',
            `grant_type=authorization_code&code=${code}&redirect_uri=${process.env.BACKEND_URL}/api/auth/spotify/callback&client_id=${clientId}&client_secret=${clientSecret}`,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        const { access_token, refresh_token, expires_in } = tokenResponse.data;
        const tokenId = `st_${Math.random().toString(36).substring(7)}`;
        userTokens[tokenId] = { access_token, refresh_token, expires_in, platform: 'spotify' };
        res.redirect(`${process.env.FRONTEND_URL}?token=${tokenId}&platform=spotify`);
    } catch (error: any) {
        console.error('Spotify Auth error:', error.response?.data || error.message);
        res.redirect(`${process.env.FRONTEND_URL}?error=auth_error`);
    }
});

// S3. Get Spotify Current User Profile
app.get('/api/spotify/me', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }
        const accessToken = userTokens[tokenId].access_token;
        const response = await axios.get('https://api.spotify.com/v1/me',
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        console.log(response.data);
        const profile = response.data;
        res.json({
            success: true,
            user: {
                id: profile.id,
                display_name: profile.display_name,
                email: profile.email,
                country: profile.country,
                followers: profile.followers?.total,
                image: profile.images?.[0]?.url,
                product: profile.product
            },
            raw_data: response.data
        });
    } catch (error: any) {
        console.error('Spotify API error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.error?.message || 'Failed to fetch user data'
        });
    }
});

// S4. Get Spotify Current User Playlists
app.get('/api/spotify/me/playlists', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }
        const accessToken = userTokens[tokenId].access_token;
        const response: any = await axios.get('https://api.spotify.com/v1/me/playlists?limit=20', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        }
        );
        const playlistsItems = response.data.items;
        console.log(playlistsItems);
        const playlists = playlistsItems.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            tracks: item.tracks.total,
            image: item.images?.[0]?.url,
            owner: item.owner.display_name,
            privacy: item.public,
            platform: 'spotify'
        }));
        res.json({
            success: true,
            data: playlists,
            raw_data: response.data,
            total: response.data.total
        });
    } catch (error: any) {
        console.error('Spotify API error:', error.response?.data || error.message);
        res.status(400).json({
            error: error.response?.data?.error?.message || 'Failed to fetch playlists'
        });
    }
});

// S5. Get Spotify Playlist Tracks
app.get('/api/spotify/me/playlists/:id/tracks', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }
        const accessToken = userTokens[tokenId].access_token;
        const playlistId = req.params.id;
        const response: any = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        }
        );
        const tracks = response.data.items.map((item: any) => ({
            id: item.track.id,
            name: item.track.name,
            album: item.track.album.name,
            artist: item.track.artists.map((artist: any) => artist.name).join(', '),
            image: item.track.album.images?.[0]?.url,
            duration: item.track.duration_ms,
            platform: 'spotify',
            platformUrl: `https://open.spotify.com/track/${item.track.id}`
        }));
        res.json({
            success: true,
            data: tracks,
            total: response.data.total,
            playlistId: playlistId,
            raw_data: response.data
        });
    } catch (error: any) {
        console.error('Spotify API error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.error?.message || 'Failed to fetch playlist tracks'
        });
    }
});

// S6. Get Spotify Liked Tracks
app.get('/api/spotify/me/liked', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }
        const accessToken = userTokens[tokenId].access_token;
        const response: any = await axios.get('https://api.spotify.com/v1/me/tracks?limit=20', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        }
        );
        const tracksItems = response.data.items;
        const tracks = tracksItems.map((item: any) => ({
            id: item.track.id,
            name: item.track.name,
            album: item.track.album.name,
            artist: item.track.artists.map((artist: any) => artist.name).join(', '),
            image: item.track.album.images?.[0]?.url,
            duration: item.track.duration_ms,
            platform: 'spotify',
            platformUrl: `https://open.spotify.com/track/${item.track.id}`
        }));
        res.json({
            success: true,
            data: tracks,
            total: response.data.total,
            raw_data: response.data
        });
    } catch (error: any) {
        console.error('Spotify API error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.error?.message || 'Failed to fetch liked tracks'
        });
    }
});

// S7. Search Spotify Tracks
app.get('/api/spotify/me/search', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }
        const accessToken = userTokens[tokenId].access_token;
        const searchQuery = encodeURIComponent(req.query.query as string);
        const limit = req.query.limit || 20;
        const response: any = await axios.get(`https://api.spotify.com/v1/search?q=${searchQuery}&type=track&limit=${limit}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        }
        );
        const tracks = response.data.tracks.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            album: item.album.name,
            artist: item.artists.map((artist: any) => artist.name).join(', '),
            image: item.album.images?.[0]?.url,
            duration: item.duration_ms,
            platform: 'spotify',
            platformUrl: `https://open.spotify.com/track/${item.id}`
        }));
        res.json({
            success: true,
            data: tracks,
            query: searchQuery,
            total: response.data.total,
            raw_data: response.data
        });
    } catch (error: any) {
        console.error('Spotify API error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.error?.message || 'Failed to search tracks'
        });
    }
});

// S8. Create Spotify Playlist
app.post('/api/spotify/me/playlists', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }
        const accessToken = userTokens[tokenId].access_token;
        const response: any = await axios.post(`https://api.spotify.com/v1/users/${req.body.userId}/playlists`, {
            name: req.body.name,
            description: req.body.description,
            public: req.body.privacy
        }, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        }
        );
        res.json({
            success: true,
            data: {
                id: response.data.id,
                name: response.data.name,
                description: response.data.description,
                tracks: response.data.tracks.total,
                image: response.data.images?.[0]?.url,
                owner: response.data.owner.display_name,
                privacy: response.data.public,
                platform: 'spotify'
            },
            raw_data: response.data
        });
    } catch (error: any) {
        console.error('Spotify API error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.error?.message || 'Failed to create playlist'
        });
    }
});

// S9. Add Tracks to Spotify Playlist
app.post('/api/spotify/me/playlists/:id/tracks', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }
        const accessToken = userTokens[tokenId].access_token;
        const playlistId = req.params.id;
        const trackUris: string[] = req.body.trackUris;
        console.log(trackUris);
        const response: any = await axios.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            uris: trackUris.map((uri: string) => `spotify:track:${uri}`)
        }, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        }
        );
        console.log(response.data);
        res.json({
            success: true,
            data: response.data
        });
    } catch (error: any) {
        console.error('Spotify API error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.error?.message || 'Failed to add tracks to playlist'
        });
    }
});

// S10. Delete track from playlist
app.delete('/api/spotify/me/playlists/:id/tracks/:trackId', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }
        const accessToken = userTokens[tokenId].access_token;
        const playlistId = req.params.id;
        const trackId = req.params.trackId;
        const response: any = await axios.delete(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?uris=${trackId}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        }
        );
        res.json({
            success: true,
            data: response.data
        });
    } catch (error: any) {
        console.error('Spotify API error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.error?.message || 'Failed to delete track from playlist'
        });
    }
});

// S11. Delete tracks from playlist
app.delete('/api/spotify/me/playlists/:id/tracks', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }
        const accessToken = userTokens[tokenId].access_token;
        const playlistId = req.params.id;
        const trackUris: string[] = req.body.trackUris;
        console.log(trackUris);
        const response: any = await axios.delete(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            data: {
                tracks: trackUris.map((uri: string) => ({ uri: `spotify:track:${uri}` }))
            },
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
        });
        res.json({
            success: true,
            data: response.data
        });
    } catch (error: any) {
        console.error('Spotify API error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.error?.message || 'Failed to delete tracks from playlist'
        });
    }
});

// S12. Unfollow Playlist
app.delete('/api/spotify/me/playlists/:id/followers', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }
        const accessToken = userTokens[tokenId].access_token;
        const playlistId = req.params.id;
        const response: any = await axios.delete(`https://api.spotify.com/v1/playlists/${playlistId}/followers`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        }
        );
        res.json({
            success: true,
            data: response.data
        });
    } catch (error: any) {
        console.error('Spotify API error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.error?.message || 'Failed to unfollow playlist'
        });
    }
});

// Health endpoint
app.get('/api/health', (req, res) => {
    res.json({ success: true });
}); 

// Add a user to wait list json
app.post('/api/wait-list', async (req, res) => {
    try {
        const data = req.body;
        waitList.push({...data, timestamp: Date.now()});
        res.json({ success: true });
    } catch (error) {
        console.error('Error adding user to wait list:', error);
        res.status(500).json({ error: 'Failed to add user to wait list' });
    }
});

// Get wait list json
app.get('/api/wait-list', async (req, res) => {
    try {
        res.json(waitList);
    } catch (error) {
        console.error('Error getting wait list:', error);
        res.status(500).json({ error: 'Failed to get wait list' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});