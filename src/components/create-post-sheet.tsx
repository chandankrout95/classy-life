
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Post, VideoInsight } from "@/lib/types";
import { Film, Grid, X, ChevronLeft, Folder } from "lucide-react";
import { applyDemoDataAction } from "@/app/actions";
import { PublicMediaSelectionDialog } from "./public-media-selection-dialog";

interface CreatePostSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onPostCreate: (newPost: Omit<Post, "id" | "createdAt">) => void;
}

type Stage = "selectType" | "createPost";
type MediaType = "image" | "reel";

export function CreatePostSheet({
  isOpen,
  onOpenChange,
  onPostCreate,
}: CreatePostSheetProps) {
  const [stage, setStage] = useState<Stage>("selectType");
  const [media, setMedia] = useState<{ uri: string; type: MediaType, hint: string } | null>(
    null
  );
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPublicMediaDialogOpen, setIsPublicMediaDialogOpen] = useState(false);


  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const type = file.type.startsWith('video/') ? 'reel' : 'image';
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (loadEvent.target?.result) {
          setMedia({
            uri: loadEvent.target.result as string,
            type: type,
            hint: file.name,
          });
          setStage("createPost");
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handlePublicMediaSelect = (media: {url: string, hint: string, type: MediaType}) => {
     setMedia({ uri: media.url, type: media.type, hint: media.hint });
     setCaption(media.hint);
     setStage('createPost');
     setIsPublicMediaDialogOpen(false);
  }

  const handleShare = async () => {
    if (media) {
      let newPostData: Omit<Post, "id" | "createdAt"> = {
        imageUrl: media.uri,
        imageHint: media.hint,
        caption,
        type: media.type,
      };

      try {
        const mockInsight: VideoInsight = {
            videoId: `temp-${Date.now()}`,
            title: caption || "New Post",
            thumbnailUrl: media.uri,
            metrics: { views: 0, likes: 0, comments: 0, saves: 0, shares: 0, reach: 0, impressions: 0, avg_watch_time: 0 },
            timeseries: [],
            countryBreakdown: [],
            lastEdited: new Date().toISOString(),
            isDemo: false
        };

        const aiResult = await applyDemoDataAction(mockInsight);

        newPostData = {
          ...newPostData,
          ...aiResult,
        };
      } catch (error) {
        console.error("Failed to apply demo data, creating post with default metrics.", error);
        newPostData = {
            ...newPostData,
            views: 0,
            likes: 0,
            comments: 0
        }
      }

      onPostCreate(newPostData);
      reset();
    }
  };

  const reset = () => {
    setStage("selectType");
    setMedia(null);
    setCaption("");
    onOpenChange(false);
  };

  const handleBack = () => {
    if (stage === "createPost") {
      setStage("selectType");
      setMedia(null);
      setCaption("");
    } else {
      reset();
    }
  };

  const getTitle = () => {
    switch (stage) {
      case "selectType":
        return "Create";
      case "createPost":
        return "New post";
      default:
        return "Create";
    }
  };
  

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="bg-zinc-900 text-white border-t-zinc-800 rounded-t-2xl h-[90vh]"
          showClose={false}
        >
          <SheetHeader className="text-left relative border-b border-zinc-800">
            <SheetTitle className="text-center text-lg font-semibold">
              {getTitle()}
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2"
              onClick={handleBack}
            >
              {stage === "selectType" ? <X /> : <ChevronLeft />}
            </Button>
            {stage === "createPost" && (
              <Button
                variant="link"
                className="absolute right-0 top-1/2 -translate-y-1/2"
                onClick={handleShare}
              >
                Share
              </Button>
            )}
          </SheetHeader>

          {stage === "selectType" && (
            <div className="p-4 flex flex-col justify-center items-center h-full">
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  className="flex items-center gap-4 text-xl p-6"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Grid size={28} />
                  <span>From gallery</span>
                </Button>
                 <Button
                  variant="ghost"
                  className="flex items-center gap-4 text-xl p-6"
                  onClick={() => setIsPublicMediaDialogOpen(true)}
                >
                  <Folder size={28} />
                  <span>From public folder</span>
                </Button>
              </div>
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,video/*"
              />
            </div>
          )}

          {stage === "createPost" && media && (
            <div className="p-4 space-y-4">
              <div className="flex items-start gap-4">
                {media.type === "image" ? (
                  <Image
                    src={media.uri}
                    alt="New post preview"
                    width={80}
                    height={80}
                    className="rounded-md object-cover"
                  />
                ) : (
                  <video
                    src={media.uri}
                    width={80}
                    height={142}
                    className="rounded-md object-cover aspect-[9/16]"
                    autoPlay
                    loop
                    muted
                  />
                )}
                <Textarea
                  placeholder="Write a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-base p-0"
                  rows={4}
                />
              </div>
            </div>
          )}

        </SheetContent>
      </Sheet>
      <PublicMediaSelectionDialog
        isOpen={isPublicMediaDialogOpen}
        onOpenChange={setIsPublicMediaDialogOpen}
        onMediaSelect={handlePublicMediaSelect}
      />
    </>
  );
}
