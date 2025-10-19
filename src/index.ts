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
        'playlist-read-private',
        'user-library-read'
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

        const playlists = response.data;

        console.log(playlists);

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

// 5. Get User's Liked Songs
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

        console.log(response.data);

        const tracks = response.data;

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