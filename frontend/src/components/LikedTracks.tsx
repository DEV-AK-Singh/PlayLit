import TrackCard from "./TrackCard";
import Nothing from "./Nothing";
import { useMyContext } from "./ContextUtil";

export default function LikedTracks() {
  const { likedTracks } = useMyContext();
  return (
    <>
      <div className="sticky top-0 z-10 bg-slate-800 px-4 pt-4">
        <h1 className="text-2xl font-semibold mb-2">Liked Tracks</h1>
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
      <div className="p-4">
        {likedTracks.length ? (
          likedTracks.map((track: any) => (
            <TrackCard key={track.id} track={track} />
          ))
        ) : (
          <Nothing />
        )}
      </div>
    </>
  );
}
