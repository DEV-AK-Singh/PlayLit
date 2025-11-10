import { milliSecondsToMinutesSeconds, type Track } from "../App.tsx";
import { useMyContext } from "./ContextUtil";

export default function QueueTrackCard({ track }: { track: Track }) {
  const { queueTracks, setQueueTracks } = useMyContext();
  return (
    <>
      <div key={track?.id} id={"vid-" + track?.id} className="track-item">
        <div className="track-img">
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
        <div className="track-info">
          <div className="track-title">{track?.name}</div>
          <div className="track-artist">
            {track?.artist} •{" "}
            {milliSecondsToMinutesSeconds(track?.duration || 0)} •{" "}
            <span
              onClick={() => {
                window.location.href = track?.platformUrl;
              }}
            >
              {track?.platform}
            </span> •{" "}
            <span
              onClick={() => {
                setQueueTracks(queueTracks.filter((t) => t.id !== track?.id));
              }}
              className="text-red-600"
            >
              delete
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
