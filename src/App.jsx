import { Outlet, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import { socket } from './lib/socket'
import './App.css'
import MobileNav from './components/MobileNav'
import SidebarLeft from './components/SidebarLeft'
import SidebarRight from './components/SidebarRight'

function App() {
  const { targetuserId } = useParams();
  const isChatActive = !!targetuserId;
  const { user } = useAuth();

  useEffect(() => {
    if (user && user._id) {
      if (!socket.connected) {
        socket.connect();
      }
      socket.emit("setup", user._id);
    } else {
      socket.disconnect();
    }

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col md:flex-row p-0 md:p-[var(--spacing-container-margin)] gap-0 md:gap-[var(--spacing-gutter)] font-sans text-slate-100 bg-acrylic-canvas antialiased">
      {/* Mobile Nav - hidden when a chat is open on mobile */}
      <div className={`${isChatActive ? 'hidden md:block' : 'block'} md:hidden w-full shrink-0`}>
        <MobileNav />
      </div>
      
      {/* Main App Container */}
      <div className="flex flex-1 h-full w-full overflow-hidden md:rounded-xl">
        {/* SidebarLeft - hidden when a chat is open on mobile */}
        <div className={`h-full shrink-0 w-full md:w-auto ${isChatActive ? 'hidden md:block' : 'block'}`}>
          <SidebarLeft />
        </div>
        
        {/* ChatArea/Outlet - hidden when no chat is open on mobile */}
        <div className={`flex-1 h-full overflow-hidden ${!isChatActive ? 'hidden md:flex' : 'flex'}`}>
          <Outlet />
        </div>
        
        {/* SidebarRight - hide on mobile, only visible on lg screens when chat active */}
        <div className={`hidden lg:flex flex-col w-[320px] h-full shrink-0 ${!isChatActive && 'lg:invisible'}`}>
          {isChatActive && <SidebarRight />}
        </div>
      </div>
    </div>
  )
}

export default App
