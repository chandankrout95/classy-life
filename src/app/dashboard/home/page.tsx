"use client";

import React from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Plus,
  Search,
  Home,
  Film,
} from "lucide-react";
import Image from "next/image";

// --- Dummy Data ---
const STORIES = [
  {
    id: 1,
    username: "Your story",
    img: "https://i.pravatar.cc/150?u=admin",
    isUser: true,
  },
  {
    id: 2,
    username: "whopphantom",
    img: "https://i.pravatar.cc/150?u=phantom",
  },
  {
    id: 3,
    username: "dripsociety.inc",
    img: "https://i.pravatar.cc/150?u=drip",
  },
  { id: 4, username: "mxrcmuno_oz", img: "https://i.pravatar.cc/150?u=marc" },
  { id: 5, username: "samuel_ecom", img: "https://i.pravatar.cc/150?u=sam" },
];

const POSTS = [
  {
    id: 1,
    username: "marcmunozultimate",
    userImg: "https://i.pravatar.cc/150?u=marc",
    postImg: "https://picsum.photos/seed/car1/600/800",
    likes: "1,240",
    caption:
      "The dream my brain has on repeat every night 🏎️💨 #lifestyle #goals",
    audio: "marcmunozultimate • Original audio",
    time: "2 HOURS AGO",
  },
  {
    id: 2,
    username: "samuel_ecom",
    userImg: "https://i.pravatar.cc/150?u=sam",
    postImg: "https://picsum.photos/seed/ecom/600/800",
    likes: "852",
    caption:
      "Clipping rewards are live. Check the campaign details for $3 per 1k views.",
    audio: "Entrepreneurial Spirit • Ambition",
    time: "5 HOURS AGO",
  },
  {
    id: 3,
    username: "dripsociety.inc",
    userImg: "https://i.pravatar.cc/150?u=drip",
    postImg: "https://picsum.photos/seed/style/600/800",
    likes: "3,100",
    caption: "New drop coming Friday. Stay tuned. #dripsociety",
    audio: "Drip Society • Official Audio",
    time: "1 DAY AGO",
  },
];

export default function InstagramHomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* --- Top Header --- */}
      <header className=" w-full bg-background border-border z-50 px-4 h-14 flex items-center justify-between">
        {/* Left Icon */}
        <Plus className="nav-icon" />

        {/* Center Logo - CSS Filter Approach */}
        <div className="relative w-28 h-12">
          <Image
            src="/instalogo.png" // Your black-text logo
            alt="Instagram Logo"
            fill
            className="object-contain transition-all duration-300 dark:invert"
            priority
          />
        </div>

        {/* Right Icon */}
        <Heart className="nav-icon" />
      </header>

      <main className=" max-w-md mx-auto">
   
        {/* --- Stories Section --- */}
        <div className="flex overflow-x-auto py-4 px-2 no-scrollbar border-b border-border">
          {STORIES.map((story) => (
            <div
              key={story.id}
              className="flex flex-col items-center min-w-[85px] space-y-1"
            >
              <div
                className={`p-[2.5px] rounded-full ${
                  story.isUser
                    ? "bg-transparent" // Usually user story doesn't have the gradient ring
                    : "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600"
                }`}
              >
                <div className="bg-background p-[2px] rounded-full">
                  {/* REMOVED overflow-hidden from this relative container 
              so the absolute positioned plus icon can "leak" outside 
          */}
                  <div className="relative w-16 h-16">
                    {/* Image Wrapper with overflow-hidden */}
                    <div className="w-full h-full rounded-full overflow-hidden relative">
                      <Image
                        src={story.img}
                        alt={story.username}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>

                    {/* Plus Icon - Now outside the overflow-hidden boundary */}
                    {story.isUser && (
                      <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full border-[3px] border-background p-0.5 z-10 translate-x-1 translate-y-1">
                        <Plus className="w-3.5 h-3.5 fill-white text-white stroke-[4px]" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-[10px] truncate w-20 text-center text-muted-foreground font-medium">
                {story.username}
              </span>
            </div>
          ))}
        </div>

        {/* --- Posts Feed --- */}
        <div className="space-y-2">
          {POSTS.map((post) => (
            <article
              key={post.id}
              className="border-b border-border pb-4 last:border-0"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border">
                    <Image
                      src={post.userImg}
                      alt={post.username}
                      fill
                      sizes="32px"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">{post.username}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {post.audio}
                    </span>
                  </div>
                </div>
                <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
              </div>

              {/* Post Image */}
              <div className="relative aspect-square w-full bg-muted overflow-hidden">
                <Image
                  src={post.postImg}
                  alt="post content"
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                />
              </div>

              {/* Post Actions */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Heart className="nav-icon hover:text-destructive transition-colors" />
                    <MessageCircle className="nav-icon" />
                    <Send className="nav-icon" />
                  </div>
                  <Bookmark className="nav-icon" />
                </div>

                {/* Likes & Caption */}
                <div className="space-y-1">
                  <p className="text-sm font-bold">{post.likes} likes</p>
                  <p className="text-sm leading-tight">
                    <span className="font-bold mr-2">{post.username}</span>
                    {post.caption}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter">
                    {post.time}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
