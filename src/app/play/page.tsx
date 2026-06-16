
"use client";

import { useState, useEffect } from 'react';
import { 
  Users, 
  Trophy, 
  Search, 
  Map as MapIcon, 
  Skull, 
  Wallet,
  Gamepad2,
  Calendar,
  Layers,
  Monitor,
  ArrowLeft,
  Globe,
  Lock,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Link from 'next/link';

function CountdownTimer({ startTime }: { startTime: string }) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const target = new Date(startTime).getTime();
    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = target - now;
      if (difference <= 0) {
        setTimeLeft('MATCH STARTED');
        return;
      }
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft(`STARTS IN: ${minutes}M ${seconds}S`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="w-full bg-green-600 py-2.5 flex items-center justify-center">
      <span className="text-white text-[10px] font-black uppercase tracking-widest">{timeLeft}</span>
    </div>
  );
}

function PrizeDistributionSheet({ tournament }: { tournament: any }) {
  const prizes = tournament.prizes || {};
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-9 rounded-lg text-[10px] font-bold uppercase flex-1 border-white/10 hover:bg-white/5">
          <Trophy className="w-3 h-3 mr-1.5" /> Prizes
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl bg-background border-t border-white/5 px-6 pb-10">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-black uppercase italic text-center">Prize Pool Details</SheetTitle>
        </SheetHeader>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[1, 2, 3, 4, 5].map((pos) => (
            <div key={pos} className="p-3 rounded-xl bg-muted/50 border border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Pos {pos}</span>
              <span className="font-bold text-sm">{(prizes as any)[`p${pos}`] || 0} TK</span>
            </div>
          ))}
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-primary">Per Kill</span>
            <span className="font-bold text-sm text-primary">{tournament.perKill || 0} TK</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-primary flex items-center justify-between shadow-lg">
          <span className="text-sm font-black uppercase italic text-white">Total Prize</span>
          <span className="text-xl font-black text-white">{tournament.prizePool || 0} TK</span>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function PlayPage() {
  const db = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');

  const tournamentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'), limit(20));
  }, [db]);

  const { data: tournaments, loading } = useCollection<any>(tournamentsQuery);

  const filteredTournaments = tournaments?.filter(t => 
    t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.matchId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md z-50 border-b border-white/5">
        <Link href="/" className="p-2 -ml-2 text-white">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-black uppercase italic tracking-tighter">Active <span className="text-primary">Arenas</span></h1>
        <Button variant="outline" size="sm" className="bg-secondary/50 border-white/5 rounded-full text-[10px] font-bold h-7 px-3">
          <Globe className="w-3 h-3 mr-1.5" />
          বাংলা
        </Button>
      </header>

      <main className="p-6 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by ID or Title..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 bg-muted/30 border-white/5 h-11 rounded-xl text-sm" 
          />
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Syncing Arenas...</p>
            </div>
          ) : filteredTournaments?.length === 0 ? (
            <div className="text-center py-20 bg-muted/10 rounded-3xl border border-white/5 border-dashed">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No Battlefields Detected</p>
            </div>
          ) : filteredTournaments?.map((t) => (
            <Card key={t.id} className="border-white/5 bg-card overflow-hidden rounded-2xl shadow-xl">
              <div className="p-5 space-y-5">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                      <Gamepad2 className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase italic tracking-tight leading-none mb-1">
                        {t.title} <span className="text-primary ml-1">{t.mode}</span>
                      </h3>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-green-500 uppercase">
                        <Calendar className="w-3 h-3" />
                        {t.startTime ? format(new Date(t.startTime), 'dd MMM, hh:mm a') : 'TBA'}
                      </div>
                    </div>
                  </div>
                  <div className="bg-primary text-white font-black text-[10px] py-1 px-3 rounded-lg">
                    {t.matchId || '#----'}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'FEE', val: `${t.entryFee} TK`, icon: Wallet },
                    { label: 'PRIZE', val: `${t.prizePool} TK`, icon: Trophy },
                    { label: 'KILL', val: `${t.perKill} TK`, icon: Skull },
                    { label: 'MAP', val: t.map, icon: MapIcon },
                    { label: 'VER', val: t.version, icon: Monitor },
                    { label: 'TYPE', val: t.mode, icon: Layers },
                  ].map((stat, i) => (
                    <div key={i} className="bg-muted/30 rounded-lg p-2 flex flex-col items-center justify-center border border-white/5">
                      <span className="text-[7px] font-bold uppercase text-muted-foreground mb-0.5">{stat.label}</span>
                      <span className="text-[10px] font-black truncate w-full text-center">{stat.val}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                     <span className="text-[9px] font-bold uppercase text-muted-foreground">Registered Players</span>
                     <span className="text-[10px] font-black">{t.currentPlayers}/{t.maxPlayers}</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500" 
                      style={{ width: `${Math.min(100, (t.currentPlayers / t.maxPlayers) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button disabled={t.currentPlayers >= t.maxPlayers} className="w-full h-11 rounded-xl font-black uppercase italic tracking-wider text-xs">
                    {t.currentPlayers >= t.maxPlayers ? <><Lock className="w-3.5 h-3.5 mr-2" /> Match Full</> : 'Join Match'}
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" className="h-9 rounded-lg text-[10px] font-bold uppercase flex-1 border-white/10 hover:bg-white/5">Slots</Button>
                    <Button variant="outline" className="h-9 rounded-lg text-[10px] font-bold uppercase flex-1 border-white/10 hover:bg-white/5">Room</Button>
                    <PrizeDistributionSheet tournament={t} />
                  </div>
                </div>
              </div>

              <CountdownTimer startTime={t.startTime} />
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
