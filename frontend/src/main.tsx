import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { createBrowserRouter } from 'react-router-dom'
import { RouterProvider } from 'react-router-dom'
import Playlists from './components/Playlists.tsx'
import PlaylistTracks from './components/PlaylistTracks.tsx' 
import { ContextProvider } from './Context.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Playlists />,
      },
      {
        path: '/playlists/:id',
        element: <PlaylistTracks />,
      }
    ]
  }, 
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode> 
    <ContextProvider>
      <RouterProvider router={router} /> 
    </ContextProvider>
  </StrictMode>
)