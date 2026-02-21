"use client";

import React, { useState } from "react";
import { 
  Heart, 
  MessageCircle, 
  Send, 
  MoreVertical, 
  Music, 
  Camera 
} from "lucide-react";
import Image from "next/image";

// --- Dummy Data ---
const REELS = [
  {
    id: 1,
    username: "pankajsaini_02",
    videoUrl: "https://picsum.photos/seed/reel1/600/1000",
    caption: "Har baat pr nhi nhi 😅 @pankajsaini_02 ... #lifestyle #fun",
    audio: "Original audio - Khariya, Shigaari",
    likes: "64K",
    comments: "301",
    shares: "1,595",
  },
  {
    id: 2,
    username: "dr.nitesh.choudhary_",
    videoUrl: "https://picsum.photos/seed/reel2/600/1000",
    caption: "from saree grace to midnight blue elegance ✨ ... #fashion #reels",
    audio: "badkrazy • Humsafar",
    likes: "2,630",
    comments: "98",
    shares: "253",
  }
];

export default function ReelsPage() {
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});
  const [showAnimation, setShowAnimation] = useState<{ id: number; visible: boolean } | null>(null);

  const handleDoubleTap = (id: number) => {
    setLikedPosts((prev) => ({ ...prev, [id]: true }));
    setShowAnimation({ id, visible: true });
    
    setTimeout(() => {
      setShowAnimation(null);
    }, 1000);
  };

  return (
    /* FIXED: Added w-full and overflow-x-hidden to prevent horizontal movement */
    <div className="h-[calc(100vh-50px)] w-full max-w-full overflow-x-hidden overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black text-white">
      
      {/* Top Header */}
      <div className="fixed top-0 w-full z-50 flex justify-between items-center p-4 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
        <h2 className="text-xl font-bold pointer-events-auto">Reels</h2>
        <Camera className="w-6 h-6 pointer-events-auto" />
      </div>

      {REELS.map((reel) => (
        <div 
          key={reel.id} 
          /* FIXED: touch-none or touch-pan-y prevents accidental horizontal swipes on mobile */
          className="h-full w-full relative snap-start flex items-center justify-center bg-zinc-900 overflow-hidden touch-pan-y"
          onDoubleClick={() => handleDoubleTap(reel.id)}
        >
          {/* Background Image */}
          <Image 
            src={reel.videoUrl} 
            alt="Reel content" 
            fill 
            priority
            className="object-cover pointer-events-none" 
          />

          {/* Double Tap Heart Animation */}
          {showAnimation?.id === reel.id && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
              <Heart className="w-24 h-24 text-white fill-white animate-heart-pop opacity-0" />
            </div>
          )}

          {/* --- UI Overlays --- */}
          <div className="absolute bottom-0 left-0 w-full p-4 pb-8 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex justify-between items-end z-30">
            
            {/* Left Side: User Info & Caption */}
            <div className="flex-1 max-w-[75%] space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-500 flex-shrink-0">
                  <Image src={`https://i.pravatar.cc/150?u=${reel.username}`} width={32} height={32} alt="avatar" />
                </div>
                <span className="text-sm font-semibold truncate">{reel.username}</span>
                <button className="text-xs border border-white px-2 py-0.5 rounded-md font-bold hover:bg-white/10 active:scale-95 transition-all">Follow</button>
              </div>
              
              <p className="text-sm leading-snug line-clamp-2 pr-2">{reel.caption}</p>
              
              <div className="flex items-center gap-2 text-[11px] bg-black/40 backdrop-blur-md w-fit px-3 py-1.5 rounded-full border border-white/10">
                <Music className="w-3 h-3" />
                <div className="w-28 overflow-hidden whitespace-nowrap">
                   <p className="animate-marquee inline-block">{reel.audio}</p>
                </div>
              </div>
            </div>

            {/* Right Side: Action Buttons */}
            <div className="flex flex-col items-center gap-6 mb-2 mr-1">
              <div className="flex flex-col items-center group">
                <Heart 
                  onClick={(e) => {
                    e.stopPropagation();
                    setLikedPosts(p => ({...p, [reel.id]: !p[reel.id]}));
                  }}
                  className={`w-7 h-7 cursor-pointer transition-all active:scale-150 ${likedPosts[reel.id] ? "fill-red-500 text-red-500" : "text-white"}`} 
                />
                <span className="text-[11px] font-bold mt-1 shadow-sm">{reel.likes}</span>
              </div>

              <div className="flex flex-col items-center">
                <MessageCircle className="w-7 h-7 cursor-pointer active:scale-110 transition-transform" />
                <span className="text-[11px] font-bold mt-1">{reel.comments}</span>
              </div>

              <div className="flex flex-col items-center">
                <Send className="w-7 h-7 cursor-pointer active:scale-110 transition-transform -rotate-14" />
                <span className="text-[11px] font-bold mt-1">{reel.shares}</span>
              </div>

              <MoreVertical className="w-6 h-6 cursor-pointer opacity-80" />

              <div className="w-8 h-8 border-2 border-white/40 rounded-lg overflow-hidden bg-zinc-800 animate-spin-slow mt-2 ring-2 ring-black">
                 <Image src={reel.videoUrl} width={32} height={32} alt="music-disc" className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      ))}

      <style jsx global>{`
        /* Prevent scroll chaining and horizontal bounce on mobile browsers */
        html, body {
          overscroll-behavior: none;
          overflow: hidden;
          width: 100%;
        }

        @keyframes heart-pop {
          0% { transform: scale(0); opacity: 0; }
          25% { transform: scale(1.4); opacity: 1; }
          50% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .animate-heart-pop {
          animation: heart-pop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 12s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin 4s linear infinite;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}