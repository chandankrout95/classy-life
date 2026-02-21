"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  Edit,
  Search,
  Camera,
  ChevronDown,
  X,
  Loader2,
  Plus,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Firebase & Custom Hooks
import { collection, query, orderBy, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useFirestore, useUser, storage as firebaseStorage } from "@/firebase"; 
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useDashboard } from "../context";
import { UserProfileData } from "@/lib/types";

const DEFAULT_CHATS = Array.from({ length: 8 }).map((_, i) => ({
  id: `chat-${i + 1}`,
  username: ["amaritsaran", "dripsociety.inc", "whopphantom", "textfae.ree67", "Pawan Saini"][i % 5],
  img: `https://i.pravatar.cc/150?u=user${i}`,
  lastMsg: ["Ooo · Reply?", "Sent 10h ago", "Active 3h ago", "Seen on Wednesday"][i % 4],
  hasStory: i % 3 === 0,
}));

const DEFAULT_THOUGHTS = [
  { id: "t-1", username: "whopphantom", img: "https://i.pravatar.cc/150?u=phantom", note: "LFG! 🚀" },
  { id: "t-2", username: "dripsociety", img: "https://i.pravatar.cc/150?u=drip", note: "New drop live" },
  { id: "t-3", username: "mxrcmuno_oz", img: "https://i.pravatar.cc/150?u=marc", note: "Working..." },
];

export default function MessagesPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, loading: authLoading } = useUser();
  const [localProfile, setLocalProfile] = useState<UserProfileData | null>(null);
  const { profile: formData } = useDashboard();

  useEffect(() => {
    if (formData) setLocalProfile(formData);
  }, [formData]);

  // States
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);
  const [isThoughtDialogOpen, setIsThoughtDialogOpen] = useState(false);
  
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editMsg, setEditMsg] = useState("");
  const [editImg, setEditImg] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const userId = user?.uid || "guest";
  const chatPath = `users/${userId}/user_messages`;
  const thoughtPath = `users/${userId}/user_thoughts`;

  const [dbChats] = useCollectionData(query(collection(firestore, chatPath), orderBy("createdAt", "desc")));
  const [dbThoughts] = useCollectionData(query(collection(firestore, thoughtPath), orderBy("createdAt", "desc")));

  const displayChats = dbChats && dbChats.length > 0 
    ? [...dbChats, ...DEFAULT_CHATS.filter(dc => !dbChats.find(db => db.id === dc.id))] 
    : DEFAULT_CHATS;

  const displayThoughts = dbThoughts && dbThoughts.length > 0 
    ? [...dbThoughts, ...DEFAULT_THOUGHTS.filter(dt => !dbThoughts.find(db => db.id === dt.id))] 
    : DEFAULT_THOUGHTS;

  // Image Upload Logic
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUpdating(true);
    try {
      const sRef = ref(firebaseStorage, `messages/${userId}/${Date.now()}`);
      await uploadBytes(sRef, file);
      const url = await getDownloadURL(sRef);
      setEditImg(url);
    } catch (err) { console.error(err); } finally { setIsUpdating(false); }
  };

  // Save Handlers
  const handleSaveChat = async () => {
    if (!editingItem) return;
    setIsUpdating(true);
    await setDoc(doc(firestore, chatPath, editingItem.id.toString()), {
      ...editingItem, username: editName, lastMsg: editMsg, img: editImg, createdAt: serverTimestamp(),
    }, { merge: true });
    setIsChatDialogOpen(false);
    setIsUpdating(false);
  };

  const handleSaveThought = async () => {
    if (!editingItem) return;
    setIsUpdating(true);
    await setDoc(doc(firestore, thoughtPath, editingItem.id.toString()), {
      ...editingItem, username: editName, note: editMsg, img: editImg, createdAt: serverTimestamp(),
    }, { merge: true });
    setIsThoughtDialogOpen(false);
    setIsUpdating(false);
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background text-foreground pb-10">
      <input type="file" ref={fileInputRef} hidden onChange={handleImageChange} />
      
      {/* --- Common Modal Content (Dynamic for Chat/Thought) --- */}
      {(isChatDialogOpen || isThoughtDialogOpen) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-sm rounded-3xl border border-border p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Edit {isChatDialogOpen ? "Chat" : "Note"}</h3>
              <X className="w-5 h-5 cursor-pointer" onClick={() => { setIsChatDialogOpen(false); setIsThoughtDialogOpen(false); }} />
            </div>
            
            <div className="space-y-4">
              {/* Image Editor */}
              <div className="flex justify-center">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-border cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                  <Image src={editImg} alt="edit" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white w-5 h-5" />
                  </div>
                  {isUpdating && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Loader2 className="animate-spin text-white w-5 h-5" /></div>}
                </div>
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Display Name</label>
                 <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-secondary p-3 rounded-xl outline-none text-sm" placeholder="Username" />
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">{isChatDialogOpen ? "Message Text" : "Note Bubble Text"}</label>
                 <input value={editMsg} onChange={(e) => setEditMsg(e.target.value)} className="w-full bg-secondary p-3 rounded-xl outline-none text-sm" placeholder={isChatDialogOpen ? "Last message..." : "Note (max 20 chars)"} maxLength={isThoughtDialogOpen ? 20 : 100} />
              </div>

              <button 
                onClick={isChatDialogOpen ? handleSaveChat : handleSaveThought} 
                disabled={isUpdating} 
                className="w-full bg-foreground text-background font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Header --- */}
      <header className="fixed top-0 w-full bg-background z-50 px-4 h-14 flex items-center justify-between ">
        <div className="flex items-center gap-6">
          <ArrowLeft className="w-7 h-7 cursor-pointer active:scale-90 transition-transform" onClick={() => router.back()} />
          <div className="flex items-center gap-1 font-bold text-xl tracking-tight">
            {localProfile?.username || "insight_editor"} 
            <ChevronDown className="w-4 h-4 mt-1" />
          </div>
        </div>
        <Edit className="w-6 h-6 cursor-pointer" />
      </header>

      <main className="pt-14 max-w-md mx-auto">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 bg-secondary/60 rounded-xl px-3 py-2.5 text-muted-foreground">
            <Search className="w-4 h-4" />
            <input type="text" placeholder="Search" className="bg-transparent border-none outline-none text-sm w-full" />
          </div>
        </div>

        {/* --- Thoughts Section (Fixed UI) --- */}
        <div className="flex overflow-x-auto py-6 px-2 no-scrollbar scroll-smooth">
          {/* Your Note */}
          <div className="flex flex-col items-center min-w-[100px] space-y-2">
            <div className="relative">
               <div className="absolute z-20 -top-7 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-800 text-[11px] px-3 py-1 text-[10px] rounded-2xl border border-border shadow-sm text-center min-w-[70px]">
                 Create note
                 <div className="absolute -bottom-1 left-4 w-2 h-2 bg-inherit border-r border-b border-border rotate-45" />
               </div>
               <div className="relative w-16 h-16 rounded-full overflow-hidden bg-secondary">
                 <Image src={localProfile?.avatarUrl || "https://i.pravatar.cc/150?u=admin"} alt="me" fill className="object-cover" />
               </div>
               <div className="absolute bottom-0 right-0 bg-secondary rounded-full p-1 border-2 border-background">
                 <Plus className="w-3 h-3 text-foreground" strokeWidth={3} />
               </div>
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">Your note</span>
          </div>

          {/* Others' Thoughts */}
          {displayThoughts.map((t: any) => (
            <div key={t.id} className="flex flex-col items-center min-w-[100px] space-y-2 cursor-pointer group" onClick={() => {
                setEditingItem(t); setEditName(t.username); setEditMsg(t.note); setEditImg(t.img); setIsThoughtDialogOpen(true);
            }}>
              <div className="relative">
                {t.note && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-900 text-[12px] px-3 py-1.5 rounded-2xl border border-border shadow-lg whitespace-nowrap z-10 font-medium">
                    {t.note}
                    {/* Cloud tail bubble */}
                    <div className="absolute -bottom-1 left-4 w-2.5 h-2.5 bg-inherit border-r border-b border-border rotate-45" />
                  </div>
                )}
                <div className="p-[2px] rounded-full border border-border group-active:scale-95 transition-transform">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-secondary">
                    <Image src={t.img} alt={t.username} fill className="object-cover" />
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-muted-foreground truncate w-20 text-center">{t.username}</span>
            </div>
          ))}
        </div>

        {/* --- Chat List --- */}
        <div className="mt-2">
          <div className="px-4 py-2 flex justify-between items-center mb-1">
            <span className="font-bold text-base">Messages</span>
            <span className="text-blue-500 text-sm font-bold active:opacity-50">Requests</span>
          </div>
          
          {displayChats.map((chat: any) => (
            <div
              key={chat.id}
              onClick={() => {
                setEditingItem(chat); setEditName(chat.username); setEditMsg(chat.lastMsg); setEditImg(chat.img); setIsChatDialogOpen(true);
              }}
              className="flex items-center justify-between px-4 py-3 active:bg-secondary transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className={`p-[2.5px] rounded-full ${chat.hasStory ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600" : ""}`}>
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-background">
                    <Image src={chat.img} alt={chat.username} fill className="object-cover bg-secondary" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-semibold text-foreground flex items-center gap-2">
                    {chat.username}
                    {chat.createdAt && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                  </span>
                  <span className={`text-[13px] line-clamp-1 ${chat.createdAt ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                    {chat.lastMsg}
                  </span>
                </div>
              </div>
              <Camera className="w-6 h-6 text-muted-foreground opacity-40 group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}