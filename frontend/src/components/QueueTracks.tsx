import Nothing from "./Nothing";
import { useMyContext } from "./ContextUtil";
import QueueTrackCard from "./QueueTrackCard";
import { useState } from "react";
import {
  addTracksToSpotifyPlaylist,
  addTracksToYoutubePlaylist,
  createSpotifyPlaylist,
  createYoutubePlaylist,
  loadMultipleSearchedSpotifyTracks,
  loadMultipleSearchedYoutubeTracks,
  type Track,
} from "../App.tsx";
import PreviewPlaylistModal from "./PreviewPlaylistModal";

export default function QueueTracks() {
  const [queueActive, setQueueActive] = useState(false);
  const { queueTracks, setQueueTracks } = useMyContext();

  const [playlistName, setPlaylistName] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const [playlistPrivacy, setPlaylistPrivacy] = useState("public");
  const [playlistPlatform, setPlaylistPlatform] = useState("spotify");

  const youtubeToken = localStorage.getItem("youtubeToken") || "";
  const spotifyToken = localStorage.getItem("spotifyToken") || "";

  const [finalSearchedTracks, setFinalSearchedTracks] = useState(
    [] as Track[][]
  );

  const [modal, setModal] = useState(false);

  const handlePlaylistPreview = async () => {
    if (playlistPlatform === "spotify" && !spotifyToken) {
      alert("Please connect to Spotify first.");
      setQueueActive(false);
      return;
    }
    if (playlistPlatform === "youtube" && !youtubeToken) {
      alert("Please connect to YouTube first.");
      setQueueActive(false);
      return;
    }
    if (playlistName === "") {
      alert("Please enter a playlist name.");
      setQueueActive(false);
      return;
    }
    const otherPlatformQueue: Track[] = queueTracks.filter(
      (track) => track.platform != playlistPlatform
    );
    const currentPlatformQueue: Track[] = queueTracks.filter(
      (track) => track.platform == playlistPlatform
    );
    const queries = otherPlatformQueue.map((track) => {
      const id = track.id;
      const query = `${track.name}, ${track.artist}`;
      return { id, query };
    });
    if (playlistPlatform === "youtube" && youtubeToken) {
      const results = await loadMultipleSearchedYoutubeTracks(
        queries,
        youtubeToken
      );
      setFinalSearchedTracks([
        ...currentPlatformQueue.map((track) => [track]),
        ...results.map((result) => result.tracks),
      ]);
    } else if (playlistPlatform === "spotify" && spotifyToken) {
      const results = await loadMultipleSearchedSpotifyTracks(
        queries,
        spotifyToken
      );
      setFinalSearchedTracks([
        ...currentPlatformQueue.map((track) => [track]),
        ...results.map((result) => result.tracks),
      ]);
    }
    setQueueActive(!queueActive);
    setModal(true);
  };

  const savePlaylist = async (
    platform: string,
    finalSelectedTracks: Track[]
  ) => {
    if (platform === "youtube" && youtubeToken) {
      const createdPlaylist = await createYoutubePlaylist(
        playlistName,
        playlistDescription,
        playlistPrivacy,
        youtubeToken
      );
      await addTracksToYoutubePlaylist(
        createdPlaylist.id,
        finalSelectedTracks.map((track) => track.id),
        youtubeToken
      );
    } else if (platform === "spotify" && spotifyToken) {
      const createdPlaylist = await createSpotifyPlaylist(
        playlistName,
        playlistDescription,
        playlistPrivacy,
        spotifyToken
      );
      await addTracksToSpotifyPlaylist(
        createdPlaylist.id,
        finalSelectedTracks.map((track) => track.id),
        spotifyToken
      );
    } 
    setQueueTracks([]);
    setFinalSearchedTracks([]);
    setQueueActive(false);
    alert("Playlist created successfully!");
  };

  return (
    <>
      {finalSearchedTracks && (
        <PreviewPlaylistModal
          isOpen={modal}
          onClose={() => setModal(false)}
          playlistName={playlistName}
          searchResults={finalSearchedTracks}
          onConfirm={(tracks) => {
            savePlaylist(playlistPlatform, tracks);
            setQueueActive(false);
          }}
        />
      )}
      {queueActive && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] overflow-hidden flex justify-between">
            <form className={`w-full z-0 bg-white text-black`} style={{padding: "16px"}}>
              <h1 className="w-full pt-2 pb-4 text-2xl font-semibold" style={{marginBottom:"16px"}}>
                Create Playlist
              </h1>
              <input
                type="text"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                style={{padding: "8px", marginBottom:"8px"}}
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-blue-500 mb-2"
                placeholder="Playlist Name.."
              />
              <input
                type="text"
                value={playlistDescription}
                onChange={(e) => setPlaylistDescription(e.target.value)}
                style={{padding: "8px", marginBottom:"8px"}}
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-blue-500 mb-2"
                placeholder="Playlist Description.."
              />
              <select
                defaultValue={playlistPrivacy}
                onChange={(e) => setPlaylistPrivacy(e.target.value)}
                style={{padding: "8px", marginBottom:"8px"}}
                className="w-full border border-gray-300 rounded-md py-2 px-2 text-sm focus:outline-none focus:border-blue-500 mb-2"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
              <select
                defaultValue={playlistPlatform}
                onChange={(e) => setPlaylistPlatform(e.target.value)}
                style={{padding: "8px", marginBottom:"16px"}}
                className="w-full border border-gray-300 rounded-md py-2 px-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="spotify">Spotify</option>
                <option value="youtube">Youtube</option>
              </select>
              <button
                type="button"
                onClick={handlePlaylistPreview}
                style={{padding: "8px"}}
                className="bg-slate-900 hover:bg-slate-800 text-white w-full py-3 mt-4 rounded-full border border-white cursor-pointer"
              >
                Save Playlist
              </button>
            </form>
          </div>
        </div>
      )}
      <div className="panel-header">
        <div className="create-header-row">
          <div style={{ flex: 1 }}>
            <h2 className="panel-title">Create Playlist</h2>
            <div className="filter-buttons">
              <button className="filter-btn active">All</button>
              <button className="filter-btn">Spotify</button>
              <button className="filter-btn">Youtube</button>
            </div>
          </div>
          <button
            className="create-btn"
            onClick={() => {
              setQueueActive(!queueActive);
            }}
          >
            <span>Create Now</span>
            <span>➕</span>
          </button>
        </div>
      </div>
      <div className="panel-content">
        {queueTracks.length ? (
            queueTracks.map((track: any) => (
              <QueueTrackCard key={track.id} track={track} />
            ))
          ) : (
            <Nothing icon="✨" text="No Queue Tracks" />
          )}
      </div>
    </>
  );
}
