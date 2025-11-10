import TrackCard from "./TrackCard";
import Nothing from "./Nothing";
import { useMyContext } from "./ContextUtil";
import { useState } from "react";
import { loadSearchedTracks } from "../App.tsx";

export default function SearchTracks() {
  const [searchActive, setSearchActive] = useState(false);

  const youtubeToken = localStorage.getItem("youtubeToken") || "";
  const spotifyToken = localStorage.getItem("spotifyToken") || "";

  const { searchedTracks, setSearchedTracks } = useMyContext();

  const [queryText, setQueryText] = useState("");

  const handleSearch = async () => { 
    if (queryText) {
      const tracks = await loadSearchedTracks(
        queryText,
        youtubeToken,
        spotifyToken
      );
      setSearchedTracks(tracks);
      setQueryText("");
      setSearchActive(!searchActive);
    } else {
      setSearchedTracks([]);
      setSearchActive(!searchActive);
    }
  };

  return (
    <>
      <div className="panel-header">
        <div className="search-header-row">
          <div style={{ flex: 1 }}>
            {!searchActive ? (
              <h2 className="panel-title">Search Tracks</h2>
            ) : (
              <div className="search-btn" style={{ marginBottom: "16px" }}>
                <input
                  autoFocus
                  type="text"
                  value={queryText}
                  className="flex-1 rounded-full focus:outline-none text-black outline-none"
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
              </div>
            )}

            <div className="filter-buttons">
              <button className="filter-btn active">All</button>
              <button className="filter-btn">Spotify</button>
              <button className="filter-btn">Youtube</button>
            </div>
          </div>
          <button
            className="search-btn"
            onClick={handleSearch}
          >
            <span>🔍</span>
            <span>Search</span>
          </button>
        </div>
      </div>
      <div className="panel-content">
        {searchedTracks.length ? (
          searchedTracks.map((track: any) => (
            <TrackCard key={track.id} track={track} />
          ))
        ) : (
          <Nothing icon="🔍" text="No Search Results" />
        )}
      </div>
    </>
  );
}
