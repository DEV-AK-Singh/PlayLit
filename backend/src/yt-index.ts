import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { configDotenv } from 'dotenv';

const app = express();
const PORT = 5000;

configDotenv();

// Middleware
app.use(cors());
app.use(express.json());

// Store tokens (in production, use a database)
let userTokens : Record<string, { access_token: string, refresh_token: string, expires_in: number, platform: string }> = {};

// 1. Get YouTube Auth URL
app.get('/api/auth/youtube', (req, res) => {
    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const redirectUri = 'http://localhost:5000/api/auth/youtube/callback';
    
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

// 2. Handle YouTube Callback
app.get('/api/auth/youtube/callback', async (req, res) => {
    try {
        const { code, error } = req.query;
        
        if (error) {
            return res.redirect('http://localhost:3000?error=' + error);
        }

        if (!code) {
            return res.redirect('http://localhost:3000?error=no_code');
        }

        const clientId = process.env.YOUTUBE_CLIENT_ID;
        const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
        
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token'+
            `?code=${code}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=http://localhost:5000/api/auth/youtube/callback&grant_type=authorization_code`, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { access_token, refresh_token, expires_in } = tokenResponse.data;
        
        const tokenId = `yt_${Math.random().toString(36).substring(7)}`;
        userTokens[tokenId] = { 
            access_token, 
            refresh_token,
            expires_in,
            platform: 'youtube'
        };
        
        res.redirect(`http://localhost:3000?token=${tokenId}&platform=youtube`);
        
    } catch (error : any) {
        console.error('YouTube Auth error:', error.response?.data || error.message);
        res.redirect('http://localhost:3000?error=auth_failed');
    }
});

// 3. Get YouTube User Profile
app.get('/api/me', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }

        const accessToken = userTokens[tokenId].access_token;
        
        // Get channel info
        const response = await axios.get('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.data.items || response.data.items.length === 0) {
            return res.status(404).json({ error: 'No YouTube channel found' });
        }

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
            }
        });

    } catch (error : any) {
        console.error('YouTube API error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.error?.message || 'Failed to fetch user data'
        });
    }
});

// 4. Get YouTube Music Playlists
app.get('/api/playlists', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }

        const accessToken = userTokens[tokenId].access_token;
        
        const response = await axios.get('https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails,status&mine=true&maxResults=50', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const playlists = response.data.items.map((playlist: { id: any; snippet: { title: any; description: any; thumbnails: { high: { url: any; }; default: { url: any; }; }; channelTitle: any; publishedAt: any; }; contentDetails: { itemCount: any; }; status: { privacyStatus: any; }; }) => ({
            id: playlist.id,
            name: playlist.snippet.title,
            description: playlist.snippet.description,
            tracks: playlist.contentDetails.itemCount,
            image: playlist.snippet.thumbnails?.high?.url || playlist.snippet.thumbnails?.default?.url,
            owner: playlist.snippet.channelTitle,
            privacy: playlist.status.privacyStatus,
            created_at: playlist.snippet.publishedAt,
            platform: 'youtube'
        }));

        res.json({
            success: true,
            data: playlists,
            total: response.data.pageInfo.totalResults
        });

    } catch (error : any) {
        console.error('YouTube API error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.error?.message || 'Failed to fetch playlists'
        });
    }
});

// 5. Get YouTube Playlist Tracks
app.get('/api/playlists/:playlistId/tracks', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        const { playlistId } = req.params;
        
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }

        const accessToken = userTokens[tokenId].access_token;
        
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const tracks = await Promise.all(
            response.data.items.map(async (item : any) => {
                const video = item.snippet;
                
                // Get video duration
                let duration = 0;
                try {
                    const videoResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${video.resourceId.videoId}`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    });
                    
                    if (videoResponse.data.items[0]) {
                        const durationStr = videoResponse.data.items[0].contentDetails.duration;
                        // Convert ISO 8601 duration to seconds
                        duration = parseDuration(durationStr);
                    }
                } catch (error : any) {
                    console.error('Error fetching video duration:', error.message);
                }

                return {
                    id: item.id,
                    videoId: video.resourceId.videoId,
                    title: video.title,
                    artists: [video.videoOwnerChannelTitle || video.channelTitle || 'Unknown Artist'],
                    album: 'YouTube Music',
                    duration: duration,
                    image: video.thumbnails?.high?.url || video.thumbnails?.default?.url,
                    platformUrl: `https://www.youtube.com/watch?v=${video.resourceId.videoId}`,
                    platform: 'youtube',
                    added_at: video.publishedAt,
                    description: video.description
                };
            })
        );

        res.json({
            success: true,
            data: tracks,
            total: response.data.pageInfo.totalResults,
            playlistId: playlistId
        });

    } catch (error : any) {
        console.error('YouTube API error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.error?.message || 'Failed to fetch playlist tracks'
        });
    }
});

// 6. Get YouTube Liked Videos (Music)
app.get('/api/liked', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }

        const accessToken = userTokens[tokenId].access_token;
        
        // Get liked videos playlist (special ID: LM)
        const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=LM&maxResults=50', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const tracks = await Promise.all(
            response.data.items.map(async (item : any) => {
                const video = item.snippet;
                
                // Get video duration
                let duration = 0;
                try {
                    const videoResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${video.resourceId.videoId}`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    });
                    
                    if (videoResponse.data.items[0]) {
                        const durationStr = videoResponse.data.items[0].contentDetails.duration;
                        duration = parseDuration(durationStr);
                    }
                } catch (error : any) {
                    console.error('Error fetching video duration:', error.message);
                }

                return {
                    id: item.id,
                    videoId: video.resourceId.videoId,
                    title: video.title,
                    artists: [video.videoOwnerChannelTitle || video.channelTitle || 'Unknown Artist'],
                    album: 'YouTube Music',
                    duration: duration,
                    image: video.thumbnails?.high?.url || video.thumbnails?.default?.url,
                    platformUrl: `https://www.youtube.com/watch?v=${video.resourceId.videoId}`,
                    platform: 'youtube',
                    added_at: video.publishedAt
                };
            })
        );

        res.json({
            success: true,
            data: tracks,
            total: response.data.pageInfo.totalResults
        });

    } catch (error : any) {
        console.error('YouTube API error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.error?.message || 'Failed to fetch liked videos'
        });
    }
});

// 7. Search YouTube Music
app.get('/api/search', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        const { q, maxResults = 20 } = req.query;
        
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }

        if (!q) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        const accessToken = userTokens[tokenId].access_token;
        
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(q as string)}+music&maxResults=${maxResults}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const tracks = await Promise.all(
            response.data.items.map(async (item : any) => {
                const video = item.snippet;
                
                // Get video duration
                let duration = 0;
                try {
                    const videoResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${item.id.videoId}`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    });
                    
                    if (videoResponse.data.items[0]) {
                        const durationStr = videoResponse.data.items[0].contentDetails.duration;
                        duration = parseDuration(durationStr);
                    }
                } catch (error : any) {
                    console.error('Error fetching video duration:', error.message);
                }

                return {
                    id: item.id.videoId,
                    title: video.title,
                    artists: [video.channelTitle],
                    album: 'YouTube Music',
                    duration: duration,
                    image: video.thumbnails?.high?.url || video.thumbnails?.default?.url,
                    platformUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                    platform: 'youtube',
                    description: video.description,
                    published_at: video.publishedAt
                };
            })
        );

        res.json({
            success: true,
            data: tracks,
            query: q,
            total: response.data.pageInfo.totalResults
        });

    } catch (error : any) {
        console.error('YouTube API error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.error?.message || 'Failed to search videos'
        });
    }
});

// 8. Create YouTube Playlist
app.post('/api/playlists', async (req, res) => {
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
            message: 'Playlist created successfully!'
        });

    } catch (error : any) {
        console.error('YouTube API error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.error?.message || 'Failed to create playlist'
        });
    }
});

// 9. Add Track to YouTube Playlist
app.post('/api/playlists/:playlistId/tracks', async (req, res) => {
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

    } catch (error : any) {
        console.error('YouTube API error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.error?.message || 'Failed to add track to playlist'
        });
    }
});

// 10. Delete Track from YouTube Playlist
app.delete('/api/playlists/:playlistId/tracks/:itemId', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        const { playlistId, itemId } = req.params;
        
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }

        const accessToken = userTokens[tokenId].access_token;
        
        await axios.delete(`https://www.googleapis.com/youtube/v3/playlistItems?id=${itemId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        res.json({
            success: true,
            message: 'Track removed from playlist successfully!'
        });

    } catch (error : any) {
        console.error('YouTube API error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.error?.message || 'Failed to remove track from playlist'
        });
    }
});

// Utility function to parse ISO 8601 duration
function parseDuration(duration: string) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/); 
    if (!match) return 0; 
    const hours = (match[1] ? parseInt(match[1]) : 0);
    const minutes = (match[2] ? parseInt(match[2]) : 0);
    const seconds = (match[3] ? parseInt(match[3]) : 0); 
    return hours * 3600 + minutes * 60 + seconds;
}

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true,
        status: 'OK', 
        message: 'YouTube Music API is running!',
        platform: 'YouTube Music',
        endpoints: [
            'GET /api/auth/youtube - Start OAuth flow',
            'GET /api/me - Get user profile',
            'GET /api/playlists - Get user playlists',
            'GET /api/playlists/:id/tracks - Get playlist tracks',
            'GET /api/liked - Get liked videos',
            'GET /api/search?q=query - Search music',
            'POST /api/playlists - Create playlist',
            'POST /api/playlists/:id/tracks - Add track to playlist',
            'DELETE /api/playlists/:id/tracks/:itemId - Remove track from playlist'
        ]
    });
});

app.listen(PORT, () => {
    console.log(`🎵 YouTube Music API running on http://localhost:${PORT}`);
    console.log(`🔐 Make sure to set YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET environment variables`);
});