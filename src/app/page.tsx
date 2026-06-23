
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, LayoutGrid, Bell, ChevronRight, Swords } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { cn } from '@/lib/utils';

export default function Home() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  const [lastNotifiedId, setLastNotifiedId] = useState<string | null>(null);

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
    if (!db || !user) return;

    const q = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'), limit(1));
    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        if (!snapshot.empty) {
          const newNote = snapshot.docs[0];
          const noteData = newNote.data();
          
          setLastNotifiedId((prevId) => {
            if (prevId !== null && prevId !== newNote.id) {
              toast({
                title: noteData.title || "নতুন ঘোষণা",
                description: noteData.message,
                className: "bg-primary text-white border-none rounded-2xl shadow-xl",
              });
            }
            return newNote.id;
          });
        }
      },
      async (serverError) => {
        if (serverError.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: 'notifications',
            operation: 'list',
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        }
      }
    );

    return () => unsubscribe();
  }, [db, user, toast]);

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
          <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <Swords className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse">Loading Arena...</p>
      </div>
    );
  }

  if (!user) return null;

  const promoBanner = PlaceHolderImages.find(img => img.id === 'promo-banner')?.imageUrl || '';

  const gameSections = [
    {
      title: 'BR Match',
      types: [
        { id: 'br-solo', title: 'BR SOLO', image: 'br-solo' },
        { id: 'br-duo', title: 'BR DUO', image: 'br-duo' },
        { id: 'br-squad', title: 'BR SQUAD', image: 'br-squad' },
      ]
    },
    {
      title: 'Squad Matches',
      types: [
        { id: 'cs-rank', title: 'CS RANK', image: 'cs-rank' },
        { id: 'cs-hs', title: 'CS HEADSHOT', image: 'cs-headshot' },
      ]
    },
    {
      title: 'Lonewolf',
      types: [
        { id: 'lw-1v1', title: 'LW 1V1', image: 'lw-1v1' },
        { id: 'lw-2v2', title: 'LW 2V2', image: 'lw-2v2' },
        { id: 'lw-hs', title: 'LW HEADSHOT', image: 'lw-hs' },
      ]
    }
  ];

  return (
    <div className="min-h-screen pb-40 bg-background w-full">
      <header className="px-4 pt-10 pb-6 flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur-xl z-[100]">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl magma-gradient flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="w-6 h-6 text-white fill-white/20" />
           </div>
           <div>
              <h1 className="text-lg font-black uppercase italic tracking-tighter leading-none text-white">TS <span className="text-primary">TOUR</span></h1>
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Status: Operational</p>
           </div>
        </div>

        <Link href="/notifications" className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center relative hover:bg-white/10 transition-colors border border-white/5">
          <Bell className="w-5 h-5 text-white" />
          <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background animate-pulse" />
        </Link>
      </header>

      <main className="px-4 space-y-12 w-full max-w-md mx-auto">
        <section>
          <Link href="https://t.me/TSTOUR" target="_blank" className="block outline-none">
            <Card className="overflow-hidden border-none relative group rounded-[2rem] h-56 shadow-[0_20px_50px_rgba(255,0,0,0.15)] cursor-pointer">
              <Image 
                src={promoBanner} 
                alt="Promo Banner" 
                width={800}
                height={400}
                className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-110"
                data-ai-hint="gaming promotion"
              />
              
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between z-10">
                <div className="bg-primary text-white text-[9px] font-black uppercase italic tracking-widest px-6 py-3 rounded-full shadow-2xl transition-all active:scale-95 flex items-center gap-2 border border-white/20">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.53-.99-.68-.35-1.05.22-1.71.15-.17 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.18-.08-.04-.19-.01-.27.01-.12.02-1.95 1.22-5.41 3.53-.51.35-.97.52-1.38.51-.45-.01-1.31-.25-1.95-.46-.78-.26-1.4-.4-1.35-.85.03-.24.36-.48.98-.73 3.84-1.67 6.4-2.77 7.67-3.3 3.65-1.51 4.41-1.77 4.9-.17z" />
                  </svg>
                  Join Official Telegram
                </div>
              </div>
            </Card>
          </Link>
        </section>

        {gameSections.map((section) => (
          <section key={section.title} className="space-y-6">
            <div className="flex items-center justify-center">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-primary italic text-glow-red">
                {section.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {section.types.map((type) => {
                const availableCount = getMatchCountForType(type.title);
                const typeImage = PlaceHolderImages.find(img => img.id === type.image)?.imageUrl || '';
                return (
                  <Link href={`/play?mode=${encodeURIComponent(type.title)}`} key={type.id} className="group outline-none">
                    <Card className="magma-card rounded-[2rem] overflow-hidden flex flex-col items-stretch p-0 border border-white/10 shadow-2xl transition-all duration-300 active:scale-[0.98]">
                      <div className="relative aspect-[21/9] w-full overflow-hidden">
                         <Image 
                            src={typeImage} 
                            alt={type.title} 
                            fill 
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            data-ai-hint="game mode"
                          />
                         {availableCount > 0 && (
                            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                               <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_12px_#22c55e] border-2 border-background" />
                               <span className="text-[8px] font-black text-white uppercase bg-green-600/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-green-500/30">Live Match</span>
                            </div>
                         )}
                      </div>
                      
                      <div className="p-5 bg-[#0d0d0d] border-t border-white/5 flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-base font-black uppercase italic text-white tracking-tight leading-none block group-hover:text-primary transition-colors">
                            {type.title}
                          </span>
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest",
                            availableCount > 0 ? "text-green-500" : "text-muted-foreground opacity-50"
                          )}>
                            {availableCount} {availableCount === 1 ? 'Match Available' : 'Matches Available'}
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                           <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        <section className="pb-10 pt-4">
          <Link href="/scout">
            <Card className="overflow-hidden border-none bg-[#0d0d0d] relative group cursor-pointer rounded-[2.5rem] shadow-2xl border border-primary/20">
              <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
              <CardContent className="p-8 relative z-10 flex items-center justify-between">
                <div className="space-y-2">
                  <Badge className="bg-primary text-white border-none mb-1 font-black italic tracking-widest text-[8px] px-3 py-1 shadow-lg shadow-primary/20">ELITE AI</Badge>
                  <h3 className="text-2xl font-black uppercase text-white tracking-tighter italic leading-tight">Tactical <br /> <span className="text-primary">Scout</span></h3>
                  <p className="text-muted-foreground text-[8px] font-bold uppercase tracking-[0.2em] mt-1">Get strategic drops</p>
                </div>
                <div className="w-16 h-16 rounded-2xl magma-gradient flex items-center justify-center shadow-xl shadow-primary/30 group-hover:scale-110 transition-transform rotate-3 group-hover:rotate-0">
                   <Zap className="w-9 h-9 text-white fill-white/20" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </section>
      </main>
    </div>
  );
}
