"use client";

import { useState, useRef, useMemo } from "react";
import Image from "next/image";
import { Check, MoreHorizontal, Plus, Camera, ChevronRight, Loader2, ArrowLeft } from "lucide-react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useFirebase, storage as firebaseStorage } from "@/firebase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/app/dashboard/context";
import { FaMeta } from "react-icons/fa6";


// Initial dummy data
const INITIAL_OTHER_ACCOUNTS = [
  { id: "acc-1", username: "dripsociety", avatarUrl: "https://i.pravatar.cc/150?u=ds" },
  { id: "acc-2", username: "whopphantom", avatarUrl: "https://i.pravatar.cc/150?u=wp" },
  { id: "acc-3", username: "mxrcmuno", avatarUrl: "https://i.pravatar.cc/150?u=mm" }
];

interface AccountsCentreModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountsCentreModal({ userId, isOpen, onClose }: AccountsCentreModalProps) {
  const { firestore } = useFirebase();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profile: localProfile } = useDashboard();

  // --- States ---
  // localAccounts manages the list in memory for immediate UI feedback
  const [localAccounts, setLocalAccounts] = useState(INITIAL_OTHER_ACCOUNTS);
  const [editingItem, setEditingItem] = useState<any>(null); 
  const [isEditing, setIsEditing] = useState(false); 
  const [isSaving, setIsSaving] = useState(false);

  // Form States for Editing
  const [editUsername, setEditUsername] = useState("");
  const [editAvatar, setEditAvatar] = useState("");

  // --- Handlers ---
  const openEditMode = (item: any) => {
    setEditingItem(item);
    setEditUsername(item.username || "");
    setEditAvatar(item.avatarUrl || "");
    setIsEditing(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setIsSaving(true);
    
    // Simulate/Prepare for Firebase Storage
    try {
      const sRef = ref(firebaseStorage, `accounts/${userId}/${Date.now()}`);
      await uploadBytes(sRef, file);
      const url = await getDownloadURL(sRef);
      setEditAvatar(url);
    } catch (err) {
      // Fallback for local testing if Firebase is not connected
      const localUrl = URL.createObjectURL(file);
      setEditAvatar(localUrl);
      console.warn("Storage upload failed, using local URL for preview.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!editingItem) return;
    setIsSaving(true);

    try {
      // 1. UPDATE LOCAL STATE (Immediate UI change)
      setLocalAccounts((prev) => 
        prev.map((acc) => 
          acc.id === editingItem.id 
            ? { ...acc, username: editUsername, avatarUrl: editAvatar } 
            : acc
        )
      );

      // 2. FIREBASE UPDATE (Optional/Future)
      if (firestore && userId && !userId.includes("guest")) {
        const accountsPath = `users/${userId}/linked_accounts`;
        const docRef = doc(firestore, accountsPath, editingItem.id.toString());
        await setDoc(docRef, {
          id: editingItem.id,
          username: editUsername,
          avatarUrl: editAvatar,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      // Close edit mode
      setIsEditing(false);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "fixed left-0 right-0 bottom-0 top-auto z-50 w-full max-w-md mx-auto",
          "bg-[#262626] text-white border-none rounded-t-[22px] rounded-b-none p-0 overflow-hidden outline-none",
          "translate-x-0 translate-y-0 animate-in slide-in-from-bottom duration-300",
          "!top-auto !bottom-0 !translate-y-0 focus:outline-none"
        )}
      >
        <input type="file" ref={fileInputRef} hidden onChange={handleImageUpload} />
        
        <div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto mt-3 mb-1" />

        <DialogHeader className="px-4 py-2 flex flex-row items-center justify-between space-y-0 border-b border-zinc-800/50">
          <div className="flex items-center gap-2">
            {isEditing && (
              <ArrowLeft 
                className="w-5 h-5 cursor-pointer text-zinc-400 hover:text-white" 
                onClick={() => setIsEditing(false)} 
              />
            )}
            <DialogTitle className="text-base font-bold">
              {isEditing ? "Edit Account" : "Accounts Centre"}
            </DialogTitle>
          </div>
          
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={isSaving}
            className="p-2 active:scale-90 transition-transform"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
            ) : isEditing ? (
              <Check className="w-6 h-6 text-blue-500 stroke-[3px]" />
            ) : (
              <MoreHorizontal className="text-white w-5 h-5" />
            )}
          </button>
        </DialogHeader>

        <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar pb-10">
          {isEditing ? (
            /* --- EDIT VIEW --- */
            <div className="space-y-6 py-2 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex flex-col items-center gap-4">
                <div 
                  className="relative group cursor-pointer w-[90px] h-[90px]" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image
                    src={editAvatar || "/placeholder-avatar.png"}
                    alt="Edit"
                    fill
                    className="rounded-full border-2 border-zinc-700 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  {isSaving && (
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                      <Loader2 className="animate-spin text-white w-5 h-5" />
                    </div>
                  )}
                </div>
                <p className="text-blue-500 text-sm font-semibold">Change profile photo</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] text-zinc-400 uppercase font-bold ml-1">Username</label>
                  <Input 
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="bg-zinc-800 border-none text-white h-12 rounded-xl focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* --- LIST VIEW --- */
            <>
              {/* Primary Profile */}
              <div className="bg-zinc-800/40 p-4 rounded-[22px] border border-zinc-700/30">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Image
                        src={localProfile?.avatarUrl || "/placeholder-avatar.png"}
                        alt="Profile"
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                         <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white stroke-[4]" />
                         </div>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-sm">{localProfile?.username || "main_user"}</span>
                      <span className="text-zinc-500 text-xs">Primary Account</span>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  </div>
                </div>
                
                <button className="flex items-center gap-3 w-full py-2 group">
                  <div className="w-11 h-11 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700">
                    <Plus className="text-white w-6 h-6" />
                  </div>
                  <span className="text-zinc-200 text-sm font-semibold">Add Instagram Account</span>
                </button>
              </div>

              {/* Linked Accounts List */}
              <div className="space-y-4">
                <h3 className="text-zinc-400 text-[11px] font-bold uppercase tracking-widest px-1">Other profiles</h3>
                <div className="space-y-1">
                   {localAccounts.map((acc) => (
                      <div 
                        key={acc.id} 
                        onClick={() => openEditMode(acc)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 cursor-pointer active:opacity-60 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <Image src={acc.avatarUrl} alt={acc.username} width={44} height={44} className="rounded-full object-cover h-11 w-11" />
                          <div className="flex flex-col">
                            <span className="text-white text-sm font-semibold">{acc.username}</span>
                            <span className="text-zinc-500 text-[11px]">Click to edit profile</span>
                          </div>
                        </div>
                        <ChevronRight className="text-zinc-600 w-5 h-5" />
                      </div>
                   ))}
                </div>
              </div>

              <div className="flex flex-col items-center pt-8 opacity-40">
            

                 <span className="text-white font-bold flex gap-x-3 items-center text-[16px] tracking-[2px]">   <FaMeta /> Meta</span>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}