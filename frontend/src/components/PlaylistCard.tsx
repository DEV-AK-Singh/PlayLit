import { Link } from "react-router-dom";
import type { Playlist } from "../App";

export default function PlaylistCard({
  playlist,
}: {
  playlist: Playlist;
}) { 
  return (
    <div className="bg-white border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200"> 
      <div className="relative h-40 bg-linear-to-br from-purple-500 to-blue-500">
        <img
          src={playlist?.image}
          alt={playlist?.name}
          className="w-full h-full object-cover"
        />
        <div className={`absolute top-3 left-3 ${playlist?.platform === "spotify"  ? "bg-green-500" : "bg-red-500"} px-2 py-1 rounded-full text-xs font-medium text-white`}>
          {playlist?.platform}
        </div>
        <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
          {playlist?.tracks} songs
        </div>
      </div> 
      {/* Playlist Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-lg mb-1">{playlist?.name}</h3>
        <p className="text-gray-600 text-sm mb-2">{playlist?.description}</p>
        <p className="text-gray-500 text-xs mb-4">{playlist?.owner}</p>

        {/* Actions */}
        <div className="flex space-x-2"> 
          <Link to={`/playlists/${playlist?.id}?platform=${playlist?.platform}`} className="bg-blue-500 text-white py-2 px-6 rounded-full text-sm hover:bg-blue-600 transition-colors">
            View Playlist
          </Link>
        </div>
      </div>
    </div>
  );
}
