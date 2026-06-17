
"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  ShieldAlert, 
  ChevronLeft,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, loading: profileLoading } = useDoc<any>(userDocRef);

  useEffect(() => {
    if (authLoading || profileLoading) return;
    if (!user || profile?.role !== 'admin') {
      router.replace('/');
    } else {
      setIsAuthorized(true);
    }
  }, [user, authLoading, profile, profileLoading, router]);

  if (authLoading || profileLoading || !isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Checking Permissions...</p>
      </div>
    );
  }

  const isMainAdmin = pathname === '/admin';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Simple Header */}
      <header className="px-6 py-8 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md z-[100] border-b border-white/5">
        <div className="flex items-center gap-3">
          {!isMainAdmin ? (
            <Button variant="ghost" size="icon" className="rounded-full bg-white/5" asChild>
              <Link href="/admin"><ChevronLeft className="w-5 h-5" /></Link>
            </Button>
          ) : (
            <div className="w-10 h-10 rounded-xl magma-gradient flex items-center justify-center shadow-lg shadow-primary/20">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-lg font-black uppercase italic tracking-tighter">Command <span className="text-primary">Center</span></h1>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Administrator Access</p>
          </div>
        </div>
        {isMainAdmin && (
           <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase" asChild>
             <Link href="/profile">Back to Profile</Link>
           </Button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 pb-32">
        {children}
      </main>
    </div>
  );
}
