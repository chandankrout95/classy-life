"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Check,
  Plus,
  MoreHorizontal,
  Camera,
  Loader2,
  X,
  ChevronRight,
} from "lucide-react";

import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import { useFirestore, storage } from "@/firebase";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { cn } from "@/lib/utils";

interface Props {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountsCentreModal({
  userId,
  isOpen,
  onClose,
}: Props) {
  const firestore = useFirestore();

  // Accounts Reference
  const accountsRef = userId 
    ? collection(firestore, "users", userId, "linked_accounts") 
    : null;

  const [accounts, accountsLoading] = useCollectionData(accountsRef);

  const [selectedId, setSelectedId] = useState(userId);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userId) setSelectedId(userId);
  }, [userId]);

//   if (!isOpen ) return null;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const storageRef = ref(storage, `accounts/${userId}/${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setEditAvatar(url);
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveAccount = async () => {
    if (!editingAccount?.id) return;
    setLoading(true);
    try {
      await setDoc(
        doc(firestore, "users", userId, "linked_accounts", editingAccount.id),
        {
          username: editName,
          avatarUrl: editAvatar,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setEditingAccount(null);
    } catch (err) {
      console.error("Failed to save account:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* MAIN OVERLAY - z-[9999] ensures it stays on top of everything */}
      <div 
        className=" absolute inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-end justify-center transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      >
        <div 
          className="w-full max-w-md bg-[#262626] rounded-t-[20px] overflow-hidden animate-in slide-in-from-bottom duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Pill Handle */}
          <div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto mt-3 mb-1" />

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <button onClick={onClose} className="p-1">
              <X className="w-6 h-6 text-white" />
            </button>
            <h2 className="text-white font-bold text-[16px]">Accounts Centre</h2>
            <div className="w-8" /> {/* Balance spacer */}
          </div>

          <div className="p-4 max-h-[70vh] overflow-y-auto no-scrollbar">
            <p className="text-zinc-400 text-xs mb-4 px-1">
              Manage your connected experiences and account settings across Meta technologies.
            </p>

            <div className="bg-[#363636] rounded-2xl overflow-hidden border border-zinc-700/50">
              {accountsLoading ? (
                <div className="p-10 flex justify-center">
                  <Loader2 className="animate-spin text-zinc-500" />
                </div>
              ) : (
                <div className="flex flex-col">
                  {accounts?.map((acc: any) => (
                    <div
                      key={acc.id}
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-700/50 transition-colors border-b border-zinc-700/30 last:border-0"
                      onClick={() => setSelectedId(acc.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border border-zinc-700">
                           <Image 
                             src={acc.avatarUrl || "https://i.pravatar.cc/150"} 
                             fill 
                             alt="" 
                             className="object-cover" 
                           />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-semibold text-sm">{acc.username}</span>
                          <span className="text-zinc-400 text-[11px]">Instagram</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {selectedId === acc.id && (
                          <div className="bg-blue-500 rounded-full p-1">
                            <Check className="text-white w-3 h-3" strokeWidth={4} />
                          </div>
                        )}
                        <button
                          className="p-2 hover:bg-zinc-600 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAccount(acc);
                            setEditName(acc.username);
                            setEditAvatar(acc.avatarUrl);
                          }}
                        >
                          <MoreHorizontal className="text-zinc-400 w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add Account Option */}
                  <button className="flex items-center justify-between p-4 hover:bg-zinc-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700">
                        <Plus className="text-white w-6 h-6" />
                      </div>
                      <span className="text-white text-sm font-semibold">Add accounts</span>
                    </div>
                    <ChevronRight className="text-zinc-500 w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Meta Footer */}
          <div className="pb-10 pt-2 text-center">
            <div className="flex items-center justify-center gap-1 opacity-60">
               <span className="text-[10px] font-black tracking-[0.25em] text-zinc-500 uppercase">Meta</span>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT MODAL - z-[10000] */}
      {editingAccount && (
        <div className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in zoom-in duration-200">
          <div className="bg-[#262626] p-6 rounded-[24px] w-full max-w-xs border border-zinc-800 shadow-2xl">
            <h3 className="text-white font-bold text-center text-lg mb-6">Profile info</h3>

            <div 
              className="relative w-24 h-24 mx-auto cursor-pointer group" 
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-zinc-700">
                <Image src={editAvatar || "https://i.pravatar.cc/150"} fill alt="edit" className="object-cover" />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Camera className="text-white w-6 h-6" />
              </div>
            </div>

            <input type="file" hidden ref={fileInputRef} onChange={handleAvatarChange} />

            <div className="mt-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500 uppercase ml-1">Username</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3 bg-zinc-800 rounded-xl text-white text-sm outline-none border border-zinc-700 focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={saveAccount}
                  disabled={loading}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white p-3 rounded-xl text-sm font-bold flex justify-center"
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Done"}
                </button>
                <button
                  onClick={() => setEditingAccount(null)}
                  className="w-full text-zinc-400 hover:text-white p-2 text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}