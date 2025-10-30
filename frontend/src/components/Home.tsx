import { Outlet } from "react-router-dom";
import SearchTracks from "./SearchTracks";
import QueueTracks from "./QueueTracks";
import LikedTracks from "./LikedTracks";
import playLitLogo from "../assets/playlitLogo.png";

export default function Home({
  connectYoutube,
  youtubeUser,
  connectSpotify,
  spotifyUser,
  loadBothLikedTracks,
  loadBothPlaylists,
}: any) {
  return (
    <>
      <header>
        <div className="mx-auto flex h-20 w-full items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 bg-slate-900">
          <div className="flex items-center gap-2">
            <img src={playLitLogo} alt="PlayLit Logo" className="h-16 w-16 mix-blend-lighten" />
            <h1 className="text-3xl text-white font-extrabold">
              <span>PLay</span>
              <span className="text-red-500">Lit</span>
            </h1>
          </div>
          {/* { youtubeUser ? youtubeUser.display_name : "YT" } | { spotifyUser ? spotifyUser.display_name : "SP" } */}
          <div className="flex items-center justify-end md:justify-between">
            <div className="flex items-center gap-4">
              <div className="sm:flex sm:gap-4">
                <button
                  onClick={loadBothPlaylists}
                  className="rounded-lg bg-slate-700 px-5 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800 flex items-center"
                >
                  Refresh Playlists
                </button>
                <button
                  onClick={loadBothLikedTracks}
                  className="rounded-lg bg-slate-700 px-5 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800 flex items-center"
                >
                  Refresh Liked Tracks
                </button>
                <button
                  onClick={connectYoutube}
                  className="rounded-lg bg-slate-700 px-5 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800 flex items-center"
                >
                  <span>
                    {youtubeUser ? "Connected YT!" : "Connect YouTube"}
                  </span>
                  <i className="fa-brands fa-youtube px-2 text-base text-red-500"></i>
                </button>
                <button
                  onClick={connectSpotify}
                  className="rounded-lg bg-slate-700 px-5 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800 flex items-center"
                >
                  <span>
                    {spotifyUser ? "Connected SP!" : "Connect Spotify"}
                  </span>
                  <i className="fa-brands fa-spotify px-2 text-base text-green-500"></i>
                </button>
                <button
                  onClick={() => {}}
                  className="px-5 py-1.5 text-lg font-medium text-white transition flex items-center"
                >
                  <span>
                    Hey{" "}
                    {youtubeUser && spotifyUser
                      ? spotifyUser.display_name
                      : youtubeUser
                      ? youtubeUser.display_name
                      : spotifyUser
                      ? spotifyUser.display_name
                      : "there!"}
                    👋
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="bg-slate-900 p-5">
        <div className="h-[calc(100vh-120px)] bg-white">
          <div className="grid grid-cols-4 grid-rows-2 gap-5 h-full bg-slate-900">
            <div className="h-full bg-slate-800 text-white col-span-2 row-span-2 overflow-y-scroll border border-slate-700 rounded-lg">
              <Outlet />
            </div>
            <div className="h-full bg-slate-800 text-white col-span-1 overflow-y-scroll border border-slate-700 rounded-lg">
              <LikedTracks />
            </div>
            <div className="h-full bg-slate-800 text-white col-span-1 overflow-y-scroll border border-slate-700 rounded-lg">
              <SearchTracks />
            </div>
            <div className="h-full bg-slate-800 text-white col-span-2 overflow-y-scroll border border-slate-700 rounded-lg">
              <QueueTracks />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
