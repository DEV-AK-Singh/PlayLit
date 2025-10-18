// scripts/test-spotify.ts
import { SpotifyService } from '../services/spotifyService.js';

// Test function - you'll need to get an access token from Spotify
async function testSpotifyAPI(accessToken: string) {
  try {
    const spotify = new SpotifyService(accessToken);
    
    console.log('🔍 Testing Spotify API...\n');
    
    // Test user profile
    const profile = await spotify.getUserProfile();
    console.log('✅ User Profile:', profile.display_name, `(${profile.email})`);
    
    // Test playlists
    const playlists = await spotify.getUserPlaylists(5);
    console.log('\n✅ Playlists:', playlists.length);
    playlists.forEach((playlist, index) => {
      console.log(`   ${index + 1}. ${playlist.name} (${playlist.trackCount} tracks)`);
    });
    
    // Test liked songs
    const likedSongs = await spotify.getLikedSongs(5);
    console.log('\n✅ Liked Songs:', likedSongs.length);
    likedSongs.forEach((track, index) => {
      console.log(`   ${index + 1}. ${track.title} - ${track.artists.join(', ')}`);
    });
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

// You'll need to replace this with a real access token
const TEST_ACCESS_TOKEN = 'BQDVuw83AcJUt553k9A4LkWrwLXuCaeKcaRW87rH-EHwCt5oDPpZNlxYcALwXN6_Wx5toXTJSw6QspqPLP4EW-SIx5HjKcdaqJQu3hATuWlaFSba9WJgSWnYf6YLKicxWa_QrLuuZ7U';

if (TEST_ACCESS_TOKEN) {
  testSpotifyAPI(TEST_ACCESS_TOKEN);
} else {
  console.log('Please set a valid Spotify access token in scripts/test-spotify.ts');
}