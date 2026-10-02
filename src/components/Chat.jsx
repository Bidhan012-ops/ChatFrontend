import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { socket, cachedOnlineUsers } from '../lib/socket'

const Chat = ({ chat }) => {
  const { targetuserId } = useParams();
  const { user: currentUser } = useAuth();
  
  const otherUser = chat?.users?.find(u => u._id !== currentUser?._id);
  const [isOnline, setIsOnline] = useState(() => {
    return otherUser ? cachedOnlineUsers.includes(otherUser._id) : false;
  });

  useEffect(() => {
    if (!otherUser) return;
    const handleOnlineUsers = (users) => {
      setIsOnline(users.includes(otherUser._id));
    };
    socket.on("online-users", handleOnlineUsers);
    return () => socket.off("online-users", handleOnlineUsers);
  }, [otherUser]);

  if (!chat || !otherUser) return null;

  // Use a fallback avatar since they might not have profilePic set, matching Schat behavior.
  const avatarUrl = otherUser.profilepic || otherUser.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name || 'User')}&background=random`;

  return (
    <div>
      <Link to={`/dashboard/chat/${otherUser._id}`} className={`flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer ${targetuserId === otherUser._id ? 'bg-emerald-500/10 border border-emerald-500/20 shadow-sm' : 'hover:bg-white/5'}`}>
        <div className="relative shrink-0">
          <img className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]" src={avatarUrl} alt={`${otherUser.name} avatar`} />
          <span className="absolute bottom-0 right-0 flex h-3 w-3">
            {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-emerald-500' : 'bg-slate-500'} border-2 border-[#09101b]`}></span>
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline mb-1">
            <span className="font-headline-sm text-headline-sm text-on-surface truncate">{otherUser.name}</span>
            <span className="text-xs text-primary flex items-center gap-2">
              {chat.unreadCount > 0 && (
                <span className="bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {chat.unreadCount}
                </span>
              )}
              {chat.latestMessage ? new Date(chat.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
            </span>
          </div>
          <div className="text-sm text-on-surface-variant truncate">{chat.latestMessage ? chat.latestMessage.content : "No messages yet"}</div>
        </div>
      </Link>
    </div>
  )
}

export default Chat
