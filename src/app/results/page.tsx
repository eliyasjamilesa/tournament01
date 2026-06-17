
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  Calendar, 
  Trophy,
  ArrowLeft,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';

function MatchResultsSheet({ tournament }: { tournament: any }) {
  const db = useFirestore();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDetails = async () => {
    if (!db || !tournament.id) return;
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'tournaments', tournament.id, 'registrations'));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort: Highest Win Amount first, then Highest Kills
      const sorted = data.sort((a, b) => {
        const winDiff = Number(b.wonAmount || 0) - Number(a.wonAmount || 0);
        if (winDiff !== 0) return winDiff;
        return Number(b.kills || 0) - Number(a.kills || 0);
      });
      
      setRegistrations(sorted);
    } catch (err) {
      console.error("Result load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const maxWonAmount = registrations.length > 0 ? Math.max(...registrations.map(r => Number(r.wonAmount || 0))) : 0;
  
  const booyahPlayers = maxWonAmount > 0 
    ? registrations.filter(r => Number(r.wonAmount || 0) === maxWonAmount)
    : [];
    
  const otherPlayers = maxWonAmount > 0 
    ? registrations.filter(r => Number(r.wonAmount || 0) < maxWonAmount)
    : registrations;

  return (
    <Sheet onOpenChange={(open) => open && fetchDetails()}>
      <SheetTrigger asChild>
        <div className="absolute inset-0 cursor-pointer z-10" />
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[95vh] rounded-t-[2.5rem] bg-black border-t border-red-900/30 p-0 overflow-y-auto no-scrollbar">
        <SheetHeader className="px-6 pt-10 pb-4 text-center sticky top-0 bg-black z-50">
          <div className="flex items-center gap-4 mb-2">
             <SheetTrigger asChild>
                <button className="p-2 -ml-2 text-white bg-white/5 rounded-full"><ArrowLeft className="w-5 h-5" /></button>
             </SheetTrigger>
             <SheetTitle className="text-lg font-black uppercase text-white tracking-tight">Match Results</SheetTitle>
          </div>
          <SheetDescription className="sr-only">Detailed results for {tournament.title}</SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-20 space-y-6">
          <Card className="bg-[#121212] border border-red-900/30 rounded-3xl overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-xs font-black text-white uppercase leading-tight">
                  {tournament.title} | {tournament.mode}
                </h3>
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">
                  {tournament.startTime ? format(new Date(tournament.startTime), 'dd MMM yyyy | hh:mm a') : 'TBA'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4">
                <div className="text-center">
                  <span className="text-[8px] font-bold text-muted-foreground uppercase block">Win Pool</span>
                  <p className="text-xs font-black text-white">{tournament.prizePool} TK</p>
                </div>
                <div className="text-center">
                  <span className="text-[8px] font-bold text-muted-foreground uppercase block">Per Kill</span>
                  <p className="text-xs font-black text-white">{tournament.perKill} TK</p>
                </div>
                <div className="text-center">
                  <span className="text-[8px] font-bold text-muted-foreground uppercase block">Entry</span>
                  <p className="text-xs font-black text-white">{tournament.entryFee} TK</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <div className="bg-red-600 py-2.5 rounded-t-2xl text-center">
              <h4 className="text-sm font-black text-white uppercase italic tracking-widest">BOOYAH</h4>
            </div>
            <div className="bg-[#121212] border border-white/5 rounded-b-2xl overflow-hidden">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-red-900/30 text-[9px] font-black text-white uppercase border-b border-white/5">
                     <th className="px-4 py-3">#</th>
                     <th className="px-2 py-3">Player Name</th>
                     <th className="px-2 py-3 text-center">Kills</th>
                     <th className="px-4 py-3 text-right">Winning</th>
                   </tr>
                 </thead>
                 <tbody>
                   {loading ? (
                     <tr><td colSpan={4} className="py-10 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-red-500" /></td></tr>
                   ) : booyahPlayers.length > 0 ? (
                     booyahPlayers.map((player) => (
                       <tr key={player.id} className="text-white border-b border-white/5 last:border-none">
                          <td className="px-4 py-4 text-[11px] font-bold text-yellow-500">1</td>
                          <td className="px-2 py-4 text-xs font-black uppercase">{player.ingameName || player.displayName}</td>
                          <td className="px-2 py-4 text-xs font-black text-center">{player.kills || 0}</td>
                          <td className="px-4 py-4 text-xs font-black text-red-600 text-right">{player.wonAmount || 0} TK</td>
                       </tr>
                     ))
                   ) : (
                     <tr><td colSpan={4} className="py-6 text-center text-[10px] font-bold text-muted-foreground uppercase">No Data</td></tr>
                   )}
                 </tbody>
               </table>
            </div>
          </div>

          <div className="space-y-2">
            <div className="bg-red-600/80 py-2.5 rounded-t-2xl text-center">
              <h4 className="text-sm font-black text-white uppercase italic tracking-widest">FULL RESULT</h4>
            </div>
            <div className="bg-[#121212] border border-white/5 rounded-b-2xl overflow-hidden">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-red-900/20 text-[9px] font-black text-white uppercase border-b border-white/5">
                     <th className="px-4 py-3">Rank</th>
                     <th className="px-2 py-3">Player Name</th>
                     <th className="px-2 py-3 text-center">Kills</th>
                     <th className="px-4 py-3 text-right">Winning</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {loading ? (
                      <tr><td colSpan={4} className="py-10 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-red-500" /></td></tr>
                   ) : otherPlayers.length > 0 ? (
                     otherPlayers.map((player, idx) => (
                       <tr key={player.id} className="text-white hover:bg-white/5">
                         <td className="px-4 py-4 text-[11px] font-bold text-gray-500">#{booyahPlayers.length + idx + 1}</td>
                         <td className="px-2 py-4 text-xs font-bold text-gray-300 uppercase">{player.ingameName || player.displayName}</td>
                         <td className="px-2 py-4 text-xs font-black text-center">{player.kills || 0}</td>
                         <td className="px-4 py-4 text-xs font-black text-red-600 text-right">{player.wonAmount || 0} TK</td>
                       </tr>
                     ))
                   ) : (
                     <tr><td colSpan={4} className="py-10 text-center text-[10px] font-bold text-muted-foreground uppercase">Archives closed</td></tr>
                   )}
                 </tbody>
               </table>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function ResultsPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('BR SOLO');

  const tabs = [
    { id: 'br-solo', label: 'BR Solo', value: 'BR SOLO' },
    { id: 'br-duo', label: 'BR Duo', value: 'BR DUO' },
    { id: 'br-squad', label: 'BR Squad', value: 'BR SQUAD' },
    { id: 'cs-rank', label: 'CS Rank', value: 'CS RANK' },
    { id: 'cs-hs', label: 'CS Headshot', value: 'CS HEADSHOT' },
    { id: 'lw-1v1', label: 'LW 1v1', value: 'LW 1V1' },
    { id: 'lw-2v2', label: 'LW 2v2', value: 'LW 2V2' },
    { id: 'lw-hs', label: 'LW Headshot', value: 'LW HEADSHOT' },
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const resultsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'tournaments'),
      where('mode', '==', activeTab),
      where('status', '==', 'completed'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
  }, [db, activeTab, user]);

  const { data: matches, loading } = useCollection<any>(resultsQuery);

  const getModeImage = (mode: string) => {
    const idMap: Record<string, string> = {
      'BR SOLO': 'br-solo', 'BR DUO': 'br-duo', 'BR SQUAD': 'br-squad',
      'CS RANK': 'cs-rank', 'CS HEADSHOT': 'cs-headshot',
      'LW 1V1': 'lw-1v1', 'LW 2V2': 'lw-2v2', 'LW HEADSHOT': 'lw-hs'
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

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="px-6 pt-12 pb-4 text-center">
        <h1 className="text-xl font-black uppercase tracking-tight text-white italic">Archives</h1>
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Match History & Results</p>
      </header>

      <div className="px-4 sticky top-0 bg-background/95 backdrop-blur-md z-40 border-b border-white/5">
        <div className="flex overflow-x-auto no-scrollbar gap-6 py-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-all relative pb-1.5",
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
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Loading Records...</p>
          </div>
        ) : matches?.length === 0 ? (
          <div className="text-center py-20 bg-muted/5 rounded-3xl border border-white/5 border-dashed">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              No results for {activeTab} yet.
            </p>
          </div>
        ) : (
          matches?.map((match: any) => (
            <Card key={match.id} className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden relative active:scale-[0.98] transition-all">
              <MatchResultsSheet tournament={match} />
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
                  <div className="space-y-1 pr-10">
                    <p className="text-[12px] font-bold text-gray-200 leading-tight">
                      {match.title} | {match.mode}
                    </p>
                    <div className="flex items-center gap-2 text-primary">
                      <Calendar className="w-3 h-3" />
                      <span className="text-[10px] font-black italic">
                        {match.startTime ? format(new Date(match.startTime), 'dd MMM yyyy') : 'TBA'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <div className="bg-white/5 p-2 rounded-xl text-center">
                    <span className="text-[7px] font-bold text-muted-foreground uppercase block mb-0.5">Prize</span>
                    <span className="text-[11px] font-black text-white">{match.prizePool} TK</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl text-center">
                    <span className="text-[7px] font-bold text-muted-foreground uppercase block mb-0.5">Kill</span>
                    <span className="text-[11px] font-black text-primary">{match.perKill} TK</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl text-center">
                    <span className="text-[7px] font-bold text-muted-foreground uppercase block mb-0.5">Fee</span>
                    <span className="text-[11px] font-black text-white">{match.entryFee} TK</span>
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
