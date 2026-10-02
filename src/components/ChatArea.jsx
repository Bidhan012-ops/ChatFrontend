import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { accessChat, markAsRead } from '../services/Chatservice';
import { useEffect, useState } from 'react';
import { fetchmessages } from '../services/Chatservice';
import Rmessage from './Rmessage';
import Smessage from './Smessage';
import { socket, cachedOnlineUsers } from '../lib/socket';
import { useRef } from 'react';
import { sendmessage } from '../services/Chatservice';
import { getuserdetails } from '../services/Chatservice';
import VideoCall from './VideoCall';

export default function ChatArea() {
  const { targetuserId } = useParams()
  const { user } = useAuth();
  console.log("this is form the fuck", targetuserId);
  const [chatdetail, setChatdetail] = useState(null);
  const [messages, setmessages] = useState([]);
  const [onlineusers, setonlineusers] = useState(() => cachedOnlineUsers || []);
  const [isonline, setisonline] = useState(() => (cachedOnlineUsers || []).includes(targetuserId));
  const [isSending, setIsSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const messageref = useRef();
  const fileref = useRef(null);
  const ringtoneRef = useRef(new Audio('/whatsapp_ringtone.mp3'));

  // WebRTC Call State
  const [callType, setCallType] = useState(null); // 'video' | 'audio' | null
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    const handleMessage = (messagedetails) => {
      if (chatdetail && chatdetail._id === messagedetails.chatId) {
        setmessages((prev) => [...prev, messagedetails]);
      }
      console.log("this is the messagedetails received from the server", messagedetails);
    };
    socket.on("message", handleMessage);
    return () => socket.off("message", handleMessage);
  }, [chatdetail]);

  useEffect(() => {
    // Manually sync with cache when navigating between chats
    setonlineusers(cachedOnlineUsers || []);
    setisonline((cachedOnlineUsers || []).includes(targetuserId));

    const handleOnlineUsers = (users) => {
      setonlineusers(users);
      setisonline(users.includes(targetuserId));
    };
    socket.on("online-users", handleOnlineUsers);
    return () => socket.off("online-users", handleOnlineUsers);
  }, [targetuserId]);

  useEffect(() => {
    const handleIncomingCall = ({ offer, callerId, callType }) => {
      // Only show incoming call if the user is in the chat with the caller
      if (callerId === targetuserId) {
        setIncomingCall({ offer, callerId, callType });
      } else {
        console.log(`Missed call from ${callerId} because you are not in their chat.`);
      }
    };
    
    const handleCallEnded = () => {
       setIncomingCall(null);
       setCallType(null);
    };

    socket.on("webrtc-offer", handleIncomingCall);
    socket.on("webrtc-call-ended", handleCallEnded);

    return () => {
      socket.off("webrtc-offer", handleIncomingCall);
      socket.off("webrtc-call-ended", handleCallEnded);
    };
  }, [targetuserId]);

  useEffect(() => {
    if (incomingCall && !incomingCall.accepted) {
      ringtoneRef.current.loop = true;
      ringtoneRef.current.play().catch(e => console.error("Error playing ringtone:", e));
    } else {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
  }, [incomingCall]);

  const startVideoCall = () => setCallType('video');
  const startAudioCall = () => setCallType('audio');
  
  const acceptCall = () => setIncomingCall(prev => ({ ...prev, accepted: true }));
  
  const rejectCall = () => {
    socket.emit("webrtc-end-call", { targetId: incomingCall.callerId });
    setIncomingCall(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedImage(URL.createObjectURL(file));
      } else {
        // Generic document icon for non-image files
        setSelectedImage("https://cdn-icons-png.flaticon.com/512/2965/2965335.png");
      }
    } else {
      setSelectedImage(null);
    }
  };

  const handlesendmessage = () => {
    if (isSending) return; // Prevent double clicks
    if (!chatdetail) return;
    const content = messageref.current.value;
    if (!content.trim() && fileref.current.files.length === 0) return;
    
    setIsSending(true);

    const formData = new FormData();
    formData.append("content", content);
    formData.append("chatId", chatdetail._id);
    formData.append("sender", user._id);

    // If there is a file/image, append it
    if (fileref.current.files.length > 0) {
      // Depending on your backend, you might want to change this to "file" later, 
      // but keeping "image" for now to not break your existing backend multer setup.
      formData.append("image", fileref.current.files[0]); 
    }

    sendmessage(formData).then((res) => {
      console.log("message sent successfully", res.data);
      
      // 1. Add the REAL message (with _id, timestamps, file urls) to your own screen
      setmessages((prev) => [...prev, res.data]);
      
      // 2. Emit the EXACT SAME REAL message over the socket!
      // We spread res.data, but manually add the fully populated chatdetail 
      // so the backend can read chat.users to know who to send it to!
      socket.emit("newmessage", { ...res.data, chat: chatdetail });
      
      // 3. Clear inputs
      messageref.current.value = "";
      if (fileref.current) fileref.current.value = "";
      setSelectedImage(null);
      setIsSending(false);

    }).catch((err) => {
      console.log("error occured while sending the message", err);
      setIsSending(false);
      setSelectedImage(null);
    });
  }

  useEffect(() => {
    if (targetuserId) {
      markAsRead(targetuserId).catch(console.error);
    }
    accessChat(targetuserId).then((res) => {
      setChatdetail(res.data);
      console.log("fetched chat for the chatArea", res.data);
      fetchmessages(res.data._id).then((res2) => {
        setmessages(res2.data);
        console.log("fetched messages for the chatArea", res2.data);
      }).catch((err) => {
        console.log("error occured while fetching the messages for the chatArea", err);
      })
    }).catch((err) => {
      console.log("error occured while fetching the chat for the chatArea", err);
    })
  }, [targetuserId])
  const [targetuser, settargetuser] = useState(null);
  useEffect(() => {
    if (!targetuserId) return;
    getuserdetails(targetuserId).then((res) => {
      settargetuser(res.data);
      console.log("fetched targetuser for the chatArea", res.data);
    }).catch((err) => {
      console.log("error occured while fetching the targetuser for the chatArea", err);
    })
  }, [targetuserId]);
  return (
    <div className="flex-1 flex flex-col h-full relative z-0">
      {/* Chat Header */}
      <div className="smoked-panel mx-3 mt-1 px-3 py-2.5 rounded-2xl flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/" className="md:hidden flex items-center justify-center text-slate-300 p-2 -ml-2 rounded-xl hover:bg-white/5 smoked-icon-btn">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="relative flex items-center">
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-1.5 ring-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                <img className="w-full h-full object-cover" src={targetuser?.profilepic || targetuser?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetuser?.name || 'User')}&background=random`} alt={targetuser?.name || "User avatar"} />
            </div>
            {isonline && (
                <span className="absolute bottom-0 right-0 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#09101b]"></span>
                </span>
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-white flex items-center gap-1.5">{targetuser?.name}</h2>
            <p className={`text-[11px] font-medium flex items-center gap-1.5 ${isonline ? 'text-emerald-400' : 'text-slate-400'}`}>
              {!isonline && <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block"></span>}
              {isonline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1.5">
          <button className="smoked-icon-btn p-2 rounded-xl text-slate-300" onClick={startVideoCall} title="Video Call">
            <span className="material-symbols-outlined text-[16px]">videocam</span>
          </button>
          <button className="smoked-icon-btn p-2 rounded-xl text-slate-300" onClick={startAudioCall} title="Voice Call">
            <span className="material-symbols-outlined text-[16px]">call</span>
          </button>
          <button className="smoked-icon-btn p-2 rounded-xl text-slate-300 md:hidden">
            <span className="material-symbols-outlined text-[16px]">info</span>
          </button>
        </div>
      </div>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {
          messages.map((message, index) => {
            const senderId = typeof message.sender === 'object' ? message.sender?._id : message.sender;
            if (senderId === user._id) {
              return <Smessage key={index} message={message} onImageClick={() => setFullScreenImage(message.image)} />
            } else {
              return <Rmessage key={index} message={message} onImageClick={() => setFullScreenImage(message.image)} />
            }
          })
        }
      </div>
      {/* Input Area */}
      <div className="p-3 pb-6 sm:pb-4 z-20 shrink-0 flex flex-col gap-2">
        {selectedImage && (
            <div className="relative w-max h-20 ml-12 flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/10">
                <img src={selectedImage} alt="Preview" className="w-16 h-16 object-cover rounded-md" />
                {fileref.current?.files?.[0] && !fileref.current.files[0].type.startsWith("image/") && (
                  <span className="text-sm text-slate-400 max-w-[150px] truncate pr-4">
                    {fileref.current.files[0].name}
                  </span>
                )}
                <button 
                    className="absolute -top-2 -right-2 text-slate-400 rounded-full p-0.5 hover:text-red-500 hover:bg-white/10 transition-colors flex items-center justify-center bg-black/50 backdrop-blur-md"
                    onClick={() => {
                        setSelectedImage(null);
                        fileref.current.value = "";
                    }}
                >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
            </div>
        )}
        <div className="smoked-panel p-1.5 pl-2 rounded-2xl flex items-center gap-2 transition-all duration-300">
          <label className="p-2 text-slate-400 hover:text-emerald-300 transition-colors rounded-xl hover:bg-white/5 active:scale-90 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">attach_file</span>
            <input type="file" className="hidden" ref={fileref} onChange={handleImageChange} />
          </label>
          <input className="flex-1 bg-transparent border-0 text-sm text-white placeholder-slate-400/70 focus:ring-0 focus:outline-none px-1 py-2 font-normal" placeholder="Type a message..." ref={messageref} />
          <button className="p-2 text-slate-400 hover:text-emerald-300 transition-colors rounded-xl hover:bg-white/5 active:scale-90">
            <span className="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
          </button>
          <button className={`emerald-glow-btn w-10 h-10 rounded-xl text-white flex items-center justify-center border border-white/20 active:scale-90 transition shrink-0 cursor-pointer ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handlesendmessage} disabled={isSending}>
            {isSending ? (
                <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
            ) : (
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
            )}
          </button>
        </div>
      </div>

      {/* Full Screen Image Modal */}
      {fullScreenImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-pointer"
          onClick={() => setFullScreenImage(null)}
        >
          <img 
            src={fullScreenImage} 
            alt="Full screen view" 
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button 
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-all"
            onClick={() => setFullScreenImage(null)}
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
        </div>
      )}

      {/* Incoming Call Overlay */}
      {incomingCall && !incomingCall.accepted && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#09101b] p-8 rounded-3xl border border-emerald-500/30 flex flex-col items-center gap-4 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
            <div className="w-24 h-24 rounded-full overflow-hidden mb-2 ring-4 ring-emerald-500/50">
              <img src={targetuser?.profilepic || targetuser?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetuser?.name || 'User')}&background=random`} alt="Caller" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-xl font-medium text-white">{targetuser?.name || "User"}</h3>
            <p className="text-sm text-emerald-400 animate-pulse mb-2">Incoming {incomingCall.callType === 'audio' ? 'voice' : 'video'} call...</p>
            <div className="flex gap-8 mt-2">
              <button 
                onClick={rejectCall}
                className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-lg"
              >
                <span className="material-symbols-outlined text-white text-2xl">call_end</span>
              </button>
              <button 
                onClick={acceptCall}
                className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-lg"
              >
                <span className="material-symbols-outlined text-white text-2xl">call</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* The Actual Video Call Component */}
      {(callType || (incomingCall && incomingCall.accepted)) && (
        <VideoCall 
          isCaller={!!callType} 
          targetUserId={targetuserId} 
          targetUser={targetuser}
          incomingOffer={incomingCall?.offer} 
          callType={callType || incomingCall?.callType}
          onEndCall={() => {
            setCallType(null);
            setIncomingCall(null);
          }} 
        />
      )}

    </div>
  );
}
