import type { Track } from "../App";
import { useMyContext } from "./ContextUtil";

export default function TrackCard({ track }: {
  track: Track
}) {
  const { queueTracks, setQueueTracks } = useMyContext();
  const checkTrack = (track: Track) => {
    const existingTrack = queueTracks.find((t) => t.id === track.id);
    return existingTrack ? true : false;
  };
  return (
    <div className="bg-white p-1 hover:shadow-lg transition-all duration-200 max-w-md cursor-pointer h-20" onClick={() => {
      if (checkTrack(track)) {
        alert('Track already in queue!');
        return;
      } else {
        setQueueTracks([...queueTracks, track]);
      }
    }}>
      <div className="flex items-center space-x-2">
        {/* Album Art */}
        <div className="relative w-18 h-18">
          <img
            src={track?.image || "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWMlMjBsb2dvfGVufDB8fDB8fHww&fm=jpg&q=60&w=3000"}
            alt={track?.name}
            className="w-full h-full object-cover object-center"
            style={{
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat", 
            }}
          />
          <span className="absolute bg-white bottom-0 left-0 w-full h-4 text-xs flex items-center justify-center text-black border border-black">{track?.duration}</span>
        </div>
        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {track?.name}
          </h3>
          <p className="text-gray-600 text-sm truncate">{track?.artist}</p>
        </div>
        {/* Actions */}
        <div className="flex items-center space-x-3 pe-3"> 
          <button className={`${track?.platform === "spotify" ? "bg-green-500" : "bg-red-500"} text-white h-10 w-10 rounded-full hover:${track?.platform === "spotify" ? "bg-green-600" : "bg-red-600"} transition-colors}`}>
            {track?.platform === "spotify" ? <i className="fa-brands fa-spotify"></i> : <i className="fa-brands fa-youtube"></i>} 
          </button>
        </div>
      </div>
    </div>
  );
}
