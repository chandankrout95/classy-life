
"use client";

import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Post } from "@/lib/types";
import { useState, useEffect, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { ImageSelectionDialog } from "./image-selection-dialog";
import { uploadFile } from "@/lib/storage";
import { useAuth, useStorage } from "@/firebase";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "./ui/scroll-area";

interface EditPostSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  post: Post;
  onPostUpdate: (newPost: Post) => void;
}

export function EditPostSheet({
  isOpen,
  onOpenChange,
  post,
  onPostUpdate,
}: EditPostSheetProps) {
  const [formData, setFormData] = useState(post);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { user } = useAuth();
  const { storage } = useStorage();
  const { toast } = useToast();

  useEffect(() => {
    setFormData(post);
  }, [post, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: "image" | "reel") => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const handleImageSelect = async (image: string | File) => {
    setIsImageDialogOpen(false);
    if (typeof image === 'string') {
      setFormData(prev => ({...prev, imageUrl: image}));
    } else {
        if (!user || !storage) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to upload images.' });
            return;
        }
        setIsUploading(true);
        try {
            const downloadUrl = await uploadFile(storage, image, `posts/${user.uid}/${Date.now()}_${image.name}`);
            setFormData(prev => ({...prev, imageUrl: downloadUrl}));
        } catch (error) {
            console.error("Upload failed", error);
            toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload image. Please try again.' });
        } finally {
            setIsUploading(false);
        }
    }
  }

  const handleSave = () => {
    startTransition(() => {
      onPostUpdate(formData);
      onOpenChange(false);
    });
  };

  const isSaving = isPending || isUploading;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="bg-zinc-900 text-white border-t-0 h-auto max-h-[90dvh] flex flex-col rounded-t-2xl"
        >
          <SheetHeader className="text-left shrink-0">
            <SheetTitle className="flex justify-between items-center">
              <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving}>
                Cancel
              </Button>
              <span className="text-lg font-semibold">Edit post</span>
              <Button variant="link" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Done"}
              </Button>
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              <div className="flex flex-col items-center gap-2">
                 <button
                    className="relative w-[120px] h-[120px] rounded-md group"
                    onClick={() => setIsImageDialogOpen(true)}
                    disabled={isSaving}
                  >
                    {formData.imageUrl && (
                      <Image
                        src={formData.imageUrl}
                        alt="Post image"
                        width={120}
                        height={120}
                        className="rounded-md object-cover w-[120px] h-[120px] transition-opacity group-hover:opacity-70"
                        data-ai-hint={formData.imageHint}
                      />
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs text-center">Change Photo</span>
                    </div>
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full">
                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                      </div>
                    )}
                  </button>
              </div>

              <div className="space-y-4">
                 <div className="space-y-1">
                  <Label htmlFor="caption">Caption</Label>
                  <Textarea
                    id="caption"
                    name="caption"
                    value={formData.caption || ""}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border-zinc-700"
                    placeholder="Write a caption..."
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="imageHint">Image Hint</Label>
                  <Input
                    id="imageHint"
                    name="imageHint"
                    value={formData.imageHint}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border-zinc-700"
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="type">Post Type</Label>
                  <Select
                    name="type"
                    value={formData.type}
                    onValueChange={handleSelectChange}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                      <SelectValue placeholder="Select post type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="reel">Reel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="views">Views</Label>
                    <Input
                      id="views"
                      name="views"
                      type="number"
                      value={formData.views || ""}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          views: e.target.value ? parseInt(e.target.value, 10) : undefined,
                        }))
                      }
                      className="bg-zinc-800 border-zinc-700"
                      placeholder="e.g. 15000"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="likes">Likes</Label>
                    <Input
                      id="likes"
                      name="likes"
                      type="number"
                      value={formData.likes || ""}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          likes: e.target.value ? parseInt(e.target.value, 10) : undefined,
                        }))
                      }
                      className="bg-zinc-800 border-zinc-700"
                      placeholder="e.g. 996"
                      disabled={isSaving}
                    />
                  </div>
                   <div className="space-y-1">
                    <Label htmlFor="comments">Comments</Label>
                    <Input
                      id="comments"
                      name="comments"
                      type="number"
                      value={formData.comments || ""}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          comments: e.target.value ? parseInt(e.target.value, 10) : undefined,
                        }))
                      }
                      className="bg-zinc-800 border-zinc-700"
                      placeholder="e.g. 5"
                      disabled={isSaving}
                    />
                  </div>
                   <div className="space-y-1">
                    <Label htmlFor="shares">Shares</Label>
                    <Input
                      id="shares"
                      name="shares"
                      type="number"
                      value={formData.shares || ""}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          shares: e.target.value ? parseInt(e.target.value, 10) : undefined,
                        }))
                      }
                      className="bg-zinc-800 border-zinc-700"
                      placeholder="e.g. 23"
                      disabled={isSaving}
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
      <ImageSelectionDialog 
          isOpen={isImageDialogOpen}
          onOpenChange={setIsImageDialogOpen}
          onImageSelect={handleImageSelect}
      />
    </>
  );
}
