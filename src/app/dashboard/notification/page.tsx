"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronDown, Loader2, Camera, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Firebase Imports
import { doc, setDoc, collection, query } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useFirestore, useUser, storage as firebaseStorage } from "@/firebase";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { UserProfileData } from "@/lib/types";
import { useDashboard } from "../context";

// --- Expanded Dummy Notifications Data (2x Data) ---
const DEFAULT_NOTIFICATIONS = [
  { id: "n1", type: "like", users: "crazy_brendkely, ganga_zto01", count: 187, time: "1m", userImg: "https://i.pravatar.cc/150?u=1", postImg: "https://picsum.photos/seed/p1/100/100" },
  { id: "n2", type: "follow", username: "sohail__boy78", time: "2h", userImg: "https://i.pravatar.cc/150?u=2", isFollowing: false },
  { id: "n3", type: "follow", username: "spin.vaultt", time: "1h", userImg: "https://i.pravatar.cc/150?u=3", isFollowing: false },
  { id: "n4", type: "like", users: "swastikchawlla, therealcartels", count: 1, time: "2h", userImg: "https://i.pravatar.cc/150?u=4", postImg: "https://picsum.photos/seed/p2/100/100" },
  { id: "n5", type: "follow", username: "biwas.edits", time: "9h", userImg: "https://i.pravatar.cc/150?u=5", isFollowing: false },
  { id: "n6", type: "like", users: "saumya_not_found", count: 12, time: "5h", userImg: "https://i.pravatar.cc/150?u=6", postImg: "https://picsum.photos/seed/p3/100/100" },
  { id: "n7", type: "comment", username: "asad.edith", text: "insight", time: "6h", userImg: "https://i.pravatar.cc/150?u=7", postImg: "https://picsum.photos/seed/p1/100/100" },
  { id: "n8", type: "follow", username: "brentharris.clipz", time: "7h", userImg: "https://i.pravatar.cc/150?u=8", isFollowing: false },
  { id: "n9", type: "like_comment", username: "sh4le3n_raza", time: "9h", userImg: "https://i.pravatar.cc/150?u=9" },
  { id: "n10", type: "follow", username: "introvertarash", time: "10h", userImg: "https://i.pravatar.cc/150?u=10", isFollowing: false }
];

export default function ActivityPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const firestore = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editTime, setEditTime] = useState("");
  const [tempImg, setTempImg] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

   const [localProfile, setLocalProfile] = useState<UserProfileData | null>(
        null,
      );
  
    const {
        profile: formData,
        onProfileUpdate: setFormData,
        loading: isComponentLoading,
      } = useDashboard();
      useEffect(() => {
          if (formData) {
            setLocalProfile(formData);
          }
        }, [formData]);

  // 1. Fetch Data
  const userId = user?.uid || "guest";
  const notificationPath = `users/${userId}/notifications`;
  const [dbData] = useCollectionData(query(collection(firestore, notificationPath)));

  // 2. Merge Logic
  const notifications = useMemo(() => {
    return DEFAULT_NOTIFICATIONS.map(item => {
      const saved = dbData?.find(d => d.id === item.id);
      return saved ? { ...item, ...saved } : item;
    });
  }, [dbData]);

  // 3. Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUpdating(true);
    try {
      const sRef = ref(firebaseStorage, `notifications/${userId}/${Date.now()}`);
      await uploadBytes(sRef, file);
      const url = await getDownloadURL(sRef);
      setTempImg(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // 4. Save Logic
  const handleSave = async () => {
    if (!editingItem) return;
    setIsUpdating(true);
    try {
      await setDoc(doc(firestore, notificationPath, editingItem.id), {
        ...editingItem,
        username: editName,
        users: editName,
        time: editTime,
        userImg: tempImg || editingItem.userImg,
      }, { merge: true });
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading) return <div className="h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-foreground" /></div>;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <input type="file" ref={fileInputRef} hidden onChange={handleImageUpload} />

      {/* --- Header --- */}
      <div className="flex items-center px-4 py-3 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-40">
        <button onClick={() => router.back()}>
          <ChevronLeft className="w-8 h-8 mr-2 active:scale-90 transition-transform" />
        </button>
        <h1 className="text-xl font-bold flex items-center gap-1 cursor-pointer">
          {localProfile?.username || "user_9868"} <ChevronDown className="w-4 h-4" />
        </h1>
      </div>

      <div className="px-4 py-4">
        <h2 className="font-bold mb-4 text-lg">Highlights</h2>
        
        <div className="space-y-6">
          {notifications.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center gap-x-1 justify-between group cursor-pointer active:opacity-70 transition-opacity"
              onClick={() => {
                setEditingItem(item);
                setEditName(item.username || item.users);
                setEditTime(item.time);
                setTempImg(item.userImg);
                setIsModalOpen(true);
              }}
            >
              <div className="flex items-center gap-3 flex-1">
                {/* User Avatar */}
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-border">
                  <Image src={item.userImg} fill className="object-cover" alt="user" />
                </div>

                {/* Text Content Logic */}
                <div className="text-sm flex-1">
                  <p className="leading-tight">
                    <span className="font-bold mr-1">{item.username || item.users}</span>
                    {item.type === "like" && `and ${item.count} others liked your reel.`}
                    {item.type === "follow" && `started following you.`}
                    {item.type === "comment" && `commented: ${item.text}`}
                    {item.type === "like_comment" && `liked your comment.`}
                    <span className="text-muted-foreground ml-1">{item.time}</span>
                  </p>
                </div>
              </div>

              {/* Action Button or Post Preview */}
              {item.type === "follow" ? (
                <button className="bg-[#425bea] text-primary-foreground px-4 py-1.5 rounded-lg text-sm font-semibold hover:opacity-90 active:scale-95 transition-all">
                  Follow back
                </button>
              ) : (
                item.postImg && (
                  <div className="w-10 h-10 relative rounded overflow-hidden ml-2 border border-border">
                    <Image src={item.postImg} fill className="object-cover" alt="post" />
                  </div>
                )
              )}
            </div>
          ))}
        </div>

        <div className="mt-8">
           <h2 className="font-bold mb-4 text-lg">Earlier</h2>
           <p className="text-muted-foreground text-sm text-center py-10">No more recent activity.</p>
        </div>
      </div>

      {/* --- Edit Modal (Theme Adaptive) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 dark:bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground w-full max-w-sm rounded-3xl p-6 border border-border shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold">Edit Activity Item</h3>
              <X className="cursor-pointer hover:rotate-90 transition-transform" onClick={() => setIsModalOpen(false)} />
            </div>
            
            <div className="space-y-4">
              <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden bg-muted cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                <Image src={tempImg || editingItem.userImg} alt="p" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                {isUpdating && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase font-bold ml-1">Username Display</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-secondary border border-border p-3 rounded-xl outline-none text-sm focus:ring-2 ring-primary/20" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase font-bold ml-1">Time Label</label>
                <input value={editTime} onChange={(e) => setEditTime(e.target.value)} className="w-full bg-secondary border border-border p-3 rounded-xl outline-none text-sm focus:ring-2 ring-primary/20" />
              </div>

              <button 
                onClick={handleSave} 
                disabled={isUpdating}
                className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl flex justify-center items-center shadow-lg active:scale-95 transition-transform"
              >
                {isUpdating ? <Loader2 className="animate-spin w-5 h-5" /> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}