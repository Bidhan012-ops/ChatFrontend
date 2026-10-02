import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/Authservice';
import { fetchchats, searchuser } from '../services/Chatservice';
import Chat from './Chat';
import Schat from './Schat';
import ProfileDetailsModal from './ProfileDetailsModal';
import { Socket } from 'socket.io-client';
import { socket } from '../lib/socket';
export default function SidebarLeft() {
  const { targetuserId } = useParams();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [text, setText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [chats, setChats] = useState([]);
  const [searchchats, setSearchChats] = useState([]);

  const handlelogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate('/signin');
    } catch (error) {
      console.log("logout error", error);
    }
  }
  const fetchChatsData = async () => {
    try {
      const response = await fetchchats();

      // Deduplicate 1-on-1 chats to handle any existing DB duplicates
      const uniqueChats = [];
      const seenUserIds = new Set();

      response.data.forEach(chat => {
        if (!chat.isGroupChat && user) {
          const otherUser = chat.users.find(u => u._id !== user._id);
          if (otherUser) {
            if (!seenUserIds.has(otherUser._id)) {
              seenUserIds.add(otherUser._id);
              uniqueChats.push(chat);
            }
          } else {
            uniqueChats.push(chat);
          }
        } else {
          uniqueChats.push(chat);
        }
      });

      setChats(uniqueChats);
      console.log("Fetched and deduplicated chats:", uniqueChats);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };
  useEffect(() => {
    const handleNewMessage = (messagedetails) => {
      const chatId = messagedetails.chatId; // Note the lowercase 'c'
      const senderId = messagedetails.sender;

      setChats(prevChats => {
        // Find if this chat already exists in the sidebar
        const existingChatIndex = prevChats.findIndex(chat => chat._id === chatId);

        if (existingChatIndex !== -1) {
          // If it exists, clone it so we can modify it
          const chatToMove = { ...prevChats[existingChatIndex] };

          // Update the latestMessage preview text for the sidebar
          chatToMove.latestMessage = {
            content: messagedetails.content,
            latestMessage: messagedetails.content,
            time: new Date().toISOString(),
          };

          // Update unread count if the chat is not currently open
          if (senderId !== targetuserId) {
            chatToMove.unreadCount = (chatToMove.unreadCount || 0) + 1;
          }

          // Remove it from its old position
          const newChats = prevChats.filter(chat => chat._id !== chatId);

          // Add it to the top
          newChats.unshift(chatToMove);
          return newChats;
        } else {
          // If it's a completely new chat (e.g. from search), 
          // we re-fetch to get the full populated chat object from the backend.
          fetchChatsData();
          return prevChats;
        }
      });
    };

    socket.on("message", handleNewMessage);
    return () => socket.off("message", handleNewMessage);
  }, [targetuserId]);
  useEffect(() => {
    if (user) {
      fetchChatsData();
    }
  }, [user]);

  // When opening a chat, reset its unreadCount
  useEffect(() => {
    if (targetuserId && chats.length > 0) {
      setChats(prevChats => prevChats.map(chat => {
        const otherUser = chat.users.find(u => u._id !== user._id);
        if (otherUser && otherUser._id === targetuserId && chat.unreadCount > 0) {
          return { ...chat, unreadCount: 0 };
        }
        return chat;
      }));
    }
  }, [targetuserId]);

  useEffect(() => {
    setIsSearching(text.length > 0);
    if (text.length === 0) {
      setSearchChats([]);
      return;
    }
    const performSearch = async () => {
      try {
        const response = await searchuser(text);
        console.log("Search results:", response.data);
        setSearchChats(response.data);
      } catch (error) {
        console.error("Error searching users:", error);
      }
    }
    performSearch();
  }, [text]);
  return (
    <div className="flex flex-col w-full md:w-[320px] h-full smoked-panel shrink-0 shadow-lg z-10">
      {/* Header */}
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between mb-1 relative">
          <div className="font-headline-md text-headline-md text-on-surface">NeonChat</div>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined">more_vert</span>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-8 right-0 w-48 bg-[#1e293b] rounded-lg shadow-xl border border-white/10 overflow-hidden z-50">
              <button
                className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-white/5 transition-colors flex items-center gap-2"
                onClick={() => { setIsDropdownOpen(false); setIsProfileModalOpen(true); }}
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                Edit Profile
              </button>
              <button
                onClick={handlelogout}
                className="w-full text-left px-4 py-3 text-sm text-error hover:bg-error/10 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Logout
              </button>
            </div>
          )}
        </div>
        <div className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary"></span> Online
        </div>
      </div>
      {/* Search */}
      <div className="px-6 py-4">
        <div className="glass-input rounded-full flex items-center px-4 py-2 gap-2 transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant text-sm">search</span>
          <input className="bg-transparent border-none outline-none text-on-surface w-full placeholder-on-surface-variant text-sm focus:ring-0" placeholder="Search chats..." type="text" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
      </div>
      {/* Tabs */}
      <div className="flex px-4 gap-1 border-b border-white/5 pb-2">
        <button className="flex-1 py-2 text-primary font-bold bg-white/5 rounded-lg flex flex-col items-center gap-1 transition-colors">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
          <span className="text-[10px] uppercase tracking-wider">Chats</span>
        </button>
        <button className="flex-1 py-2 text-on-surface-variant hover:bg-white/5 rounded-lg flex flex-col items-center gap-1 transition-colors">
          <span className="material-symbols-outlined text-[20px]">call</span>
          <span className="text-[10px] uppercase tracking-wider">Calls</span>
        </button>
        <button className="flex-1 py-2 text-on-surface-variant hover:bg-white/5 rounded-lg flex flex-col items-center gap-1 transition-colors">
          <span className="material-symbols-outlined text-[20px]">history</span>
          <span className="text-[10px] uppercase tracking-wider">Status</span>
        </button>
      </div>
      {/* Contact List */}
      {
        isSearching ? (
          <div className="flex-1 overflow-y-auto p-4">
            {
              searchchats.length > 0 ? (
                searchchats.map((user) => {
                  return <Schat key={user.id} user={user} />
                })
              ) : (
                <div className="text-on-surface-variant text-sm text-center">No user found for "{text}"</div>
              )
            }
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-1">
            {/* Active Contact */}
            {
              chats.map((chat, index) => {
                return <Chat key={chat._id || index} chat={chat} />
              })
            }
          </div>
        )
      }
      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <button className="w-full py-3 px-4 bg-primary/10 border border-primary/20 rounded-lg text-primary font-headline-sm flex justify-center items-center gap-2 hover:bg-primary/20 transition-colors duration-300">
          <span className="material-symbols-outlined">add</span>
          New Message
        </button>
      </div>
      
      <ProfileDetailsModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        userProfile={user} 
      />
    </div>
  );
}
