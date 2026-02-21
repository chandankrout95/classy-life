"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  MoreVertical,
  Music,
  Camera,
  X,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import PullToRefresh from "react-simple-pull-to-refresh";
import AppleLoader from "@/components/apple-loader";

// Firebase Imports
import { doc, setDoc, collection, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useFirestore, useUser, storage as firebaseStorage } from "@/firebase";
import { useCollectionData } from "react-firebase-hooks/firestore";

// --- Fallback Data ---
const DEFAULT_REELS = [
  {
    id: "reel-1",
    username: "pankajsaini_02",
    videoUrl: "https://picsum.photos/seed/reel1/600/1000",
    caption: "Har baat pr nhi nhi 😅 @pankajsaini_02 ... #lifestyle #fun",
    audio: "Original audio - Khariya, Shigaari",
    likes: "64K",
    comments: "301",
    shares: "1,595",
  },
  {
    id: "reel-2",
    username: "dr.nitesh.choudhary_",
    videoUrl: "https://picsum.photos/seed/reel2/600/1000",
    caption:
      "from saree grace to midnight blue elegance ✨ ... #fashion #reels",
    audio: "badkrazy • Humsafar",
    likes: "2,630",
    comments: "98",
    shares: "253",
  },
];

export default function ReelsPage() {
  const { user, loading: authLoading } = useUser();
  const firestore = useFirestore();
  const mediaInputRef = useRef<HTMLInputElement>(null);

  // States
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [showAnimation, setShowAnimation] = useState<{
    id: string;
    visible: boolean;
  } | null>(null);

  // Edit States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<any>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editLikes, setEditLikes] = useState("");
  const [tempMediaUrl, setTempMediaUrl] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // 1. Fetch Data (Ordering by ID to keep consistency)
  const userId = user?.uid || "guest";
  const reelsPath = `users/${userId}/user_reels`;
  const [dbReels, dbLoading] = useCollectionData(
    query(collection(firestore, reelsPath)),
  );

  // 2. Merge Logic: Replace defaults with DB versions, maintain ID order
  const displayReels = useMemo(() => {
    return DEFAULT_REELS.map((defaultReel) => {
      const dbVersion = dbReels?.find((r) => r.id === defaultReel.id);
      return dbVersion ? { ...defaultReel, ...dbVersion } : defaultReel;
    });
  }, [dbReels]);

  // 3. Double Tap Action
  const handleDoubleTap = (id: string) => {
    setLikedPosts((prev) => ({ ...prev, [id]: true }));
    setShowAnimation({ id, visible: true });
    setTimeout(() => setShowAnimation(null), 1000);
  };

  // 4. Media Upload
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUpdating(true);
    try {
      const sRef = ref(firebaseStorage, `reels/${userId}/${Date.now()}`);
      await uploadBytes(sRef, file);
      const url = await getDownloadURL(sRef);
      setTempMediaUrl(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // 5. Save to Firebase
  const saveReelChanges = async () => {
    if (!editingReel) return;
    setIsUpdating(true);
    try {
      await setDoc(
        doc(firestore, reelsPath, editingReel.id.toString()),
        {
          ...editingReel,
          username: editUsername,
          caption: editCaption,
          likes: editLikes,
          videoUrl: tempMediaUrl || editingReel.videoUrl,
        },
        { merge: true },
      );
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading)
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-white" />
      </div>
    );

  return (
    <div className="h-[calc(100vh-50px)] w-full max-w-full overflow-x-hidden overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black text-white">
      <input
        type="file"
        ref={mediaInputRef}
        hidden
        accept="image/*"
        onChange={handleMediaUpload}
      />

      <PullToRefresh
        onRefresh={() =>
          new Promise((resolve) => setTimeout(resolve, 1000))
        }
        pullingContent={<AppleLoader />}
        refreshingContent={<AppleLoader />}
      >

      {/* --- Edit Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 w-full max-w-sm rounded-3xl p-6 border border-zinc-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold">Edit Reel Data</h3>
              <X
                className="cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              />
            </div>
            <div className="space-y-4">
              <div
                className="relative aspect-[9/16] w-24 mx-auto rounded-lg overflow-hidden border border-zinc-700 cursor-pointer"
                onClick={() => mediaInputRef.current?.click()}
              >
                <Image
                  src={tempMediaUrl || editingReel.videoUrl}
                  alt="prev"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  {isUpdating ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                </div>
              </div>
              <input
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="w-full bg-zinc-800 p-3 rounded-xl outline-none text-sm"
                placeholder="Username"
              />
              <textarea
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                className="w-full bg-zinc-800 p-3 rounded-xl outline-none text-sm h-20"
                placeholder="Caption"
              />
              <input
                value={editLikes}
                onChange={(e) => setEditLikes(e.target.value)}
                className="w-full bg-zinc-800 p-3 rounded-xl outline-none text-sm"
                placeholder="Likes Count"
              />
              <button
                onClick={saveReelChanges}
                disabled={isUpdating}
                className="w-full bg-white text-black font-bold py-3 rounded-xl active:scale-95 transition-transform"
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed top-0 w-full z-50 flex justify-between items-center p-4 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
        <h2 className="text-xl font-bold pointer-events-auto">Reels</h2>
        <Camera className="w-6 h-6 pointer-events-auto" />
      </div>

      {displayReels.map((reel: any) => (
        <div
          key={reel.id}
          className="h-full w-full relative snap-start flex items-center justify-center bg-zinc-900 overflow-hidden touch-pan-y"
          onDoubleClick={() => handleDoubleTap(reel.id)}
        >
          <Image
            src={reel.videoUrl}
            alt="Reel content"
            fill
            priority
            className="object-cover pointer-events-none"
          />

          {showAnimation?.id === reel.id && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
              <Heart className="w-24 h-24 text-white fill-white animate-heart-pop opacity-0" />
            </div>
          )}

          {/* --- UI Overlays --- */}
          <div className="absolute bottom-0 left-0 w-full p-4 pb-8 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex justify-between items-end z-30">
            <div className="flex-1 max-w-[75%] space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-500 flex-shrink-0">
                  <Image
                    src={`https://i.pravatar.cc/150?u=${reel.username}`}
                    width={32}
                    height={32}
                    alt="avatar"
                  />
                </div>
                <span className="text-sm font-semibold truncate">
                  {reel.username}
                </span>
                <button className="text-xs border border-white px-2 py-0.5 rounded-md font-bold hover:bg-white/10 active:scale-95 transition-all">
                  Follow
                </button>
              </div>

              <p className="text-sm leading-snug line-clamp-2 pr-2">
                {reel.caption}
              </p>

              <div className="flex items-center gap-2 text-[11px] bg-black/40 backdrop-blur-md w-fit px-3 py-1.5 rounded-full border border-white/10">
                <Music className="w-3 h-3" />
                <div className="w-28 overflow-hidden whitespace-nowrap">
                  <p className="animate-marquee inline-block">{reel.audio}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6 mb-2 mr-1">
              <div className="flex flex-col items-center group">
                <Heart
                  onClick={(e) => {
                    e.stopPropagation();
                    setLikedPosts((p) => ({ ...p, [reel.id]: !p[reel.id] }));
                  }}
                  className={`w-7 h-7 cursor-pointer transition-all active:scale-150 ${likedPosts[reel.id] ? "fill-red-500 text-red-500" : "text-white"}`}
                />
                <span className="text-[11px] font-bold mt-1 shadow-sm">
                  {reel.likes}
                </span>
              </div>

              <div
                className="flex flex-col items-center"
                onClick={() => {
                  setEditingReel(reel);
                  setEditCaption(reel.caption);
                  setEditUsername(reel.username);
                  setEditLikes(reel.likes);
                  setTempMediaUrl(reel.videoUrl);
                  setIsModalOpen(true);
                }}
              >
                <MessageCircle className="w-7 h-7 cursor-pointer active:scale-110 transition-transform scale-x-[-1]" />{" "}
                <span className="text-[11px] font-bold mt-1">
                  {reel.comments}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <Send className="w-7 h-7 cursor-pointer active:scale-110 transition-transform -rotate-14" />
                <span className="text-[11px] font-bold mt-1">
                  {reel.shares}
                </span>
              </div>

              <MoreVertical
                className="w-6 h-6 cursor-pointer opacity-80"
                onClick={() => {
                  setEditingReel(reel);
                  setEditCaption(reel.caption);
                  setEditUsername(reel.username);
                  setEditLikes(reel.likes);
                  setTempMediaUrl(reel.videoUrl);
                  setIsModalOpen(true);
                }}
              />

              <div className="w-8 h-8 border-2 border-white/40 rounded-lg overflow-hidden bg-zinc-800  mt-2 ring-2 ring-black">
                <Image
                  src={reel.videoUrl}
                  width={32}
                  height={32}
                  alt="music-disc"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <style jsx global>{`
        html,
        body {
          overscroll-behavior: none;
          overflow: hidden;
          width: 100%;
        }
        @keyframes heart-pop {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          25% {
            transform: scale(1.4);
            opacity: 1;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        .animate-heart-pop {
          animation: heart-pop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)
            forwards;
        }
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          animation: marquee 12s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin 4s linear infinite;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      </PullToRefresh>
    </div>
  );
}
