import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import App from './App.jsx'
import ChatArea from './components/ChatArea.jsx'
import Signup from './components/Signup.jsx'
import Signin from './components/Signin.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import GuestRoute from './components/GuestRoute.jsx'
import LandingPage from './components/LandingPage.jsx'
import "./App.css"

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute><App /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <div className="hidden md:flex flex-1 items-center justify-center text-on-surface-variant bg-[var(--color-surface-container)]/50 backdrop-blur-[4px]">Select a chat to start messaging</div>
      },
      {
        path: "chat/:targetuserId",

        element: <ProtectedRoute><ChatArea /></ProtectedRoute>
      }
    ]
  },
  {
    path: "/signup",
    element: <GuestRoute><Signup /></GuestRoute>
  },
  {
    path: "/signin",
    element: <GuestRoute><Signin /></GuestRoute>
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
