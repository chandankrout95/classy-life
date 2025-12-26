
"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Info, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber, cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { StackedProgress } from "@/components/stacked-progress";
import { ViewsBreakdownChart } from "@/components/views-breakdown-chart";
import { produce } from "immer";
import type { UserProfileData } from "@/lib/types";
import { useDashboard } from "@/app/dashboard/context";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Slider } from "@/components/ui/slider";


type EditableField = {
    list: 'countries' | 'cities' | 'ageRanges' | 'gender';
    index: number;
    field: 'name' | 'percentage';
    value: string | number;
} | null;


export default function ViewsPage() {
    const { profile, onProfileUpdate, loading } = useDashboard();
    
    const [tempProfile, setTempProfile] = useState<UserProfileData | null>(null);
    const [isPageEditing, setIsPageEditing] = useState(false);
    const [activeFilter, setActiveFilter] = useState("All");

    const [contentTypeValues, setContentTypeValues] = useState([
        { name: "Reels", percentage: 98.7, followers: 80, nonFollowers: 20 },
        { name: "Stories", percentage: 0.8, followers: 60, nonFollowers: 40 },
        { name: "Posts", percentage: 0.5, followers: 90, nonFollowers: 10 },
    ]);
    const [showSliders, setShowSliders] = useState(false);

    const handleSliderChange = (index: number, value: number[]) => {
        const newValues = produce(contentTypeValues, draft => {
            draft[index].followers = value[0];
            draft[index].nonFollowers = 100 - value[0];
        });
        setContentTypeValues(newValues);
    };

    useEffect(() => {
        if (profile) {
            setTempProfile(profile);
        }
    }, [profile]);

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <p className="text-muted-foreground mt-4">Loading Views...</p>
            </div>
        );
    }

    if (!tempProfile) {
        return (
            <div className="bg-background text-foreground min-h-screen flex items-center justify-center">
                Could not load profile data.
            </div>
        );
    }
    
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
        setTempProfile(updatedProfile); // Optimistic update
        if (onProfileUpdate) {
            onProfileUpdate(updatedProfile);
        }
    };
    
    const handleToggleEdit = () => {
        if (isPageEditing && tempProfile) {
            onProfileUpdate(tempProfile);
        }
        setIsPageEditing(!isPageEditing);
    };

    const renderInput = (
      listName: 'countries' | 'cities' | 'ageRanges' | 'gender', 
      item: { name: string; percentage: number }, 
      index: number, 
      field: 'name' | 'percentage'
    ) => {
      const value = item[field];
      const type = field === 'percentage' ? 'number' : 'text';
      const className = field === 'name' 
        ? "bg-transparent border-none p-0 h-auto text-xs sm:text-sm"
        : "bg-transparent border-none p-0 h-auto w-12 text-right text-xs sm:text-sm font-semibold no-spinner";

        if (!isPageEditing) {
            return <span className={cn(className.replace(/w-\d+/,''), "w-auto")}>{value}{field === 'percentage' && '%'}</span>;
        }

      return (
        <Input 
          value={value} 
          onChange={(e) => {
                if (!tempProfile) return;
                const pathMap = {
                    'cities': 'stats.topCities',
                    'countries': 'stats.topCountries',
                    'ageRanges': 'stats.topAgeRanges',
                    'gender': 'stats.genderBreakdown'
                }
                const listPath = pathMap[listName];
                const listData = (tempProfile.stats as any)[listPath.split('.')[1]] || [];

                const updatedList = produce(listData, (draft: any[]) => {
                    if (!draft[index]) {
                      if (listName === 'gender' || listName === 'ageRanges' || listName === 'cities' || listName === 'countries') {
                        draft[index] = { name: '', percentage: 0 };
                      }
                    }
                    (draft[index] as any)[field] = type === 'number' ? Number(e.target.value) : e.target.value;
                });
                handleUpdate(listPath, updatedList);
          }}
          type={type}
          className={cn(className, { 'ring-1 ring-primary rounded-sm': isPageEditing })}
        />
      );
    };
    

    const topContent = tempProfile?.posts?.slice(0, 4).map((post, i) => ({
        ...post,
        views: [14000, 10000, 7900, 7000][i],
        date: ["26 Sep", "13 Sep", "11 Sep", "7 Oct"][i]
    })) || [];

    const { stats = {} } = tempProfile;
    const { 
        viewsBreakdown = [], 
        totalViews = 0, 
        accountsReached = { value: 0, change: 0 },
        dateRangeText = "9 Sep - 8 Oct",
        topCities = [],
        topCountries = [],
        topAgeRanges = [],
        genderBreakdown = [],
        profileActivity = { total: 0, change: 0, vsDate: '', visits: { total: 0, change: 0 }, linkTaps: { total: 0, changeText: '' } },
    } = stats;


    const audienceSlides = [
      {
        title: "Top towns/cities",
        data: topCities.slice(0, 4),
      },
      {
        title: "Top countries",
        data: topCountries.slice(0,4),
      },
      {
        title: "Top age ranges",
        data: topAgeRanges.slice(0, 4),
      },
      {
        title: "Gender",
        data: [...genderBreakdown].sort((a,b) => a.name === 'Men' ? -1 : 1),
      },
    ].sort((a, b) => {
        if (a.title === "Top towns/cities") return -1;
        if (b.title === "Top towns/cities") return 1;
        if (a.title === "Gender") return 1;
        if (b.title === "Gender") return -1;
        if (a.title === "Top age ranges") return 1;
        if (b.title === "Top age ranges") return -1;
        return 0;
    });

    return (
        <div className="bg-background text-foreground min-h-screen pb-8">
        <header className="p-4 flex items-center justify-between sticky top-0 bg-background z-10 border-b border-zinc-800">
            <div className="flex items-center gap-4">
            {!isPageEditing && (
                <Link href="/dashboard">
                <ChevronLeft size={28} />
                </Link>
            )}
            <span className="text-xl font-bold">Views</span>
            </div>
            <Button variant={isPageEditing ? "default" : "ghost"} size="icon" onClick={handleToggleEdit}>
                <Info size={24} />
            </Button>
        </header>

        <main className="p-4 space-y-8">
            <div className="flex justify-between items-center text-sm sm:text-base">
                <Button variant="ghost" className="bg-black text-white border border-zinc-700 rounded-full h-auto py-1.5 px-4 text-xs sm:text-sm" disabled>
                    Last 30 days
                    <ChevronDown size={20} className="ml-2" />
                </Button>
                {isPageEditing ? (
                    <Input 
                        value={dateRangeText}
                        onChange={(e) => handleUpdate('stats.dateRangeText', e.target.value)}
                        className="bg-transparent border-none text-zinc-400 text-xs sm:text-sm text-right p-0 h-auto w-28 ring-1 ring-primary rounded-sm"
                    />
                ) : (
                    <span className="text-zinc-400 text-xs sm:text-sm text-right p-0 h-auto w-28">{dateRangeText}</span>
                )}
            </div>
            
            <section>
            <div className="relative flex justify-center items-center">
                <ViewsBreakdownChart data={viewsBreakdown} totalViews={totalViews} />
                {isPageEditing && (
                    <div className="absolute flex flex-col items-center">
                        <span className="text-sm text-zinc-400">Views</span>
                        <Input
                            type="number"
                            value={totalViews}
                            onChange={(e) => handleUpdate('stats.totalViews', parseInt(e.target.value) || 0)}
                            className="bg-transparent border-none text-3xl font-bold text-center h-auto p-0 w-48 no-spinner ring-1 ring-primary rounded-sm"
                        />
                    </div>
                )}
            </div>
            <div className="mt-6 space-y-2 text-sm">
                <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: viewsBreakdown.find(d => d.name === 'followers')?.color }}></span>
                    <span>Followers</span>
                </div>
                 {isPageEditing ? (
                  <Input
                    type="number"
                    value={viewsBreakdown.find(d => d.name === 'followers')?.value || 0}
                    onChange={(e) => {
                        const newValue = parseInt(e.target.value) || 0;
                        const newBreakdown = produce(viewsBreakdown, draft => {
                            const item = draft.find(d => d.name === 'followers');
                            if (item) item.value = newValue;
                        });
                        handleUpdate('stats.viewsBreakdown', newBreakdown);
                    }}
                    className="bg-transparent border-none p-0 h-auto w-12 text-right text-xs sm:text-sm font-semibold no-spinner ring-1 ring-primary rounded-sm"
                    />
                ) : (
                    <span>{viewsBreakdown.find(d => d.name === 'followers')?.value}%</span>
                )}
                </div>
                <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: viewsBreakdown.find(d => d.name === 'non-followers')?.color }}></span>
                    <span>Non-followers</span>
                </div>
                {isPageEditing ? (
                    <Input
                    type="number"
                     value={viewsBreakdown.find(d => d.name === 'non-followers')?.value || 0}
                     onChange={(e) => {
                        const newValue = parseInt(e.target.value) || 0;
                        const newBreakdown = produce(viewsBreakdown, draft => {
                            const item = draft.find(d => d.name === 'non-followers');
                            if (item) item.value = newValue;
                        });
                        handleUpdate('stats.viewsBreakdown', newBreakdown);
                    }}
                    className="bg-transparent border-none p-0 h-auto w-12 text-right text-xs sm:text-sm font-semibold no-spinner ring-1 ring-primary rounded-sm"
                    />
                ) : (
                    <span>{viewsBreakdown.find(d => d.name === 'non-followers')?.value}%</span>
                )}
                </div>
            </div>
            </section>

            <div className="border-t border-zinc-800 pt-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-base sm:text-lg font-semibold">Accounts reached</h3>
                    </div>
                    <div className="text-right">
                        {isPageEditing ? (
                            <Input
                                type="number"
                                value={accountsReached.value}
                                onChange={(e) => handleUpdate('stats.accountsReached.value', parseInt(e.target.value) || 0)}
                                className="bg-transparent border-none text-base sm:text-lg font-bold text-right p-0 h-auto w-28 no-spinner ring-1 ring-primary rounded-sm"
                            />
                        ) : (
                           <p className="text-base sm:text-lg font-bold">{formatNumber(accountsReached.value)}</p>
                        )}
                        <div className="flex items-center justify-end">
                            {isPageEditing ? (
                                <Input
                                    type="number"
                                    value={accountsReached.change}
                                    onChange={(e) => handleUpdate('stats.accountsReached.change', parseFloat(e.target.value) || 0)}
                                    className="bg-transparent border-none text-sm text-red-500 text-right p-0 h-auto w-16 no-spinner ring-1 ring-primary rounded-sm"
                                />

                            ) : (
                                <p className="text-sm text-red-500">{accountsReached.change}%</p>
                            )}
                        <span className="text-sm text-red-500">%</span>
                        </div>
                    </div>
                </div>
            </div>


            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base sm:text-lg font-bold">By content type</h3>
                    {isPageEditing && (
                        <Button
                            variant={showSliders ? "default" : "secondary"}
                            onClick={() => setShowSliders(!showSliders)}
                            className="rounded-full h-8 px-4 text-xs sm:text-sm"
                        >
                            {showSliders ? 'Done' : 'Adjust'}
                        </Button>
                    )}
                </div>
                <div className="space-y-4">
                    {contentTypeValues.map((type, index) => (
                        <div key={type.name} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span>{type.name}</span>
                                <span>{type.percentage}%</span>
                            </div>
                            <StackedProgress
                                value1={type.followers}
                                value2={type.nonFollowers}
                                total={100}
                                className="h-2"
                            />
                            {showSliders && (
                                <div className="pt-2">
                                     <Slider
                                        defaultValue={[type.followers]}
                                        max={100}
                                        step={1}
                                        onValueChange={(value) => handleSliderChange(index, value)}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex justify-center gap-6 mt-4 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-chart-1"></div>
                        <span>Followers</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-chart-2"></div>
                        <span>Non-followers</span>
                    </div>
                </div>
            </section>

            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base sm:text-lg font-bold">By top content</h3>
                    <Button variant="link" className="p-0 h-auto text-blue-400 text-sm sm:text-base">See All</Button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {topContent.map(post => (
                        <div key={post.id} className="flex-shrink-0 space-y-2">
                            <div className="relative aspect-[9/16] w-full">
                                <Image src={post.imageUrl} alt={post.caption || "Top content"} fill className="rounded-lg object-cover" />
                                <div className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                                </div>
                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {formatNumber(post.views || 0)}
                                </div>
                            </div>
                            <p className="text-center text-xs text-zinc-400">{post.date}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section>
              <Carousel
                opts={{
                  align: "start",
                }}
                className="w-full"
              >
                <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-base sm:text-lg font-bold">Audience</h3>
                    <Info size={16} className="text-zinc-400" />
                </div>
                <CarouselContent>
                  {audienceSlides.map((slide, index) => (
                    <CarouselItem key={index} className="basis-auto pr-4">
                      <div className="border border-zinc-800 p-4 rounded-lg w-[85vw] sm:w-72">
                        <h4 className="font-bold mb-4 text-sm sm:text-base">{slide.title}</h4>
                        <div className="space-y-3">
                          {(slide.data as {name: string, percentage: number}[]).map((item, itemIndex) => (
                            <div key={itemIndex} className="space-y-1">
                                <div className="flex justify-between items-center text-sm">
                                    {renderInput(
                                    slide.title.toLowerCase().replace(/ /g, '').replace('towns/', '') as 'cities' | 'countries' | 'ageRanges' | 'gender', 
                                    item, 
                                    itemIndex, 
                                    'name'
                                    )}
                                    <div className="flex items-center gap-1">
                                    {renderInput(
                                        slide.title.toLowerCase().replace(/ /g, '').replace('towns/', '') as 'cities' | 'countries' | 'ageRanges' | 'gender', 
                                        item, 
                                        itemIndex, 
                                        'percentage'
                                    )}
                                    </div>
                                </div>
                                <Progress value={item.percentage} className="h-2 flex-1" indicatorClassName={slide.title === 'Gender' && item.name === 'Women' ? "bg-chart-2" : "bg-chart-1"}/>
                              </div>
                          ))}
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden" />
                <CarouselNext className="hidden" />
              </Carousel>
            </section>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold">Profile activity</h3>
                        <Info size={16} className="text-zinc-400" />
                    </div>
                    <div className="text-right">
                        {isPageEditing ? (
                             <Input
                                type="number"
                                value={profileActivity?.total}
                                onChange={(e) => handleUpdate('stats.profileActivity.total', parseInt(e.target.value) || 0)}
                                className="bg-transparent border-none text-lg sm:text-xl font-bold p-0 h-auto text-right w-24 no-spinner ring-1 ring-primary rounded-sm"
                            />
                        ) : (
                            <p className="text-lg sm:text-xl font-bold">{formatNumber(profileActivity?.total)}</p>
                        )}
                        <div className="flex items-center justify-end">
                            {isPageEditing ? (
                                <Input
                                    type="number"
                                    value={profileActivity?.change}
                                    onChange={(e) => handleUpdate('stats.profileActivity.change', parseFloat(e.target.value) || 0)}
                                    className="bg-transparent border-none text-sm text-red-500 p-0 h-auto text-right w-16 no-spinner ring-1 ring-primary rounded-sm"
                                />
                            ) : (
                                <p className="text-sm text-red-500">{profileActivity?.change}%</p>
                            )}
                            <span className="text-sm text-red-500">%</span>
                        </div>
                    </div>
                </div>
                 {isPageEditing ? (
                    <Input
                        value={profileActivity?.vsDate}
                        onChange={(e) => handleUpdate('stats.profileActivity.vsDate', e.target.value)}
                        className="bg-transparent border-none text-sm text-zinc-400 p-0 h-auto w-full ring-1 ring-primary rounded-sm"
                    />
                 ) : (
                    <p className="text-sm text-zinc-400">{profileActivity?.vsDate}</p>
                 )}
                
                <div className="flex justify-between items-center pt-2 text-sm sm:text-base">
                    <p>Profile visits</p>
                    <div className="text-right">
                        {isPageEditing ? (
                            <Input
                                type="number"
                                value={profileActivity?.visits.total}
                                onChange={(e) => handleUpdate('stats.profileActivity.visits.total', parseInt(e.target.value) || 0)}
                                className="bg-transparent border-none font-bold p-0 h-auto text-right w-24 no-spinner ring-1 ring-primary rounded-sm"
                            />
                        ) : (
                            <p className="font-bold">{formatNumber(profileActivity?.visits.total)}</p>
                        )}
                        <div className="flex items-center justify-end">
                            {isPageEditing ? (
                                <Input
                                        type="number"
                                        value={profileActivity?.visits.change}
                                        onChange={(e) => handleUpdate('stats.profileActivity.visits.change', parseFloat(e.target.value) || 0)}
                                        className="bg-transparent border-none text-xs text-red-500 p-0 h-auto text-right w-16 no-spinner ring-1 ring-primary rounded-sm"
                                    />
                            ): (
                                <p className="text-xs text-red-500">{profileActivity?.visits.change}%</p>
                            )}
                            <span className="text-xs text-red-500">%</span>
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center text-sm sm:text-base">
                    <p>External link taps</p>
                    <div className="text-right">
                        {isPageEditing ? (
                             <Input
                                type="number"
                                value={profileActivity?.linkTaps.total}
                                onChange={(e) => handleUpdate('stats.profileActivity.linkTaps.total', parseInt(e.target.value) || 0)}
                                className="bg-transparent border-none font-bold p-0 h-auto text-right w-24 no-spinner ring-1 ring-primary rounded-sm"
                            />
                        ) : (
                            <p className="font-bold">{profileActivity?.linkTaps.total}</p>
                        )}

                        {isPageEditing ? (
                            <Input
                                value={profileActivity?.linkTaps.changeText}
                                onChange={(e) => handleUpdate('stats.profileActivity.linkTaps.changeText', e.target.value)}
                                className="bg-transparent border-none text-xs text-zinc-500 p-0 h-auto text-right w-12 no-spinner ring-1 ring-primary rounded-sm"
                            />
                        ): (
                            <p className="text-xs text-zinc-500">{profileActivity?.linkTaps.changeText}</p>
                        )}
                    </div>
                </div>
            </div>

        </main>
        </div>
    );
}

    
