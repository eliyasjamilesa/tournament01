
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  Calendar, 
  Clock, 
  Trophy,
  Swords,
  Map as MapIcon,
  Monitor,
  LayoutGrid
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

export default function ResultsPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('BR SOLO');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const tabs = [
    { id: 'br-solo', label: 'BR Solo', value: 'BR SOLO' },
    { id: 'br-duo', label: 'BR Duo', value: 'BR DUO' },
    { id: 'br-squad', label: 'BR SQUAD', value: 'BR SQUAD' },
    { id: 'cs-rank', label: 'CS Rank', value: 'CS RANK' },
    { id: 'cs-hs', label: 'CS Headshot', value: 'CS HEADSHOT' },
  ];

  const resultsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    // Showing matches that are completed or just all past matches for this mode
    return query(
      collection(db, 'tournaments'),
      where('mode', '==', activeTab),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
  }, [db, activeTab, user]);

  const { data: matches, loading } = useCollection<any>(resultsQuery);

  const getModeImage = (mode: string) => {
    const idMap: Record<string, string> = {
      'BR SOLO': 'br-solo',
      'BR DUO': 'br-duo',
      'BR SQUAD': 'br-squad',
      'CS RANK': 'cs-rank',
      'CS HEADSHOT': 'cs-headshot',
      'LW 1V1': 'lw-1v1',
      'LW 2V2': 'lw-2v2',
      'LW HEADSHOT': 'lw-hs'
    };
    return PlaceHolderImages.find(img => img.id === idMap[mode])?.imageUrl || '';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="px-6 pt-12 pb-4 text-center">
        <h1 className="text-xl font-black uppercase tracking-tight text-white italic">Results</h1>
      </header>

      <div className="px-4 sticky top-0 bg-background/95 backdrop-blur-md z-40 border-b border-white/5 pb-2">
        <div className="flex overflow-x-auto no-scrollbar gap-6 py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "whitespace-nowrap text-[11px] font-black uppercase tracking-wider transition-all relative pb-2",
                activeTab === tab.value ? "text-primary" : "text-muted-foreground"
              )}
            >
              {tab.label}
              {activeTab === tab.value && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 py-6 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Fetching Archives...</p>
          </div>
        ) : matches?.length === 0 ? (
          <div className="text-center py-20 bg-muted/5 rounded-3xl border border-white/5 border-dashed">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              No results found for {activeTab}
            </p>
          </div>
        ) : (
          matches?.map((match: any) => (
            <Card key={match.id} className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 right-0">
                <div className="bg-primary text-white text-[9px] font-black px-3 py-1.5 rounded-bl-xl shadow-lg">
                  {match.matchId || '#-----'}
                </div>
              </div>

              <CardContent className="p-5 space-y-6">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 shrink-0">
                    <Image 
                      src={getModeImage(match.mode)} 
                      alt={match.mode} 
                      width={64} 
                      height={64} 
                      className="object-cover h-full w-full"
                    />
                  </div>
                  <div className="space-y-1.5 pr-12">
                    <p className="text-[12px] font-bold text-gray-200 leading-tight">
                      {match.title} | Normal | 🚫ম্যাচ এ জয়েন করার আগে রুলস পরে নেন। 🚫রুলস ফলো না করলে রিওয়ার্ড দেয়া হবে না & রিফান্ড পাবেন না
                    </p>
                    <div className="flex items-center gap-2 text-primary">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-black italic">
                        {match.startTime ? format(new Date(match.startTime), 'dd, MMM yyyy | hh:mm a') : 'TBA'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-px bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                  <div className="bg-[#0d0d0d] p-3 flex flex-col items-center justify-center text-center">
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Win Prize</span>
                    <span className="text-[12px] font-black text-cyan-400">{match.prizePool} TK</span>
                  </div>
                  <div className="bg-[#0d0d0d] p-3 flex flex-col items-center justify-center text-center border-x border-white/5">
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Entry Type</span>
                    <span className="text-[12px] font-black text-white">{match.mode.includes('SOLO') ? 'Solo' : match.mode.includes('DUO') ? 'Duo' : 'Squad'}</span>
                  </div>
                  <div className="bg-[#0d0d0d] p-3 flex flex-col items-center justify-center text-center">
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Entry Fee</span>
                    <span className="text-[12px] font-black text-white">{match.entryFee}</span>
                  </div>
                  <div className="bg-[#0d0d0d] p-3 flex flex-col items-center justify-center text-center border-t border-white/5">
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Per Kill</span>
                    <span className="text-[12px] font-black text-red-600">{match.perKill}</span>
                  </div>
                  <div className="bg-[#0d0d0d] p-3 flex flex-col items-center justify-center text-center border-t border-x border-white/5">
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Map</span>
                    <span className="text-[12px] font-black text-white">{match.map}</span>
                  </div>
                  <div className="bg-[#0d0d0d] p-3 flex flex-col items-center justify-center text-center border-t border-white/5">
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Version</span>
                    <span className="text-[12px] font-black text-white">{match.version}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
}
