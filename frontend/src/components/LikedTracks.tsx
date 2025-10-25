import TrackCard from "./TrackCard";
import Nothing from "./Nothing";
import { useMyContext } from "./ContextUtil"; 

export default function LikedTracks() {
  const { likedTracks } = useMyContext();
  return (
    <>
      <div className="sticky top-0 z-10 bg-black">
        <h1 className="text-2xl p-4 font-semibold">Liked Tracks</h1>
        <hr />
      </div>
      <div className="p-4 space-y-4">
        {likedTracks.length ? (
          likedTracks.map((track: any) => <TrackCard key={track.id} track={track}/>)
        ) : (
          <Nothing />
        )}
      </div>
    </>
  );
}
