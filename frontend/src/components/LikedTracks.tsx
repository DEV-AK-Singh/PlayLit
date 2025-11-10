import TrackCard from "./TrackCard";
import Nothing from "./Nothing";
import { useMyContext } from "./ContextUtil";

export default function LikedTracks() {
  const { likedTracks } = useMyContext();
  return (
    <>
      <div className="panel-header">
        <h2 className="panel-title">Liked Tracks</h2>
        <div className="filter-buttons">
          <button className="filter-btn active">All</button>
          <button className="filter-btn">Spotify</button>
          <button className="filter-btn">Youtube</button>
        </div>
      </div>
      <div className="panel-content">
        {likedTracks.length ? (
          likedTracks.map((track: any) => (
            <TrackCard key={track.id} track={track} />
          ))
        ) : (
          <Nothing icon="❤️" text="No Liked Tracks" />
        )}
      </div>
    </>
  );
}
