
"use client";

import { Home, Search, PlusSquare, PlaySquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { useDocument } from "react-firebase-hooks/firestore";
import type { UserProfileData } from "@/lib/types";

interface BottomNavProps {
  onPlusClick?: () => void;
  userId: string;
}

export function BottomNav({ onPlusClick, userId }: BottomNavProps) {
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
    <div className="bg-background p-2 flex justify-around items-center md:hidden">
      <Link href="/dashboard" className={cn("flex-1 flex justify-center", pathname === "/dashboard" ? "text-white" : "text-zinc-400")}>
        <Home size={28} />
      </Link>
      <Link href="#" className="flex-1 flex justify-center text-zinc-400">
        <Search size={28} />
      </Link>
      <button onClick={onPlusClick} className="flex-1 flex justify-center text-zinc-400 hover:text-white">
        <PlusSquare size={28} />
      </button>
      <Link href="#" className="flex-1 flex justify-center text-zinc-400">
        <PlaySquare size={28} />
      </Link>
      <button onClick={handleProfileClick} className="flex-1 flex justify-center">
        {profile && !loading && profile.avatarUrl ? (
            <div className="relative">
                <Image
                    src={profile.avatarUrl}
                    alt="Profile"
                    width={30}
                    height={30}
                    className={cn("rounded-full object-cover", pathname === "/dashboard/profile" && "border-2 border-white" )}
                    data-ai-hint={profile.avatarHint}
                />
                {pathname !== "/dashboard/profile" && <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>}
            </div>
        ) : (
            <div className="w-[30px] h-[30px] bg-zinc-800 rounded-full animate-pulse" />
        )}
      </button>
    </div>
  );
}
