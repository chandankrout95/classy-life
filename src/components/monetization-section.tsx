
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
        <div className="space-y-2">
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
        </div>
      </div>
    </section>
  );
}
