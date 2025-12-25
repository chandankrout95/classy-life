
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
  Loader2,
  Music2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Post, type UserProfileData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import React from "react";
import { useFirestore } from "@/firebase";
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

async function getPostAndProfile(firestore: any, postId: string): Promise<{ post: Post | null; profile: UserProfileData | null }> {
    try {
        const usersRef = collection(firestore, "users");
        const q = query(usersRef, where("posts", "array-contains", { id: postId }));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            // Fallback for posts that might not be perfectly indexed
            const allUsersSnapshot = await getDocs(usersRef);
            for (const userDoc of allUsersSnapshot.docs) {
                const userProfile = userDoc.data() as UserProfileData;
                const post = userProfile.posts?.find(p => p.id === postId);
                if (post) {
                    return { post, profile: userProfile };
                }
            }
            return { post: null, profile: null };
        }
        
        const userDoc = querySnapshot.docs[0];
        const userProfile = userDoc.data() as UserProfileData;
        const post = userProfile.posts.find(p => p.id === postId);

        return { post: post || null, profile: userProfile };

    } catch (error) {
        console.error("Error fetching post and profile:", error);
        return { post: null, profile: null };
    }
}


export default function PublicPostPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const firestore = useFirestore();
  
  const [post, setPost] = useState<Post | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !id) return;
    
    getPostAndProfile(firestore, id).then(({ post, profile }) => {
        if (post && profile) {
            setPost(post);
            setProfile(profile);
        } else {
            // Handle post not found, e.g., redirect
            router.push('/');
        }
        setLoading(false);
    });
    
  }, [firestore, id, router]);


  if (loading || !post || !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <p className="text-muted-foreground mt-4">Loading Post...</p>
      </div>
    );
  }

  return (
    <div className="bg-black text-white h-dvh flex flex-col overflow-hidden">
        <header className="p-4 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/profile">
              <ChevronLeft size={28} />
            </Link>
            <span className="text-xl font-bold">Reels</span>
          </div>
          <Button variant="ghost" size="icon" className="text-white rounded-full">
            <MoreHorizontal size={28} />
          </Button>
        </header>

      <div className="relative flex-1 overflow-y-auto -mt-16">
        <div className="absolute inset-0">
          {post.imageUrl && (
            post.type === 'reel' ? (
              <video
                src={post.imageUrl}
                className="object-cover w-full h-full"
                autoPlay
                loop
                muted
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
          
          <div className="absolute right-3 bottom-4 flex flex-col gap-5 items-center pointer-events-auto">
            <div className="flex flex-col items-center cursor-pointer">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-auto p-1.5 text-2xl">
                <Heart size={28} />
              </Button>
              <span className="text-xs font-semibold mt-1">{formatNumber(post.likes || 0)}</span>
            </div>
            <div className="flex flex-col items-center cursor-pointer">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-auto p-1.5 text-2xl">
                <MessageCircle size={28} />
              </Button>
              <span className="text-xs font-semibold mt-1">{formatNumber(post.comments || 0)}</span>
            </div>
            <div className="flex flex-col items-center cursor-pointer">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-auto p-1.5 text-2xl">
                <Send size={28} />
              </Button>
              <span className="text-xs font-semibold mt-1">{formatNumber(post.shares || 0)}</span>
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
          
          <div className="relative p-4 pb-4 z-10 bg-gradient-to-t from-black/50 to-transparent pointer-events-auto">
            <div className="flex items-center gap-2 mb-2">
              {profile.avatarUrl && (
                <Image
                  src={profile.avatarUrl}
                  alt="Avatar"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <span className="font-bold text-white">{profile.username}</span>
            </div>
            <p className="text-sm text-white/90">
              {post.caption || `Rich Billionaire Family Lifestyle in Monaco 🇲🇨`}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Music2 size={16} className="text-white"/>
              <p className="text-sm text-white/90 truncate">Original audio - {profile.username}</p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

    