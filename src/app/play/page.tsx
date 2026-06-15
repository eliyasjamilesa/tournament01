
"use client";

import { useState, useEffect } from 'react';
import { 
  Timer, 
  Users, 
  Trophy, 
  Search, 
  Filter, 
  Map as MapIcon, 
  Skull, 
  Wallet,
  Gamepad2,
  Calendar,
  Layers,
  Monitor
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

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
    <div className="w-full bg-[#00c853] py-2 flex items-center justify-center">
      <span className="text-white text-[12px] font-black uppercase tracking-widest">{timeLeft}</span>
    </div>
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
    <div className="p-6 space-y-6">
      <header className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-headline font-bold uppercase tracking-tight">Active <span className="text-primary">Arenas</span></h1>
          <Badge className="bg-primary/10 text-primary border-primary/20">{tournaments?.length || 0} Lobbies</Badge>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by ID or Title..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card border-white/5 h-11 rounded-xl" 
            />
          </div>
          <Button variant="outline" size="icon" className="border-white/5 bg-card h-11 w-11 rounded-xl">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Timer className="w-10 h-10 animate-spin text-primary" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Loading Matches...</p>
          </div>
        ) : filteredTournaments?.map((t) => (
          <Card key={t.id} className="border-white/5 bg-[#0a0a0a] overflow-hidden shadow-2xl relative">
            {/* Match Header */}
            <div className="p-4 bg-gradient-to-r from-[#111] to-background flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl border border-white/5 bg-[#111] flex items-center justify-center overflow-hidden">
                   <div className="magma-gradient w-full h-full flex items-center justify-center">
                      <Gamepad2 className="text-white w-6 h-6" />
                   </div>
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold uppercase tracking-tight">{t.title} | {t.mode}</h3>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                    <Calendar className="w-3 h-3 text-[#00c853]" />
                    {t.startTime ? format(new Date(t.startTime), 'dd MMM yyyy hh:mm a') : 'TBA'}
                  </div>
                </div>
              </div>
              <Badge className="bg-primary text-white font-black text-[11px] h-6 px-3 border-none">
                {t.matchId || '#----'}
              </Badge>
            </div>

            {/* Stats Grid */}
            <CardContent className="p-4 space-y-6">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center justify-center border border-white/5">
                  <Wallet className="w-4 h-4 text-primary mb-1.5" />
                  <span className="text-[8px] font-black uppercase text-muted-foreground">Fee</span>
                  <span className="text-xs font-black uppercase">{t.entryFee} TK</span>
                </div>
                <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center justify-center border border-white/5">
                  <Trophy className="w-4 h-4 text-yellow-500 mb-1.5" />
                  <span className="text-[8px] font-black uppercase text-muted-foreground">Prize</span>
                  <span className="text-xs font-black uppercase">{t.prizePool} TK</span>
                </div>
                <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center justify-center border border-white/5">
                  <Skull className="w-4 h-4 text-red-500 mb-1.5" />
                  <span className="text-[8px] font-black uppercase text-muted-foreground">Kill</span>
                  <span className="text-xs font-black uppercase">{t.perKill} TK</span>
                </div>
                <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center justify-center border border-white/5">
                  <Layers className="w-4 h-4 text-primary mb-1.5" />
                  <span className="text-[8px] font-black uppercase text-muted-foreground">Type</span>
                  <span className="text-xs font-black uppercase">{t.mode}</span>
                </div>
                <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center justify-center border border-white/5">
                  <MapIcon className="w-4 h-4 text-[#00c853] mb-1.5" />
                  <span className="text-[8px] font-black uppercase text-muted-foreground">Map</span>
                  <span className="text-xs font-black uppercase truncate w-full text-center">{t.map}</span>
                </div>
                <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center justify-center border border-white/5">
                  <Monitor className="w-4 h-4 text-blue-500 mb-1.5" />
                  <span className="text-[8px] font-black uppercase text-muted-foreground">Ver</span>
                  <span className="text-xs font-black uppercase">{t.version}</span>
                </div>
              </div>

              {/* Registration Progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                   <div className="flex items-center gap-1.5 text-primary">
                     <Users className="w-3 h-3" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Registration</span>
                   </div>
                   <span className="text-[10px] font-black text-white">{t.currentPlayers}/{t.maxPlayers}</span>
                </div>
                <Progress value={(t.currentPlayers / t.maxPlayers) * 100} className="h-1.5 bg-white/5" />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                 <Button className={`w-full h-11 rounded-xl font-black uppercase italic tracking-widest text-sm shadow-xl transition-all active:scale-95 ${t.currentPlayers >= t.maxPlayers ? 'bg-secondary text-muted-foreground grayscale cursor-not-allowed' : 'magma-gradient border-none'}`}>
                   {t.currentPlayers >= t.maxPlayers ? 'Match Full' : 'Join Arena'}
                 </Button>
                 
                 <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" className="h-10 bg-white/5 border-white/5 rounded-xl text-[10px] font-black uppercase italic">Slots</Button>
                    <Button variant="outline" className="h-10 bg-white/5 border-white/5 rounded-xl text-[10px] font-black uppercase italic">Room</Button>
                    <Button variant="outline" className="h-10 bg-white/5 border-white/5 rounded-xl text-[10px] font-black uppercase italic">Prizes</Button>
                 </div>
              </div>
            </CardContent>

            {/* Sticky Timer Footer */}
            <CountdownTimer startTime={t.startTime} />
          </Card>
        ))}
      </div>
    </div>
  );
}
