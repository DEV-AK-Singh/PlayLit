import { useNavigate } from "react-router-dom";
import { deletePlaylist, type Playlist } from "../App.tsx";

export default function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const navigate = useNavigate();
  const youtubeToken = localStorage.getItem("youtubeToken") || "";
  const spotifyToken = localStorage.getItem("spotifyToken") || "";
  return (
    <> 
      <div className="playlist-card">
        <div
          className="playlist-img" 
          onClick={()=>{
            navigate(`/playlists/${playlist?.id}?platform=${playlist?.platform}`);
          }}
        >
          <img
            src={playlist?.image}
            alt={playlist?.name}
            className="w-full h-full object-cover border border-slate-600 rounded-lg"
          />
        </div>
        <button
          className="play-btn" 
          onClick={() => {
            deletePlaylist(
              playlist?.id,
              playlist?.platform,
              youtubeToken,
              spotifyToken
            );
            alert("Playlist deleted successfully!");
          }}
        > 
          <i className="fa-solid fa-trash"></i>
        </button>
        <div className="playlist-title">{playlist?.name}</div>
        <div className="playlist-subtitle">{playlist?.owner}</div>
        <div className="playlist-subtitle">
          {playlist?.tracks} tracks • {playlist?.platform}
        </div>
      </div> 
    </>
  );
}
