// PreviewPlaylistModal.tsx
import React, { useState, useEffect } from "react";
import { milliSecondsToMinutesSeconds, type Track } from "../App.tsx";

interface PreviewPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistName: string;
  searchResults: Track[][];
  onConfirm: (tracks: Track[]) => void;
}

const PreviewPlaylistModal: React.FC<PreviewPlaylistModalProps> = ({
  isOpen,
  onClose,
  playlistName,
  searchResults,
  onConfirm,
}) => {
  const [selectedTracks, setSelectedTracks] = useState<Record<string, Track>>(
    {}
  );

  useEffect(() => {
    if (searchResults.length > 0) {
      const trackObjects: Record<string, Track> = {};
      searchResults.map((result) => {
        trackObjects[String(result[0].id)] = result[0];
      });
      setSelectedTracks(trackObjects);
    }
  }, [searchResults]);

  const handleConfirm = () => {
    const tracks = Object.values(selectedTracks);
    onConfirm(tracks);
    onClose();
    alert("Playlist creating...");
  };

  const getSelectedTracksCount = (): number => {
    return Object.keys(selectedTracks).length;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 text-white bg-black/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4"
      style={{ padding: "16px" }}
    >
      <div
        className="bg-black rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        style={{ padding: "16px" }}
      >
        {/* Header */}
        <div
          className="p-4 border-b border-gray-200"
          style={{ padding: "16px" }}
        >
          <div className="flex justify-between items-center">
            <h2 className=" text-2xl font-semibold">
              Preview Playlist: {playlistName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-100 text-2xl"
            >
              <i className="fa-solid fa-x"></i>
            </button>
          </div>
          <p className="text-gray-400 mt-1 text-sm">
            Review and customize your tracks before creating the playlist
          </p>
        </div>

        {/* Content */}
        <div
          className="p-4 overflow-y-auto max-h-[60vh]"
          style={{ padding: "16px", maxHeight: "360px" }}
        >
          {searchResults.map((result, index) => (
            <TrackSelection
              key={index}
              tracks={result}
              selectedTracks={selectedTracks}
              setSelectedTracks={setSelectedTracks}
            />
          ))}
        </div>

        {/* Footer */}
        <div
          className="p-6 border-t border-gray-200 text-white"
          style={{ padding: "16px" }}
        >
          <div className="flex justify-between items-center">
            <div>{getSelectedTracksCount()} tracks selected</div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                style={{ padding: "12px", marginRight: "12px" }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                style={{ padding: "16px" }}
                onClick={handleConfirm}
                disabled={getSelectedTracksCount() === 0}
                className="px-6 py-2 bg-black text-white border rounded-lg hover:bg-black/80 disabled:bg-black/40 disabled:cursor-not-allowed transition-colors"
              >
                Create Playlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Track Selection Component Props
interface TrackSelectionProps {
  tracks: Track[];
  selectedTracks: Record<string, Track>;
  setSelectedTracks: (tracks: Record<string, Track>) => void;
}

const TrackSelection: React.FC<TrackSelectionProps> = ({
  tracks,
  selectedTracks,
  setSelectedTracks,
}) => {
  if (tracks.length === 0) {
    return (
      <div
        className="mb-2 rounded-lg overflow-hidden"
        style={{ margin: "16px" }}
      >
        <div className="bg-gray-100 p-2 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">No tracks found</h3>
        </div>
      </div>
    );
  }

  const [toggleOptions, setToggleOptions] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track>(tracks[0]);

  return (
    <div className="mb-2 rounded-lg overflow-hidden">
      <div className="divide-y divide-gray-100">
        {tracks.length > 1 ? (
          <>
            <TrackHeader
              key={currentTrack.id}
              track={currentTrack}
              single={false}
              optionsHidden={toggleOptions}
              onToggle={() => {
                setToggleOptions(!toggleOptions);
              }}
            />
            {toggleOptions && (
              <div
                className="p-2 border-b border-gray-200 bg-black"
                style={{ padding: "4px" }}
              >
                <div className="space-y-2 bg-white">
                  {tracks.map((track, index) => (
                    <TrackOption
                      key={track.id}
                      track={track}
                      isSelected={track.id === currentTrack?.id}
                      position={index}
                      onSelect={() => {
                        setCurrentTrack(track);
                        setSelectedTracks({
                          ...selectedTracks,
                          [currentTrack.id]: track,
                        });
                        setToggleOptions(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <TrackHeader
            key={currentTrack.id}
            track={currentTrack}
            single={true}
            optionsHidden={toggleOptions}
            onToggle={() => {
              setToggleOptions(!toggleOptions);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Track Option Props
interface TrackOptionProps {
  track: Track;
  isSelected: boolean;
  position: number;
  onSelect: () => void;
}

interface TrackHeaderProps {
  track: Track;
  single: boolean;
  optionsHidden: boolean;
  onToggle: () => void;
}

const TrackHeader: React.FC<TrackHeaderProps> = ({
  track,
  single,
  optionsHidden = false,
  onToggle,
}) => {
  return (
    <div
      style={{ padding: "12px", margin: "4px" }}
      className={`p-4 hover:bg-black/90 bg-black cursor-pointer transition-colors border`}
    >
      <div className="flex items-center space-x-4">
        {/* Album Art */}
        <div className="relative">
          <img
            src={track.image}
            alt={track.name}
            className="w-16 h-16 rounded-lg object-cover"
            style={{ marginRight: "16px" }}
          />
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-white text-base truncate">
                {track.name}
              </h4>
              <p className="text-white text-xs truncate">{track.artist}</p>
              <p className="text-gray-400 text-xs truncate">
                {track.album} • {milliSecondsToMinutesSeconds(track.duration)}
              </p>
            </div>
          </div>
        </div>

        {/* Radio Button */}
        {!single && (
          <div className="shrink-0">
            <div className="flex items-center justify-center">
              <button onClick={onToggle} className="cursor-pointer">
                {!optionsHidden ? (
                  <h1 className="text-xs underline">show suggestions</h1>
                ) : (
                  <h1 className="text-xs underline">hide suggestions</h1>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TrackOption: React.FC<TrackOptionProps> = ({
  track,
  isSelected,
  position,
  onSelect,
}) => {
  const getSuggestionText = (): string => {
    if (position === 0) return "🎯 Best Match";
    if (position === 1) return "👍 Good Alternative";
    if (position === 2) return "🤔 Other Option";
    return "";
  };

  const getSuggestionColor = (): string => {
    if (position === 0) return "text-green-600 bg-green-50 border-green-200";
    if (position === 1) return "text-blue-600 bg-blue-50 border-blue-200";
    if (position === 2) return "text-purple-600 bg-purple-50 border-purple-200";
    return "";
  };

  return (
    <div
      className={`p-4 hover:bg-blue-50 cursor-pointer transition-colors ${
        isSelected ? "bg-blue-100 border-l-4 border-l-blue-500" : ""
      }`}
      style={{ padding: "12px" }}
      onClick={onSelect}
    >
      <div className="flex items-center space-x-4">
        {/* Album Art */}
        <div className="relative">
          <img
            src={track.image}
            alt={track.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0" style={{ padding: "16px" }}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-base truncate">
                {track.name}
              </h4>
              <p className="text-gray-600 text-xs truncate">{track.artist}</p>
              <p className="text-gray-500 text-xs truncate">
                {track.album} • {milliSecondsToMinutesSeconds(track.duration)}
              </p>
            </div>
            {/* Suggestion Badge */}
            <div
              className={`ml-4 px-2 py-1 rounded-full text-xs font-medium border ${getSuggestionColor()}`}
            >
              {getSuggestionText()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPlaylistModal;
