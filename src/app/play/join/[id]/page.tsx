
"use client";

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Loader2 } from 'lucide-react';

// Required for static export with dynamic routes
export async function generateStaticParams() {
  return [{ id: 'match' }];
}

export default function JoinMatchPlaceholder({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  useEffect(() => {
    if (id && id !== 'match') {
      router.replace(`/play/join?id=${id}`);
    } else {
      router.replace('/play');
    }
  }, [id, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <Trophy className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Redirecting to Arena...</p>
    </div>
  );
}
