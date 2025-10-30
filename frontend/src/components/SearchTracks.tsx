import TrackCard from "./TrackCard";
import Nothing from "./Nothing";
import { useMyContext } from "./ContextUtil";
import { useState } from "react";
import { loadSearchedTracks } from "../App";

export default function SearchTracks() {
  const [searchActive, setSearchActive] = useState(false);

  const youtubeToken = localStorage.getItem("youtubeToken") || "";
  const spotifyToken = localStorage.getItem("spotifyToken") || "";

  const { searchedTracks, setSearchedTracks } = useMyContext();

  const [queryText, setQueryText] = useState("");

  const handleSearch = async () => {
    const tracks = await loadSearchedTracks(
      queryText,
      youtubeToken,
      spotifyToken
    );
    setSearchedTracks(tracks);
  };

  return (
    <>
      {searchActive && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-full max-w-xl w-full max-h-[90vh] overflow-hidden flex justify-between">
            <input
              autoFocus
              type="text"
              value={queryText}
              className="flex-1 px-6 py-3 rounded-full focus:outline-none text-black outline-none"
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="search tracks, artists, or albums on youTube or spotify..." 
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (queryText) {
                    handleSearch();
                    setQueryText("");
                  } else {
                    setSearchedTracks([]);
                  }
                  setSearchActive(!searchActive);
                }
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (queryText) {
                  handleSearch();
                  setQueryText("");
                } else {
                  setSearchedTracks([]);
                }
                setSearchActive(!searchActive);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-full border border-white cursor-pointer"
            >
              <span className="block">
                <i className="fa-solid fa-magnifying-glass"></i> Search
              </span>
            </button>
          </div>
        </div>
      )}
      <div className="sticky top-0 z-10 bg-slate-800">
        <div className="flex items-start justify-between bg-slate-800 px-4 pt-4 ">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Search Tracks</h1>
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
          <button
            onClick={() => {
              setSearchActive(!searchActive);
            }}
            className="rounded-full border border-slate-600 hover:border-slate-400 bg-slate-700 text-sm px-4 py-1.5 font-medium text-white transition cursor-pointer"
          >
            <span className="block">
              <i className="fa-solid fa-magnifying-glass"></i> Search
            </span>
          </button>
        </div>
      </div>
      <div className="p-4">
        {searchedTracks.length ? (
          searchedTracks.map((track: any) => (
            <TrackCard key={track.id} track={track} />
          ))
        ) : (
          <Nothing />
        )}
      </div>
    </>
  );
}
