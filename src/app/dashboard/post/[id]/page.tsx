"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
// 1. IMPORT MOTION
import { motion } from "framer-motion";
import {
  ChevronLeft,
  MoreHorizontal,
  Heart,
  MessageCircle,
  Send,
  Loader2,
  BarChart,
  Zap,
  Music2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Post } from "@/lib/types";
import { EditPostSheet } from "@/components/edit-post-sheet";
import { PostOptionsSheet } from "@/components/post-options-sheet";
import { formatNumber, truncateWords } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { useDashboard } from "@/app/dashboard/context";
import React from "react";

export default function PostPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { profile, onProfileUpdate, loading } = useDashboard();

  const [post, setPost] = useState<Post | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (profile) {
      const currentPost = profile.posts.find(p => p.id === id);
      if (currentPost) {
        setPost(currentPost);
      } else if (profile) {
        router.push('/dashboard/profile');
      }
    }
  }, [profile, id, router]);

  const handlePostUpdate = async (updatedPost: Post) => {
    if (!profile || !onProfileUpdate) return;
    const updatedPosts = profile.posts.map(p => p.id === updatedPost.id ? updatedPost : p);
    onProfileUpdate({ ...profile, posts: updatedPosts });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!profile || !post || !onProfileUpdate) return;
    const updatedPosts = profile.posts.filter(p => p.id !== post.id);
    onProfileUpdate({ ...profile, posts: updatedPosts });
    router.push("/dashboard/profile");
  };

  const handleEdit = () => {
    setIsOptionsOpen(false);
    setIsEditing(true);
  }

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (loading || !post || !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
        <p className="text-muted-foreground mt-4">Loading Post...</p>
      </div>
    );
  }

  return (
    // 2. WRAP WITH MOTION.DIV
    <motion.div 
      // Animation Settings
      initial={{ opacity: 0, scale: 0.9 }} // Starts smaller in center
      animate={{ opacity: 1, scale: 1 }}    // Grows to full size
      exit={{ opacity: 0, scale: 0.9 }}     // Shrinks back to center on leave
      transition={{ 
        type: "spring", 
        damping: 25, 
        stiffness: 350,
        opacity: { duration: 0.2 } 
      }}
      className="bg-background text-foreground h-dvh flex flex-col overflow-hidden origin-center"
    >
      <div className="relative flex-1 overflow-y-auto" onDoubleClick={toggleMute}>
        <header className="absolute w-full p-2 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/profile">
              <ChevronLeft size={28} className="text-white"/>
            </Link>
          </div>

          <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-white">
            Your reels
          </h1>

          <Button variant="ghost" size="icon" className="rounded-full text-white" onClick={() => setIsOptionsOpen(true)}>
            <MoreHorizontal size={28} />
          </Button>
        </header>

        <div className="absolute inset-0">
          {post.imageUrl && (
            post.type === 'reel' ? (
              <video
                src={post.imageUrl}
                className="object-cover w-full h-full"
                autoPlay
                loop
                playsInline
                webkit-playsinline="true"
                muted={isMuted}
              />
            ) : (
              <Image
                src={post.imageUrl}
                alt={post.caption || "Reel background"}
                fill
                className="object-cover"
                data-ai-hint={post.imageHint}
              />
            )
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end z-10 pointer-events-none">
          <div className="relative p-4 pb-0 z-10 pointer-events-auto">
            <div className="flex items-center gap-2 mb-2">
              {profile.avatarUrl && (
                <div className="h-[40px] w-[40px] rounded-full overflow-hidden">
                  <Image
                    src={profile.avatarUrl}
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </div>
              )}
              <span className="font-bold text-white">{profile.username}</span>
            </div>
            <p className="text-sm text-white">
              {truncateWords(post.caption, 6) || `Rich Billionaire Family Lifestyle in Monaco 🇲🇨`}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Music2 size={16} className="text-white" />
              <p className="text-sm text-white">Original audio - {profile.username}</p>
            </div>

            <div className="absolute right-3 bottom-0 flex flex-col gap-5 items-center pointer-events-auto text-white">
              <div className="flex flex-col items-center">
                <div className="p-1 rounded-full hover:bg-white/10 cursor-pointer">
                  <Heart className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold">
                  {formatNumber(post.likes || 0)}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="p-1 rounded-full hover:bg-white/10 cursor-pointer">
                  <MessageCircle className="w-6 h-6 transform -scale-x-100" />
                </div>
                <span className="text-xs font-semibold">
                  {formatNumber(post.comments || 0)}
                </span>
              </div>

              <div className="flex flex-col items-center cursor-pointer">
                <div className="p-1 rounded-full hover:bg-white/10">
                  <Send className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold opacity-95">
                  {formatNumber(post.shares || 0)}
                </span>
              </div>

              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-auto p-1.5 text-2xl">
                <MoreHorizontal size={28} />
              </Button>
              <div className="w-10 h-10 border-2 border-zinc-500 rounded-lg overflow-hidden">
                {profile.avatarUrl && (
                  <Image
                    src={profile.avatarUrl}
                    alt="User avatar"
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                )}
              </div>
            </div>
          </div>

          <Separator className="bg-white/20 mt-3.5" />

          <div className="flex justify-around bg-gradient-to-t from-black/50 to-transparent gap-2 text-sm p-3 pointer-events-auto">
            <Button
              variant="ghost"
              className="text-white flex-1 justify-center p-0 h-auto"
              onClick={() => router.push(`/dashboard/post/${id}/insights`)}
            >
              <BarChart className="mr-2 h-4 w-4" />
              View insights
            </Button>

            <Button
              variant="ghost"
              className="text-white flex-1 justify-center p-0 h-auto"
            >
              <Zap className="mr-2 h-4 w-4" />
              Boost reel
            </Button>
          </div>
        </div>
      </div>

      <div className="shrink-0 z-30 bg-black border-t px-3 py-3 border-zinc-800 pointer-events-auto">
        <button className="w-full py-2 px-6 bg-zinc-900 text-start text-[13px] rounded-[20px] text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-shadow">
          Add comment...
        </button>
      </div>

      <PostOptionsSheet
        isOpen={isOptionsOpen}
        onOpenChange={setIsOptionsOpen}
        onEdit={handleEdit}
        onDelete={handleDelete}
        postUrl={post.imageUrl}
      />

      {post && <EditPostSheet
        isOpen={isEditing}
        onOpenChange={setIsEditing}
        post={post}
        onPostUpdate={handlePostUpdate}
      />}
    </motion.div>
  );
}
