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
    const loadedTracks = await loadPlaylistTracks(playlistId || "", youtubeToken, spotifyToken, platform || "");
    setTracks(loadedTracks);
  };
  useEffect(() => {
    handlePlaylistTracks();
  }, []);
  return (
    <>
        <div className="sticky top-0 z-10 bg-black"> 
            <div className="flex justify-between items-center">
                <h1 className="text-2xl p-4 font-semibold">Playlist Tracks</h1>
                <Link to="/" className="bg-blue-500 me-4 text-white py-2 px-6 rounded-full text-sm hover:bg-blue-600 transition-colors">Go Back</Link>
            </div>
            <hr />
        </div>
        <div className="p-4 space-y-4 grid grid-cols-2 gap-3">
            {tracks.length ? (
              tracks.map((track: any) => <TrackCard key={track.id} track={track}/>)
            ) : (
              <Nothing />
            )}
        </div>
    </>
  );
}
