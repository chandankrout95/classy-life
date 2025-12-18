
'use client';

import React, { useState } from 'react';
import type { Post } from '@/lib/types';
import { useUser, useFirestore } from '@/firebase';
import { updateDoc, arrayUnion, doc } from 'firebase/firestore';
import { BottomNav } from '@/components/bottom-nav';
import { CreatePostSheet } from '@/components/create-post-sheet';
import { Loader2 } from 'lucide-react';
import { DashboardProvider, useDashboard } from './context';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BarChart, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

function DashboardCore({ children }: { children: React.ReactNode }) {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { loading: profileLoading } = useDashboard();
  const pathname = usePathname();
  const router = useRouter();
  
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  const handleCreatePost = async (newPost: Omit<Post, 'id' | 'createdAt'>) => {
    if (!user || !firestore) return;
    
    const createdPost: Post = {
        ...newPost,
        id: `post-${Date.now()}`,
        createdAt: new Date().toISOString(),
        views: newPost.views || 0,
        likes: newPost.likes || 0,
        comments: newPost.comments || 0,
        shares: newPost.shares || 0,
        saves: newPost.saves || 0,
    };
    
    const userDocRef = doc(firestore, 'users', user.uid);
    await updateDoc(userDocRef, {
        posts: arrayUnion(createdPost)
    });
    
    setIsCreatingPost(false);
  }

  if (userLoading || profileLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
        <p className="text-muted-foreground mt-4">Loading Dashboard...</p>
      </div>
    );
  }
  
  if (!user) {
      return null; // The context handles redirection
  }

  const isReelPage = pathname.includes('/post/') && !pathname.includes('/insights');
  const shouldShowBottomNav = !isReelPage;

  return (
    <>
      <div className={`bg-background text-white min-h-screen ${shouldShowBottomNav ? 'pb-24' : ''}`}>
        {children}
      </div>
      
      {shouldShowBottomNav && (
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-background border-t border-zinc-800">
          <BottomNav 
            onPlusClick={() => setIsCreatingPost(true)}
            userId={user.uid}
          />
        </div>
      )}

      <CreatePostSheet
        isOpen={isCreatingPost}
        onOpenChange={setIsCreatingPost}
        onPostCreate={handleCreatePost}
      />
    </>
  );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <DashboardCore>{children}</DashboardCore>
    </DashboardProvider>
  )
}
