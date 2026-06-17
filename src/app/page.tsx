
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Loader2, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query } from 'firebase/firestore';

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
    return query(collection(db, 'tournaments'));
  }, [db]);

  const { data: allTournaments } = useCollection<any>(tournamentsQuery);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const getMatchCountForType = (typeTitle: string) => {
    if (!allTournaments) return 0;
    return allTournaments.filter(t => {
      const isAvailable = (t.status === 'open' || !t.status) && (t.currentPlayers < (t.maxPlayers || 48));
      if (!isAvailable) return false;
      return t.mode === typeTitle;
    }).length;
  };

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <LayoutGrid className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary animate-pulse">Initiating Arena...</p>
      </div>
    );
  }

  if (!user) return null;

  const userAvatar = profile?.photoURL || user?.photoURL || PlaceHolderImages.find(img => img.id === 'player-avatar')?.imageUrl;
  const promoBanner = PlaceHolderImages.find(img => img.id === 'promo-banner')?.imageUrl || '';

  const gameSections = [
    {
      title: 'BATTLE ROYALE',
      types: [
        { id: 'br-solo', title: 'BR SOLO', image: 'br-solo' },
        { id: 'br-duo', title: 'BR DUO', image: 'br-duo' },
        { id: 'br-squad', title: 'BR SQUAD', image: 'br-squad' },
      ]
    },
    {
      title: 'CLASH SQUAD',
      types: [
        { id: 'cs-rank', title: 'CS RANK', image: 'cs-rank' },
        { id: 'cs-hs', title: 'CS HEADSHOT', image: 'cs-headshot' },
      ]
    },
    {
      title: 'LONE WOLF',
      types: [
        { id: 'lw-1v1', title: 'LW 1V1', image: 'lw-1v1' },
        { id: 'lw-2v2', title: 'LW 2V2', image: 'lw-2v2' },
        { id: 'lw-hs', title: 'LW HEADSHOT', image: 'lw-hs' },
      ]
    }
  ];

  return (
    <div className="min-h-screen pb-32 bg-background w-full">
      <header className="px-4 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <button className="p-2 -ml-2 text-white hover:bg-white/5 rounded-xl transition-colors">
          <LayoutGrid className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-2 bg-[#1a0505] border border-primary/20 px-4 py-2 rounded-full">
          <Zap className="w-4 h-4 text-primary fill-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-primary italic">Live Status</span>
        </div>

        <Link href="/profile">
          <Avatar className="w-10 h-10 border-2 border-primary shadow-[0_0_15px_rgba(255,0,0,0.3)]">
            <AvatarImage src={userAvatar} className="object-cover" />
            <AvatarFallback className="bg-muted font-bold">
              {profile?.displayName?.[0] || user?.displayName?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
        </Link>
      </header>

      <main className="px-4 space-y-8 mt-4 w-full">
        <section>
          <Card className="overflow-hidden border-none relative group cursor-pointer rounded-[2.5rem] h-52 shadow-2xl">
            <Image 
              src={promoBanner} 
              alt="Promo Banner" 
              width={800}
              height={400}
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
              data-ai-hint="gaming promotion"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 space-y-3">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white leading-tight">
                টেলিগ্রাম চ্যানেলে <br /> <span className="text-primary">জয়েন করুন</span>
              </h3>
              <button className="bg-primary text-white text-[10px] font-black uppercase italic px-6 py-2.5 rounded-full w-fit flex items-center gap-2 shadow-lg shadow-primary/20">
                JOIN TELEGRAM <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </button>
            </div>
          </Card>
        </section>

        {gameSections.map((section) => (
          <section key={section.title} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-[1px] flex-1 bg-white/10" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">
                {section.title}
              </h2>
              <div className="h-[1px] flex-1 bg-white/10" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {section.types.map((type) => {
                const availableCount = getMatchCountForType(type.title);
                const typeImage = PlaceHolderImages.find(img => img.id === type.image)?.imageUrl || '';
                return (
                  <Link href={`/play?mode=${encodeURIComponent(type.title)}`} key={type.id} className="group">
                    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/5 shadow-xl transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-primary/10">
                      <Image 
                        src={typeImage} 
                        alt={type.title} 
                        fill 
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        data-ai-hint="game mode"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      
                      <div className="absolute top-3 left-3">
                        <Badge className={`${availableCount > 0 ? 'bg-primary' : 'bg-muted/80'} text-[8px] font-black italic tracking-widest px-2 py-0.5 border-none shadow-lg`}>
                          {availableCount} {availableCount === 1 ? 'Match' : 'Matches'} Available
                        </Badge>
                      </div>

                      <div className="absolute inset-0 flex flex-col justify-end p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase italic text-white tracking-tight">{type.title}</span>
                          <div className="w-6 h-6 rounded-lg bg-primary/20 backdrop-blur-md flex items-center justify-center border border-primary/20">
                            <Zap className="w-3 h-3 text-primary fill-primary" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        <section className="pb-10">
          <Link href="/scout">
            <Card className="overflow-hidden border-none magma-gradient relative group cursor-pointer rounded-[2.5rem] shadow-xl">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              <CardContent className="p-8 relative z-10 flex items-center justify-between">
                <div className="space-y-2">
                  <Badge className="bg-white/20 text-white border-white/20 mb-2 font-black italic tracking-widest text-[8px]">ELITE AI</Badge>
                  <h3 className="text-2xl font-black uppercase text-white tracking-tighter italic leading-none">Tactical <br /> Scout</h3>
                  <p className="text-white/80 text-[8px] font-bold uppercase tracking-[0.2em] mt-1">কোথায় নামবেন জানুন।</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform">
                   <Zap className="w-8 h-8 text-white fill-white/20" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </section>
      </main>
    </div>
  );
}
