import PlaylistCard from "./PlaylistCard";
import Nothing from "./Nothing";
import { useMyContext } from "./ContextUtil";

export default function Playlists() {
  const { myPlaylists } = useMyContext();
  return (
    <>
      <div className="panel-header">
        <h2 className="panel-title">My Playlists</h2>
        <div className="filter-buttons">
          <button className="filter-btn active">All</button>
          <button className="filter-btn">Spotify</button>
          <button className="filter-btn">Youtube</button>
        </div>
      </div>
      <div className="panel-content">
        {myPlaylists.length ? (
          <div className="playlist-grid">
            {myPlaylists.map((playlist: any) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        ) : (
          <Nothing icon="🎵" text="No Playlists" />
        )}
      </div>
    </>
  );
}
