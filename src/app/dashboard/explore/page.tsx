"use client";

import React from "react";
import { 
  Search, 
  Home, 
  Film, 
  Send, 
  Play,
  Copy
} from "lucide-react";
import Image from "next/image";

// --- Dummy Data ---
// Generating 30 posts with varied metadata
const EXPLORE_POSTS = Array.from({ length: 30 }).map((_, i) => ({
  id: i + 1,
  url: `https://picsum.photos/seed/${i + 58}/600/600`,
  views: `${(Math.random() * 10).toFixed(1)} M`,
  type: i % 5 === 0 ? "video" : i % 7 === 0 ? "carousel" : "image",
}));

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* --- Search Header --- */}
      <header className="fixed top-0 w-full bg-background z-50 px-4 h-14 flex items-center">
        <div className="flex items-center gap-3 bg-muted rounded-xl px-4 py-1.5 w-full border border-transparent focus-within:border-border transition-all">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search" 
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground"
          />
        </div>
      </header>

      <main className="pt-14">
        {/* --- Explore Grid --- */}
        <div className="grid grid-cols-3 gap-[2px]">
          {EXPLORE_POSTS.map((post, index) => {
            // Instagram Explore logic: Every 10th post is a tall "Reel" (row-span-2)
            const isTall = (index + 1) % 10 === 3 || (index + 1) % 10 === 6;

            return (
              <div 
                key={post.id} 
                className={`relative bg-muted group cursor-pointer overflow-hidden ${
                  isTall ? "row-span-2" : ""
                }`}
              >
                <Image 
                  src={post.url} 
                  alt="Explore post"
                  width={400}
                  height={isTall ? 800 : 400}
                  className="object-cover w-full h-full hover:brightness-90 transition-all"
                />

                {/* Overlay Icons (Video/Carousel indicators) */}
                <div className="absolute top-2 right-2 text-white drop-shadow-md">
                  {post.type === "video" && <Play className="w-4 h-4 fill-white" />}
                  {post.type === "carousel" && <Copy className="w-4 h-4" />}
                </div>

                {/* View Count (Bottom Left) */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-[11px] font-semibold drop-shadow-lg opacity-90">
                  <Play className="w-3 h-3 fill-white" />
                  {post.views}
                </div>
              </div>
            );
          })}
        </div>
      </main>

    </div>
  );
}