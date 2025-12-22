
"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  PlusSquare,
  Menu,
  Grid3x3,
  Contact,
  PlaySquare,
  ChevronRight,
  Repeat,
  Eye,
  Link2,
  Loader2,
  LogOut,
} from "lucide-react";
import { Button } from "./ui/button";
import { UserProfileData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useUser, useFirebase } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { AvatarSelectionDialog } from "./avatar-selection-dialog";
import { useToast } from "@/hooks/use-toast";
import { EditProfileHeader } from "./edit-profile-header";
import { useDashboard } from "../app/dashboard/context";


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
  const { auth } = useUser();
  const { profile: formData, onProfileUpdate: setFormData, loading: isComponentLoading } = useDashboard();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  
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
          [name]: value,
        },
      }));
  }

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
     if (!localProfile) return;
    setLocalProfile((prev) => ({...prev!, bio: e.target.value.split('\n')}));
  }

  const handleAvatarSelect = (image: string) => {
    setIsAvatarDialogOpen(false);
    if(localProfile)
    setLocalProfile(prev => ({...prev!, avatarUrl: image}));
  }

  const handleSave = async () => {
    if (!localProfile || !setFormData) return;
    setIsSaving(true);
    setFormData(localProfile); // This now calls the async update function from the context
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
                  data-ai-hint={localProfile.avatarHint}
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
                <Input id="name" name="name" value={localProfile.name} onChange={handleInputChange} className="bg-zinc-800 border-zinc-700" disabled={isActionPending}/>
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
                  <Input id="posts" name="posts" value={localProfile.posts.length} readOnly placeholder="Posts" className="bg-zinc-800 border-zinc-700" disabled />
                  <Input id="followers" name="followers" value={localProfile.stats.followers} onChange={handleStatsChange} placeholder="Followers" className="bg-zinc-800 border-zinc-700" disabled={isActionPending} />
                  <Input id="following" name="following" value={localProfile.stats.following} onChange={handleStatsChange} placeholder="Following" className="bg-zinc-800 border-zinc-700" disabled={isActionPending} />
                </div>
              </div>
               <div className="p-4 border-t border-zinc-800">
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
    <div className="p-4 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 relative">
          <h1 className="text-xl sm:text-2xl font-bold">{localProfile.username}</h1>
          <ChevronDown size={20} />
           <div className="absolute -right-1 -top-1 w-2 h-2 bg-red-500 rounded-full"></div>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-bold text-xl">@</span>
          <div className="relative">
            <PlusSquare size={24} />
            <div className="absolute -right-1 -top-1 w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
          <Menu size={28} />
        </div>
      </header>

      <div className="flex items-center gap-2 sm:gap-4 mb-4">
        <div className="relative flex-shrink-0 w-[90px] h-[90px]">
          {localProfile.avatarUrl && <Image
            src={localProfile.avatarUrl}
            alt="Profile"
            width={90}
            height={90}
            className="rounded-full border-2 border-zinc-700 object-cover w-[90px] h-[90px]"
            data-ai-hint={localProfile.avatarHint}
          />}
        </div>
        <div className="flex-1 flex justify-around items-center">
          <div className="text-center">
            <div className="font-bold text-base sm:text-lg">{localProfile.posts?.length || 0}</div>
            <div className="text-xs sm:text-sm text-zinc-400">posts</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-base sm:text-lg">{localProfile.stats.followers}</div>
            <div className="text-xs sm:text-sm text-zinc-400">followers</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-base sm:text-lg">{localProfile.stats.following}</div>
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
        className="w-full p-3 rounded-lg mb-4 text-left justify-between h-auto"
        onClick={() => router.push("/dashboard")}
      >
        <div>
          <div className="font-semibold text-sm sm:text-base">Professional dashboard</div>
          <div className="text-xs text-zinc-400">
            {localProfile.professionalDashboard.views} views in the last 30 days
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

      <div className="profile-tabs">
        <button onClick={() => setActiveTab('grid')}>
          <svg className={`tab-icon ${activeTab === 'grid' ? 'active' : ''}`} viewBox="0 0 24 24">
            <rect x="3" y="3" width="4" height="4"/>
            <rect x="10" y="3" width="4" height="4"/>
            <rect x="17" y="3" width="4" height="4"/>
            <rect x="3" y="10" width="4" height="4"/>
            <rect x="10" y="10" width="4" height="4"/>
            <rect x="17" y="10" width="4" height="4"/>
            <rect x="3" y="17" width="4" height="4"/>
            <rect x="10" y="17" width="4" height="4"/>
            <rect x="17" y="17" width="4" height="4"/>
          </svg>
        </button>
        <button onClick={() => setActiveTab('reels')}>
          <svg className={`tab-icon ${activeTab === 'reels' ? 'active' : ''}`} viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="4"/>
            <polygon points="10,8 16,12 10,16"/>
          </svg>
        </button>
        <button onClick={() => setActiveTab('repost')}>
          <svg className={`tab-icon ${activeTab === 'repost' ? 'active' : ''}`} viewBox="0 0 24 24">
            <path d="M17 1l4 4-4 4"/>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
            <path d="M7 23l-4-4 4-4"/>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
          </svg>
        </button>
        <button onClick={() => setActiveTab('tagged')}>
          <svg className={`tab-icon ${activeTab === 'tagged' ? 'active' : ''}`} viewBox="0 0 24 24">
            <path d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"/>
            <circle cx="12" cy="11" r="3"/>
            <path d="M7 18c1.5-2 8.5-2 10 0"/>
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1">
        {localProfile.posts?.sort((a,b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()).map((post) => (
          <Link href={`/dashboard/post/${post.id}`} key={post.id}>
            <div className="relative aspect-[9/16] overflow-hidden rounded-md">
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
                    alt="Post"
                    fill
                    className="object-cover"
                    data-ai-hint={post.imageHint}
                  />
                )
              )}
              <div className="absolute top-2 right-2 text-foreground">
                {post.type === 'reel' && <PlaySquare />}
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 text-foreground text-sm font-bold bg-black/30 px-1.5 py-0.5 rounded-md">
                <Eye size={16} />
                {formatNumber(post.views || 0)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
    </>
  );
}
    
    