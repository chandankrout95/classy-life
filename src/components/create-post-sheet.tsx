"use client";

import { useState, useRef } from "react";
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
import { useToast } from "@/hooks/use-toast";

export function CreatePostSheet({
  isOpen,
  onOpenChange,
  onPostCreate,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onPostCreate: (newPost: Omit<Post, "id" | "createdAt">) => void;
}) {
  const { toast } = useToast();
  const [stage, setStage] = useState<"selectType" | "createPost">("selectType");
  const [isUploading, setIsUploading] = useState(false);
  const [media, setMedia] = useState<{ uri: string; type: "image" | "reel"; hint: string } | null>(null);
  const [caption, setCaption] = useState("");
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // --- COMPRESSION LOGIC FOR IMAGES ---
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1080; // Instagram standard
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.8)); // 80% quality
        };
      };
    });
  };

  const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "reel") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Size Validation (10MB limit for better UX, Cloudinary Free tier handles this well)
    const MAX_SIZE = type === "reel" ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast({
        title: "File too large",
        description: `Please select a ${type} smaller than ${type === "reel" ? '10MB' : '5MB'}.`,
        variant: "destructive"
      });
      e.target.value = "";
      return;
    }

    try {
      let finalUri: string;
      if (type === "image") {
        finalUri = await compressImage(file);
      } else {
        finalUri = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (le) => resolve(le.target?.result as string);
          reader.readAsDataURL(file);
        });
      }

      setMedia({
        uri: finalUri,
        type: type,
        hint: file.name,
      });
      setStage("createPost");
    } catch (err) {
      toast({ title: "Error processing file", variant: "destructive" });
    }
  };

  const uploadMedia = async (): Promise<string> => {
    if (!media) return "";
    const isReel = media.type === "reel";
    
    const formData = new FormData();
    formData.append("file", media.uri);
    formData.append("upload_preset", isReel ? "video_reels" : "photo_posts"); 
    formData.append("resource_type", isReel ? "video" : "image");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/dlprwkqzj/${isReel ? 'video' : 'image'}/upload`,
      { method: "POST", body: formData }
    );
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Cloudinary upload failed");
    return data.secure_url;
  };

  const handleShare = async () => {
    if (!media) return;
    setIsUploading(true);

    try {
      const remoteUrl = await uploadMedia();
      
      let finalPostData: Omit<Post, "id" | "createdAt"> = {
        imageUrl: remoteUrl,
        imageHint: media.hint,
        caption,
        type: media.type,
        views: 0,
        likes: 0,
        comments: 0
      };

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
        console.warn("AI insights failed", aiError);
      }

      onPostCreate(finalPostData);
      reset();
      toast({ title: "Post shared successfully!" });
    } catch (error) {
      toast({ 
        title: "Upload failed", 
        description: (error as Error).message, 
        variant: "destructive" 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setStage("selectType");
    setMedia(null);
    setCaption("");
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
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
            <MenuOption icon={<PlaySquare />} label="Reel" onClick={() => videoInputRef.current?.click()} />
            <MenuOption icon={<Scissors />} label="Edits" />
            <MenuOption icon={<Grid3x3 />} label="Post" onClick={() => imageInputRef.current?.click()} />
            <MenuOption icon={<Clapperboard />} label="Story" />
            <MenuOption icon={<MonitorPlay />} label="Highlight" />
            <MenuOption icon={<Sparkles />} label="AI" />
            <MenuOption icon={<Megaphone />} label="Ad" />
          </div>
        ) : (
          <div className="p-4 space-y-4 pb-10">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-zinc-800 rounded-md overflow-hidden flex-shrink-0 relative">
                {media?.type === "image" ? (
                  <img src={media.uri} alt="preview" className="object-cover h-full w-full" />
                ) : (
                  <video key={media?.uri} src={media?.uri} className="object-cover h-full w-full" muted autoPlay playsInline loop />
                )}
                
                {media?.type === "reel" && (
                  <div className="absolute top-1 right-1 drop-shadow-md">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="2" width="20" height="20" rx="6" fill="white" />
                      <path d="M9.5 7.5L16.5 12L9.5 16.5V7.5Z" fill="black" />
                    </svg>
                  </div>
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

        <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelection(e, "image")} />
        <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={(e) => handleFileSelection(e, "reel")} />
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