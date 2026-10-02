import { logout } from "../services/Authservice";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { getuserdetails } from "../services/Chatservice";
import { socket, cachedOnlineUsers } from "../lib/socket";

export default function SidebarRight() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { targetuserId } = useParams();
  
  const [targetuser, settargetuser] = useState(null);
  const [isOnline, setIsOnline] = useState(() => (cachedOnlineUsers || []).includes(targetuserId));

  useEffect(() => {
    if (!targetuserId) return;
    getuserdetails(targetuserId)
      .then((res) => {
        settargetuser(res.data);
      })
      .catch((err) => {
        console.log("error fetching user details for sidebar", err);
      });
  }, [targetuserId]);

  useEffect(() => {
    if (!targetuserId) return;
    const handleOnlineUsers = (users) => {
      setIsOnline(users.includes(targetuserId));
    };
    socket.on("online-users", handleOnlineUsers);
    return () => socket.off("online-users", handleOnlineUsers);
  }, [targetuserId]);

  const handlelogout = async () => {
    try {
      const data = await logout();
      setUser(null);
      console.log("The data after logout is ", data);
      navigate('/signin');
    } catch (error) {
      console.log("logout error", error);
    }
  }
  return (
    <div className="hidden lg:flex flex-col w-[320px] h-full smoked-panel shrink-0 shadow-lg z-10">
      <div className="flex-1 overflow-y-auto">
        {/* Profile Header */}
        <div className="p-8 flex flex-col items-center border-b border-white/5">
          <div className="relative mb-4">
            <img className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]" src={targetuser?.profilepic || targetuser?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetuser?.name || 'User')}&background=random`} alt={`${targetuser?.name || 'User'} avatar`} />
            <span className="absolute bottom-2 right-2 flex h-4 w-4">
              {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>}
              <span className={`relative inline-flex rounded-full h-4 w-4 ${isOnline ? 'bg-emerald-500' : 'bg-slate-500'} border-[3px] border-[#09101b]`}></span>
            </span>
          </div>
          <h3 className="font-headline-md text-headline-md text-white mb-1 text-center">{targetuser?.name || "Loading..."}</h3>
          <p className="text-sm text-slate-400 text-center px-4">{targetuser?.bio || "No bio available"}</p>
          <div className="flex gap-4 mt-6 w-full">
            <button className="flex-1 flex flex-col items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-white/5 transition-colors text-emerald-400">
              <span className="material-symbols-outlined">person</span>
              <span className="text-[10px] uppercase font-bold tracking-wider">Profile</span>
            </button>
            <button className="flex-1 flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined">notifications_off</span>
              <span className="text-[10px] uppercase font-bold tracking-wider">Mute</span>
            </button>
          </div>
        </div>
      </div>
      {/* Footer Action */}
      <div className="p-6 mt-auto">
        <button className="w-full py-3 px-4 rounded-lg flex justify-center items-center gap-2 text-error hover:bg-error/10 border border-transparent hover:border-error/20 transition-colors duration-300" onClick={handlelogout}>
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </div>
  );
}
