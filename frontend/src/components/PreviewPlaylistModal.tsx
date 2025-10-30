// PreviewPlaylistModal.tsx
import React, { useState, useEffect } from "react";
import { milliSecondsToMinutesSeconds, type Track } from "../App";

export const dummyTracks: Track[][] = [
  [
    {
      id: "0FoAlOXHI6KJ4RHP9v8jnw",
      name: "Baby Girl",
      album: "Baby Girl",
      artist: "Guru Randhawa, Dhvani Bhanushali",
      image: "https://i.scdn.co/image/ab67616d0000b27333f648898c89bc72e75eec43",
      duration: 207493,
      platform: "spotify",
      platformUrl: "https://open.spotify.com/track/0FoAlOXHI6KJ4RHP9v8jnw",
    },
  ],
  [
    {
      id: "4rOvOF8mGZToUh1KuZW3iS",
      name: "Bol Kaffara Kya Hoga",
      album: "Bol Kaffara Kya Hoga",
      artist: "chronically online",
      image: "https://i.scdn.co/image/ab67616d0000b273c27a6440b4baeda9ecd100a4",
      duration: 406000,
      platform: "spotify",
      platformUrl: "https://open.spotify.com/track/4rOvOF8mGZToUh1KuZW3iS",
    },
  ],
  [
    {
      id: "56zZ48jdyY2oDXHVnwg5Di",
      name: "Tum Hi Ho",
      album: "Aashiqui 2",
      artist: "Mithoon, Arijit Singh",
      image: "https://i.scdn.co/image/ab67616d0000b2736404721c1943d5069f0805f3",
      duration: 261974,
      platform: "spotify",
      platformUrl: "https://open.spotify.com/track/56zZ48jdyY2oDXHVnwg5Di",
    },
    {
      id: "6E9UwSfT80age2xknoMS7Y",
      name: 'Tum Hi Aana (From "Marjaavaan")',
      album: 'Tum Hi Aana (From "Marjaavaan")',
      artist: "Payal Dev, Jubin Nautiyal, Kunaal Vermaa",
      image: "https://i.scdn.co/image/ab67616d0000b2736539071e0f1833190a491d4d",
      duration: 249126,
      platform: "spotify",
      platformUrl: "https://open.spotify.com/track/6E9UwSfT80age2xknoMS7Y",
    },
    {
      id: "5PUXKVVVQ74C3gl5vKy9Li",
      name: "Heeriye (feat. Arijit Singh)",
      album: "Heeriye (feat. Arijit Singh)",
      artist: "Jasleen Royal, Arijit Singh, Dulquer Salmaan",
      image: "https://i.scdn.co/image/ab67616d0000b2734a60872ae145776164540a7f",
      duration: 194857,
      platform: "spotify",
      platformUrl: "https://open.spotify.com/track/5PUXKVVVQ74C3gl5vKy9Li",
    },
  ],
  [
    {
      id: "0TeH0rRFmef6eqk86MPyUA",
      name: "MACHAYENGE 4",
      album: "MACHAYENGE 4",
      artist: "Emiway Bantai",
      image: "https://i.scdn.co/image/ab67616d0000b2732fa101479cfd6b18a78fde26",
      duration: 605898,
      platform: "spotify",
      platformUrl: "https://open.spotify.com/track/0TeH0rRFmef6eqk86MPyUA",
    },
    {
      id: "3LDbs1aonzCuDC7e1plkEX",
      name: "Akela",
      album: "Akela",
      artist: "BAWA",
      image: "https://i.scdn.co/image/ab67616d0000b27341b850051501fc0470cbbb38",
      duration: 200904,
      platform: "spotify",
      platformUrl: "https://open.spotify.com/track/3LDbs1aonzCuDC7e1plkEX",
    },
    {
      id: "5dqrgmHHBuUzwYKBXJuIm0",
      name: "Like I Ain't",
      album: "N9NA",
      artist: "Tech N9ne",
      image: "https://i.scdn.co/image/ab67616d0000b27369ca801157537b266dc93873",
      duration: 222904,
      platform: "spotify",
      platformUrl: "https://open.spotify.com/track/5dqrgmHHBuUzwYKBXJuIm0",
    },
  ],
  [
    {
      id: "5PUXKVVVQ74C3gl5vKy9Li",
      name: "Heeriye (feat. Arijit Singh)",
      album: "Heeriye (feat. Arijit Singh)",
      artist: "Jasleen Royal, Arijit Singh, Dulquer Salmaan",
      image: "https://i.scdn.co/image/ab67616d0000b2734a60872ae145776164540a7f",
      duration: 194857,
      platform: "spotify",
      platformUrl: "https://open.spotify.com/track/5PUXKVVVQ74C3gl5vKy9Li",
    },
    {
      id: "4MU4Kfkd9EnkArK2ocQyqK",
      name: "Zaalima",
      album: "The Arijit Singh Collection",
      artist: "Arijit Singh, Harshdeep Kaur",
      image: "https://i.scdn.co/image/ab67616d0000b273627b5b17cb48f6e6956b842e",
      duration: 299333,
      platform: "spotify",
      platformUrl: "https://open.spotify.com/track/4MU4Kfkd9EnkArK2ocQyqK",
    },
    {
      id: "1tCduDqB3J8r90FAxprLzO",
      name: "Nazm Nazm",
      album: "Hits of Ayushmann Khurrana",
      artist: "Arko",
      image: "https://i.scdn.co/image/ab67616d0000b273bb101867b5d5f63bf1ae30ba",
      duration: 226941,
      platform: "spotify",
      platformUrl: "https://open.spotify.com/track/1tCduDqB3J8r90FAxprLzO",
    },
  ],
];

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
  };

  const getSelectedTracksCount = (): number => {
    return Object.keys(selectedTracks).length;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 text-white bg-slate-900/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
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
        <div className="p-4 overflow-y-auto max-h-[60vh]">
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
        <div className="p-6 border-t border-gray-200 bg-slate-900 text-white">
          <div className="flex justify-between items-center">
            <div>{getSelectedTracksCount()} tracks selected</div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={getSelectedTracksCount() === 0}
                className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
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
      <div className="mb-2 rounded-lg overflow-hidden">
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
              <div className="bg-gray-100 p-2 border-b border-gray-200">
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
      className={`p-4 hover:bg-slate-800 bg-slate-900 cursor-pointer transition-colors`}
    >
      <div className="flex items-center space-x-4">
        {/* Album Art */}
        <div className="relative">
          <img
            src={track.image}
            alt={track.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div
            className={`absolute -top-1 -right-1 w-6 h-6 rounded-full text-xs flex items-center justify-center text-white ${
              track.platform === "spotify" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {track.platform === "spotify" ? (
              <i className="fab fa-spotify"></i>
            ) : (
              <i className="fab fa-youtube"></i>
            )}
          </div>
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
              <button
                onClick={onToggle}
                className="cursor-pointer"
              >
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
          <div
            className={`absolute -top-1 -right-1 w-6 h-6 rounded-full text-xs flex items-center justify-center text-white ${
              track.platform === "spotify" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {track.platform === "spotify" ? (
              <i className="fab fa-spotify"></i>
            ) : (
              <i className="fab fa-youtube"></i>
            )}
          </div>
        </div> 

        {/* Track Info */}
        <div className="flex-1 min-w-0">
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
