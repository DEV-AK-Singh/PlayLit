import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import TrackCard from "./TrackCard";
import { loadPlaylistTracks, type Track } from "../App";
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
      <div className="sticky top-0 z-10 bg-slate-800 px-4 pt-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Current Playlist Tracks</h1>
          <div className="flex gap-2 pb-1">
            <button className="rounded-lg bg-slate-700 px-4 py-1 text-xs font-medium text-white transition border border-slate-600 hover:border-slate-400">
              All
            </button>
            <button className="rounded-lg bg-slate-700 px-4 py-1 text-xs font-medium text-white transition border border-slate-600 hover:border-slate-400">
              Spotify
            </button>
            <button className="rounded-lg bg-slate-700 px-4 py-1 text-xs font-medium text-white transition border border-slate-600 hover:border-slate-400">
              Youtube
            </button>
          </div>
        </div>
        <Link to={`/`} className="rounded-full border border-slate-600 hover:border-slate-400 bg-slate-700 text-sm px-4 py-1.5 font-medium text-white transition">
          <h1 className="block"><i className="fa-solid fa-arrow-left"></i> Go back</h1>
        </Link>
      </div>
      <div className="p-4 space-x-4 grid grid-cols-2">
        {tracks.length ? (
          tracks.map((track: any) => <TrackCard key={track.id} track={track} />)
        ) : (
          <Nothing />
        )}
      </div>
    </>
  );
}
