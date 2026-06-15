
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Menu, Gamepad2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function Home() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, loading: profileLoading } = useDoc<any>(userDocRef);

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

  const modes = [
    { id: 'br-solo', name: 'Br solo', desc: 'Survival Duo', matches: 0, imageId: 'br-solo' },
    { id: 'br-duo', name: 'Br duo', desc: 'Survival Duo', matches: 0, imageId: 'br-duo' },
    { id: 'br-squad', name: 'Br squad', desc: 'Team Combat', matches: 4, imageId: 'br-squad' },
    { id: 'cs-rank', name: 'Cs rank', desc: 'Ranked 4v4', matches: 12, imageId: 'cs-rank' },
    { id: 'cs-headshot', name: 'Cs headshot', desc: 'Pro Precision', matches: 8, imageId: 'cs-headshot' },
    { id: 'lw-1v1', name: 'Long wolf 1v1', desc: 'Solo Duel', matches: 0, imageId: 'lw-1v1' },
    { id: 'lw-2v2', name: 'Long wolf 2v2', desc: 'Duo Duel', matches: 0, imageId: 'lw-2v2' },
    { id: 'lw-headshot', name: 'Long wolf headshot', desc: 'Pro Precision 1v1', matches: 3, imageId: 'lw-hs' },
  ];

  const userAvatar = profile?.photoURL || user?.photoURL || PlaceHolderImages.find(img => img.id === 'player-avatar')?.imageUrl;

  return (
    <div className="min-h-screen pb-24">
      {/* Top Header */}
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

      <main className="px-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-headline font-bold uppercase tracking-tight text-glow">
            Battle <span className="text-primary">Arena</span>
          </h1>
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">Select your game mode</p>
        </div>

        {/* Game Modes Grid */}
        <div className="grid grid-cols-2 gap-4">
          {modes.map((mode) => {
            const imageData = PlaceHolderImages.find(img => img.id === mode.imageId);
            return (
              <Link href={`/play?mode=${mode.id}`} key={mode.id}>
                <Card className="overflow-hidden bg-card border-white/5 card-glow relative group aspect-[3/4]">
                  {/* Background Image */}
                  <div className="absolute inset-0 z-0">
                    <Image 
                      src={imageData?.imageUrl || 'https://picsum.photos/seed/gaming/600/800'} 
                      alt={mode.name}
                      fill
                      className="object-cover opacity-60 transition-transform duration-500 group-hover:scale-110"
                      data-ai-hint={imageData?.imageHint || 'gaming'}
                    />
                    <div className="absolute inset-0 magma-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                  </div>

                  {/* Mode Icon Overlay */}
                  <div className="absolute top-3 right-3 z-20">
                    <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
                      <Gamepad2 className="w-4 h-4 text-primary" />
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="relative z-10 h-full p-4 flex flex-col justify-end">
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-headline font-bold uppercase italic tracking-tighter text-white group-hover:text-primary transition-colors">
                        {mode.name}
                      </h3>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                        {mode.matches} Matches Live
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Pro League / Elite Banner */}
        <section className="pt-2">
          <Card className="overflow-hidden border-none magma-gradient relative group cursor-pointer">
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
            <CardContent className="p-6 relative z-10 flex items-center justify-between">
              <div className="space-y-1">
                <Badge className="bg-white/20 text-white border-white/20 mb-2">PRO EVENT</Badge>
                <h3 className="text-xl font-headline font-bold uppercase text-white tracking-tight">BR Pro League</h3>
                <p className="text-white/80 text-xs font-medium">Weekly tournaments with high prize pools.</p>
              </div>
              <Flame className="w-12 h-12 text-white/30 group-hover:scale-125 transition-transform" />
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
