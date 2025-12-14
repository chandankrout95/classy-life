
"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PUBLIC_MEDIA } from "@/lib/public-images";
import { PlaySquare } from "lucide-react";

interface PublicMediaSelectionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onMediaSelect: (media: {url: string, hint: string, type: 'image' | 'reel'}) => void;
}

export function PublicMediaSelectionDialog({
  isOpen,
  onOpenChange,
  onMediaSelect,
}: PublicMediaSelectionDialogProps) {
  
  const handleSelect = (media: {url: string, hint: string, type: 'image' | 'video'}) => {
    onMediaSelect({ ...media, type: media.type === 'video' ? 'reel' : 'image' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle>Select from Public</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4 p-4 max-h-[60vh] overflow-y-auto">
          {PUBLIC_MEDIA.map((media) => (
            <button
              key={media.id}
              onClick={() => handleSelect(media as any)}
              className="aspect-square relative rounded-md overflow-hidden border-2 border-transparent hover:border-primary focus:border-primary outline-none focus:ring-2 focus:ring-primary group"
            >
              <Image
                src={media.type === 'video' ? media.thumbnailUrl : media.url}
                alt={media.hint}
                fill
                className="object-cover"
              />
              {media.type === 'video' && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <PlaySquare className="h-8 w-8 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
