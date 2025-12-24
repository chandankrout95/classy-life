"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Post, VideoInsight } from "@/lib/types";
import { 
  PlaySquare, 
  Grid3x3, 
  ChevronLeft, 
  X, 
  Loader2, 
  Scissors, 
  Clapperboard, 
  MonitorPlay, 
  Sparkles, 
  Megaphone 
} from "lucide-react";
import { applyDemoDataAction } from "@/app/actions";
import { useFirebase } from "@/firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";

export function CreatePostSheet({
  isOpen,
  onOpenChange,
  onPostCreate,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onPostCreate: (newPost: Omit<Post, "id" | "createdAt">) => void;
}) {
  const { storage } = useFirebase();
  const [stage, setStage] = useState<"selectType" | "createPost">("selectType");
  const [isUploading, setIsUploading] = useState(false);
  const [media, setMedia] = useState<{ uri: string; type: "image" | "reel"; hint: string } | null>(null);
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingType, setPendingType] = useState<"image" | "reel" | null>(null);

  const handleTypeClick = (type: "image" | "reel") => {
    setPendingType(type);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0] && pendingType) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (loadEvent.target?.result) {
          setMedia({
            uri: loadEvent.target.result as string,
            type: pendingType,
            hint: file.name,
          });
          setStage("createPost");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadMedia = async (): Promise<string> => {
    if (!media) return "";

    const formData = new FormData();
    formData.append("file", media.uri);
    
    // Check if it's a reel or image to set the correct preset and resource type
    const isReel = media.type === "reel";
    
    // If it's a reel, use your video preset. If image, Cloudinary handles it as 'image' by default.
    formData.append("upload_preset", isReel ? "video_reels" : "photo_posts"); 
    formData.append("resource_type", isReel ? "video" : "image");

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/dlprwkqzj/${isReel ? 'video' : 'image'}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error?.message || "Upload to Cloudinary failed");
      }

      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary Error:", error);
      throw error;
    }
  };
  const handleShare = async () => {
    if (!media) return;
    setIsUploading(true);

    try {
      // 1. Upload file to Cloudinary or Firebase
      const remoteUrl = await uploadMedia();
      
      // 2. Base post data with default metrics
      let finalPostData: Omit<Post, "id" | "createdAt"> = {
        imageUrl: remoteUrl,
        imageHint: media.hint,
        caption,
        type: media.type,
        views: 0,
        likes: 0,
        comments: 0
      };

      // 3. Attempt to get AI Demo Data (failsafe wrapper)
      try {
        const mockInsight: VideoInsight = {
          videoId: `temp-${Date.now()}`,
          title: caption || "New Post",
          thumbnailUrl: remoteUrl,
          metrics: { views: 0, likes: 0, comments: 0, saves: 0, shares: 0, reach: 0, impressions: 0, avg_watch_time: 0 },
          timeseries: [],
          countryBreakdown: [],
          lastEdited: new Date().toISOString(),
          isDemo: false
        };

        const aiResult = await applyDemoDataAction(mockInsight);
        finalPostData = { ...finalPostData, ...aiResult };
      } catch (aiError) {
        console.warn("AI insights failed, using default metrics", aiError);
        // We continue anyway so the post is created
      }

      onPostCreate(finalPostData);
      reset();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Error: " + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setStage("selectType");
    setMedia(null);
    setCaption("");
    setPendingType(null);
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-[#121212] text-white border-t-zinc-800 rounded-t-[20px] p-0 overflow-hidden h-auto max-h-[90vh]">
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto my-3" />
        
        <SheetHeader className="px-4 pb-2 border-b border-zinc-800 flex-row items-center justify-between space-y-0">
          <Button variant="ghost" size="icon" onClick={() => (stage === "createPost" ? setStage("selectType") : onOpenChange(false))}>
            {stage === "selectType" ? <X /> : <ChevronLeft />}
          </Button>
          <SheetTitle className="text-white font-bold text-base">
            {stage === "selectType" ? "Create" : "New post"}
          </SheetTitle>
          <div className="w-10 flex justify-end">
            {stage === "createPost" && (
              <Button variant="link" className="text-blue-500 font-bold p-0" onClick={handleShare} disabled={isUploading}>
                {isUploading ? <Loader2 className="animate-spin w-4 h-4" /> : "Share"}
              </Button>
            )}
          </div>
        </SheetHeader>

        {stage === "selectType" ? (
          <div className="flex flex-col py-2 mb-4">
            <MenuOption icon={<PlaySquare />} label="Reel" onClick={() => handleTypeClick("reel")} />
            <MenuOption icon={<Scissors />} label="Edits" />
            <MenuOption icon={<Grid3x3 />} label="Post" onClick={() => handleTypeClick("image")} />
            <MenuOption icon={<Clapperboard />} label="Story" />
            <MenuOption icon={<MonitorPlay />} label="Highlight" />
            <MenuOption icon={<Sparkles />} label="AI" />
            <MenuOption icon={<Megaphone />} label="Ad" />
          </div>
        ) : (
          <div className="p-4 space-y-4 pb-10">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-zinc-800 rounded-md overflow-hidden flex-shrink-0">
                {media?.type === "image" ? (
                  <img src={media.uri} alt="preview" className="object-cover h-full w-full" />
                ) : (
                  <video key={media?.uri} src={media?.uri} className="object-cover h-full w-full" muted autoPlay playsInline loop />
                )}
              </div>
              <Textarea 
                placeholder="Write a caption..." 
                className="bg-transparent border-none focus-visible:ring-0 text-white resize-none p-0"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
          </div>
        )}

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept={pendingType === "reel" ? "video/*" : "image/*"} 
          onChange={handleFileChange} 
        />
      </SheetContent>
    </Sheet>
  );
}

function MenuOption({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-4 px-4 py-4 hover:bg-zinc-800/50 transition-colors w-full text-left border-b border-zinc-900/30">
      {icon}
      <span className="text-[16px] font-normal">{label}</span>
    </button>
  );
}