import { Link } from "react-router-dom";
import { deletePlaylist, type Playlist } from "../App";

export default function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const youtubeToken = localStorage.getItem("youtubeToken") || "";
  const spotifyToken = localStorage.getItem("spotifyToken") || "";
  return (
    <Link to={`/playlists/${playlist?.id}?platform=${playlist?.platform}`}>
      <div className="rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 text-white bg-slate-700">
        <div className="relative ">
          <img
            src={playlist?.image}
            alt={playlist?.name}
            className="w-full h-20 object-cover border border-slate-600 rounded-lg"
          />
          <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs border border-slate-600">
            {playlist?.tracks} songs
          </div>
        </div>
        {/* Playlist Info */}
        <div className="p-2">
          <div className="w-full flex justify-between items-start">
            <div className="w-full">
              <h3 className="font-bold text-white text-xs mb-1 truncate">
                {playlist?.name}
              </h3>
              <p className="text-white font-thin text-xs mb-2 w-full truncate">
                {playlist?.description}
              </p>
            </div>
            <button
              className={`${
                playlist?.platform === "spotify"
                  ? "text-green-500"
                  : "text-red-500"
              } transition-colors text-2xl`}
            >
              {playlist?.platform === "spotify" ? (
                <i className="fa-brands fa-spotify"></i>
              ) : (
                <i className="fa-brands fa-youtube"></i>
              )}
            </button>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-xs truncate">{playlist?.owner}</p>
            <button
              onClick={() => {
                deletePlaylist(
                  playlist?.id,
                  playlist?.platform,
                  youtubeToken,
                  spotifyToken
                );
              }}
              className="text-black cursor-pointer text-xs bg-white px-1 rounded-sm hover:text-red-600 transition-colors"
            >
              <i className="fa-solid fa-trash"></i> delete
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
