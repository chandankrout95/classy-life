
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { useDocument } from "react-firebase-hooks/firestore";
import type { UserProfileData } from "@/lib/types";

interface TopNavProps {
  onPlusClick?: () => void;
  userId: string;
}

export function TopNav({ onPlusClick, userId }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const firestore = useFirestore();

  const [profileSnapshot, loading] = useDocument(
    firestore && userId ? doc(firestore, 'users', userId) : null
  );
  
  const profile = profileSnapshot?.data() as UserProfileData | undefined;

  const handleProfileClick = () => {
    router.push('/dashboard/profile');
  };

  return (
    <div className="top-nav">
      {/* HOME */}
      <Link href="/dashboard" className={cn("nav-item", pathname === "/dashboard" ? "active" : "")}>
        <svg className="nav-icon" viewBox="0 0 24 24">
          <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
        </svg>
      </Link>

      {/* SEARCH */}
      <Link href="#" className="nav-item">
        <svg className="nav-icon" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </Link>

      {/* REELS (PLUS) */}
      <button onClick={onPlusClick} className="nav-item">
        <svg className="nav-icon" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="4" ry="4"/>
          <polygon points="10,8 16,12 10,16"/>
        </svg>
      </button>

      {/* SEND */}
      <Link href="#" className="nav-item">
        <svg className="nav-icon" viewBox="0 0 24 24">
          <path d="M22 2 11 13"/>
          <path d="M22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </Link>

      {/* PROFILE */}
      <button onClick={handleProfileClick} className="profile-wrapper">
        {profile && !loading && profile.avatarUrl ? (
          <>
            <Image
              src={profile.avatarUrl}
              alt="Profile"
              width={28}
              height={28}
              className={cn("profile-img", pathname === "/dashboard/profile" && "border-2 border-foreground")}
              data-ai-hint={profile.avatarHint}
            />
            {pathname !== "/dashboard/profile" && <span className="dot"></span>}
          </>
        ) : (
          <div className="w-[28px] h-[28px] bg-zinc-800 rounded-full animate-pulse" />
        )}
      </button>
    </div>
  );
}
