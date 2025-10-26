import { Outlet } from "react-router-dom";
import SearchTracks from "./SearchTracks";
import QueueTracks from "./QueueTracks";
import LikedTracks from "./LikedTracks";

export default function Home({
  connectYoutube,
  youtubeUser,
  connectSpotify,
  spotifyUser,
  loadBothLikedTracks,
  loadBothPlaylists 
}: any) {
  return (
    <>
      <header className="bg-white">
        <div className="mx-auto flex h-20 w-full items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 bg-black">
          <h1 className="text-3xl text-white font-extrabold">Music Manager : { youtubeUser ? youtubeUser.display_name : "YT" } | { spotifyUser ? spotifyUser.display_name : "SP" }</h1>
          <div className="flex items-center justify-end md:justify-between">
            <div className="flex items-center gap-4">
              <div className="sm:flex sm:gap-4">
                <button
                  onClick={connectYoutube}
                  className="block rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  {youtubeUser ? "Connected YT!" : "Connect YouTube"}
                </button>
                <button
                  onClick={connectSpotify}
                  className="block rounded-full bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
                >
                  {spotifyUser ? "Connected SP!" : "Connect Spotify"}
                </button> 
                <button
                  onClick={loadBothPlaylists}
                  className="block rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  Load Playlists
                </button> 
                <button
                  onClick={loadBothLikedTracks}
                  className="block rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  Load Liked Tracks
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="bg-white p-5">
        <div className="h-[calc(100vh-120px)] bg-white">
          <div className="grid grid-cols-9 gap-5 h-full">
            <div className="h-full bg-black text-white col-span-2 overflow-y-scroll relative">
              <LikedTracks />
            </div>
            <div className="h-full bg-black text-white col-span-3 overflow-y-scroll">
              <Outlet />
            </div>
            <div className="h-full bg-black text-white col-span-2 overflow-y-scroll">
              <SearchTracks />
            </div>
            <div className="h-full bg-black text-white col-span-2 overflow-y-scroll">
              <QueueTracks />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
