
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * This page is kept to prevent build errors with Next.js static export.
 * In dynamic environments, we use generateStaticParams to satisfy the build,
 * but for actual functionality, we've moved to a query-parameter based route.
 */

export function generateStaticParams() {
  return [{ id: 'match' }];
}

export default function JoinMatchRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirecting to the non-dynamic route to ensure Capacitor compatibility
    router.replace('/play');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
    </div>
  );
}
