
"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AVATAR_IMAGES } from "@/lib/avatars";

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
  
  const handleSelect = (avatarUrl: string) => {
    onAvatarSelect(avatarUrl);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle>Select an Avatar</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4 p-4 max-h-[60vh] overflow-y-auto">
          {AVATAR_IMAGES.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => handleSelect(avatar.url)}
              className="aspect-square relative rounded-full overflow-hidden border-2 border-transparent hover:border-primary focus:border-primary outline-none focus:ring-2 focus:ring-primary"
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
