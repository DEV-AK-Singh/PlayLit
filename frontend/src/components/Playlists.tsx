import PlaylistCard from "./PlaylistCard";
import Nothing from "./Nothing";
import { useMyContext } from "./ContextUtil";

export default function Playlists() {
  const { myPlaylists } = useMyContext(); 
  return (
    <>
      <div className="sticky top-0 z-10 bg-black">
        <h1 className="text-2xl p-4 font-semibold">Playlists</h1>
        <hr />
      </div>
      <div className="p-4 space-y-4 grid grid-cols-2 gap-3">
        {myPlaylists.length ? (
          myPlaylists.map((playlist: any) => <PlaylistCard key={playlist.id} playlist={playlist}/>)
        ) : (
          <Nothing />
        )}
      </div>
    </>
  );
}
