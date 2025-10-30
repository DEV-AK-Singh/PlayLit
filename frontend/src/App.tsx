import { useEffect, useState } from "react";
import "./App.css";
import Home from "./components/Home";
import { useMyContext } from "./components/ContextUtil"; 

export type QueryType = {
  id: string;
  query: string;
};

export type User = {
  id: string;
  display_name: string;
  email: string;
};

export type Track = {
  id: string;
  name: string;
  album: string;
  artist: string;
  image: string;
  duration: number;
  platform: string;
  platformUrl: string;
};

export type Playlist = {
  id: string;
  name: string;
  description: string;
  tracks: number;
  image: string;
  owner: string;
  privacy: string | boolean;
  platform: string;
};

export const milliSecondsToMinutesSeconds = (milliseconds: number ) => {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor(((milliseconds % 60000) / 1000));
  return `${minutes}:${(seconds < 10) ? "0" + seconds : seconds}`;
};

const cleanQuery = (query: string) => {
  return query.replace(/[^\w\s]/g, ""); // Remove everything except letters, numbers, spaces
};

export const sortArrayByKey = (array: any[], key: string) => {
  return array.sort((a: any, b: any) => {
    const nameA = a[key].toLowerCase();
    const nameB = b[key].toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
};

export const loadSearchedYoutubeTracks = async (
  query: string,
  youtubeToken: string,
  limit: number = 5
) => {
  try {
    const response = await fetch(
      `/api/youtube/me/search?q=${cleanQuery(
        query
      )}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${youtubeToken}`,
        },
      }
    );
    const data = await response.json();
    console.log(data);
    return data.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const loadMultipleSearchedYoutubeTracks = async (
  queries: QueryType[],
  youtubeToken: string,
  limit: number = 3
) => {
  const results = [] as any[];
  for await (const query of queries) {
    const youtubeTracks = await loadSearchedYoutubeTracks(
      cleanQuery(query.query),
      youtubeToken,
      limit
    );
    results.push({
      id: query.id,
      query: cleanQuery(query.query),
      tracks: youtubeTracks,
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return results;
};

export const loadSearchedSpotifyTracks = async (
  query: string,
  spotifyToken: string,
  limit: number = 5
) => {
  try {
    const response = await fetch(
      `/api/spotify/me/search?query=${cleanQuery(
        query
      )}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
      }
    );
    const data = await response.json();
    console.log(data);
    return data.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const loadMultipleSearchedSpotifyTracks = async (
  queries: QueryType[],
  spotifyToken: string,
  limit: number = 3
) => {
  const results = [] as any[];
  for await (const query of queries) {
    const spotifyTracks = await loadSearchedSpotifyTracks(
      cleanQuery(query.query),
      spotifyToken,
      limit
    );
    results.push({
      id: query.id,
      query: cleanQuery(query.query),
      tracks: spotifyTracks,
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return results;
};

export const loadSearchedTracks = async (
  query: string,
  youtubeToken: string,
  spotifyToken: string
) => {
  let youtubeTracks = [];
  let spotifyTracks = [];
  try {
    if (youtubeToken) {
      youtubeTracks = await loadSearchedYoutubeTracks(
        cleanQuery(query),
        youtubeToken
      );
    }
  } catch (error) {
    console.error(error);
  }
  try {
    if (spotifyToken) {
      spotifyTracks = await loadSearchedSpotifyTracks(
        cleanQuery(query),
        spotifyToken
      );
    }
  } catch (error) {
    console.error(error);
  } 
  let tracks: Track[] = [];
  if (youtubeTracks?.length > 0) {
    tracks = [...tracks, ...youtubeTracks];
  }
  if (spotifyTracks?.length > 0) {
    tracks = [...tracks, ...spotifyTracks];
  }
  return tracks;
};

export const loadYoutubePlaylistTracks = async (
  playlistId: string,
  youtubeToken: string
) => {
  try {
    const response = await fetch(
      `/api/youtube/me/playlists/${playlistId}/tracks`,
      {
        headers: {
          Authorization: `Bearer ${youtubeToken}`,
        },
      }
    );
    const data = await response.json();
    console.log(data);
    return sortArrayByKey(data.data, "name");
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const loadSpotifyPlaylistTracks = async (
  playlistId: string,
  spotifyToken: string
) => {
  try {
    const response = await fetch(
      `/api/spotify/me/playlists/${playlistId}/tracks`,
      {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
      }
    );
    const data = await response.json();
    console.log(data);
    return sortArrayByKey(data.data, "name");
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const loadPlaylistTracks = async (
  playlistId: string,
  youtubeToken: string,
  spotifyToken: string,
  platform: string
) => {
  let youtubeTracks = [];
  let spotifyTracks = [];
  if (youtubeToken && platform === "youtube") {
    youtubeTracks = await loadYoutubePlaylistTracks(playlistId, youtubeToken);
  }
  if (spotifyToken && platform === "spotify") {
    spotifyTracks = await loadSpotifyPlaylistTracks(playlistId, spotifyToken);
  }
  const tracks = [...youtubeTracks, ...spotifyTracks];
  return sortArrayByKey(tracks, "name");
};

export const createYoutubePlaylist = async (
  playlistName: string,
  playlistDescription: string,
  playlistPrivacy: string,
  youtubeToken: string
) => {
  try {
    const response = await fetch(
      `/api/youtube/me/playlists`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${youtubeToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: playlistName,
          description: playlistDescription,
          privacy: playlistPrivacy,
        }),
      }
    );
    const data = await response.json();
    console.log(data);
    return data.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const addTracksToYoutubePlaylist = async (
  playlistId: string,
  trackIds: string[],
  youtubeToken: string
) => {
  try {
    console.log(trackIds);
    const response = await fetch(
      `/api/youtube/me/playlists/${playlistId}/tracks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${youtubeToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoIds: trackIds,
        }),
      }
    );
    const data = await response.json();
    console.log(data);
    return data.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const createSpotifyPlaylist = async (
  playlistName: string,
  playlistDescription: string,
  playlistPrivacy: string,
  spotifyToken: string
) => {
  try {
    const userId = JSON.parse(localStorage.getItem("spotifyUser") || "{}")?.id;
    if (!userId) {
      console.error("User ID not found, connect to Spotify first.");
      return [];
    }
    const response = await fetch(
      `/api/spotify/me/playlists`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: playlistName,
          description: playlistDescription,
          privacy: playlistPrivacy === "public",
          userId: userId,
        }),
      }
    );
    const data = await response.json();
    console.log(data);
    return data.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const addTracksToSpotifyPlaylist = async (
  playlistId: string,
  trackIds: string[],
  spotifyToken: string
) => {
  try {
    const response = await fetch(
      `/api/spotify/me/playlists/${playlistId}/tracks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trackUris: trackIds,
        }),
      }
    );
    const data = await response.json();
    console.log(data);
    return data.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const deletePlaylist = async (
  playlistId: string,
  platform: string,
  youtubeToken: string,
  spotifyToken: string
) => {
  if (platform === "spotify" && spotifyToken) {
    const tracksUriSpotify: string[] = (
      await loadPlaylistTracks(
        playlistId,
        youtubeToken,
        spotifyToken,
        "spotify"
      )
    ).map((track) => track.id);
    console.log(tracksUriSpotify);
    try {
      const responseDelete = await fetch(
        `/api/spotify/me/playlists/${playlistId}/tracks`,
        {
          method: "DELETE",
          body: JSON.stringify({ trackUris: tracksUriSpotify }),
          headers: {
            Authorization: `Bearer ${spotifyToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const deleteData = await responseDelete.json();
      const responseUnfollow = await fetch(
        `/api/spotify/me/playlists/${playlistId}/followers`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${spotifyToken}`,
          },
        }
      );
      const unfollowData = await responseUnfollow.json();
      console.log(deleteData, unfollowData);
      return { deleteData, unfollowData };
    } catch (error) {
      console.error(error);
      return [];
    }
  } else if (platform === "youtube" && youtubeToken) {
    try {
      const response = await fetch(
        `/api/youtube/me/playlists/${playlistId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${youtubeToken}`,
          },
        }
      );
      const data = await response.json();
      console.log(data);
      return data.data;
    } catch (error) {
      console.error(error);
      return [];
    }
  } else {
    console.error("No token found");
    return [];
  }
};

function App() {
  const { setLikedTracks, setMyPlaylists } = useMyContext();

  const [youtubeToken, setYoutubeToken] = useState(
    localStorage.getItem("youtubeToken") || ""
  );
  const [spotifyToken, setSpotifyToken] = useState(
    localStorage.getItem("spotifyToken") || ""
  );

  const [youtubeUser, setYoutubeUser] = useState(null as User | null);
  const [spotifyUser, setSpotifyUser] = useState(null as User | null);

  const [youtubeLikedTracks, setYoutubeLikedTracks] = useState([] as Track[]);
  const [spotifyLikedTracks, setSpotifyLikedTracks] = useState([] as Track[]);
  const [youtubePlaylists, setYoutubePlaylists] = useState([] as Playlist[]);
  const [spotifyPlaylists, setSpotifyPlaylists] = useState([] as Playlist[]); 

  const connectYoutube = async () => {
    try {
      const response = await fetch("/api/auth/youtube");
      const data = await response.json();
      window.location.href = data.authUrl;
    } catch (error) {
      console.error(error);
    }
  };

  const checkForYoutubeToken = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const error = urlParams.get("error");
    const platform = urlParams.get("platform");
    if (error) {
      console.error("YouTube Auth error:", error);
    }
    if (token && platform === "youtube") {
      localStorage.setItem("youtubeToken", token);
      setYoutubeToken(token);
      loadYoutubeProfile();
    }
  };

  const loadYoutubeProfile = async () => {
    try {
      const response = await fetch("/api/youtube/me", {
        headers: {
          Authorization: `Bearer ${youtubeToken}`,
        },
      });
      const data = await response.json();
      setYoutubeUser(data.user);
      localStorage.setItem("youtubeUser", JSON.stringify(data.user));
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadYoutubePlaylists = async () => {
    try {
      const response = await fetch(
        "/api/youtube/me/playlists",
        {
          headers: {
            Authorization: `Bearer ${youtubeToken}`,
          },
        }
      );
      const data = await response.json();
      setYoutubePlaylists(sortArrayByKey(data.data, "name"));
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadYoutubeLikedTracks = async () => {
    try {
      const response = await fetch(
        "/api/youtube/me/liked",
        {
          headers: {
            Authorization: `Bearer ${youtubeToken}`,
          },
        }
      );
      const data = await response.json();
      setYoutubeLikedTracks(sortArrayByKey(data.data, "name"));
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  const connectSpotify = async () => {
    try {
      const response = await fetch("/api/auth/spotify");
      const data = await response.json();
      window.location.href = data.authUrl;
    } catch (error) {
      console.error(error);
    }
  };

  const checkForSpotifyToken = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const error = urlParams.get("error");
    const platform = urlParams.get("platform");
    if (error) {
      console.error("Spotify Auth error:", error);
    }
    if (token && platform === "spotify") {
      localStorage.setItem("spotifyToken", token);
      setSpotifyToken(token);
      loadSpotifyProfile();
    }
  };

  const loadSpotifyProfile = async () => {
    try {
      const response = await fetch("/api/spotify/me", {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
      });
      const data = await response.json();
      setSpotifyUser(data.user);
      localStorage.setItem("spotifyUser", JSON.stringify(data.user));
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadSpotifyPlaylists = async () => {
    try {
      const response = await fetch(
        "/api/spotify/me/playlists",
        {
          headers: {
            Authorization: `Bearer ${spotifyToken}`,
          },
        }
      );
      const data = await response.json();
      setSpotifyPlaylists(sortArrayByKey(data.data, "name"));
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadSpotifyLikedTracks = async () => {
    try {
      const response = await fetch(
        "/api/spotify/me/liked",
        {
          headers: {
            Authorization: `Bearer ${spotifyToken}`,
          },
        }
      );
      const data = await response.json();
      setSpotifyLikedTracks(sortArrayByKey(data.data, "name"));
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadBothPlaylists = () => {
    loadYoutubePlaylists();
    loadSpotifyPlaylists();
  };

  const loadBothLikedTracks = () => {
    loadYoutubeLikedTracks();
    loadSpotifyLikedTracks();
  };

  useEffect(() => {
    checkForYoutubeToken();
    checkForSpotifyToken();
  }, []);

  useEffect(() => {
    loadYoutubeProfile();
    loadSpotifyProfile();
  }, [youtubeToken, spotifyToken]);

  useEffect(() => {
    if (youtubeLikedTracks || spotifyLikedTracks) {
      setLikedTracks(
        sortArrayByKey([...youtubeLikedTracks, ...spotifyLikedTracks], "name")
      );
    }
  }, [youtubeLikedTracks, spotifyLikedTracks]);

  useEffect(() => {
    if (youtubePlaylists || spotifyPlaylists) {
      setMyPlaylists(
        sortArrayByKey([...youtubePlaylists, ...spotifyPlaylists], "name")
      );
    }
  }, [youtubePlaylists, spotifyPlaylists]);

  return (
    <>
      <Home
        connectYoutube={connectYoutube}
        youtubeUser={youtubeUser}
        connectSpotify={connectSpotify}
        spotifyUser={spotifyUser}
        loadBothLikedTracks={loadBothLikedTracks}
        loadBothPlaylists={loadBothPlaylists}
      />
    </>
  );
}

export default App;
