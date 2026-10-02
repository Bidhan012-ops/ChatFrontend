import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { socket } from '../lib/socket';

export default function VideoCall({ isCaller, targetUserId, targetUser, onEndCall, incomingOffer, callType = 'video' }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null); // Ref to hold stream for cleanup
  const [callStatus, setCallStatus] = useState(isCaller ? 'Calling...' : 'Connecting...');
  const [facingMode, setFacingMode] = useState("user");
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let intervalId;
    if (callStatus === 'Connected') {
      intervalId = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [callStatus]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    const initCall = async () => {
      try {
        // 1. Get Local Stream
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: callType === 'video' ? { facingMode: "user" } : false, 
          audio: true 
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // 2. Initialize Peer Connection with STUN servers
        const configuration = {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        };

        const pc = new RTCPeerConnection(configuration);
        peerConnectionRef.current = pc;

        // 3. Add Local Tracks to Peer Connection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // 4. Listen for Remote Tracks
        pc.ontrack = (event) => {
          if (remoteVideoRef.current && remoteVideoRef.current.srcObject !== event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setCallStatus('Connected');
          }
        };

        // 5. Listen for ICE Candidates and send them via Socket
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("webrtc-ice-candidate", {
              targetId: targetUserId,
              candidate: event.candidate,
            });
          }
        };

        // 6. Handle Offer / Answer logic
        if (isCaller) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("webrtc-offer", { targetUserId, offer, callType });
        } else if (incomingOffer) {
          await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("webrtc-answer", { callerId: targetUserId, answer });
        }
      } catch (err) {
        console.error("Error starting video call:", err);
        setCallStatus('Failed to access camera/mic');
      }
    };

    initCall();

    const handleAnswer = async ({ answer }) => {
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (e) {
          console.error("Error setting remote description from answer", e);
        }
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Error adding received ICE candidate", e);
        }
      }
    };
    
    const handleEndCall = () => {
      onEndCall();
    };

    socket.on("webrtc-answer", handleAnswer);
    socket.on("webrtc-ice-candidate", handleIceCandidate);
    socket.on("webrtc-call-ended", handleEndCall);

    return () => {
      socket.off("webrtc-answer", handleAnswer);
      socket.off("webrtc-ice-candidate", handleIceCandidate);
      socket.off("webrtc-call-ended", handleEndCall);
      cleanup();
    };
  }, [isCaller, targetUserId, incomingOffer, callType]);

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  const flipCamera = async () => {
    if (callType !== 'video' || !localStreamRef.current || !peerConnectionRef.current) return;

    const newFacingMode = facingMode === "user" ? "environment" : "user";
    
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: newFacingMode } },
        audio: false // Only request video to switch camera
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      
      const sender = peerConnectionRef.current.getSenders().find(s => s.track.kind === 'video');
      if (sender) {
        sender.replaceTrack(newVideoTrack);
      }

      const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
      if (oldVideoTrack) {
        oldVideoTrack.stop();
        localStreamRef.current.removeTrack(oldVideoTrack);
      }
      
      localStreamRef.current.addTrack(newVideoTrack);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }

      setFacingMode(newFacingMode);
    } catch (err) {
      console.error("Exact facingMode failed, falling back", err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: newFacingMode },
          audio: false
        });
        const fallbackTrack = fallbackStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => s.track.kind === 'video');
        if (sender) sender.replaceTrack(fallbackTrack);
        
        const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
        if (oldVideoTrack) {
          oldVideoTrack.stop();
          localStreamRef.current.removeTrack(oldVideoTrack);
        }
        
        localStreamRef.current.addTrack(fallbackTrack);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
        setFacingMode(newFacingMode);
      } catch (fallbackErr) {
        console.error("Camera flip failed:", fallbackErr);
      }
    }
  };

  const endCall = () => {
    socket.emit("webrtc-end-call", { targetId: targetUserId });
    cleanup();
    onEndCall();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center">
      <div className="relative w-full h-[100dvh] md:max-w-6xl md:h-[85vh] bg-[#09101b] md:rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] flex items-center justify-center">
        
        {/* Call Status Overlay (when connecting) */}
        {callStatus !== 'Connected' && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
            <p className="text-white text-lg font-medium tracking-wide">{callStatus}</p>
          </div>
        )}

        {/* Remote Video (Main) - Hidden if audio only */}
        <video 
          ref={remoteVideoRef} 
          autoPlay 
          playsInline 
          className={`w-full h-full object-cover ${callType === 'audio' ? 'opacity-0 absolute' : ''}`}
        />

        {/* Audio Only Avatar UI */}
        {callType === 'audio' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#09101b]">
            <div className={`w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden mb-6 ring-4 ${callStatus === 'Connected' ? 'ring-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'ring-white/10'}`}>
              <img src={targetUser?.profilepic || targetUser?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetUser?.name || 'User')}&background=random`} alt={targetUser?.name} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-3xl font-semibold text-white">{targetUser?.name || "User"}</h2>
            <p className="text-emerald-400 mt-2">{callStatus === 'Connected' ? formatTime(callDuration) : callStatus}</p>
          </div>
        )}
        
        {/* Local Video (PiP) - Hidden if audio only */}
        {callType === 'video' && (
          <div className="absolute top-6 right-4 md:top-8 md:right-8 w-28 h-40 md:w-56 md:h-36 bg-black rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.8)] ring-2 ring-emerald-500/50 z-20">
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover transform -scale-x-100"
            />
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 z-30 bg-black/50 backdrop-blur-xl px-8 py-4 rounded-full border border-white/10 shadow-2xl">
          
          {callType === 'video' && (
            <button 
              onClick={flipCamera}
              className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              title="Flip Camera"
            >
              <span className="material-symbols-outlined text-white text-2xl">flip_camera_ios</span>
            </button>
          )}

          <button 
            onClick={endCall}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all hover:scale-105 active:scale-95"
            title="End Call"
          >
            <span className="material-symbols-outlined text-white text-3xl">call_end</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
