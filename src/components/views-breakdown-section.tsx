'use client';

import { produce } from 'immer';
import { Info } from 'lucide-react';

import type { Post } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { ViewsBreakdownChart } from '@/components/views-breakdown-chart';

interface ViewsBreakdownSectionProps {
  post: Post;
  isEditing: boolean;
  onPostChange: (post: Post) => void;
}

const defaultAudienceBreakdown = { followers: 60, nonFollowers: 40 };

export function ViewsBreakdownSection({
  post,
  isEditing,
  onPostChange,
}: ViewsBreakdownSectionProps) {
  const audienceBreakdown = post.audienceBreakdown || defaultAudienceBreakdown;

  const handleBreakdownChange = (
    subField: 'followers' | 'nonFollowers',
    value: string
  ) => {
    const updatedPost = produce(post, (draft) => {
      if (!draft.audienceBreakdown) {
        draft.audienceBreakdown = defaultAudienceBreakdown;
      }
      draft.audienceBreakdown[subField] = Number(value) || 0;
    });
    onPostChange(updatedPost);
  };

  const viewsBreakdownData = [
    {
      name: 'followers',
      value: audienceBreakdown.followers,
      color: 'hsl(var(--chart-1))',
    },
    {
      name: 'non-followers',
      value: audienceBreakdown.nonFollowers,
      color: 'hsl(var(--chart-2))',
    },
  ];

  return (
    <section className="bg-background pt-4">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-bold">Views</h2>
        <Info size={16} className="text-zinc-400" />
      </div>
      <div className="flex justify-center">
        <div className="w-[250px] h-[250px]">
          <ViewsBreakdownChart
            data={viewsBreakdownData}
            totalViews={post.views || 0}
            fullNumberFormat={true}
          />
        </div>
      </div>
      <div className="mt-6 space-y-2 text-sm w-full">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-chart-1"></span>
            <span>Followers</span>
          </div>
          {isEditing ? (
            <Input
              type="number"
              value={audienceBreakdown.followers || 0}
              onChange={(e) => handleBreakdownChange('followers', e.target.value)}
              className="w-20 text-right bg-transparent"
            />
          ) : (
            <span>{audienceBreakdown.followers || 0}%</span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-chart-2"></span>
            <span>Non-followers</span>
          </div>
          {isEditing ? (
            <Input
              type="number"
              value={audienceBreakdown.nonFollowers || 0}
              onChange={(e) =>
                handleBreakdownChange('nonFollowers', e.target.value)
              }
              className="w-20 text-right bg-transparent"
            />
          ) : (
            <span>{audienceBreakdown.nonFollowers || 0}%</span>
          )}
        </div>
      </div>
    </section>
  );
}
