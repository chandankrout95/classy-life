
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  MoreHorizontal,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Share2,
  BarChart,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Post } from "@/lib/types";
import { EditPostSheet } from "@/components/edit-post-sheet";
import { PostOptionsSheet } from "@/components/post-options-sheet";
import { formatNumber } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { useDashboard } from "@/app/dashboard/context";
import React from "react";

export default function PostPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { profile, onProfileUpdate } = useDashboard();
  
  const [post, setPost] = useState<Post | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  useEffect(() => {
    const currentPost = profile?.posts.find(p => p.id === id);
    if (currentPost) {
      setPost(currentPost);
    } else if(profile) {
      // If post not found but profile is loaded, redirect
      router.push('/dashboard/profile');
    }
  }, [profile, id, router]);

  const handlePostUpdate = async (updatedPost: Post) => {
     if (!profile) return;
     const updatedPosts = profile.posts.map(p => p.id === updatedPost.id ? updatedPost : p);
     onProfileUpdate({ ...profile, posts: updatedPosts });
     setIsEditing(false);
  };
  
  const handleDelete = async () => {
    if (!profile || !post) return;
    const updatedPosts = profile.posts.filter(p => p.id !== post.id);
    onProfileUpdate({ ...profile, posts: updatedPosts });
    router.push("/dashboard/profile");
  };


  const handleEdit = () => {
    setIsOptionsOpen(false);
    setIsEditing(true);
  }

  if (!post || !profile) {
    return (
      <div className="bg-background text-white min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-background text-white h-dvh flex flex-col overflow-hidden">
      <div className="relative flex-1">
        {post.imageUrl && (
          post.type === 'reel' ? (
            <video
              src={post.imageUrl}
              className="object-cover w-full h-full"
              autoPlay
              loop
              controls={false}
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
        
        <div className="absolute inset-0 flex flex-col justify-between z-10 pointer-events-none">
          <header className="p-4 flex items-center justify-between text-white pointer-events-auto">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/profile">
                <ChevronLeft size={28} />
              </Link>
              <span className="text-xl font-bold">Your reels</span>
            </div>
            <Button variant="ghost" size="icon" className="text-white rounded-full" onClick={() => setIsOptionsOpen(true)}>
              <MoreHorizontal size={28} />
            </Button>
          </header>

          <div className="flex-1 flex justify-end items-center p-4 pb-28">
            <div className="flex flex-col items-center gap-2 pointer-events-auto">
                <div className="flex flex-col items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-auto p-1.5">
                        <Heart size={28} />
                    </Button>
                    <span className="text-xs font-semibold">{formatNumber(post.likes || 0)}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-auto p-1.5">
                        <MessageCircle size={28} />
                    </Button>
                    <span className="text-xs font-semibold">{formatNumber(post.comments || 0)}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-auto p-1.5">
                        <Send size={28} />
                    </Button>
                    <span className="text-xs font-semibold">{formatNumber(post.shares || 0)}</span>
                </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-16 left-0 right-0 p-4 z-10 bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
          <div className="flex items-center gap-2 mb-2 pointer-events-auto">
            {profile.avatarUrl && (
              <Image
                src={profile.avatarUrl}
                alt="Avatar"
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <span className="font-bold">{profile.username}</span>
          </div>
          <p className="text-xs mb-3.5">
            {post.caption || `Rich Billionaire Family Lifestyle in Monaco 🇲🇨`}
          </p>
          
          <Separator className="bg-white/20 mb-3" />
        </div>
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
    </div>
  );
}
