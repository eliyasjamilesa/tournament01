
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
  Medal
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
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft(`Starts In: ${hours > 0 ? hours + 'h ' : ''}${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="w-full bg-[#00c853]/10 border-t border-green-500/20 py-2.5 flex items-center justify-center">
      <span className="text-[#00c853] text-[11px] font-black uppercase tracking-widest">{timeLeft}</span>
    </div>
  );
}

function PrizeDistributionSheet({ tournament }: { tournament: any }) {
  const prizes = tournament.prizes || {};
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-10 bg-white/5 border-white/5 rounded-xl text-[10px] font-black uppercase italic flex-1">
          Prizes
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl bg-background border-t border-white/5 px-6 pb-10">
        <SheetHeader className="mb-6">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl magma-gradient flex items-center justify-center shadow-lg shadow-primary/20">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <SheetTitle className="text-xl font-headline font-black uppercase italic">Match Prizes</SheetTitle>
          </div>
        </SheetHeader>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-500 font-black">1</div>
                <span className="text-xs font-bold uppercase">1st Winner</span>
              </div>
              <span className="text-yellow-500 font-black">{prizes.p1 || 0}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-400/20 flex items-center justify-center text-slate-400 font-black">2</div>
                <span className="text-xs font-bold uppercase">2nd Position</span>
              </div>
              <span className="text-slate-400 font-black">{prizes.p2 || 0}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-700/20 flex items-center justify-center text-orange-700 font-black">3</div>
                <span className="text-xs font-bold uppercase">3rd Position</span>
              </div>
              <span className="text-orange-700 font-black">{prizes.p3 || 0}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500 font-black">4</div>
                <span className="text-xs font-bold uppercase">4th Position</span>
              </div>
              <span className="text-blue-500 font-black">{prizes.p4 || 0}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-500 font-black">5</div>
                <span className="text-xs font-bold uppercase">5th Position</span>
              </div>
              <span className="text-green-500 font-black">{prizes.p5 || 0}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500">
                  <Skull className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase">Per Kill</span>
              </div>
              <span className="text-red-500 font-black">{tournament.perKill || 0}</span>
            </div>
          </div>

          <div className="mt-6 p-5 rounded-2xl magma-gradient flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-white" />
              <span className="text-sm font-black uppercase italic text-white">Total Prize</span>
            </div>
            <span className="text-xl font-black text-white">{tournament.prizePool || 0} TK</span>
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
    <div className="p-6 space-y-6 pb-24">
      <header className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-headline font-bold uppercase tracking-tight">Active <span className="text-primary">Arenas</span></h1>
          <Badge className="bg-primary/10 text-primary border-primary/20">{tournaments?.length || 0} Lobbies</Badge>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by ID or Title..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card border-white/5 h-11 rounded-xl" 
          />
        </div>
      </header>

      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Syncing Matches...</p>
          </div>
        ) : filteredTournaments?.length === 0 ? (
          <div className="text-center py-20 bg-card/20 rounded-3xl border border-white/5">
            <Info className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No Matches Found</p>
          </div>
        ) : filteredTournaments?.map((t) => (
          <Card key={t.id} className="border-white/5 bg-[#0a0a0a] overflow-hidden shadow-2xl relative">
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                    <div className="magma-gradient w-full h-full flex items-center justify-center">
                      <Gamepad2 className="text-white w-7 h-7" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase italic tracking-tight flex items-center gap-1.5">
                      {t.title} <span className="text-muted-foreground font-normal">|</span> <span className="text-primary">{t.mode}</span>
                    </h3>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase leading-tight">ম্যাচ এ জয়েন করার আগে রুলস পরে নেন।</span>
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-green-500 uppercase">
                        <Calendar className="w-3 h-3" />
                        {t.startTime ? format(new Date(t.startTime), 'dd MMM yyyy hh:mm a') : 'TBA'}
                      </div>
                    </div>
                  </div>
                </div>
                <Badge className="bg-primary text-white font-black text-[11px] h-6 px-3 border-none rounded-lg self-start">
                  {t.matchId || '#----'}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'FEE', val: `${t.entryFee} TK`, icon: Wallet, color: 'text-primary' },
                  { label: 'PRIZE', val: `${t.prizePool} TK`, icon: Trophy, color: 'text-yellow-500' },
                  { label: 'KILL', val: `${t.perKill} TK`, icon: Skull, color: 'text-red-500' },
                  { label: 'TYPE', val: t.mode, icon: Layers, color: 'text-blue-500' },
                  { label: 'MAP', val: t.map, icon: MapIcon, color: 'text-[#00c853]' },
                  { label: 'VER', val: t.version, icon: Monitor, color: 'text-purple-500' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/[0.03] rounded-2xl p-3 flex flex-col items-center justify-center border border-white/5 transition-all hover:bg-white/[0.06]">
                    <stat.icon className={`w-3.5 h-3.5 ${stat.color} mb-1.5`} />
                    <span className="text-[7px] font-black uppercase text-muted-foreground tracking-widest">{stat.label}</span>
                    <span className="text-[10px] font-black uppercase truncate w-full text-center">{stat.val}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                   <div className="flex items-center gap-1.5 text-primary">
                     <Users className="w-3 h-3" />
                     <span className="text-[9px] font-black uppercase tracking-widest">Registration</span>
                   </div>
                   <span className="text-[10px] font-black text-white">{t.currentPlayers}/{t.maxPlayers}</span>
                </div>
                <Progress value={(t.currentPlayers / t.maxPlayers) * 100} className="h-2 bg-white/5 rounded-full" />
              </div>

              <div className="flex flex-col gap-2.5">
                <Button className={`w-full h-11 rounded-xl font-black uppercase italic tracking-widest text-sm shadow-xl transition-all active:scale-95 ${t.currentPlayers >= t.maxPlayers ? 'bg-secondary text-muted-foreground' : 'magma-gradient border-none'}`}>
                  {t.currentPlayers >= t.maxPlayers ? 'Match Full' : 'Join Arena'}
                </Button>
                
                <div className="flex gap-2">
                  <Button variant="outline" className="h-10 bg-white/5 border-white/5 rounded-xl text-[10px] font-black uppercase italic flex-1">Slots</Button>
                  <Button variant="outline" className="h-10 bg-white/5 border-white/5 rounded-xl text-[10px] font-black uppercase italic flex-1">Room</Button>
                  <PrizeDistributionSheet tournament={t} />
                </div>
              </div>
            </div>

            <CountdownTimer startTime={t.startTime} />
          </Card>
        ))}
      </div>
    </div>
  );
}
