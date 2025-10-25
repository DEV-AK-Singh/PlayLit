import { createContext, useState } from "react";

type ContextType = {
  likedTracks: any[];
  setLikedTracks: (tracks: any[]) => void;
  queueTracks: any[];
  setQueueTracks: (tracks: any[]) => void;
  searchedTracks: any[];
  setSearchedTracks: (tracks: any[]) => void;
  myPlaylists: any[];
  setMyPlaylists: (playlists: any[]) => void;
};

export const MyContext = createContext<ContextType | undefined>(undefined);

export const ContextProvider = ({ children }: any) => {
  const [likedTracks, setLikedTracks] = useState([] as any);
  const [queueTracks, setQueueTracks] = useState([] as any);
  const [searchedTracks, setSearchedTracks] = useState([] as any);
  const [myPlaylists, setMyPlaylists] = useState([] as any);

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

