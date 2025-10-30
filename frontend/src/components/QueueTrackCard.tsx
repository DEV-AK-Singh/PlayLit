import { milliSecondsToMinutesSeconds, type Track } from "../App";
import { useMyContext } from "./ContextUtil";

export default function QueueTrackCard({ track }: { track: Track }) {
  const { queueTracks, setQueueTracks } = useMyContext();
  return (
    <div
      key={track?.id}
      id={"vid-" + track?.id}
      className="text-white transition-all duration-200 cursor-pointer py-2 w-full"
    >
      <div className="flex items-center space-x-2 w-full">
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
        <div className="flex-1 min-w-0 w-full px-2">
          <h3 className="font-semibold text-white text-base truncate">
            {track?.name}
          </h3>
        </div>
        {/* Actions */}
        <div className="flex items-center px-1 sm:px-2 md:px-4 lg:px-6 xl:px-8"> 
          <p className="text-white text-xs truncate">{track?.artist}</p>
        </div>
        <div className="flex items-center px-1 sm:px-2 md:px-4 lg:px-6 xl:px-8">
          <h1 className="text-xs font-thin">
            {milliSecondsToMinutesSeconds(track?.duration || 0)}
          </h1>
        </div>
        <div className="flex items-center space-x-3 pe-3">
          <button
            onClick={() => {
              window.location.href = track?.platformUrl;
            }}
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
          <button
            onClick={() => {
              setQueueTracks(queueTracks.filter((t) => t.id !== track?.id));
            }}
            className={`bg-black text-white h-10 w-10 rounded-full hover:${
              track?.platform === "spotify" ? "bg-green-600" : "bg-red-600"
            } transition-colors}`}
          >
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
