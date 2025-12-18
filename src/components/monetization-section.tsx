'use client';

import { produce } from 'immer';
import { Info, BarChart, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Post } from '@/lib/types';

interface MonetizationSectionProps {
  post: Post;
  isEditing: boolean;
  onPostChange: (post: Post) => void;
}

export function MonetizationSection({ post, isEditing, onPostChange }: MonetizationSectionProps) {

  const handleEarningsChange = (value: string) => {
    const updatedPost = produce(post, (draft) => {
      draft.approximateEarnings = value;
    });
    onPostChange(updatedPost);
  };

  return (
    <section>
      <div className="border-t border-zinc-800 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-bold">Monetization</h2>
          <Info size={16} className="text-zinc-400" />
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Gifts</h3>
            <div className="flex justify-between items-center text-sm">
              <p className="text-zinc-400">Approximate earnings</p>
              {isEditing ? (
                <Input
                  value={post.approximateEarnings || '$0.00'}
                  onChange={(e) => handleEarningsChange(e.target.value)}
                  className="w-24 text-right bg-transparent"
                />
              ) : (
                <p className="font-semibold">{post.approximateEarnings || '$0.00'}</p>
              )}
            </div>
          </div>
          <div className="border-t border-zinc-800 pt-6">
            <h3 className="font-semibold mb-2">Ad</h3>
            <Button
              variant="ghost"
              className="w-full justify-between items-center p-0 h-auto hover:bg-transparent"
            >
              <div className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-blue-400" />
                <span className="font-semibold text-blue-400">Boost this reel</span>
              </div>
              <ChevronRight className="h-5 w-5 text-zinc-400" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
