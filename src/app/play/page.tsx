
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
  ChevronRight,
  Info,
  Medal,
  ArrowLeft,
  Globe,
  Lock,
  Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Link from 'next/link';

function CountdownTimer({ startTime }: { startTime: string }) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const target = new Date(startTime).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = target - now;
      if (difference <= 0) {
        setTimeLeft('Match Started');
        clearInterval(interval);
        return;
      }
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft(`Starts In: ${minutes} Minute ${seconds} Second`);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="w-full bg-[#00c853] py-3 flex items-center justify-center">
      <span className="text-white text-[12px] font-black uppercase tracking-widest">{timeLeft}</span>
    </div>
  );
}

function PrizeDistributionSheet({ tournament }: { tournament: any }) {
  const prizes = tournament.prizes || {};
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="destructive" className="h-10 rounded-xl text-[10px] font-black uppercase italic flex-1 gap-1">
          <Trophy className="w-3 h-3" /> Prizes
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-[2.5rem] bg-background border-t border-white/5 px-6 pb-12">
        <SheetHeader className="mb-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl magma-gradient flex items-center justify-center shadow-2xl shadow-primary/30">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <SheetTitle className="text-2xl font-black uppercase italic tracking-tighter">Match Prize Pool</SheetTitle>
          </div>
        </SheetHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5].map((pos) => (
              <div key={pos} className="p-4 rounded-2xl bg-[#0d0d0d] border border-white/5 flex items-center justify-between group hover:border-primary/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${pos === 1 ? 'bg-yellow-500/20 text-yellow-500' : pos === 2 ? 'bg-slate-400/20 text-slate-400' : 'bg-primary/20 text-primary'}`}>
                    {pos}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pos {pos}</span>
                </div>
                <span className="font-black text-sm text-foreground">{(prizes as any)[`p${pos}`] || 0} TK</span>
              </div>
            ))}
            <div className="p-4 rounded-2xl bg-[#0d0d0d] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500">
                  <Skull className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Per Kill</span>
              </div>
              <span className="font-black text-sm text-red-500">{tournament.perKill || 0} TK</span>
            </div>
          </div>

          <div className="mt-8 p-6 rounded-3xl magma-gradient flex items-center justify-between shadow-2xl shadow-primary/20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-black uppercase italic text-white tracking-widest">Total Reward</span>
            </div>
            <span className="text-2xl font-black text-white">{tournament.prizePool || 0} TK</span>
          </div>
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
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.matchId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="px-6 pt-8 pb-6 flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur-xl z-50 border-b border-white/5">
        <Link href="/" className="p-2 -ml-2 text-white hover:bg-white/5 rounded-full transition-all">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        
        <h1 className="text-xl font-black uppercase italic tracking-tighter">Active <span className="text-primary">Arenas</span></h1>

        <Button variant="outline" size="sm" className="bg-[#1a1a1a]/80 border-white/5 rounded-full text-[10px] font-bold h-7 px-3 gap-1.5">
          <Globe className="w-3 h-3 text-primary" />
          বাংলা
        </Button>
      </header>

      <main className="p-6 space-y-8">
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <Input 
            placeholder="Search by ID or Title..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 bg-[#0d0d0d] border-white/5 h-12 rounded-2xl text-sm font-medium placeholder:text-muted-foreground/30 focus:ring-primary/20" 
          />
        </div>

        <div className="space-y-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Syncing Tactical Grid...</p>
            </div>
          ) : filteredTournaments?.length === 0 ? (
            <div className="text-center py-20 bg-[#0d0d0d]/40 rounded-[2.5rem] border border-white/5 border-dashed">
              <Info className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">No Battlefields Detected</p>
            </div>
          ) : filteredTournaments?.map((t) => (
            <Card key={t.id} className="border-white/5 bg-[#0a0a0a] overflow-hidden rounded-[2.5rem] shadow-2xl group transition-all hover:border-primary/20">
              <div className="p-6 pb-4 space-y-6">
                <div className="flex items-start justify-between relative">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 p-1">
                      <div className="w-full h-full magma-gradient rounded-xl flex items-center justify-center shadow-lg">
                        <Gamepad2 className="text-white w-8 h-8" />
                      </div>
                    </div>
                    <div className="space-y-2 max-w-[200px]">
                      <h3 className="text-sm font-black uppercase italic tracking-tight leading-none group-hover:text-primary transition-colors">
                        {t.title} <span className="text-muted-foreground font-normal">|</span> <span className="text-primary">{t.mode}</span>
                      </h3>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase leading-relaxed">
                        🚫 ম্যাচ এ জয়েন করার আগে রুলস পরে নেন। <br />
                        🚫 রুলস ফলো না করলে রিওয়ার্ড দেয়া হবে না & রিফান্ড পাবেন না
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-black text-[#00c853] uppercase tracking-tighter">
                        <Calendar className="w-3.5 h-3.5" />
                        {t.startTime ? format(new Date(t.startTime), 'dd MMM yyyy hh:mm a') : 'TBA'}
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-6 -right-6">
                     <div className="bg-primary text-white font-black text-[11px] py-1.5 px-6 rounded-bl-3xl shadow-lg">
                       {t.matchId || '#----'}
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'FEE', val: `${t.entryFee} TK`, icon: Wallet, color: 'text-primary' },
                    { label: 'PRIZE', val: `${t.prizePool} TK`, icon: Trophy, color: 'text-yellow-500' },
                    { label: 'KILL', val: `${t.perKill} TK`, icon: Skull, color: 'text-red-500' },
                    { label: 'TYPE', val: t.mode, icon: Layers, color: 'text-blue-500' },
                    { label: 'MAP', val: t.map, icon: MapIcon, color: 'text-[#00c853]' },
                    { label: 'VER', val: t.version, icon: Monitor, color: 'text-purple-500' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/[0.03] rounded-2xl py-4 flex flex-col items-center justify-center border border-white/5 transition-all hover:bg-white/[0.06]">
                      <stat.icon className={`w-4 h-4 ${stat.color} mb-2`} />
                      <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">{stat.label}</span>
                      <span className="text-[11px] font-black uppercase truncate w-full text-center mt-0.5">{stat.val}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                     <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.1em] text-[10px]">
                       <Users className="w-4 h-4" /> Registration
                     </div>
                     <span className="text-[11px] font-black text-white tracking-widest">{t.currentPlayers}/{t.maxPlayers}</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full magma-gradient transition-all duration-1000" 
                      style={{ width: `${(t.currentPlayers / t.maxPlayers) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button disabled={t.currentPlayers >= t.maxPlayers} className={`w-full h-14 rounded-2xl font-black uppercase italic tracking-[0.2em] text-sm shadow-2xl transition-all active:scale-95 ${t.currentPlayers >= t.maxPlayers ? 'bg-secondary text-muted-foreground' : 'magma-gradient border-none'}`}>
                    {t.currentPlayers >= t.maxPlayers ? <span className="flex items-center gap-2"><Lock className="w-4 h-4" /> Match Full</span> : 'Join Arena'}
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button variant="destructive" className="h-10 rounded-xl text-[10px] font-black uppercase italic flex-1 gap-1">
                      <Users className="w-3 h-3" /> Slots
                    </Button>
                    <Button variant="destructive" className="h-10 rounded-xl text-[10px] font-black uppercase italic flex-1 gap-1">
                      <Gamepad2 className="w-3 h-3" /> Room
                    </Button>
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
