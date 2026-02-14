
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  Plus,
  Menu,
  PlaySquare,
  ChevronRight,
  Eye,
  Link2,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { Button } from "./ui/button";
import { UserProfileData, Post } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useUser, useFirebase } from "@/firebase";
import { doc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { AvatarSelectionDialog } from "./avatar-selection-dialog";
import { useToast } from "@/hooks/use-toast";
import { EditProfileHeader } from "./edit-profile-header";
import { useDashboard } from "../app/dashboard/context";
import { CreatePostSheet } from "./create-post-sheet";
import { Loader2 } from "lucide-react";
import PullToRefresh from 'react-simple-pull-to-refresh';
import AppleLoader from "./apple-loader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { mockProfile } from "@/lib/mock-data";


const BioWithMentions = ({ bio }: { bio: string[] }) => {
  return (
    <div className="text-xs sm:text-sm">
      {bio.map((line, index) => (
        <div key={index}>
          {line.split(' ').map((word, wordIndex) =>
            word.startsWith('@') ? (
              <span key={wordIndex} className="text-blue-400">
                {word}{' '}
              </span>
            ) : (
              <span key={wordIndex}>{word} </span>
            )
          )}
        </div>
      ))}
    </div>
  );
};

export function UserProfile() {
  const router = useRouter();
  const { auth, user } = useUser();
  const { profile: formData, onProfileUpdate: setFormData, loading: isComponentLoading } = useDashboard();
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [localProfile, setLocalProfile] = useState<UserProfileData | null>(null);
  const [activeTab, setActiveTab] = useState('grid');

  useEffect(() => {
    if (formData) {
      setLocalProfile(formData);
    }
  }, [formData]);

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
    }
    router.push('/login');
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!localProfile) return;
    const { name, value } = e.target;
    setLocalProfile((prev) => ({ ...prev!, [name]: value }));
  };

  const handleStatsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!localProfile) return;
    const { name, value } = e.target;
    setLocalProfile((prev) => ({
      ...prev!,
      stats: {
        ...prev!.stats,
        [name]: parseInt(value) || 0,
      },
    }));
  }

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!localProfile) return;
    setLocalProfile((prev) => ({ ...prev!, bio: e.target.value.split('\n') }));
  }

  const handleAvatarSelect = (image: string) => {
    setIsAvatarDialogOpen(false);
    if (localProfile)
      setLocalProfile(prev => ({ ...prev!, avatarUrl: image }));
  }

  const handleSave = async () => {
    if (!localProfile || !setFormData) return;
    setIsSaving(true);
    setFormData(localProfile);
    setIsSaving(false);
    setIsEditing(false);
    toast({ title: 'Profile saved!' });
  };

  const handleCancel = () => {
    if (formData) {
      setLocalProfile(formData);
    }
    setIsEditing(false);
  }

  const handleResetAccount = async () => {
    if (!localProfile || !user || !firestore || !setFormData) return;
    setIsSaving(true);
    try {
      const resetProfile: UserProfileData = {
        ...localProfile,
        posts: [], // Empty the posts array
      };
      // Also explicitly set the posts count in stats to 0.
      resetProfile.stats.posts = 0;

      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, resetProfile); // Overwrite with the modified profile

      setFormData(resetProfile); // Update the context

      toast({ title: "Account Reset Successfully", description: "All of your posts and reels have been deleted." });
      setIsEditing(false);
    } catch (error) {
      console.error("Error resetting account:", error);
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: "There was a problem resetting your account.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreatePost = async (newPost: Omit<Post, "id" | "createdAt">) => {
    if (!user || !firestore) return;

    try {
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

      if (localProfile) {
        setLocalProfile({
          ...localProfile,
          posts: [createdPost, ...localProfile.posts]
        });
      }

      setIsCreatingPost(false);
      toast({ title: "Post published!" });
    } catch (error) {
      toast({ title: "Error creating post", variant: "destructive" });
    }
  }

  const formatStat = (num: number): string => {
    if (num === null || typeof num === 'undefined') {
      return '0';
    }
    if (num > 9999) { // More than 4 digits
      return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1
      }).format(num);
    }
    return num.toLocaleString('en-US');
  };

  const isActionPending = isSaving;

  if (isComponentLoading || !localProfile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
        <p className="text-muted-foreground mt-4">Loading Profile...</p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <>
        <div className="p-4 max-w-4xl mx-auto pb-24">
          <EditProfileHeader
            onCancel={handleCancel}
            onDone={handleSave}
            isSaving={isActionPending}
          />
          <div className="p-4 space-y-6">
            <div className="flex flex-col items-center gap-2">
              <button
                className="relative w-[90px] h-[90px] rounded-full group"
                onClick={() => setIsAvatarDialogOpen(true)}
                disabled={isActionPending}
              >
                {localProfile.avatarUrl && <Image
                  src={localProfile.avatarUrl}
                  alt="Avatar"
                  width={90}
                  height={90}
                  className="rounded-full object-cover w-[90px] h-[90px] transition-opacity group-hover:opacity-70"
                />}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs text-center">Change Photo</span>
                </div>
              </button>
              <Button
                variant="link"
                className="text-sm"
                onClick={() => setIsAvatarDialogOpen(true)}
                disabled={isActionPending}
              >
                Edit picture or avatar
              </Button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={localProfile.name} onChange={handleInputChange} className="bg-zinc-800 border-zinc-700" disabled={isActionPending} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" value={localProfile.username} onChange={handleInputChange} className="bg-zinc-800 border-zinc-700" disabled={isActionPending} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" name="bio" value={Array.isArray(localProfile.bio) ? localProfile.bio.join("\n") : ""} onChange={handleBioChange} className="bg-zinc-800 border-zinc-700" disabled={isActionPending} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="link">Link</Label>
                <Input id="link" name="link" value={localProfile.link || ""} onChange={handleInputChange} className="bg-zinc-800 border-zinc-700" placeholder="Add a link" disabled={isActionPending} />
              </div>
              <div className="space-y-1">
                <Label>Stats</Label>
                <div className="flex gap-2">
                  <Input id="posts" name="posts" value={localProfile.stats.posts} onChange={handleStatsChange} placeholder="Posts" className="bg-zinc-800 border-zinc-700" disabled={isActionPending} />
                  <Input id="followers" name="followers" value={localProfile.stats.followers} onChange={handleStatsChange} placeholder="Followers" className="bg-zinc-800 border-zinc-700" disabled={isActionPending} />
                  <Input id="following" name="following" value={localProfile.stats.following} onChange={handleStatsChange} placeholder="Following" className="bg-zinc-800 border-zinc-700" disabled={isActionPending} />
                </div>
              </div>
               <div className="p-4 border-t border-zinc-800 space-y-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive" disabled={isActionPending}>
                        Reset Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete all your posts and reels. Your profile information will be kept.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResetAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Yes, Reset Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button variant="destructive" className="w-full" onClick={handleSignOut} disabled={isActionPending}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
            </div>
          </div>
        </div>
        <AvatarSelectionDialog
          isOpen={isAvatarDialogOpen}
          onOpenChange={setIsAvatarDialogOpen}
          onAvatarSelect={handleAvatarSelect}
        />
      </>
    );
  }

  return (
    <>


      <div className="bg-background h-screen flex flex-col">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <header className="p-4 bg-background">
            <div className="grid grid-cols-3 items-center">
              <div className="justify-self-start">
                <div
                  className="relative cursor-pointer active:scale-95 transition-transform"
                  onClick={() => setIsCreatingPost(true)}
                >
                  <Plus size={28} />
                  <div className="absolute -right-1 -top-1 w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center gap-1 justify-self-center">
                <h1 className="text-xl sm:text-2xl font-bold">{localProfile.username}</h1>
                <ChevronDown size={20} />
              </div>
              <div className="flex items-center gap-4 justify-self-end">
                <span className="font-bold text-xl">@</span>
                <Menu size={28} />
              </div>
            </div>
          </header>

          <PullToRefresh
            onRefresh={() =>
              new Promise((resolve) => setTimeout(resolve, 1000))
            }
            pullingContent={<AppleLoader />}
            refreshingContent={<AppleLoader />}
            resistance={2.5}
            maxPullDownDistance={90}
          >
            <div className="max-w-4xl mx-auto">
              <div className="p-4">
                <div className="flex items-center gap-2 sm:gap-4 mb-4">
                  <div className="relative flex-shrink-0 w-[90px] h-[90px]">
                    {localProfile.avatarUrl && <Image
                      src={localProfile.avatarUrl}
                      alt="Profile"
                      width={90}
                      height={90}
                      className="rounded-full border-2 border-zinc-700 object-cover w-[90px] h-[90px]"
                    />}
                  </div>
                  <div className="flex-1 flex justify-around items-center">
                    <div className="text-center">
                      <div className="font-bold text-base sm:text-lg">{formatStat(localProfile.stats.posts)}</div>
                      <div className="text-xs sm:text-sm text-zinc-400">posts</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-base sm:text-lg">{formatStat(localProfile.stats.followers)}</div>
                      <div className="text-xs sm:text-sm text-zinc-400">followers</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-base sm:text-lg">{formatStat(localProfile.stats.following)}</div>
                      <div className="text-xs sm:text-sm text-zinc-400">following</div>
                    </div>
                  </div>
                </div>

                <div className="mb-4 space-y-1">
                  <div className="font-semibold text-sm sm:text-base">{localProfile.name}</div>
                  {Array.isArray(localProfile.bio) && <BioWithMentions bio={localProfile.bio} />}
                  {localProfile.link && (
                    <a href={`https://${localProfile.link}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs sm:text-sm text-blue-400">
                      <Link2 size={16} />
                      <span>{localProfile.link}</span>
                    </a>
                  )}
                </div>

                <Button
                  variant="secondary"
                  className="w-full p-3 rounded-lg mb-2 text-left justify-between h-auto"
                  onClick={() => router.push("/dashboard")}
                >
                  <div>
                    <div className="font-semibold text-sm sm:text-base">Professional dashboard</div>
                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                      <TrendingUp size={14} className="text-green-500" />
                      <span>
                        {formatStat(localProfile.stats.totalViews || 0)} views in the last 30 days
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={20} />
                </Button>

                <div className="flex gap-2 mb-4 text-sm">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit profile
                  </Button>
                  <Button variant="secondary" className="flex-1">
                    Share Profile
                  </Button>
                </div>
              </div>

              <div className="profile-tabs">
                <button onClick={() => setActiveTab('grid')}>
                  <svg className={`tab-icon ${activeTab === 'grid' ? 'active' : ''}`} viewBox="0 0 24 24">
                    <rect x="3" y="3" width="4" height="4" fill="currentColor" />
                    <rect x="10" y="3" width="4" height="4" fill="currentColor" />
                    <rect x="17" y="3" width="4" height="4" fill="currentColor" />
                    <rect x="3" y="10" width="4" height="4" fill="currentColor" />
                    <rect x="10" y="10" width="4" height="4" fill="currentColor" />
                    <rect x="17" y="10" width="4" height="4" fill="currentColor" />
                    <rect x="3" y="17" width="4" height="4" fill="currentColor" />
                    <rect x="10" y="17" width="4" height="4" fill="currentColor" />
                    <rect x="17" y="17" width="4" height="4" fill="currentColor" />
                  </svg>
                </button>
                <button onClick={() => setActiveTab('reels')}>
                  <svg
                    className={`tab-icon ${activeTab === 'reels' ? 'active' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="4"
                      ry="4"
                      stroke="currentColor"
                    />
                    <polygon points="10,8 16,12 10,16" fill="currentColor" />
                  </svg>
                </button>
                <button onClick={() => setActiveTab('tagged')}>
                  <svg className={`tab-icon ${activeTab === 'tagged' ? 'active' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" />
                    <circle cx="12" cy="11" r="3" />
                    <path d="M7 18c1.5-2 8.5-2 10 0" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1">
                {localProfile.posts?.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()).map((post) => (
                  <Link href={`/dashboard/post/${post.id}`} key={post.id}>
                    <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-zinc-800">
                      {post.imageUrl && (
                        post.type === 'reel' ? (
                          <video
                            src={post.imageUrl}
                            poster={post.imageUrl.replace(/\.[^/.]+$/, ".jpg")}
                            className="object-cover w-full h-full"
                            muted
                            playsInline
                            webkit-playsinline="true"
                            preload="metadata"
                          />
                        ) : (
                          <Image
                            src={post.imageUrl}
                            alt="Post"
                            fill
                            className="object-cover"
                          />
                        )
                      )}
                      <div className="absolute top-2 right-2 text-white">
                        {post.type === 'reel' && <PlaySquare size={16} />}
                      </div>
                      <div className="absolute bottom-1   flex items-center gap-1 text-white text-sm font-bold  px-1.5 py-0.5 rounded-md">
                        <Eye size={16} />
                        {formatNumber(post.views || 0)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </PullToRefresh>
        </div>
      </div>


      <CreatePostSheet
        isOpen={isCreatingPost}
        onOpenChange={setIsCreatingPost}
        onPostCreate={handleCreatePost}
      />
    </>
  );
}
