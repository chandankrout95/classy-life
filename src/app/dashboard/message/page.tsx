"use client";

import React from "react";
import {
  ArrowLeft,
  Edit,
  Search,
  Camera,
  ChevronDown,
  MoreVertical,
} from "lucide-react";
import Image from "next/image";

// --- Dummy Data ---
const THOUGHTS = [
  {
    id: 1,
    username: "Your note",
    img: "https://i.pravatar.cc/150?u=admin",
    note: "Obsessed with...",
    isUser: true,
  },
  {
    id: 3,
    username: "whopphantom",
    img: "https://i.pravatar.cc/150?u=phantom",
    note: "LFG! 🚀",
  },
  {
    id: 4,
    username: "dripsociety",
    img: "https://i.pravatar.cc/150?u=drip",
    note: "New drop live",
  },
  {
    id: 5,
    username: "mxrcmuno_oz",
    img: "https://i.pravatar.cc/150?u=marc",
    note: "Working...",
  },
];

const CHATS = Array.from({ length: 15 }).map((_, i) => ({
  id: i + 1,
  username: [
    "amaritsaran",
    "dripsociety.inc",
    "whopphantom",
    "textfae.ree67",
    "iguana.8749135",
    "Pawan Saini",
  ][i % 6],
  img: `https://i.pravatar.cc/150?u=user${i}`,
  lastMsg: [
    "Ooo · Reply?",
    "Sent 10h ago",
    "Active 3h ago",
    "Active 3h ago",
    "Active 4h ago",
    "Seen on Wednesday",
  ][i % 6],
  hasStory: i % 3 === 0,
}));

export default function MessagesPage() {
  return (
    /* Changed bg-background to handle the main container color */
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      
      {/* --- Header --- */}
      <header className="fixed top-0 w-full bg-background border-b border-border z-50 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <ArrowLeft className="w-6 h-6 cursor-pointer" />
          <div className="flex items-center gap-1 font-bold text-xl tracking-tight">
            insight_editor_app <ChevronDown className="w-4 h-4 mt-1" />
            <div className="w-2 h-2 bg-red-500 rounded-full ml-1" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Edit className="w-6 h-6 cursor-pointer" />
        </div>
      </header>

      <main className="pt-14 max-w-md mx-auto">
        {/* --- Search Bar --- */}
        <div className="px-4 py-2">
          {/* bg-muted automatically adapts to light/dark if configured in tailwind.config */}
          <div className="flex items-center gap-3 bg-secondary/50 dark:bg-muted rounded-xl px-3 py-2 text-muted-foreground">
            <Search className="w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* --- Thoughts / Notes Section --- */}
        <div className="flex overflow-x-auto py-4 px-2 no-scrollbar">
          {THOUGHTS.map((t) => (
            <div key={t.id} className="flex flex-col items-center min-w-[95px] space-y-2">
              <div className="relative">
                {/* Note Bubble - Adaptive Colors */}
                {t.note && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-muted text-[11px] px-3 py-1.5 rounded-2xl border border-border shadow-sm whitespace-nowrap z-10 text-foreground">
                    {t.note}
                    {/* Bubble Tail */}
                    <div className="absolute -bottom-1 left-4 w-2 h-2 bg-white dark:bg-muted border-r border-b border-border rotate-45" />
                  </div>
                )}

                <div className={`p-[2px] rounded-full ${t.isUser ? "" : "border border-border"}`}>
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-secondary">
                    <Image src={t.img} alt={t.username} fill className="object-cover" />
                    {/* {t.isUser && (
                      <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full border-2 border-background p-0.5">
                        <PlusIcon />
                      </div>
                    )} */}
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-muted-foreground text-center truncate w-20">
                {t.isUser ? "Your note" : t.username}
              </span>
            </div>
          ))}
        </div>

        {/* --- Chat Tabs --- */}
        <div className="flex items-center gap-2 px-3 py-3 border-b border-border bg-background">
          {/* Filter Icon Button - Theme Adaptive Border */}
          <button className="p-2 rounded-full border border-border hover:bg-secondary transition-colors">
            <div className="flex items-center gap-1 text-foreground">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
                <line x1="2" y1="14" x2="6" y2="14" /><line x1="10" y1="8" x2="14" y2="8" /><line x1="18" y1="16" x2="22" y2="16" />
              </svg>
              <ChevronDown className="w-3 h-3 fill-current" />
            </div>
          </button>

          {/* Tabs Scrollable Area */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {/* Primary Tab (Active) - Swaps Zinc-800 for adaptive muted color or black */}
            <button className="flex items-center gap-2 px-4 py-1.5 bg-foreground text-background dark:bg-muted dark:text-foreground rounded-full transition-opacity active:opacity-80">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              <span className="text-xs font-bold whitespace-nowrap">Primary</span>
              <span className="text-xs font-medium opacity-60">6</span>
            </button>

            {/* Requests Tab */}
            <button className="px-4 py-1.5 rounded-full border border-border hover:bg-secondary transition-colors">
              <span className="text-xs font-bold text-foreground whitespace-nowrap">Requests</span>
            </button>

            {/* General Tab */}
            <button className="px-4 py-1.5 rounded-full border border-border hover:bg-secondary transition-colors">
              <span className="text-xs font-bold text-foreground whitespace-nowrap">General</span>
            </button>
          </div>
        </div>

        {/* --- Chat List --- */}
        <div className="mt-1">
          {CHATS.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center justify-between px-4 py-3 active:bg-secondary transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={`p-[2px] rounded-full ${chat.hasStory ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600" : ""}`}>
                  <div className={`relative w-14 h-14 rounded-full overflow-hidden border-2 ${chat.hasStory ? "border-background" : "border-transparent"}`}>
                    <Image src={chat.img} alt={chat.username} fill className="object-cover bg-secondary" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium text-foreground">{chat.username}</span>
                  <span className="text-[13px] text-muted-foreground line-clamp-1">
                    {chat.lastMsg}
                  </span>
                </div>
              </div>
              <Camera className="w-6 h-6 text-muted-foreground" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}