
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Menu, Gamepad2, Loader2, Trophy, Swords, Zap } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, limit, orderBy } from 'firebase/firestore';

export default function Home() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, loading: profileLoading } = useDoc<any>(userDocRef);

  const tournamentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'), limit(5));
  }, [db]);

  const { data: tournaments, loading: tournamentsLoading } = useCollection<any>(tournamentsQuery);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const userAvatar = profile?.photoURL || user?.photoURL || PlaceHolderImages.find(img => img.id === 'player-avatar')?.imageUrl;

  return (
    <div className="min-h-screen pb-32">
      <header className="px-6 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <button className="p-2 -ml-2 text-white hover:bg-white/5 rounded-full transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-2 bg-red-950/20 border border-red-500/20 px-3 py-1.5 rounded-full">
          <Flame className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Live Status</span>
        </div>

        <Link href="/profile">
          <Avatar className="w-9 h-9 border border-white/10 ring-2 ring-primary/20">
            <AvatarImage src={userAvatar} className="object-cover" />
            <AvatarFallback className="bg-muted font-bold">
              {profile?.displayName?.[0] || user?.displayName?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
        </Link>
      </header>

      <main className="px-6 space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-black uppercase italic tracking-tight text-glow-red">
            IGNITE <span className="text-primary">ARENA</span>
          </h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Victory Awaits the Elite</p>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-card border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <div className="text-center">
              <span className="block text-xl font-black italic">{profile?.coins || 0}</span>
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">TK Balance</span>
            </div>
          </Card>
          <Card className="bg-card border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-2">
            <Swords className="w-6 h-6 text-primary" />
            <div className="text-center">
              <span className="block text-xl font-black italic">12</span>
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Matches Played</span>
            </div>
          </Card>
        </div>

        {/* Dynamic Matches Summary */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase italic tracking-widest text-primary flex items-center gap-2">
              <Zap className="w-4 h-4 fill-primary" /> Latest Tournaments
            </h2>
            <Link href="/play" className="text-[10px] font-bold text-muted-foreground uppercase hover:text-primary">View All</Link>
          </div>

          <div className="space-y-3">
            {tournamentsLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : tournaments?.length === 0 ? (
              <div className="text-center py-10 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">No Matches Scheduled</p>
              </div>
            ) : tournaments?.map((match: any) => (
              <Link href="/play" key={match.id}>
                <Card className="bg-card/40 border-white/5 p-4 rounded-2xl hover:bg-card transition-all mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl magma-gradient flex items-center justify-center">
                        <Gamepad2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="block text-xs font-black uppercase italic">{match.title}</span>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">{match.mode} • {match.map}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-black text-primary italic">{match.prizePool} TK</span>
                      <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter">Prize Pool</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <Card className="overflow-hidden border-none magma-gradient relative group cursor-pointer rounded-2xl">
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
            <CardContent className="p-6 relative z-10 flex items-center justify-between">
              <div className="space-y-1">
                <Badge className="bg-white/20 text-white border-white/20 mb-2 font-black italic">ELITE SCOUT</Badge>
                <h3 className="text-xl font-headline font-bold uppercase text-white tracking-tight italic">AI Tactical Scout</h3>
                <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">Get AI insights for the next match.</p>
              </div>
              <Zap className="w-12 h-12 text-white/30 group-hover:scale-125 transition-transform" />
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
