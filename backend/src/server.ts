import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { configDotenv } from 'dotenv';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
configDotenv();
app.use(cors());
app.use(express.json());

// Store tokens (in production, use a database)
let userTokens : Record<string, { access_token: string, refresh_token: string, expires_in: number, platform: string }> = {};

// Utility function to parse ISO 8601 duration
function parseDuration(duration: string) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/); 
    if (!match) return 0; 
    const hours = (match[1] ? parseInt(match[1]) : 0);
    const minutes = (match[2] ? parseInt(match[2]) : 0);
    const seconds = (match[3] ? parseInt(match[3]) : 0); 
    return hours * 3600 + minutes * 60 + seconds;
}

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
            return res.redirect('http://localhost:3000?error=' + error);
        } 
        if (!code) {
            return res.redirect('http://localhost:3000?error=no_code');
        } 
        const clientId = process.env.YOUTUBE_CLIENT_ID;
        const clientSecret = process.env.YOUTUBE_CLIENT_SECRET; 
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token'+
            `?code=${code}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=http://localhost:5000/api/auth/youtube/callback&grant_type=authorization_code`, 
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        ); 
        const { access_token, refresh_token, expires_in } = tokenResponse.data; 
        const tokenId = `yt_${Math.random().toString(36).substring(7)}`;
        userTokens[tokenId] = { access_token, refresh_token, expires_in, platform: 'youtube' }; 
        res.redirect(`${process.env.FRONTEND_URL}?token=${tokenId}&platform=youtube`);
    } catch (error : any) {
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
        // Get channel info
        const response = await axios.get('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', 
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        ); 
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
        const playlistsItems = response.data.items;
        const playlists = playlistsItems.map((item : any) => ({
            id: item.id,
            name: item.snippet.title,
            description: item.snippet.description,
            tracks: item.contentDetails.itemCount,
            image: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
            owner: item.snippet.channelTitle,
            privacy: item.status.privacyStatus,
            created_at: item.snippet.publishedAt,
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
            { headers: { 'Authorization': `Bearer ${accessToken}` }});
        const tracks = await Promise.all(
            response.data.items.map(async (item : any) => {
                const video = item.snippet;
                let duration = 0;
                try {
                    const videoResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${video.resourceId.videoId}`, 
                        { headers: { 'Authorization': `Bearer ${accessToken}`}});
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

// Y6. Get YouTube Liked Tracks
app.get('/api/youtube/me/liked', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }
        const accessToken = userTokens[tokenId].access_token;
        const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=LM&maxResults=50', {
            headers: { 'Authorization': `Bearer ${accessToken}` }});
        const tracks = await Promise.all(
            response.data.items.map(async (item : any) => {
                const video = item.snippet; 
                let duration = 0;
                try {
                    const videoResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${video.resourceId.videoId}`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` }});
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

// Y7. Search YouTube Music
app.get('/api/youtube/me/search', async (req, res) => {
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
            headers: { 'Authorization': `Bearer ${accessToken}` }});
        const tracks = await Promise.all(
            response.data.items.map(async (item : any) => {
                const video = item.snippet;
                let duration = 0;
                try {
                    const videoResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${item.id.videoId}`, {
                        headers: { 'Authorization': `Bearer ${accessToken}`}});
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
            } 
        }); 
    } catch (error : any) {
        console.error('YouTube API error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.error?.message || 'Failed to create playlist'
        });
    }
});

// Y9. Add Tracks to YouTube Playlist
app.post('/api/youtube/me/playlists/:playlistId/tracks', async (req, res) => {
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

// Y10. Delete Track from YouTube Playlist
app.delete('/api/youtube/me/playlists/:playlistId/tracks/:itemId', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        const { playlistId, itemId } = req.params; 
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        } 
        const accessToken = userTokens[tokenId].access_token; 
        await axios.delete(`https://www.googleapis.com/youtube/v3/playlistItems?id=${itemId}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }});
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
            }
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
        const response : any = await axios.get('https://api.spotify.com/v1/me/playlists?limit=20', {
            headers: { 'Authorization': `Bearer ${accessToken}` } }
        ); 
        const playlistsItems = response.data.items;  
        const playlists = playlistsItems.map((item : any) => ({
            id: item.id,
            name: item.name,
            image: item.images?.[0]?.url,
            owner: {
                id: item.owner.id,
                display_name: item.owner.display_name,
                image: item.owner.images?.[0]?.url
            }
        }));  
        res.json({
            success: true,
            data: playlists,
            total: response.data.total
        }); 
    } catch (error : any) {
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
        const response : any = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`, {
            headers: { 'Authorization': `Bearer ${accessToken}` } }
        ); 
        const tracks = response.data.items.map((item : any) => ({
            id: item.track.id,
            name: item.track.name,
            image: item.track.album.images?.[0]?.url,
            href: item.track.href,
            duration: item.track.duration_ms,
            artists: item.track.artists.map((artist : any) => ({
                id: artist.id,
                name: artist.name,
                image: artist.images?.[0]?.url
            }))
        }));  
        res.json({
            success: true,
            data:tracks,
            total: response.data.total,
            playlistId: playlistId
        }); 
    } catch (error : any) {
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
        const response : any = await axios.get('https://api.spotify.com/v1/me/tracks?limit=20', {
            headers: { 'Authorization': `Bearer ${accessToken}` } }
        ); 
        const tracksItems = response.data.items; 
        const tracks = tracksItems.map((item : any) => ({
            id: item.track.id,
            name: item.track.name,
            image: item.track.album.images?.[0]?.url,
            href: item.track.href,
            duration: item.track.duration_ms,
            artists: item.track.artists.map((artist : any) => ({
                id: artist.id,
                name: artist.name,
                image: artist.images?.[0]?.url
            }))
        }));  
        res.json({
            success: true,
            data: tracks,
            total: response.data.total
        }); 
    } catch (error : any) {
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
        const response : any = await axios.get(`https://api.spotify.com/v1/search?q=${searchQuery}&type=track&limit=20`, {
            headers: { 'Authorization': `Bearer ${accessToken}` } }
        ); 
        const tracks = response.data.tracks.items.map((item : any) => ({
            id: item.id,
            name: item.name,
            image: item.album.images?.[0]?.url,
            href: item.href,
            duration: item.duration_ms,
            artists: item.artists.map((artist : any) => ({
                id: artist.id,
                name: artist.name,
                image: artist.images?.[0]?.url
            }))
        }));  
        res.json({
            success: true,
            data: tracks,
            query: searchQuery,
            total: response.data.total
        }); 
    } catch (error : any) {
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
        const playlistName = req.body.name; 
        const response : any = await axios.post('https://api.spotify.com/v1/users/me/playlists', {
            name: playlistName
        }, {
            headers: { 'Authorization': `Bearer ${accessToken}` } }
        ); 
        res.json({
            success: true,
            data: response.data
        }); 
    } catch (error : any) {
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
        const trackUris = req.body.trackUris; 
        const response : any = await axios.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            uris: trackUris
        }, {
            headers: { 'Authorization': `Bearer ${accessToken}` } }
        ); 
        res.json({
            success: true,
            data: response.data
        }); 
    } catch (error : any) {
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
        const response : any = await axios.delete(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?uris=${trackId}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` } }
        ); 
        res.json({
            success: true,
            data: response.data
        }); 
    } catch (error : any) {
        console.error('Spotify API error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.error?.message || 'Failed to delete track from playlist'
        });
    }
});

// Health endpoint
app.get('/api/health', (req, res) => {
    res.json({ success: true });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});