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
} from "../App";
import PreviewPlaylistModal from "./PreviewPlaylistModal";

export default function QueueTracks() {
  const [queueActive, setQueueActive] = useState(false);
  const { queueTracks } = useMyContext();

  const [playlistName, setPlaylistName] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const [playlistPrivacy, setPlaylistPrivacy] = useState("public");
  const [playlistPlatform, setPlaylistPlatform] = useState("spotify");

  const youtubeToken = localStorage.getItem("youtubeToken") || "";
  const spotifyToken = localStorage.getItem("spotifyToken") || "";

  const [loadMultipleQuery, setLoadMultipleQuery] = useState([] as any);
  const [modal, setModal] = useState(false);

  const handleCreatePlaylist = async () => {
    // console.log(playlistName);
    // console.log(playlistDescription);
    // console.log(playlistPrivacy);
    // console.log(playlistPlatform);

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

    const newQueue = queueTracks.filter((track) => track.platform == playlistPlatform); 

    const queries = newQueue.map((track) => {
      const id = track.id;
      const query = `${track.name}, ${track.artist}`;
      return { id, query };
    });

    let results = [] as any[];
    let createdPlaylist = {} as any;
    let addedTracks = {} as any;

    if (playlistPlatform === "youtube" && youtubeToken) {
      results = await loadMultipleSearchedYoutubeTracks(queries, youtubeToken);
      createdPlaylist = await createYoutubePlaylist(
        playlistName,
        playlistDescription,
        playlistPrivacy,
        youtubeToken
      );
      addedTracks = await addTracksToYoutubePlaylist(
        createdPlaylist.id,
        newQueue.map((track) => track.id),
        youtubeToken
      );
    } else if (playlistPlatform === "spotify" && spotifyToken) {
      results = await loadMultipleSearchedSpotifyTracks(queries, spotifyToken);
      createdPlaylist = await createSpotifyPlaylist(
        playlistName,
        playlistDescription,
        playlistPrivacy,
        spotifyToken
      );
      addedTracks = await addTracksToSpotifyPlaylist(
        createdPlaylist.id,
        newQueue.map((track) => track.id),
        spotifyToken
      );
    }

    setQueueActive(false);

    console.log(results);
    console.log(createdPlaylist);
    console.log(addedTracks);

    // const results = await loadMultipleSearchedYoutubeTracks(queries, youtubeToken);
    // const results = await loadMultipleSearchedSpotifyTracks(queries, spotifyToken);
    // console.log(results);
    // setLoadMultipleQuery(results);
    // setModal(true);

    // const createdPlaylist =
    //   playlistPlatform === "spotify"
    //     ? await createSpotifyPlaylist(
    //         playlistName,
    //         playlistDescription,
    //         playlistPrivacy,
    //         spotifyToken
    //       )
    //     : await createYoutubePlaylist(
    //         playlistName,
    //         playlistDescription,
    //         playlistPrivacy,
    //         youtubeToken
    //       );

    // const addedTracks =
    //   playlistPlatform === "spotify"
    //     ? await addTracksToSpotifyPlaylist(
    //         createdPlaylist.id,
    //         queueTracks.map((track) => track.id),
    //         spotifyToken
    //       )
    //     : await addTracksToYoutubePlaylist(
    //         createdPlaylist.id,
    //         queueTracks.map((track) => track.id),
    //         youtubeToken
    //       );

    // console.log(createdPlaylist);
    // console.log(addedTracks);
    // setQueueActive(false);
  };

  return (
    <>
      {/* {
        loadMultipleQuery && (
          <PreviewPlaylistModal
            isOpen={modal}
            onClose={() => setModal(false)}
            playlistName={playlistName}
            searchResults={loadMultipleQuery}
            onConfirm={() => setModal(false)}
          />
        )
      } */}
      <div className="sticky top-0 z-10 bg-black">
        <div className="relative">
          <div className="flex justify-between items-center relative z-1 bg-black">
            <h1 className="text-2xl p-4 font-semibold">Queue Tracks</h1>
            {queueActive ? (
              <button
                className={`bg-green-500 me-4 text-white py-2 px-6 rounded-full text-sm transition-colors cursor-pointer`}
                onClick={handleCreatePlaylist}
              >
                Save Playlist
              </button>
            ) : (
              <button
                className={`bg-blue-500 me-4 text-white py-2 px-6 rounded-full text-sm transition-colors cursor-pointer`}
                onClick={() => {
                  setQueueActive(!queueActive);
                }}
              >
                Create Playlist
              </button>
            )}
          </div>
          <form
            className={`w-full z-0 bg-white text-black border-4 border-black py-4 px-4 absolute top-${
              queueActive ? "1 block" : "0 hidden"
            } left-1/2 transform -translate-x-1/2 -translate-y-1`}
          >
            <input
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-blue-500 mb-2"
              placeholder="Playlist Name.."
            />
            <input
              type="text"
              value={playlistDescription}
              onChange={(e) => setPlaylistDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-blue-500 mb-2"
              placeholder="Playlist Description.."
            />
            <select
              defaultValue={playlistPrivacy}
              onChange={(e) => setPlaylistPrivacy(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-2 text-sm focus:outline-none focus:border-blue-500 mb-2"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            <select
              defaultValue={playlistPlatform}
              onChange={(e) => setPlaylistPlatform(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-2 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="spotify">Spotify</option>
              <option value="youtube">Youtube</option>
            </select>
          </form>
        </div>
        <hr />
      </div>
      <div className="p-4 space-y-4">
        {queueTracks.length ? (
          queueTracks.map((track: any) => (
            <QueueTrackCard key={track.id} track={track} />
          ))
        ) : (
          <Nothing />
        )}
      </div>
    </>
  );
}
