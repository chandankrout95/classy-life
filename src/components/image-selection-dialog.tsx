
"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Separator } from "./ui/separator";

interface ImageSelectionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onImageSelect: (image: string | File) => void;
}

export function ImageSelectionDialog({
  isOpen,
  onOpenChange,
  onImageSelect,
}: ImageSelectionDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onImageSelect(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle>Select an Image</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4 p-4 max-h-[60vh] overflow-y-auto">
          {PlaceHolderImages.map((img) => (
            <button
              key={img.id}
              onClick={() => onImageSelect(img.imageUrl)}
              className="aspect-[9/16] relative rounded-md overflow-hidden border-2 border-transparent hover:border-primary focus:border-primary outline-none focus:ring-2 focus:ring-primary"
            >
              <Image
                src={img.imageUrl}
                alt={img.description}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
        <Separator />
        <DialogFooter className="p-4 pt-0">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleUploadClick}
          >
            Upload from device
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
