
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Menu, Gamepad2, Loader2, Trophy, Swords, Zap, ChevronRight } from 'lucide-react';
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

  const gameTypes = [
    { id: 'br-solo', title: 'Solo War', players: 'Solo', icon: Swords, color: 'text-blue-500' },
    { id: 'br-duo', title: 'Duo Combat', players: 'Duo', icon: Gamepad2, color: 'text-green-500' },
    { id: 'br-squad', title: 'Squad Chaos', players: 'Squad', icon: Zap, color: 'text-yellow-500' },
  ];

  return (
    <div className="min-h-screen pb-32">
      <header className="px-6 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <button className="p-2 -ml-2 text-white hover:bg-white/5 rounded-full transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-2 bg-red-950/20 border border-red-500/20 px-3 py-1.5 rounded-full">
          <Flame className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Ignite Live</span>
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

        {/* Game Types Section - Always Shown */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
            Tournament Categories
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {gameTypes.map((type) => (
              <Link href="/play" key={type.id}>
                <Card className="bg-card/40 border-white/5 p-4 rounded-2xl hover:bg-card hover:border-primary/20 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${type.color}`}>
                      <type.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="block text-sm font-black uppercase italic">{type.title}</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{type.players} Mode</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Dynamic Latest Matches */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase italic tracking-widest text-primary flex items-center gap-2">
              <Zap className="w-4 h-4 fill-primary" /> Active Matches
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
                <Card className="bg-card border-white/5 p-4 rounded-2xl hover:bg-white/5 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl magma-gradient flex items-center justify-center">
                        <Gamepad2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="block text-xs font-black uppercase italic truncate max-w-[150px]">{match.title}</span>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">{match.mode} • {match.map}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-black text-primary italic">{match.prizePool} TK</span>
                      <span className="text-[8px] font-bold text-muted-foreground uppercase">Prize Pool</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* AI Tactical Scout CTA */}
        <section>
          <Link href="/scout">
            <Card className="overflow-hidden border-none magma-gradient relative group cursor-pointer rounded-2xl">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              <CardContent className="p-6 relative z-10 flex items-center justify-between">
                <div className="space-y-1">
                  <Badge className="bg-white/20 text-white border-white/20 mb-2 font-black italic">ELITE AI</Badge>
                  <h3 className="text-xl font-headline font-bold uppercase text-white tracking-tight italic">Tactical Scout</h3>
                  <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">Master the next drop zone.</p>
                </div>
                <Zap className="w-12 h-12 text-white/30 group-hover:scale-125 transition-transform" />
              </CardContent>
            </Card>
          </Link>
        </section>
      </main>
    </div>
  );
}
