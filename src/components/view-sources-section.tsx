
'use client';

import { produce } from 'immer';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import type { Post } from '@/lib/types';

interface ViewSourcesSectionProps {
  post: Post;
  isEditing: boolean;
  onPostChange: (post: Post) => void;
}

const defaultViewSources = [
  { source: 'Your profile', percentage: 45.2 },
  { source: 'Reels tab', percentage: 30.1 },
  { source: 'Explore', percentage: 15.7 },
  { source: 'Hashtag pages', percentage: 5.5 },
  { source: 'Other', percentage: 3.5 },
];

export function ViewSourcesSection({ post, isEditing, onPostChange }: ViewSourcesSectionProps) {
  const viewSources = post.viewSources && post.viewSources.length > 0 ? post.viewSources : defaultViewSources;

  const handleViewSourceChange = (index: number, field: 'source' | 'percentage', value: string | number) => {
    const updatedPost = produce(post, (draft) => {
      if (!draft.viewSources || draft.viewSources.length === 0) {
        draft.viewSources = defaultViewSources;
      }
      const item = draft.viewSources[index];
      if (field === 'percentage') {
        item.percentage = Number(value);
      } else {
        item.source = String(value);
      }
    });
    onPostChange(updatedPost);
  };

  return (
    <section>
      <div className="border-t border-zinc-800 pt-6">
        <h4 className="font-bold mb-4 text-base">Top sources of views</h4>
        <div className="space-y-3">
          {viewSources.map((source, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                {isEditing ? (
                  <Input
                    value={source.source}
                    onChange={(e) => handleViewSourceChange(index, 'source', e.target.value)}
                    className="bg-transparent border-none p-0 h-auto w-2/3 ring-1 ring-primary rounded-sm"
                  />
                ) : (
                  <span>{source.source}</span>
                )}
                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={source.percentage}
                      onChange={(e) => handleViewSourceChange(index, 'percentage', parseFloat(e.target.value))}
                      className="bg-transparent border-none p-0 h-auto text-right w-16 ring-1 ring-primary rounded-sm"
                    />
                  ) : (
                    <span>{source.percentage}</span>
                  )}
                  <span className="text-xs sm:text-sm">%</span>
                </div>
              </div>
              <Progress value={source.percentage} className="h-2 bg-zinc-800 flex-1" indicatorClassName="bg-chart-1" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
