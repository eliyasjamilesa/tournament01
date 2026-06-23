
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  Calendar, 
  Trophy,
  ArrowLeft,
  ListChecks,
  Clock,
  Target,
  Wallet
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
      <SheetContent side="bottom" className="h-[95vh] rounded-t-[2.5rem] bg-black border-t border-primary/20 p-0 overflow-y-auto no-scrollbar">
        <SheetHeader className="px-6 pt-10 pb-4 text-center sticky top-0 bg-black z-50">
          <div className="flex items-center gap-4 mb-2">
             <SheetTrigger asChild>
                <button className="p-2 -ml-2 text-white bg-white/5 rounded-full hover:bg-white/10 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
             </SheetTrigger>
             <SheetTitle className="text-lg font-black uppercase text-white tracking-tight italic">ম্যাচ রেজাল্ট</SheetTitle>
          </div>
          <SheetDescription className="sr-only">Detailed results for {tournament.title}</SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-20 space-y-6">
          <Card className="bg-[#0d0d0d] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <CardContent className="p-6 space-y-5">
              <div className="text-center space-y-2">
                <h3 className="text-sm font-black text-white uppercase italic tracking-tight">
                  {tournament.title} • {tournament.mode}
                </h3>
                <div className="flex items-center justify-center gap-3 text-[10px] font-black text-primary uppercase tracking-[0.1em]">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {tournament.startTime ? format(new Date(tournament.startTime), 'dd MMM yyyy') : 'TBA'}</span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="flex items-center gap-1 text-white/80"><Clock className="w-3.5 h-3.5" /> {tournament.startTime ? format(new Date(tournament.startTime), 'hh:mm a') : 'TBA'}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-5">
                <div className="text-center space-y-1">
                  <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">Win Pool</span>
                  <p className="text-xs font-black text-white italic">{tournament.prizePool} TK</p>
                </div>
                <div className="text-center space-y-1">
                  <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">Per Kill</span>
                  <p className="text-xs font-black text-primary italic">{tournament.perKill} TK</p>
                </div>
                <div className="text-center space-y-1">
                  <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">Entry Fee</span>
                  <p className="text-xs font-black text-white italic">{tournament.entryFee} TK</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="magma-gradient py-3 rounded-2xl text-center shadow-lg shadow-primary/20">
              <h4 className="text-sm font-black text-white uppercase italic tracking-[0.2em] flex items-center justify-center gap-2">
                <Trophy className="w-4 h-4" /> BOOYAH
              </h4>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-white/5 text-[9px] font-black text-muted-foreground uppercase border-b border-white/5">
                     <th className="px-4 py-3">#</th>
                     <th className="px-2 py-3">Player Name</th>
                     <th className="px-2 py-3 text-center">Kills</th>
                     <th className="px-4 py-3 text-right">Winning</th>
                   </tr>
                 </thead>
                 <tbody>
                   {loading ? (
                     <tr><td colSpan={4} className="py-10 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /></td></tr>
                   ) : booyahPlayers.length > 0 ? (
                     booyahPlayers.map((player) => (
                       <tr key={player.id} className="text-white border-b border-white/5 last:border-none hover:bg-white/5 transition-colors">
                          <td className="px-4 py-5 text-[11px] font-black text-yellow-500 italic">#1</td>
                          <td className="px-2 py-5 text-xs font-black uppercase italic tracking-tight">{player.ingameName || player.displayName}</td>
                          <td className="px-2 py-5 text-xs font-black text-center">{player.kills || 0}</td>
                          <td className="px-4 py-5 text-xs font-black text-green-500 text-right italic">{player.wonAmount || 0} TK</td>
                       </tr>
                     ))
                   ) : (
                     <tr><td colSpan={4} className="py-8 text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">No Booyah Data</td></tr>
                   )}
                 </tbody>
               </table>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-white/5 py-3 rounded-2xl text-center border border-white/5">
              <h4 className="text-sm font-black text-white uppercase italic tracking-[0.2em]">FULL STANDINGS</h4>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-white/5 text-[9px] font-black text-muted-foreground uppercase border-b border-white/5">
                     <th className="px-4 py-3">Rank</th>
                     <th className="px-2 py-3">Player Name</th>
                     <th className="px-2 py-3 text-center">Kills</th>
                     <th className="px-4 py-3 text-right">Winning</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {loading ? (
                      <tr><td colSpan={4} className="py-10 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /></td></tr>
                   ) : otherPlayers.length > 0 ? (
                     otherPlayers.map((player, idx) => (
                       <tr key={player.id} className="text-white hover:bg-white/5 transition-colors">
                         <td className="px-4 py-5 text-[11px] font-black text-gray-500 italic">#{booyahPlayers.length + idx + 1}</td>
                         <td className="px-2 py-5 text-xs font-bold text-gray-300 uppercase italic tracking-tight">{player.ingameName || player.displayName}</td>
                         <td className="px-2 py-5 text-xs font-black text-center">{player.kills || 0}</td>
                         <td className="px-4 py-5 text-xs font-black text-primary text-right italic">{player.wonAmount || 0} TK</td>
                       </tr>
                     ))
                   ) : (
                     <tr><td colSpan={4} className="py-8 text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">Archives Closed</td></tr>
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

  const { data: matches, loading: matchesLoading } = useCollection<any>(resultsQuery);

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <ListChecks className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary animate-pulse">রেকর্ড খুঁজা হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="px-6 pt-12 pb-4 text-center">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-white italic">Result <span className="text-primary">Archives</span></h1>
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em] mt-1">সব ম্যাচের ফলাফল এখানে</p>
      </header>

      <div className="px-4 sticky top-0 bg-background/95 backdrop-blur-md z-40 border-b border-white/5">
        <div className="flex overflow-x-auto no-scrollbar gap-6 py-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-all relative pb-2 px-1",
                activeTab === tab.value ? "text-primary" : "text-muted-foreground hover:text-white"
              )}
            >
              {tab.label}
              {activeTab === tab.value && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full shadow-[0_0_10px_#ff0000]" />
              )}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 py-6 space-y-6 max-w-md mx-auto">
        {matchesLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
             <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">লোডিং হচ্ছে...</p>
          </div>
        ) : matches?.length === 0 ? (
          <div className="text-center py-24 bg-white/5 rounded-[2.5rem] border border-white/5 border-dashed space-y-4">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto opacity-20" />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              {activeTab} এর কোনো রেজাল্ট পাওয়া যায়নি
            </p>
          </div>
        ) : (
          matches?.map((match: any) => (
            <Card key={match.id} className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden relative active:scale-[0.98] transition-all group hover:border-primary/30 shadow-xl">
              <MatchResultsSheet tournament={match} />
              
              <div className="absolute top-4 right-4 z-20">
                <div className="bg-primary/10 border border-primary/20 text-primary text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md">
                  {match.matchId || '#-----'}
                </div>
              </div>

              <CardContent className="p-5 space-y-6">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shrink-0 relative group-hover:scale-105 transition-transform duration-500">
                    <Image 
                      src={getModeImage(match.mode)} 
                      alt={match.mode} 
                      fill
                      className="object-cover h-full w-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="space-y-2 flex-1 pt-1">
                    <h3 className="text-sm font-black text-white italic leading-tight group-hover:text-primary transition-colors">
                      {match.title}
                    </h3>
                    <div className="space-y-1">
                       <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="w-3 h-3 text-primary" />
                          <span className="text-[9px] font-bold uppercase tracking-widest">
                            {match.startTime ? format(new Date(match.startTime), 'dd MMM, yyyy') : 'TBA'}
                          </span>
                       </div>
                       <div className="flex items-center gap-1.5 text-white/80">
                          <Clock className="w-3 h-3 text-primary" />
                          <span className="text-[10px] font-black italic uppercase">
                            {match.startTime ? format(new Date(match.startTime), 'hh:mm a') : 'TBA'}
                          </span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 border border-white/5 p-3 rounded-2xl text-center space-y-1 group-hover:bg-white/10 transition-colors">
                    <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest block">Total Win</span>
                    <div className="flex items-center justify-center gap-1 text-white">
                       <Trophy className="w-3 h-3 text-yellow-500" />
                       <span className="text-[11px] font-black italic">{match.prizePool} TK</span>
                    </div>
                  </div>
                  <div className="bg-primary/5 border border-primary/10 p-3 rounded-2xl text-center space-y-1 group-hover:bg-primary/10 transition-colors">
                    <span className="text-[7px] font-black text-primary/60 uppercase tracking-widest block">Per Kill</span>
                    <div className="flex items-center justify-center gap-1 text-primary">
                       <Target className="w-3 h-3" />
                       <span className="text-[11px] font-black italic">{match.perKill} TK</span>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-3 rounded-2xl text-center space-y-1 group-hover:bg-white/10 transition-colors">
                    <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest block">Entry Fee</span>
                    <div className="flex items-center justify-center gap-1 text-white/60">
                       <Wallet className="w-3 h-3" />
                       <span className="text-[11px] font-black italic">{match.entryFee} TK</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 flex items-center justify-center">
                   <div className="h-0.5 w-8 bg-primary/20 rounded-full group-hover:w-16 transition-all duration-500" />
                   <span className="mx-3 text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em]">Tap to View Results</span>
                   <div className="h-0.5 w-8 bg-primary/20 rounded-full group-hover:w-16 transition-all duration-500" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
}
