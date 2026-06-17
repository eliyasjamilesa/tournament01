
"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldAlert, ChevronLeft, Loader2, ShieldX, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, loading: profileLoading } = useDoc<any>(userDocRef);

  useEffect(() => {
    if (authLoading || profileLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (profile?.role === 'admin') {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
      // We don't redirect immediately anymore to prevent the "kicking out" feeling
    }
  }, [user, authLoading, profile, profileLoading, router]);

  const handleClaimAdmin = async () => {
    if (!db || !user) return;
    setIsClaiming(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        role: 'admin'
      });
      toast({ title: "Authorized", description: "You are now an administrator." });
      setIsAuthorized(true);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to claim admin status." });
    } finally {
      setIsClaiming(false);
    }
  };

  // 1. Loading State
  if (authLoading || profileLoading || (isAuthorized === null && user)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <ShieldAlert className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary animate-pulse">Security Clearance</p>
          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Verifying Administrator Access...</p>
        </div>
      </div>
    );
  }

  // 2. Denied State (With Claim Option for Devs)
  if (isAuthorized === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8 text-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center border border-destructive/20">
          <ShieldX className="w-10 h-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">Access <span className="text-destructive">Denied</span></h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest max-w-[240px]">
            Your current profile does not have administrator privileges.
          </p>
        </div>
        
        <div className="flex flex-col gap-3 w-full max-w-[240px]">
          <Button onClick={handleClaimAdmin} disabled={isClaiming} className="w-full h-12 magma-gradient font-black uppercase italic rounded-xl">
            {isClaiming ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Unlock className="w-4 h-4 mr-2" /> Claim Admin Access</>}
          </Button>
          <Button variant="ghost" asChild className="text-[10px] font-bold uppercase">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>

        <p className="text-[8px] font-bold text-muted-foreground uppercase mt-8 opacity-40">
          Note: Claiming admin is enabled for prototype testing.
        </p>
      </div>
    );
  }

  const isMainAdmin = pathname === '/admin';

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
            <h1 className="text-lg font-black uppercase italic tracking-tighter text-white">Command <span className="text-primary">Center</span></h1>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Administrator Access</p>
          </div>
        </div>
        {isMainAdmin && (
           <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase" asChild>
             <Link href="/profile">Back to Profile</Link>
           </Button>
        )}
      </header>

      <main className="flex-1 p-6 pb-32 max-w-md mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
