
"use client";

import Link from "next/link";
import {
  ChevronLeft,
  Settings,
  ChevronRight,
  History,
  GraduationCap,
  Lightbulb,
  UserCheck,
  BarChart,
  PlaySquare,
  Loader2,
  ArrowUpRight,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { produce } from "immer";
import type { UserProfileData } from "@/lib/types";
import { useDashboard } from "@/app/dashboard/context";

export default function ProfessionalDashboardPage() {
    const { profile, onProfileUpdate, loading } = useDashboard();

    const [tempProfile, setTempProfile] = useState<UserProfileData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    useEffect(() => {
        if (profile) {
            setTempProfile(profile);
        }
    }, [profile]);

    const handleUpdate = (field: string, value: any) => {
        if (!tempProfile) return;
        const updatedProfile = produce(tempProfile, draft => {
            const path = field.split('.');
            let current: any = draft;
            for (let i = 0; i < path.length - 1; i++) {
                if (current[path[i]] === undefined) {
                    current[path[i]] = {};
                }
                current = current[path[i]];
            }
            current[path[path.length - 1]] = value;
        });
        setTempProfile(updatedProfile);
    };
    
    const handleDone = () => {
        if(tempProfile && onProfileUpdate) {
            onProfileUpdate(tempProfile);
        }
        setIsEditing(false);
    };
    
    const handleToggleEdit = () => {
        if (isEditing) {
            handleDone();
        } else {
            setIsEditing(true);
        }
    }

    if (loading || !tempProfile) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <p className="text-muted-foreground mt-4">Loading Dashboard...</p>
            </div>
        );
    }
    
    const insights = [
        { label: "Views", value: tempProfile.professionalDashboard.views, href: "/dashboard/views", field: 'professionalDashboard.views' },
        { label: "Interactions", value: tempProfile.stats.followers, field: 'stats.followers' },
        { label: "New followers", value: tempProfile.stats.following, field: 'stats.following' },
        { label: "Content you shared", value: tempProfile.posts?.length },
    ];

    const tools = [
        { icon: History, label: "Monthly recap", description: "See what you made happen last month.", new: true },
        { icon: GraduationCap, label: "Best practices", new: true },
        { icon: Lightbulb, label: "Inspiration" },
        { icon: UserCheck, label: "Partnership ads" },
        { icon: BarChart, label: "Ad tools" },
        { icon: PlaySquare, label: "Trial reels" },
    ]

    const tipsAndResources = [
        { icon: ArrowUpRight, label: "Trending audio" },
        { icon: Link2, label: "Other helpful resources" },
    ]

  return (
    <div className="bg-background text-foreground min-h-screen pb-24">
      <header className="p-2 grid grid-cols-3 items-center sticky top-0 bg-background z-10 border-b border-zinc-800">
        <div className="flex justify-start">
          <Link href="/dashboard/profile">
            <ChevronLeft size={28} />
          </Link>
        </div>
        <div className="text-center">
            <span className="text-sm font-bold whitespace-nowrap">Professional dashboard</span>
        </div>
        <div className="flex justify-end">
            <Button onClick={handleToggleEdit} variant={isEditing ? "default" : "ghost"} size={isEditing ? "default" : "icon"}>
                {isEditing ? "Done" : <Settings size={24} />}
            </Button>
        </div>
      </header>

      <main className="p-4 space-y-8">
        <section>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-base sm:text-lg font-bold">Insights</h2>
                {isEditing ? (
                  <Input 
                    value={tempProfile.stats.dateRangeText}
                    onChange={(e) => handleUpdate('stats.dateRangeText', e.target.value)}
                    className="bg-transparent border-none text-zinc-400 text-xs sm:text-sm text-right p-0 h-auto w-28 ring-1 ring-primary rounded-sm"
                  />
                ) : (
                  <span className="text-xs sm:text-sm text-zinc-400">{tempProfile.stats.dateRangeText}</span>
                )}
            </div>
            <div className="space-y-4 text-sm sm:text-base">
                {insights.map(item => {
                    const Wrapper = (item.href && !isEditing) ? Link : 'div';
                    const props = (item.href && !isEditing) ? { href: item.href } : {};
                    
                    return (
                        <Wrapper key={item.label} {...props} className="flex justify-between items-center">
                            <span>{item.label}</span>
                            <div className="flex items-center gap-2">
                                {isEditing && item.field ? (
                                    <Input
                                        value={item.value}
                                        onChange={(e) => handleUpdate(item.field, e.target.value)}
                                        className="bg-transparent border-none p-0 h-auto text-right w-24 font-semibold text-foreground ring-1 ring-primary rounded-sm"
                                    />
                                ) : (
                                    <span className="font-semibold">
                                        {String(item.value)}
                                    </span>
                                )}
                                {item.href && !isEditing && <ChevronRight size={20} className="text-zinc-500" />}
                            </div>
                        </Wrapper>
                    )
                })}
            </div>
        </section>

        <section>
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-base sm:text-lg font-bold">Your tools</h2>
                <Button variant="link" className="p-0 h-auto text-blue-400 text-sm sm:text-base">See all</Button>
            </div>
             <div className="space-y-2">
                {tools.map(tool => (
                    <div key={tool.label} className="flex items-center p-2 rounded-lg hover:bg-zinc-900 cursor-pointer">
                        <tool.icon size={24} className="mr-4"/>
                        <div className="flex-1">
                            <div className="flex items-center text-sm sm:text-base">
                                <span>{tool.label}</span>
                                {tool.new && <Badge className="ml-2 bg-blue-500 text-white hover:bg-blue-500 text-xs">New</Badge>}
                            </div>
                            {tool.description && <p className="text-xs sm:text-sm text-zinc-400">{tool.description}</p>}
                        </div>
                         <ChevronRight size={20} className="text-zinc-500" />
                    </div>
                ))}
            </div>
        </section>
        
        <section>
            <h2 className="text-base sm:text-lg font-bold mb-4">Tips and resources</h2>
            <div className="space-y-2">
                {tipsAndResources.map(item => (
                    <div key={item.label} className="flex items-center p-2 rounded-lg hover:bg-zinc-900 cursor-pointer">
                        <item.icon size={24} className="mr-4"/>
                        <div className="flex-1">
                            <span className="text-sm sm:text-base">{item.label}</span>
                        </div>
                        <ChevronRight size={20} className="text-zinc-500" />
                    </div>
                ))}
            </div>
        </section>

      </main>
    </div>
  );
}

    

    