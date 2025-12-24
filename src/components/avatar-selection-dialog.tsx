"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AVATAR_IMAGES } from "@/lib/avatars";
import { Upload, Loader2 } from "lucide-react";

interface AvatarSelectionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAvatarSelect: (image: string) => void;
}

export function AvatarSelectionDialog({
  isOpen,
  onOpenChange,
  onAvatarSelect,
}: AvatarSelectionDialogProps) {
  const [isUploading, setIsUploading] = useState(false);

  // Helper function to compress image
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800; // Limit dimensions for profile pics
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_WIDTH) {
              width *= MAX_WIDTH / height;
              height = MAX_WIDTH;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to 70% quality
          canvas.toBlob((blob) => {
            resolve(blob as Blob);
          }, "image/jpeg", 0.7); 
        };
      };
    });
  };

  const handleCloudinaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Check file size (5MB = 5 * 1024 * 1024 bytes)
    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`The file is too large. Please upload a profile picture smaller than ${MAX_SIZE_MB}MB.`);
      e.target.value = ""; // Reset input
      return;
    }

    setIsUploading(true);

    try {
      // 2. Compress the image before uploading
      const compressedBlob = await compressImage(file);
      
      const formData = new FormData();
      formData.append("file", compressedBlob);
      formData.append("upload_preset", "photo_profile");
      formData.append("resource_type", "image");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/dlprwkqzj/image/upload`,
        { method: "POST", body: formData }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Upload failed");

      onAvatarSelect(data.secure_url);
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      alert("Failed to upload image to Cloudinary");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle>Select or Upload Avatar</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 p-4 max-h-[60vh] overflow-y-auto">
          <label className="aspect-square relative rounded-full overflow-hidden border-2 border-dashed border-zinc-700 hover:border-blue-500 flex flex-col items-center justify-center cursor-pointer transition-colors bg-zinc-800/50">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            ) : (
              <>
                <Upload className="w-6 h-6 text-zinc-400" />
                <span className="text-[10px] mt-1 text-zinc-400">Upload</span>
              </>
            )}
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={handleCloudinaryUpload} 
              disabled={isUploading}
            />
          </label>

          {AVATAR_IMAGES.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => onAvatarSelect(avatar.url)}
              className="aspect-square relative rounded-full overflow-hidden border-2 border-transparent hover:border-primary focus:border-primary outline-none"
            >
              <Image
                src={avatar.url}
                alt={avatar.hint}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}