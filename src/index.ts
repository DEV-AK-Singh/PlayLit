import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { configDotenv } from 'dotenv';

const app = express();
const PORT = 5000;

// Middleware
configDotenv();
app.use(cors());
app.use(express.json());

// Store tokens (in production, use a database)
let userTokens : Record<string, { access_token: string, refresh_token: string, expires_in: number, platform: string }> = {};

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
