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
let userTokens: Record<string, { access_token: string, refresh_token: string }> = {};

// 1. Get Spotify Auth URL
app.get('/api/auth/spotify', (req, res) => {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const redirectUri = 'http://127.0.0.1:5000/api/auth/spotify/callback';
    
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
    
    res.json({ authUrl });
});

// 2. Handle Spotify Callback
app.get('/api/auth/spotify/callback', async (req, res) => {
    try {
        const { code } = req.query;

        console.log('Received code:', code);
        
        if (!code) {
            return res.redirect('http://localhost:3000?error=no_code');
        }

        const clientId = process.env.SPOTIFY_CLIENT_ID;
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
        
        // Get access token
        const codeStr = Array.isArray(code) ? code[0] : typeof code === 'object' ? '' : code as string;
        const tokenResponse = await axios.post('https://accounts.spotify.com/api/token',
            `grant_type=authorization_code&code=${codeStr}&redirect_uri=http://127.0.0.1:5000/api/auth/spotify/callback&client_id=${clientId}&client_secret=${clientSecret}`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { access_token, refresh_token } = tokenResponse.data;
        
        // Store token (in production, use database)
        const tokenId = Math.random().toString(36).substring(7);
        userTokens[tokenId] = { access_token, refresh_token };
        
        // Redirect to frontend with token
        res.redirect(`http://localhost:3000?token=${tokenId}`);
        
    } catch (error: any) {
        console.error('Auth error:', error.response?.data || error.message);
        res.redirect('http://localhost:3000?error=auth_failed');
    }
});

// 3. Get Current User Profile
app.get('/api/me', async (req, res) => {
    console.log(userTokens)
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        console.log(tokenId)
        
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }

        const accessToken = userTokens[tokenId].access_token;
        
        const response = await axios.get('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        console.log(response.data);

        res.json({
            success: true,
            user: {
                id: response.data.id,
                display_name: response.data.display_name,
                email: response.data.email,
                country: response.data.country,
                followers: response.data.followers?.total,
                image: response.data.images?.[0]?.url,
                product: response.data.product
            }
        });

    } catch (error: any) {
        console.error('Spotify API error:', error.response?.data || error.message);
        res.status(400).json({
            error: error.response?.data?.error?.message || 'Failed to fetch user data'
        });
    }
});

// 4. Get User's Playlists
app.get('/api/me/playlists', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }

        const accessToken = userTokens[tokenId].access_token;
        
        const response : any = await axios.get('https://api.spotify.com/v1/me/playlists?limit=20', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const playlistsItems = response.data.items;

        console.log(playlistsItems[0]);

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
            playlists,
            total: response.data.total
        });

    } catch (error : any) {
        console.error('Spotify API error:', error.response?.data || error.message);
        res.status(400).json({
            error: error.response?.data?.error?.message || 'Failed to fetch playlists'
        });
    }
});

// 5. Create Playlist
app.post('/api/me/playlists', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');

        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }

        const accessToken = userTokens[tokenId].access_token;

        const userId = await axios.get('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }).then(response => response.data.id);

        const response : any = await axios.post(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            name: req.body.name,
            description: req.body.description || '',
            public: req.body.public || false
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
 
        res.json({
            success: true,
            playlist: {
                id: response.data.id,
                name: response.data.name,
                image: response.data.images?.[0]?.url,
                owner: {
                    id: response.data.owner.id,
                    display_name: response.data.owner.display_name,
                    image: response.data.owner.images?.[0]?.url
                }
            }
        });
    } catch (error : any) {
        console.error('Spotify API error:', error.response?.data || error.message);
        res.status(400).json({
            error: error.response?.data?.error?.message || 'Failed to create playlist'
        });
    }
});

// 6. Add Songs to Playlist
app.post('/api/playlists/:playlistId/tracks', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }

        const accessToken = userTokens[tokenId].access_token; 
        
        console.log(req.body.uris);

        const response : any = await axios.post(`https://api.spotify.com/v1/playlists/${req.params.playlistId}/tracks`, {
            uris: req.body.uris
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        res.json({
            success: true,
            playlist: response.data
        });
    } catch (error : any) {
        console.error('Spotify API error:', error.response?.data || error.message);
        res.status(400).json({
            error: error.response?.data?.error?.message || 'Failed to add songs to playlist'
        });
    }
});

// 7. Get User's Liked Songs
app.get('/api/me/tracks', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }

        const accessToken = userTokens[tokenId].access_token;
        
        const response = await axios.get('https://api.spotify.com/v1/me/tracks?limit=20', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const tracksItems = response.data.items; 

        console.log(tracksItems[0]);

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
            })),
            album: {
                id: item.track.album.id,
                name: item.track.album.name,
                image: item.track.album.images?.[0]?.url
            },
            added_at: item.added_at
        })); 

        res.json({
            success: true,
            tracks,
            total: response.data.total
        });

    } catch (error : any) {
        console.error('Spotify API error:', error.response?.data || error.message);
        res.status(400).json({
            error: error.response?.data?.error?.message || 'Failed to fetch liked songs'
        });
    }
});

// 8. Search for tracks
app.get('/api/search', async (req, res) => {
    try {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        
        if (!tokenId || !userTokens[tokenId]) {
            return res.status(401).json({ error: 'Invalid or missing token' });
        }

        const accessToken = userTokens[tokenId].access_token;

        if (!req.query.query) {
            return res.status(400).json({ error: 'Missing search query' });
        }
       
        const searchQuery = encodeURIComponent(req.query.query as string);
        
        const response = await axios.get(`https://api.spotify.com/v1/search?q=${searchQuery}&type=track&limit=20`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

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
            })),
            album: {
                id: item.album.id,
                name: item.album.name,
                image: item.album.images?.[0]?.url
            }
        }));

        console.log(tracks);

        res.json({
            success: true,
            tracks,
            total: response.data.tracks.total
        });

    } catch (error : any) {
        console.error('Spotify API error:', error.response?.data || error.message);
        res.status(400).json({
            error: error.response?.data?.error?.message || 'Failed to fetch liked songs'
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Spotify User API is running!',
        endpoints: [
            'GET /api/auth/spotify - Get auth URL',
            'GET /api/me - Get user profile',
            'GET /api/me/playlists - Get user playlists',
            'GET /api/me/tracks - Get liked songs'
        ]
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`🔐 Make sure to set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables`);
});