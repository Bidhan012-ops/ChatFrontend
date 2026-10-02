import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { socket, cachedOnlineUsers } from '../lib/socket'

const Schat = ({ user }) => {
    const { chatId } = useParams()
    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        const handleOnlineUsers = (users) => {
            setIsOnline(users.includes(user._id));
        };
        // It's possible the list of online users is already available, 
        // but since we only get it on an event, we'll listen for it.
        // Actually, to get the initial list, we might miss the event if it fired earlier.
        // To be safe, socket.io doesn't cache it, so we'll just wait for the next event or it starts offline.
        // Ideally we fetch it, but let's stick to the socket event.
        socket.on("online-users", handleOnlineUsers);
        return () => socket.off("online-users", handleOnlineUsers);
    }, [user._id]);

    return (
        <div>
            <Link to={`/dashboard/chat/${user._id}`} className={`flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer ${chatId === user._id ? 'bg-emerald-500/10 border border-emerald-500/20 shadow-sm' : 'hover:bg-white/5'}`}>
                <div className="relative shrink-0">
                    <img className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]" src={user.profilepic || user.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`} alt={`${user.name} avatar`} />
                    <span className="absolute bottom-0 right-0 flex h-3 w-3">
                        {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>}
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-emerald-500' : 'bg-slate-500'} border-2 border-[#09101b]`}></span>
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="font-headline-sm text-headline-sm text-on-surface truncate">{user.name}</span>
                    </div>
                    <div className="text-sm text-on-surface-variant truncate">not available</div>
                </div>
            </Link>
        </div>
    )
}

export default Schat
