import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import TrackCard from "./TrackCard";
import { loadPlaylistTracks, type Track } from "../App.tsx";
import Nothing from "./Nothing"; 

export default function PlaylistTracks() {
  const [tracks, setTracks] = useState([] as Track[]); 
  const youtubeToken = localStorage.getItem("youtubeToken") || "";
  const spotifyToken = localStorage.getItem("spotifyToken") || "";
  const { id: playlistId } = useParams();
  const [queryParams, _] = useSearchParams();
  const platform = queryParams.get("platform");
  const handlePlaylistTracks = async () => {
    const loadedTracks = await loadPlaylistTracks(
      playlistId || "",
      youtubeToken,
      spotifyToken,
      platform || ""
    );
    setTracks(loadedTracks);
  };
  useEffect(() => {
    handlePlaylistTracks();
  }, []);
  return (
    <> 
      <div className="panel-header">
        <h2 className="panel-title">Current Playlist Tracks</h2>
        <div className="flex justify-between items-center">
          <div className="filter-buttons">
            <button className="filter-btn active">All</button>
            <button className="filter-btn">Spotify</button>
            <button className="filter-btn">Youtube</button>
          </div>
          <Link to={`/`} className="filter-btn">
            <h1 className="block"><i className="fa-solid fa-arrow-left"></i> Go back</h1>
          </Link>
        </div>
      </div>
      <div className="panel-content">
        {tracks.length ? (
          tracks.map((track: any) => (
            <TrackCard key={track.id} track={track} />
          ))
        ) : (
          <Nothing icon="🎵" text="No Tracks" />
        )}
      </div>
    </>
  );
}
