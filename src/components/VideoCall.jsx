import React, { useEffect, useRef, useState } from 'react';
import { socket } from '../lib/socket';

export default function VideoCall({ isCaller, targetUserId, targetUser, onEndCall, incomingOffer, callType = 'video' }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null); // Ref to hold stream for cleanup
  const [callStatus, setCallStatus] = useState(isCaller ? 'Calling...' : 'Connecting...');

  useEffect(() => {
    const initCall = async () => {
      try {
        // 1. Get Local Stream
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: callType === 'video', 
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

  const endCall = () => {
    socket.emit("webrtc-end-call", { targetId: targetUserId });
    cleanup();
    onEndCall();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center backdrop-blur-sm p-4">
      <div className="relative w-full max-w-5xl aspect-video bg-[#09101b] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 flex items-center justify-center">
        
        {/* Call Status Overlay (when connecting) */}
        {callStatus !== 'Connected' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
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
            <p className="text-emerald-400 mt-2">{callStatus === 'Connected' ? '00:00' : callStatus}</p>
          </div>
        )}
        
        {/* Local Video (PiP) - Hidden if audio only */}
        {callType === 'video' && (
          <div className="absolute bottom-6 right-6 w-32 md:w-48 aspect-video bg-black rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)] ring-2 ring-emerald-500/50 z-20">
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
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
          <button 
            onClick={endCall}
            className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95"
            title="End Call"
          >
            <span className="material-symbols-outlined text-white text-2xl">call_end</span>
          </button>
        </div>
      </div>
    </div>
  );
}
