import PlaylistCard from "./PlaylistCard";
import Nothing from "./Nothing";
import { useMyContext } from "./ContextUtil"; 

export default function Playlists() {
  const { myPlaylists } = useMyContext(); 
  return (
    <>
      <div className="sticky top-0 z-10 bg-slate-800 px-4 pt-4">
        <h1 className="text-2xl font-semibold mb-2">My Playlists</h1>
        <div className="flex gap-2 pb-1">
          <button className="rounded-lg bg-slate-700 px-4 py-2 text-xs font-medium text-white transition hover:bg-slate-800">
            All
          </button>
          <button className="rounded-lg bg-slate-700 px-4 py-2 text-xs font-medium text-white transition hover:bg-slate-800">
            Spotify
          </button>
          <button className="rounded-lg bg-slate-700 px-4 py-2 text-xs font-medium text-white transition hover:bg-slate-800">
            Youtube
          </button>
        </div>
      </div>
      <div className="p-4 grid grid-cols-3 gap-6">
        {myPlaylists.length ? (
          myPlaylists.map((playlist: any) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))
        ) : (
          <Nothing />
        )}
      </div>
    </>
  );
}
