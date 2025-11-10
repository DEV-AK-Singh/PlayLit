import { createContext, useState } from "react";
import type { Playlist, Track } from "./App.tsx"; 

type ContextType = {
  likedTracks: Track[];
  setLikedTracks: (tracks: Track[]) => void;
  queueTracks: Track[];
  setQueueTracks: (tracks: Track[]) => void;
  searchedTracks: Track[];
  setSearchedTracks: (tracks: Track[]) => void;
  myPlaylists: Playlist[];
  setMyPlaylists: (playlists: Playlist[]) => void;
};

export const MyContext = createContext<ContextType | undefined>(undefined);

export const ContextProvider = ({ children }: any) => {
  const [likedTracks, setLikedTracks] = useState([] as Track[]);
  const [queueTracks, setQueueTracks] = useState([] as Track[]);
  const [searchedTracks, setSearchedTracks] = useState([] as Track[]);
  const [myPlaylists, setMyPlaylists] = useState([] as Playlist[]);

  const contextInitialValues : ContextType = {
    likedTracks,
    setLikedTracks,
    queueTracks,
    setQueueTracks,
    searchedTracks,
    setSearchedTracks,
    myPlaylists,
    setMyPlaylists,
  };

  return (
    <MyContext.Provider
      value={contextInitialValues}
    >
      {children}
    </MyContext.Provider>
  );
};

