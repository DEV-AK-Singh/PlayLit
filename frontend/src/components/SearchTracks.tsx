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
    const tracks = await loadSearchedTracks(queryText, youtubeToken, spotifyToken);
    setSearchedTracks(tracks);
  };

  return (
    <>
      <div className="sticky top-0 z-10 bg-black">
        <div className="relative">
          <div className="flex justify-between items-center relative z-1 bg-black">
            <h1 className="text-2xl p-4 font-semibold">Search Tracks</h1>
            <button
              className="bg-blue-500 me-4 text-white py-2 px-6 rounded-full text-sm hover:bg-blue-600 transition-colors"
              onClick={() => {
                if (queryText) {
                  handleSearch();
                  setQueryText("");
                } else {
                  setSearchedTracks([]);
                }
                setSearchActive(!searchActive);
              }}
            >
              Search
            </button>
          </div>
          <input
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            className={`w-full h-full focus:outline-none z-0 bg-white text-black border-4 border-black py-2 px-4 absolute top-${
              searchActive ? "1" : "0"
            } left-1/2 transform -translate-x-1/2 -translate-y-1`}
            placeholder="Search"
          />
        </div>
        <hr />
      </div>
      <div className="p-4 space-y-4">
        {searchedTracks.length ? (
          searchedTracks.map((track: any) => <TrackCard key={track.id} track={track}/>)
        ) : (
          <Nothing />
        )}
      </div>
    </>
  );
}
