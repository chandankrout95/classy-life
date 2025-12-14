
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InsightForgeLogo } from '@/components/icons';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the login page
    router.replace('/login');
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <InsightForgeLogo className="w-16 h-16 text-primary animate-pulse" />
      <p className="text-muted-foreground mt-4">Loading...</p>
    </div>
  );
}
