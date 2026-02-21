"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { useDocument } from "react-firebase-hooks/firestore";
import type { UserProfileData } from "@/lib/types";
import AccountsCentreModal from "@/components/AccountsCentreModal";
import { useState } from "react";

interface TopNavProps {
  onPlusClick?: () => void;
  userId: string;
}

export function TopNav({ userId }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const firestore = useFirestore();

  const [openAccounts, setOpenAccounts] = useState(false);

  const isReels = pathname.includes("/reels");

  const [profileSnapshot, loading] = useDocument(
    firestore && userId ? doc(firestore, "users", userId) : null,
  );

  const profile = profileSnapshot?.data() as UserProfileData | undefined;

  const nav = (path: string) => router.push(path);
  const isActive = (path: string) => pathname === path;

  return (
    <div
      className={cn(
        // Fixed height of 50px ensures it doesn't jump
        "flex items-center justify-around w-full h-[50px] transition-colors duration-300 border-t",
        isReels ? "bg-black border-transparent" : "bg-background border-border",
      )}
    >
      {/* Container for each button has a fixed width to ensure equal spacing */}

      {/* HOME */}
      <button
        onClick={() => nav("/dashboard/home")}
        className="flex items-center justify-center w-12 h-12"
      >
        <svg
          className={cn(
            "w-[26px] h-[26px] transition-all",
            isReels ? "text-white" : "text-foreground",
          )}
          viewBox="0 0 24 24"
          fill={isActive("/dashboard/home") ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={isActive("/dashboard/home") ? "0" : "2"}
        >
          {isActive("/dashboard/home") ? (
            <path d="M4.5 21a1.5 1.5 0 0 1-1.5-1.5V10.5a1.5 1.5 0 0 1 .527-1.137l7.5-6.25a1.5 1.5 0 0 1 1.946 0l7.5 6.25A1.5 1.5 0 0 1 21 10.5v9a1.5 1.5 0 0 1-1.5 1.5h-5.25a.75.75 0 0 1-.75-.75V15a1.5 1.5 0 0 0-1.5-1.5h-1.5A1.5 1.5 0 0 0 9 15v5.25a.75.75 0 0 1-.75.75H4.5Z" />
          ) : (
            <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
          )}
        </svg>
      </button>

      {/* SEARCH */}
      <button
        onClick={() => nav("/dashboard/explore")}
        className="flex items-center justify-center w-12 h-12"
      >
        <svg
          className={cn(
            "w-[26px] h-[26px] transition-all",
            isReels ? "text-white" : "text-foreground",
          )}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={isActive("/dashboard/explore") ? "3" : "2"}
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>

      {/* REELS */}
      <button
        onClick={() => nav("/dashboard/reels")}
        className="flex items-center justify-center w-12 h-12"
      >
        <svg
          className={cn(
            "w-[26px] h-[26px] transition-all",
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

      {/* MESSAGES */}
      <button
        onClick={() => nav("/dashboard/message")}
        className="flex items-center justify-center w-12 h-12"
      >
        <svg
          className={cn(
            "w-[26px] h-[26px] transition-all",
            isReels ? "text-white" : "text-foreground",
          )}
          viewBox="0 0 24 24"
          fill={isActive("/dashboard/message") ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={isActive("/dashboard/message") ? "0" : "2"}
        >
          <path d="M22 2 11 13" />
          <path d="M22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>

      {/* PROFILE */}
      <button
        onClick={() => nav("/dashboard/profile")}
        className="flex items-center justify-center w-12 h-12"
      >
        <div
         
          className="relative w-[28px] h-[28px] flex items-center justify-center"
        >
          {profile && !loading && profile.avatarUrl ? (
            <Image
            
              src={profile.avatarUrl}
              alt="Profile"
              width={28}
              height={28}
              className={cn(
                "rounded-full object-cover w-[26px] h-[26px]",
                isActive("/dashboard/profile")
                  ? "ring-2 ring-foreground"
                  : "ring-1 ring-transparent",
              )}
            />
          ) : (
            <div className="w-[26px] h-[26px] bg-muted rounded-full animate-pulse" />
          )}
        </div>
      </button>
      
    </div>
  );
}
