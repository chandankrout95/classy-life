
'use client';

import React, { useState, useEffect } from 'react';
import { produce } from 'immer';
import { Info } from 'lucide-react';

import type { Post } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  DEMO_AGE_DATA,
  DEMO_COUNTRY_DATA,
  DEMO_GENDER_DATA,
} from '@/lib/audience-data';
import { cn } from '@/lib/utils';

interface AudienceSectionProps {
  post: Post;
  isEditing: boolean;
  onPostChange: (post: Post) => void;
}

export function AudienceSection({
  post,
  isEditing,
  onPostChange,
}: AudienceSectionProps) {
  const [activeTab, setActiveTab] = useState<'gender' | 'country' | 'age'>(
    'country'
  );

  // Memoize data to prevent re-renders unless post object changes
  const countryData = React.useMemo(
    () => post.countryBreakdown || DEMO_COUNTRY_DATA,
    [post.countryBreakdown]
  );
  const genderData = React.useMemo(
    () =>
      post.genderBreakdown
        ? Object.entries(post.genderBreakdown).map(([key, value]) => ({
            label: key.charAt(0).toUpperCase() + key.slice(1),
            value: value,
          }))
        : Object.entries(DEMO_GENDER_DATA).map(([key, value]) => ({
            label: key.charAt(0).toUpperCase() + key.slice(1),
            value: value,
          })),
    [post.genderBreakdown]
  );
  const ageData = React.useMemo(
    () => post.ageBreakdown || DEMO_AGE_DATA,
    [post.ageBreakdown]
  );

  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    setShouldAnimate(false);
    const timer = setTimeout(() => setShouldAnimate(true), 100);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleDemographicChange = (
    tab: 'gender' | 'country' | 'age',
    index: number,
    field: 'label' | 'value',
    newValue: string
  ) => {
    let updatedData;
    if (tab === 'country') {
      updatedData = produce(countryData, (draft) => {
        const item = draft[index] as { name: string; percentage: number };
        if (field === 'label') item.name = newValue;
        if (field === 'value') item.percentage = Number(newValue);
      });
      onPostChange({ ...post, countryBreakdown: updatedData as any });
    } else if (tab === 'age') {
      updatedData = produce(ageData, (draft) => {
        const item = draft[index] as { range: string; percentage: number };
        if (field === 'label') item.range = newValue;
        if (field === 'value') item.percentage = Number(newValue);
      });
      onPostChange({ ...post, ageBreakdown: updatedData });
    } else if (tab === 'gender') {
      updatedData = produce(genderData, (draft) => {
        if (field === 'value') draft[index].value = Number(newValue);
      });
      const newGenderBreakdown = updatedData.reduce(
        (acc, item) => ({ ...acc, [item.label.toLowerCase()]: item.value }),
        {}
      );
      onPostChange({ ...post, genderBreakdown: newGenderBreakdown });
    }
  };

  const dataMap = {
    gender: genderData.map((d) => ({ label: d.label, value: d.value })),
    country: countryData.map((c) => ({ label: c.name, value: c.percentage })),
    age: ageData.map((a) => ({ label: a.range, value: a.percentage })),
  };

  const currentData = dataMap[activeTab];
  const activeTabLabel = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);

  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v * 10) / 10));

  return (
    <div className="border-t border-zinc-800 pt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">Audience</h2>
          <Info size={16} className="text-zinc-400" />
        </div>
        <small className="text-xs text-zinc-400">{activeTabLabel}</small>
      </div>

      <div className="flex gap-2 mb-4">
        <Button
          onClick={() => setActiveTab('gender')}
          variant={activeTab === 'gender' ? 'secondary' : 'ghost'}
          className="rounded-full h-8 px-3 text-xs sm:text-sm"
        >
          Gender
        </Button>
        <Button
          onClick={() => setActiveTab('country')}
          variant={activeTab === 'country' ? 'secondary' : 'ghost'}
          className="rounded-full h-8 px-3 text-xs sm:text-sm"
        >
          Country
        </Button>
        <Button
          onClick={() => setActiveTab('age')}
          variant={activeTab === 'age' ? 'secondary' : 'ghost'}
          className="rounded-full h-8 px-3 text-xs sm:text-sm"
        >
          Age
        </Button>
      </div>

      <div className="flex flex-col gap-4" aria-live="polite">
        {currentData.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-2">
            <div className="flex justify-between items-center w-full">
              {isEditing ? (
                <Input
                  value={item.label}
                  onChange={(e) =>
                    handleDemographicChange(activeTab, idx, 'label', e.target.value)
                  }
                  className="bg-transparent border-none p-0 h-auto text-[13px] font-semibold flex-1 min-w-[120px] text-white ring-1 ring-primary rounded-sm"
                  disabled={activeTab === 'gender'}
                />
              ) : (
                <span className="font-semibold text-[13px] flex-1 min-w-0 text-white">
                  {item.label}
                </span>
              )}

              <div className="flex items-center gap-1.5 ml-2">
                {isEditing ? (
                  <Input
                    type="number"
                    value={clamp(item.value)}
                    onChange={(e) =>
                      handleDemographicChange(activeTab, idx, 'value', e.target.value)
                    }
                    className="bg-transparent border-none p-0 h-auto text-right w-12 text-sm font-semibold text-zinc-400 ring-1 ring-primary rounded-sm"
                  />
                ) : (
                  <span className="font-semibold text-sm text-zinc-400">
                    {clamp(item.value).toFixed(1)}
                  </span>
                )}
                <span className="text-sm text-zinc-400">%</span>
              </div>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full",
                  activeTab === 'gender' && item.label === 'Women' ? 'bg-chart-2' : 'bg-chart-1'
                )}
                style={{
                  width: shouldAnimate ? `${clamp(item.value)}%` : '0%',
                  transition: `width 0.6s ease ${idx * 0.1}s`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
