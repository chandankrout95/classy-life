"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { useDocument } from "react-firebase-hooks/firestore";
import type { UserProfileData } from "@/lib/types";
import { BiSolidSearch } from "react-icons/bi";

interface TopNavProps {
  onPlusClick?: () => void;
  userId: string;
}

export function TopNav({ onPlusClick, userId }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const firestore = useFirestore();

  // Check if current route is reels to apply OLED dark mode
  const isReels = pathname.includes("/reels");
  const isSearch = pathname.includes("/explore");

  const [profileSnapshot, loading] = useDocument(
    firestore && userId ? doc(firestore, "users", userId) : null,
  );

  const profile = profileSnapshot?.data() as UserProfileData | undefined;

  // Navigation handler
  const nav = (path: string) => router.push(path);

  // Helper to determine if a route is active
  const isActive = (path: string) => pathname === path;

  return (
    <div
      className={cn(
        "flex justify-around items-center py-[13px] w-full transition-colors duration-300 border-t",
        isReels
          ? "bg-black border-transparent"
          : "bg-[hsl(var(--background))] border-border",
      )}
    >
      {/* HOME */}
      <button
        onClick={() => nav("/dashboard/home")}
        className="flex items-center justify-center"
      >
        <svg
          className={cn(
            "w-7 h-7 transition-all",
            isReels ? "text-white" : "text-foreground",
          )}
          viewBox="0 0 24 24"
          fill={isActive("/dashboard/home") ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={isActive("/dashboard/home") ? "0" : "2"}
        >
          {/* Instagram Home Solid/Outline path */}
          {isActive("/dashboard/home") ? (
            <path d="M4.5 21a1.5 1.5 0 0 1-1.5-1.5V10.5a1.5 1.5 0 0 1 .527-1.137l7.5-6.25a1.5 1.5 0 0 1 1.946 0l7.5 6.25A1.5 1.5 0 0 1 21 10.5v9a1.5 1.5 0 0 1-1.5 1.5h-5.25a.75.75 0 0 1-.75-.75V15a1.5 1.5 0 0 0-1.5-1.5h-1.5A1.5 1.5 0 0 0 9 15v5.25a.75.75 0 0 1-.75.75H4.5Z" />
          ) : (
            <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
          )}
        </svg>
      </button>

      {/* SEARCH / EXPLORE */}
      <button
        onClick={() => nav("/dashboard/explore")}
        className="flex items-center justify-center"
      >
        {!isSearch ? (
         
          <svg
            className={cn(
              "w-7 h-7 transition-all",
              isReels ? "text-white" : "text-foreground",
            )}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={isActive("/dashboard/explore") ? "3.5" : "2"}
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        ) : (
          <BiSolidSearch className=" text-[30px]" />
        )}
      </button>

      {/* REELS */}
      <button
        onClick={() => nav("/dashboard/reels")}
        className="flex items-center justify-center"
      >
        <svg
          className={cn(
            "w-7 h-7 transition-all",
            isReels ? "text-white" : "text-foreground",
          )}
          viewBox="0 0 24 24"
          stroke="currentColor"
          fill="none"
          strokeWidth={isActive("/dashboard/reels") ? "2.5" : "2"}
        >
          <rect x="3" y="3" width="18" height="18" rx="4" ry="4" />
          <polygon
            points="10,8 16,12 10,16"
            fill={isActive("/dashboard/reels") ? "currentColor" : "none"}
          />
        </svg>
      </button>

      {/* MESSAGES / SEND */}
      <button
        onClick={() => nav("/dashboard/message")}
        className="flex items-center justify-center"
      >
        <svg
          className={cn(
            "w-7 h-7 transition-all",
            isReels ? "text-white" : "text-foreground",
          )}
          viewBox="0 0 24 24"
          fill={isActive("/dashboard/message") ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={isActive("/dashboard/message") ? "0" : "2"}
        >
          {isActive("/dashboard/message") ? (
            <path d="M1.323 11.447C.574 11.163.567 10.124 1.31 9.832L21.411.353c.69-.323 1.458.261 1.326.999L19.343 21.03c-.14.773-1.144.97-1.56.295l-4.71-7.662-3.141 3.141a.501.501 0 0 1-.854-.354v-3.527L1.323 11.447Z" />
          ) : (
            <>
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22 11 13 2 9 22 2" />
            </>
          )}
        </svg>
      </button>

      {/* PROFILE */}
      <button
        onClick={() => nav("/dashboard/profile")}
        className="flex items-center justify-center"
      >
        {profile && !loading && profile.avatarUrl ? (
          <div className="relative w-[28px] h-[28px]">
            <Image
              src={profile.avatarUrl}
              alt="Profile"
              width={28}
              height={28}
              className={cn(
                "rounded-full object-cover transition-all w-[28px] h-[28px]",
                isActive("/dashboard/profile")
                  ? isReels
                    ? "ring-2 ring-white scale-110"
                    : "ring-2 ring-foreground scale-110"
                  : "ring-1 ring-border opacity-90",
              )}
            />
            {/* Notification Dot */}
            <span
              className={cn(
                "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2",
                isReels ? "border-black" : "border-background",
              )}
            />
          </div>
        ) : (
          <div className="w-[28px] h-[28px] bg-muted rounded-full animate-pulse" />
        )}
      </button>
    </div>
  );
}
