
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  Heart,
  MessageCircle,
  Send,
  Repeat,
  Bookmark,
  Info,
  Loader2,
  PlayIcon,
  Settings,
  BarChart,
  ChevronRight,
  Zap,
} from "lucide-react";
import { Post, RetentionData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useDashboard } from "@/app/dashboard/context";
import { Progress } from "@/components/ui/progress";
import { RetentionChart } from "@/components/retention-chart";
import { Button } from "@/components/ui/button";
import { InteractionsChart } from "@/components/interactions-chart";
import { produce } from "immer";
import { Input } from "@/components/ui/input";
import { ViewSourcesSection } from "@/components/view-sources-section";
import { AudienceSection } from "@/components/audience-section";
import { ViewsBreakdownSection } from "@/components/views-breakdown-section";
import { MonetizationSection } from "@/components/monetization-section";


export default function ReelInsightsPage() {
  const params = useParams();
  const id = params.id as string;
  const { profile, onProfileUpdate, loading } = useDashboard();
  
  const [post, setPost] = useState<Post | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [isEditing, setIsEditing] = useState(false);
  
  const defaultRetentionData = [
    { timestamp: 0, retention: 100 }, { timestamp: 3, retention: 95 },
    { timestamp: 6, retention: 80 }, { timestamp: 9, retention: 75 },
    { timestamp: 12, retention: 60 }, { timestamp: 15, retention: 50 },
    { timestamp: 18, retention: 40 }, { timestamp: 21, retention: 30 },
    { timestamp: 25, retention: 20 }, { timestamp: 30, retention: 10 },
  ];
  
  const defaultLikesOverTime = [
    { timestamp: 0, retention: 18 }, { timestamp: 4, retention: 18 },
    { timestamp: 8, retention: 12 }, { timestamp: 12, retention: 12 },
    { timestamp: 16, retention: 8 }, { timestamp: 20, retention: 8 },
    { timestamp: 24, retention: 8 }, { timestamp: 28, retention: 5 },
    { timestamp: 32, retention: 5 }, { timestamp: 36, retention: 5 },
    { timestamp: 40, retention: 2 }, { timestamp: 44, retention: 2 },
  ];

  useEffect(() => {
    if (profile) {
      const currentPost = profile.posts.find(p => p.id === id);
      if (currentPost) {
        setPost(produce(currentPost, draft => {
          if (!draft.retentionData || draft.retentionData.length === 0) {
            draft.retentionData = defaultRetentionData;
          }
          if (!draft.likesOverTime || draft.likesOverTime.length === 0) {
            draft.likesOverTime = defaultLikesOverTime;
          }
        }));
      }
    }
  }, [profile, id]);
  
  const handlePostChange = (updatedPost: Post) => {
    setPost(updatedPost);
  };
  
  const handleSimpleFieldChange = (field: keyof Post, value: string | number) => {
    if(!post) return;
    const updatedPost = produce(post, draft => {
        (draft as any)[field] = value;
    });
    setPost(updatedPost);
  }

  const handleBreakdownChange = (field: 'audienceBreakdown' | 'interactionsBreakdown', subField: 'followers' | 'nonFollowers', value: string) => {
    if (!post) return;
    const updatedPost = produce(post, draft => {
      if(draft[field]){
        (draft[field] as any)[subField] = Number(value) || 0;
      }
    });
    setPost(updatedPost);
  };

  const handleRetentionDataChange = (index: number, field: keyof RetentionData, value: string) => {
    if (!post || !post.retentionData) return;
      const updatedPost = produce(post, draft => {
        if (draft.retentionData && draft.retentionData[index]) {
          (draft.retentionData[index] as any)[field] = Number(value) || 0;
        }
    });
    setPost(updatedPost);
  }
  
  const handleLikesOverTimeDataChange = (index: number, field: keyof RetentionData, value: string) => {
    if (!post || !post.likesOverTime) return;
    const updatedPost = produce(post, draft => {
      if (!draft.likesOverTime) {
        draft.likesOverTime = defaultLikesOverTime;
      }
      if (draft.likesOverTime && draft.likesOverTime[index]) {
        (draft.likesOverTime[index] as any)[field] = Number(value) || 0;
      }
    });
    setPost(updatedPost);
  }

  const handleToggleEdit = () => {
    if (isEditing) {
      // Save changes
      if(profile && post && onProfileUpdate) {
        const updatedPosts = profile.posts.map(p => p.id === post.id ? post : p);
        onProfileUpdate({...profile, posts: updatedPosts});
      }
    }
    setIsEditing(!isEditing);
  }


  if (loading) {
      return (
          <div className="flex min-h-screen flex-col items-center justify-center bg-background">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <p className="text-muted-foreground mt-4">Loading Insights...</p>
          </div>
      );
  }

  if (!post) {
    return (
      <div className="bg-background text-white min-h-screen flex items-center justify-center">
        Post not found.
      </div>
    );
  }
  
  const retentionData = post?.retentionData || [];
  const defaultInteractionsBreakdown = { followers: 70, nonFollowers: 30 };
  const interactionsData = post?.interactionsBreakdown || defaultInteractionsBreakdown;
  const likesOverTimeData = post?.likesOverTime || defaultLikesOverTime;


  return (
    <div className="bg-background text-white min-h-screen">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background z-10">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/post/${id}`}>
            <ChevronLeft size={28} />
          </Link>
          <span className="text-xl font-bold">Reel insights</span>
        </div>
        <Button onClick={handleToggleEdit} variant={isEditing ? "default" : "ghost"} size="icon">
          <Settings size={24} />
        </Button>
      </header>

      <main className="p-4 space-y-6 pb-0">
        <div className="flex flex-col items-center text-center gap-4">
          {post.imageUrl && (
            <Image
              src={post.imageUrl}
              alt="Reel thumbnail"
              width={100}
              height={178}
              className="rounded-lg object-cover"
              data-ai-hint={post.imageHint}
            />
          )}
          <div className="flex-1">
            {isEditing ? (
              <Input
                value={post.caption || ""}
                onChange={(e) => handleSimpleFieldChange('caption', e.target.value)}
                className="bg-transparent border-none p-0 h-auto text-lg font-semibold text-center ring-1 ring-primary rounded-sm"
              />
            ) : (
              <p className="text-lg font-semibold">{post.caption || ""}</p>
            )}
             {isEditing ? (
              <Input
                value={post.postDate || "25 April · Duration 0:33"}
                onChange={(e) => handleSimpleFieldChange('postDate', e.target.value)}
                className="bg-transparent border-none p-0 h-auto text-sm text-zinc-400 text-center ring-1 ring-primary rounded-sm mt-1"
              />
            ) : (
               <p className="text-sm text-zinc-400 mt-1">{post.postDate || "25 April · Duration 0:33"}</p>
            )}
          </div>
        </div>

        <div className="flex justify-around text-center border-b border-t border-zinc-800 py-4">
          <div className="flex flex-col items-center">
            <Heart size={24} fill="white" />
            <span className="text-sm mt-1">{isEditing ? (
                <Input type="number" value={post.likes || 0} onChange={(e) => handleSimpleFieldChange('likes', parseInt(e.target.value) || 0)} className="w-16 bg-transparent text-center"/>
            ) : formatNumber(post.likes || 0)}</span>
          </div>
          <div className="flex flex-col items-center">
            <MessageCircle size={24} fill="white" />
            <span className="text-sm mt-1">{isEditing ? (
                <Input type="number" value={post.comments || 0} onChange={(e) => handleSimpleFieldChange('comments', parseInt(e.target.value) || 0)} className="w-16 bg-transparent text-center"/>
            ) : formatNumber(post.comments || 0)}</span>
          </div>
          <div className="flex flex-col items-center">
            <Send size={24} />
            <span className="text-sm mt-1">{isEditing ? (
                <Input type="number" value={post.shares || 0} onChange={(e) => handleSimpleFieldChange('shares', parseInt(e.target.value) || 0)} className="w-16 bg-transparent text-center"/>
            ) : formatNumber(post.shares || 0)}</span>
          </div>
          <div className="flex flex-col items-center">
            <Repeat size={24} />
            <span className="text-sm mt-1">{isEditing ? (
                <Input type="number" value={post.reposts || 0} onChange={(e) => handleSimpleFieldChange('reposts', parseInt(e.target.value) || 0)} className="w-16 bg-transparent text-center"/>
            ) : formatNumber(post.reposts || 0)}</span>
          </div>
          <div className="flex flex-col items-center">
            <Bookmark size={24} fill="white"/>
            <span className="text-sm mt-1">{isEditing ? (
                <Input type="number" value={post.saves || 0} onChange={(e) => handleSimpleFieldChange('saves', parseInt(e.target.value) || 0)} className="w-16 bg-transparent text-center"/>
            ) : formatNumber(post.saves || 0)}</span>
          </div>
        </div>

        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Overview</h2>
                <Info size={16} className="text-zinc-400" />
            </div>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <p className="text-zinc-400">Views</p>
                    {isEditing ? <Input type="number" value={post.views || 0} onChange={(e) => handleSimpleFieldChange('views', parseInt(e.target.value) || 0)} className="w-24 text-right bg-transparent"/> : <p className="font-semibold">{formatNumber(post.views || 0)}</p>}
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-zinc-400">Watch time</p>
                    {isEditing ? <Input value={post.watchTime || '0s'} onChange={(e) => handleSimpleFieldChange('watchTime', e.target.value)} className="w-24 text-right bg-transparent"/> : <p className="font-semibold">{post.watchTime || '0s'}</p>}
                </div>
                 <div className="flex justify-between items-center">
                    <p className="text-zinc-400">Average watch time</p>
                    {isEditing ? <Input type="number" value={post.avgWatchTime || 0} onChange={(e) => handleSimpleFieldChange('avgWatchTime', parseInt(e.target.value) || 0)} className="w-24 text-right bg-transparent"/> : <p className="font-semibold">{post.avgWatchTime || 0}s</p>}
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-zinc-400">Interactions</p>
                    {isEditing ? <Input type="number" value={post.interactions || 0} onChange={(e) => handleSimpleFieldChange('interactions', parseInt(e.target.value) || 0)} className="w-24 text-right bg-transparent"/> : <p className="font-semibold">{formatNumber(post.interactions || 0)}</p>}
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-zinc-400">Profile activity</p>
                    {isEditing ? <Input type="number" value={post.profileActivity || 0} onChange={(e) => handleSimpleFieldChange('profileActivity', parseInt(e.target.value) || 0)} className="w-24 text-right bg-transparent"/> : <p className="font-semibold">{formatNumber(post.profileActivity || 0)}</p>}
                </div>
            </div>
        </div>

        <ViewsBreakdownSection post={post} isEditing={isEditing} onPostChange={handlePostChange} />

        <ViewSourcesSection post={post} isEditing={isEditing} onPostChange={handlePostChange} />
        
        <div className="border-t border-zinc-800 pt-6 flex justify-between items-center">
          <p className="text-zinc-400">Accounts reached</p>
          {isEditing ? <Input type="number" value={post.accountsReached || 0} onChange={(e) => handleSimpleFieldChange('accountsReached', parseInt(e.target.value) || 0)} className="w-24 text-right bg-transparent"/> : <p className="font-semibold">{formatNumber(post.accountsReached || 0)}</p>}
        </div>

        <section>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">Retention</h2>
            <Info size={16} className="text-zinc-400" />
          </div>
          <div className="mt-4 flex justify-center">
            <div className="relative bg-zinc-800 w-28 h-48 rounded-lg flex items-center justify-center overflow-hidden">
                <Image
                    src={post.imageUrl}
                    alt={post.caption || "Reel thumbnail"}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="border-2 border-white rounded-full p-2">
                        <PlayIcon className="text-white w-6 h-6" fill="white" />
                    </div>
                </div>
            </div>
          </div>
          <div className="h-[200px] -mb-4 mt-4">
            <RetentionChart data={retentionData} yAxisTicks={[0, 50, 99]} yAxisDomain={[0, 99]} />
          </div>

          {isEditing && (
            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <p className="text-xs text-muted-foreground">Timestamp (s)</p>
                <p className="text-xs text-muted-foreground">Retention (%)</p>
              </div>
              {retentionData.map((dataPoint, index) => (
                <div key={index} className="grid grid-cols-2 gap-x-4">
                  <Input
                    type="number"
                    value={dataPoint.timestamp}
                    onChange={(e) => handleRetentionDataChange(index, 'timestamp', e.target.value)}
                    className="bg-transparent"
                  />
                  <Input
                    type="number"
                    value={dataPoint.retention}
                    onChange={(e) => handleRetentionDataChange(index, 'retention', e.target.value)}
                    className="bg-transparent"
                  />
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-8 space-y-2">
            <h3 className="font-bold">Skip rate</h3>
            <div className="flex justify-between items-center text-sm">
              <span>This reel's skip rate</span>
              {isEditing ? <Input type="number" value={post.skipRate || 0} onChange={(e) => handleSimpleFieldChange('skipRate', parseInt(e.target.value) || 0)} className="w-20 text-right bg-transparent"/> : <span className="font-bold">{post.skipRate || 0}%</span>}
            </div>
             <div className="flex justify-between items-center text-sm">
              <span>Your typical skip rate</span>
              {isEditing ? <Input value={post.typicalSkipRate || '--'} onChange={(e) => handleSimpleFieldChange('typicalSkipRate', e.target.value)} className="w-24 text-right bg-transparent"/> : <span className="font-bold">{post.typicalSkipRate || '--'}</span>}
            </div>
          </div>
        </section>

        <section>
          <div className="border-t border-zinc-800 pt-6">
            <h4 className="font-bold mb-4 text-base">View rate past first 3 seconds</h4>
            <div className="flex gap-2 mb-4">
              {["All", "Followers", "Non-followers"].map(filter => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? "secondary" : "ghost"}
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full h-8 text-xs sm:text-sm ${activeFilter === filter ? 'bg-zinc-200 text-black hover:bg-zinc-300' : 'bg-zinc-800 hover:bg-zinc-700'}`}
                >
                  {filter}
                </Button>
              ))}
            </div>
            <div className="space-y-3">
                <div className="space-y-2">
                    <Progress value={post.viewRate || 0} className="h-2 bg-zinc-800" indicatorClassName="bg-chart-1" />
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-chart-1"></span>
                            <span>This reel</span>
                        </div>
                        {isEditing ? <Input type="number" value={post.viewRate || 0} onChange={(e) => handleSimpleFieldChange('viewRate', parseInt(e.target.value) || 0)} className="w-20 text-right bg-transparent"/> : <span>{post.viewRate || 0}%</span>}
                    </div>
                </div>
            </div>
          </div>
        </section>
        
        <section>
          <div className="border-t border-zinc-800 pt-6">
             <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Interactions</h2>
                <Info size={16} className="text-zinc-400" />
            </div>
            <div className="flex justify-center">
              <div className="w-[250px] h-[250px]">
                <InteractionsChart data={interactionsData} totalInteractions={post.interactions || 0} />
              </div>
            </div>
             {isEditing && (
              <div className="relative -top-[155px] flex flex-col items-center">
                <Input
                  type="number"
                  value={post.interactions || 0}
                  onChange={(e) => handleSimpleFieldChange('interactions', parseInt(e.target.value) || 0)}
                  className="w-24 text-center bg-transparent border-none text-4xl font-bold p-0 h-auto"
                />
                 <p className="text-muted-foreground text-sm -mt-2">Interactions</p>
              </div>
            )}
            <div className="space-y-2 text-sm w-full -mt-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-chart-1"></span>
                        <span>Followers</span>
                    </div>
                    {isEditing ? <Input type="number" value={interactionsData.followers || 0} onChange={(e) => handleBreakdownChange('interactionsBreakdown', 'followers', e.target.value)} className="w-20 text-right bg-transparent"/> : <span>{interactionsData.followers || 0}%</span>}
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-chart-2"></span>
                        <span>Non-followers</span>
                    </div>
                    {isEditing ? <Input type="number" value={interactionsData.nonFollowers || 0} onChange={(e) => handleBreakdownChange('interactionsBreakdown', 'nonFollowers', e.target.value)} className="w-20 text-right bg-transparent"/> : <span>{interactionsData.nonFollowers || 0}%</span>}
                </div>
            </div>
          </div>
        </section>
        
        <section>
          <div className="border-t border-zinc-800 pt-6">
            <h3 className="font-bold mb-4">When people liked your reel</h3>
            <div className="mt-4 flex justify-center">
                <div className="relative bg-zinc-800 w-28 h-48 rounded-lg flex items-center justify-center overflow-hidden">
                    <Image
                        src={post.imageUrl}
                        alt={post.caption || "Reel thumbnail"}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="border-2 border-white rounded-full p-2">
                            <PlayIcon className="text-white w-6 h-6" fill="white" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-[200px] -mb-4 mt-4">
              <RetentionChart data={likesOverTimeData} yAxisTicks={[0, 10, 20]} yAxisDomain={[0, 20]} />
            </div>
             {isEditing && (
              <div className="mt-4 space-y-2">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <p className="text-xs text-muted-foreground">Timestamp (s)</p>
                  <p className="text-xs text-muted-foreground">Likes (%)</p>
                </div>
                {likesOverTimeData.map((dataPoint, index) => (
                  <div key={index} className="grid grid-cols-2 gap-x-4">
                    <Input
                      type="number"
                      value={dataPoint.timestamp}
                      onChange={(e) => handleLikesOverTimeDataChange(index, 'timestamp', e.target.value)}
                      className="bg-transparent"
                    />
                    <Input
                      type="number"
                      value={dataPoint.retention}
                      onChange={(e) => handleLikesOverTimeDataChange(index, 'retention', e.target.value)}
                      className="bg-transparent"
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="mt-8 space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span>Likes</span>
                 {isEditing ? <Input type="number" value={post.likes || 0} onChange={(e) => handleSimpleFieldChange('likes', parseInt(e.target.value) || 0)} className="w-24 text-right bg-transparent"/> : <span className="font-semibold">{formatNumber(post.likes || 0)}</span>}
              </div>
              <div className="flex justify-between items-center">
                <span>Saves</span>
                 {isEditing ? <Input type="number" value={post.saves || 0} onChange={(e) => handleSimpleFieldChange('saves', parseInt(e.target.value) || 0)} className="w-24 text-right bg-transparent"/> : <span className="font-semibold">{formatNumber(post.saves || 0)}</span>}
              </div>
              <div className="flex justify-between items-center">
                <span>Shares</span>
                 {isEditing ? <Input type="number" value={post.shares || 0} onChange={(e) => handleSimpleFieldChange('shares', parseInt(e.target.value) || 0)} className="w-24 text-right bg-transparent"/> : <span className="font-semibold">{formatNumber(post.shares || 0)}</span>}
              </div>
              <div className="flex justify-between items-center">
                <span>Comments</span>
                 {isEditing ? <Input type="number" value={post.comments || 0} onChange={(e) => handleSimpleFieldChange('comments', parseInt(e.target.value) || 0)} className="w-24 text-right bg-transparent"/> : <span className="font-semibold">{formatNumber(post.comments || 0)}</span>}
              </div>
              <div className="flex justify-between items-center">
                <span>Reposts</span>
                 {isEditing ? <Input type="number" value={post.reposts || 0} onChange={(e) => handleSimpleFieldChange('reposts', parseInt(e.target.value) || 0)} className="w-24 text-right bg-transparent"/> : <span className="font-semibold">{formatNumber(post.reposts || 0)}</span>}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="border-t border-zinc-800 pt-6">
              <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold">Profile activity</h2>
                      <Info size={16} className="text-zinc-400" />
                  </div>
                  {isEditing ? <Input type="number" value={post.profileActivity || 0} onChange={(e) => handleSimpleFieldChange('profileActivity', parseInt(e.target.value) || 0)} className="w-24 text-right bg-transparent"/> : <p className="font-semibold">{formatNumber(post.profileActivity || 0)}</p>}
              </div>
              <div className="flex justify-between items-center text-sm text-zinc-400">
                  <p>Follows</p>
                  {isEditing ? <Input type="number" value={post.follows || 0} onChange={(e) => handleSimpleFieldChange('follows', parseInt(e.target.value) || 0)} className="w-24 text-right bg-transparent"/> : <p className="font-semibold text-white">{formatNumber(post.follows || 0)}</p>}
              </div>
          </div>
        </section>

        <section>
           <AudienceSection post={post} isEditing={isEditing} onPostChange={handlePostChange} />
        </section>
        
        <MonetizationSection post={post} isEditing={isEditing} onPostChange={handlePostChange} />

        <section className="border-t border-zinc-800 pt-6">
          <div className="border border-zinc-700 rounded-lg p-3">
            <h3 className="font-bold mb-2">Ad</h3>
            <Button variant="ghost" className="w-full justify-between items-center p-2 rounded-lg hover:bg-zinc-800">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5" />
                <span className="text-base">Boost this reel</span>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500" />
            </Button>
          </div>
        </section>

      </main>
    </div>
  );
}

    