
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import {
  Bookmark,
  RefreshCcw,
  PlusSquare,
  MinusCircle,
  PlaySquare,
  XCircle,
  Link,
  Facebook,
  BarChart,
  AreaChart,
  QrCode,
  Wand,
  Trash2,
  ChevronRight,
  Edit,
  Download,
  Code,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import { usePathname } from "next/navigation";
import { ScrollArea } from "./ui/scroll-area";

interface PostOptionsSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  postUrl?: string;
}

const actionItems = [
  { icon: MinusCircle, label: "Remove from main grid" },
  { icon: XCircle, label: "Turn off reuse" },
  { icon: Link, label: "Link a reel" },
  { icon: Facebook, label: "Recommended on Facebook" },
];

export function PostOptionsSheet({
  isOpen,
  onOpenChange,
  onEdit,
  onDelete,
  postUrl,
}: PostOptionsSheetProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleDownload = () => {
    if (postUrl) {
      const link = document.createElement("a");
      link.href = postUrl;
      link.download = "post"; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onOpenChange(false);
    }
  };

  const analyticsItems = [
    {
      icon: AreaChart,
      label: "Insights",
      action: () => {
        const postId = pathname.split("/").pop();
        if (postId) {
          router.push(`/dashboard/post/${postId}/insights`);
        }
      },
    },
    { icon: QrCode, label: "QR code" },
    { icon: Wand, label: "AI info" },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="bg-zinc-900 text-white border-t-zinc-800 rounded-t-2xl h-auto max-h-[90dvh] flex flex-col"
        showClose={false}
      >
        <SheetHeader className="text-center pb-4 shrink-0">
          <div className="mx-auto w-12 h-1.5 rounded-full bg-zinc-700" />
          <SheetTitle className="sr-only">Post Options</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 no-scrollbar">
          <div className="p-2 space-y-2">
            <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
              <Button
                variant="secondary"
                className="flex-col h-auto bg-zinc-800"
              >
                <Bookmark className="mb-1" />
                Save
              </Button>
              <Button
                variant="secondary"
                className="flex-col h-auto bg-zinc-800"
              >
                <RefreshCcw className="mb-1" />
                Remix
              </Button>
              <Button
                variant="secondary"
                className="flex-col h-auto bg-zinc-800"
              >
                <PlusSquare className="mb-1" />
                Sequence
              </Button>
            </div>

            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start p-3 text-base"
                onClick={onEdit}
              >
                <Edit className="mr-4 h-6 w-6" />
                Edit
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start p-3 text-base"
                onClick={handleDownload}
              >
                <Download className="mr-4 h-6 w-6" />
                Save to device
              </Button>
              <Button
                  variant="ghost"
                  className="w-full justify-start p-3 text-base"
                >
                  <PlaySquare className="mr-4 h-6 w-6" />
                  <span>Manage</span>
                  <ChevronRight className="ml-auto h-5 w-5" />
                </Button>
              {actionItems.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start p-3 text-base"
                >
                  <item.icon className="mr-4 h-6 w-6" />
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>

            <div className="space-y-1 border-t border-zinc-800 pt-2">
               <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-3 text-base text-red-500"
                  >
                    <Trash2 className="mr-4 h-6 w-6" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      post and remove its data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              {analyticsItems.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className={`w-full justify-start p-3 text-base ${
                    item.color || ""
                  }`}
                  onClick={item.action}
                >
                  <item.icon className="mr-4 h-6 w-6" />
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>

            <div className="space-y-1 border-t border-zinc-800 pt-2">
              <Button
                variant="ghost"
                className="w-full justify-start p-3 text-base text-blue-400"
              >
                <Zap className="mr-4 h-6 w-6" />
                Boost Reel
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
