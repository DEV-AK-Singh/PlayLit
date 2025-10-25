// PreviewPlaylistModal.tsx
import React, { useState, useEffect } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  platform: 'spotify' | 'youtube';
  image: string;
  url: string;
}

interface SearchResult {
  query: string;
  tracks: Track[];
  error?: string;
}

interface PreviewPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistName: string;
  searchResults: SearchResult[];
  onConfirm: (tracks: Track[]) => void;
}

const PreviewPlaylistModal: React.FC<PreviewPlaylistModalProps> = ({
  isOpen,
  onClose,
  playlistName = "New Playlist",
  searchResults,
  onConfirm
}) => {
  const [selectedTracks, setSelectedTracks] = useState<Record<string, Track>>({});

  useEffect(() => {
    const initialSelections: Record<string, Track> = {};
    searchResults.forEach(result => {
      if (result.tracks.length > 0) {
        initialSelections[result.query] = result.tracks[0];
      }
    });
    setSelectedTracks(initialSelections);
  }, [searchResults]);

  const handleTrackSelect = (query: string, track: Track) => {
    setSelectedTracks(prev => ({
      ...prev,
      [query]: track
    }));
  };

  const handleConfirm = () => {
    const tracks = Object.values(selectedTracks);
    onConfirm(tracks);
    onClose();
  };

  const getSelectedTracksCount = (): number => {
    return Object.keys(selectedTracks).length;
  };

  if (!isOpen) return null;

  console.log(searchResults);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Preview Playlist: {playlistName}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-gray-600 mt-1">
            Review and customize your tracks before creating the playlist
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {searchResults.map((result, index) => (
            <TrackSelection
              key={index}
              query={result.query}
              tracks={result.tracks}
              selectedTrack={selectedTracks[result.query]}
              onTrackSelect={handleTrackSelect}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-gray-600">
              {getSelectedTracksCount()} tracks selected
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={getSelectedTracksCount() === 0}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
  query: string;
  tracks: Track[];
  selectedTrack: Track | undefined;
  onTrackSelect: (query: string, track: Track) => void;
}

const TrackSelection: React.FC<TrackSelectionProps> = ({
  query,
  tracks,
  selectedTrack,
  onTrackSelect
}) => {
  if (tracks.length === 0) {
    return (
      <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-2">"{query}"</h3>
        <p className="text-gray-500 text-sm">No tracks found</p>
      </div>
    );
  }

  return (
    <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
      {/* Query Header */}
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">"{query}"</h3>
        <p className="text-gray-500 text-sm mt-1">
          Select the best match for your playlist
        </p>
      </div>

      {/* Track Options */}
      <div className="divide-y divide-gray-100">
        {tracks.map((track, index) => (
          <TrackOption
            key={track.id}
            track={track}
            isSelected={selectedTrack?.id === track.id}
            position={index}
            onSelect={() => onTrackSelect(query, track)}
          />
        ))}
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

const TrackOption: React.FC<TrackOptionProps> = ({
  track,
  isSelected,
  position,
  onSelect
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
      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center space-x-4">
        {/* Album Art */}
        <div className="relative">
          <img
            src={track.image}
            alt={track.title}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center text-white ${
            track.platform === 'spotify' ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {track.platform === 'spotify' ? 'S' : 'Y'}
          </div>
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">{track.title}</h4>
              <p className="text-gray-600 text-sm truncate">{track.artist}</p>
              <p className="text-gray-500 text-xs truncate">{track.album} • {track.duration}</p>
            </div>
            
            {/* Suggestion Badge */}
            <div className={`ml-4 px-2 py-1 rounded-full text-xs font-medium border ${getSuggestionColor()}`}>
              {getSuggestionText()}
            </div>
          </div>
        </div>

        {/* Radio Button */}
        <div className="shrink-0">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            isSelected 
              ? 'border-blue-500 bg-blue-500' 
              : 'border-gray-300'
          }`}>
            {isSelected && (
              <div className="w-2 h-2 rounded-full bg-white"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPlaylistModal;