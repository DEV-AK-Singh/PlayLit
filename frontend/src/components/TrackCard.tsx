import { milliSecondsToMinutesSeconds, type Track } from "../App";
import { useMyContext } from "./ContextUtil";

export default function TrackCard({ track }: { track: Track }) {
  const { queueTracks, setQueueTracks } = useMyContext();
  const checkTrack = (track: Track) => {
    const existingTrack = queueTracks.find((t) => t.id === track.id);
    return existingTrack ? true : false;
  };
  return (
    <div
      className="text-white transition-all duration-200 max-w-md cursor-pointer py-2"
      onClick={() => {
        if (checkTrack(track)) {
          alert("Track already in queue!");
          return;
        } else {
          setQueueTracks([...queueTracks, track]);
        }
      }}
    >
      <div className="flex items-center space-x-2">
        {/* Album Art */}
        <div className="relative w-14 h-14">
          <img
            src={
              track?.image ||
              "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWMlMjBsb2dvfGVufDB8fDB8fHww&fm=jpg&q=60&w=3000"
            }
            alt={track?.name}
            className="w-full h-full object-cover object-center rounded-lg border border-slate-600"
            style={{
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
          />
        </div>
        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm truncate">
            {track?.name}
          </h3>
          <p className="text-white text-xs truncate">{track?.artist}</p>
        </div>
        {/* Actions */}
        <div className="flex items-center px-1 sm:px-2 md:px-4 lg:px-6 xl:px-8">
          <h1 className="text-xs font-thin">
            {milliSecondsToMinutesSeconds(track?.duration || 0)}
          </h1>
        </div>
        <div className="flex items-center space-x-3 pe-3">
          <button
            className={`${
              track?.platform === "spotify" ? "text-green-500" : "text-red-500"
            } transition-colors text-2xl`}
          >
            {track?.platform === "spotify" ? (
              <i className="fa-brands fa-spotify"></i>
            ) : (
              <i className="fa-brands fa-youtube"></i>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
