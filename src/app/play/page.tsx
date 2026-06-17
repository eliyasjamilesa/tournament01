
"use client";

import { useState, useEffect } from 'react';
import { 
  Users, Trophy, Search, Map as MapIcon, Skull, Wallet, Gamepad2, Calendar, Layers, Monitor, ArrowLeft, Globe, Lock, Loader2, Key, CheckCircle2, AlertCircle, Check
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, orderBy, limit, doc, setDoc, increment, updateDoc, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

function CountdownTimer({ startTime }: { startTime: string }) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  useEffect(() => {
    const target = new Date(startTime).getTime();
    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = target - now;
      if (difference <= 0) { setTimeLeft('MATCH STARTED'); return; }
      const mins = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft(`STARTS IN: ${mins}M ${secs}S`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime]);
  return <div className="w-full bg-green-600 py-2.5 flex items-center justify-center"><span className="text-white text-[10px] font-black uppercase tracking-widest">{timeLeft}</span></div>;
}

function PrizeDistributionSheet({ tournament }: { tournament: any }) {
  const prizes = tournament.prizes || {};
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-9 rounded-lg text-[10px] font-bold uppercase flex-1 border-white/10 hover:bg-white/5"><Trophy className="w-3 h-3 mr-1.5" /> Prizes</Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl bg-background border-t border-white/5 px-6 pb-10">
        <SheetHeader className="mb-6"><SheetTitle className="text-xl font-black uppercase italic text-center">Prize Pool Details</SheetTitle></SheetHeader>
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
        <div className="p-5 rounded-2xl bg-primary flex items-center justify-between shadow-lg"><span className="text-sm font-black uppercase italic text-white">Total Prize</span><span className="text-xl font-black text-white">{tournament.prizePool || 0} TK</span></div>
      </SheetContent>
    </Sheet>
  );
}

function RoomDetailsSheet({ tournament }: { tournament: any }) {
  const { user } = useUser();
  const db = useFirestore();
  const regDocRef = useMemoFirebase(() => {
    if (!db || !user || !tournament.id) return null;
    return doc(db, 'tournaments', tournament.id, 'registrations', user.uid);
  }, [db, user, tournament.id]);

  const { data: registration } = useDoc<any>(regDocRef);
  const isJoined = !!registration;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-9 rounded-lg text-[10px] font-bold uppercase flex-1 border-white/10 hover:bg-white/5"><Key className="w-3 h-3 mr-1.5" /> Room</Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-[2.5rem] bg-[#0d0d0d] border-t border-white/5 px-8 pb-12">
        <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-8" />
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
             <Key className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black uppercase italic tracking-tight">Room Details</h2>
        </div>

        {!isJoined ? (
          <div className="bg-card/50 border border-white/5 rounded-3xl p-10 flex flex-col items-center text-center gap-4">
             <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20 mb-2">
                <Lock className="w-8 h-8 text-destructive" />
             </div>
             <h3 className="text-xl font-black uppercase italic text-destructive">Access Denied</h3>
             <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest max-w-[200px]">You&apos;re not joined on this match</p>
          </div>
        ) : (
          <div className="space-y-6">
            {!tournament.roomId ? (
              <div className="p-8 rounded-3xl bg-muted/20 border border-white/5 flex flex-col items-center text-center gap-3">
                <AlertCircle className="w-10 h-10 text-primary animate-pulse" />
                <p className="text-sm font-black uppercase italic text-primary">Standby Warrior!</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Room ID & Password will be shared 5-10 minutes before the match starts.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-muted/40 border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Room ID</span>
                    <span className="text-2xl font-black tracking-tighter text-white font-mono">{tournament.roomId}</span>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase bg-white/5 border-none" onClick={() => { navigator.clipboard.writeText(tournament.roomId); }}>Copy</Button>
                </div>
                <div className="p-6 rounded-2xl bg-muted/40 border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Password</span>
                    <span className="text-2xl font-black tracking-tighter text-white font-mono">{tournament.roomPassword}</span>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase bg-white/5 border-none" onClick={() => { navigator.clipboard.writeText(tournament.roomPassword); }}>Copy</Button>
                </div>
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <p className="text-[10px] font-bold text-green-500 uppercase">You are an authorized player for this room.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function TournamentCard({ tournament, onJoin, joining }: { tournament: any, onJoin: (t: any) => void, joining: string | null }) {
  const { user } = useUser();
  const db = useFirestore();
  const regDocRef = useMemoFirebase(() => {
    if (!db || !user || !tournament.id) return null;
    return doc(db, 'tournaments', tournament.id, 'registrations', user.uid);
  }, [db, user, tournament.id]);

  const { data: registration } = useDoc<any>(regDocRef);
  const isJoined = !!registration;

  return (
    <Card key={tournament.id} className="border-white/5 bg-card overflow-hidden rounded-2xl shadow-xl">
      <div className="p-5 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/10">
              <Gamepad2 className="text-white w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase italic tracking-tight leading-none mb-1">{tournament.title} <span className="text-primary ml-1">{tournament.mode}</span></h3>
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-green-500 uppercase">
                <Calendar className="w-3 h-3" />
                {tournament.startTime ? format(new Date(tournament.startTime), 'dd MMM, hh:mm a') : 'TBA'}
              </div>
            </div>
          </div>
          <div className="bg-primary text-white font-black text-[10px] py-1 px-3 rounded-lg shadow-lg">
            {tournament.matchId || '#----'}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[ 
            { label: 'FEE', val: `${tournament.entryFee} TK`, icon: Wallet }, 
            { label: 'PRIZE', val: `${tournament.prizePool} TK`, icon: Trophy }, 
            { label: 'KILL', val: `${tournament.perKill} TK`, icon: Skull }, 
            { label: 'MAP', val: tournament.map, icon: MapIcon }, 
            { label: 'VER', val: tournament.version, icon: Monitor }, 
            { label: 'TYPE', val: tournament.mode, icon: Layers } 
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
            <span className="text-[10px] font-black">{tournament.currentPlayers}/{tournament.maxPlayers}</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500" 
              style={{ width: `${Math.min(100, (tournament.currentPlayers / (tournament.maxPlayers || 48)) * 100)}%` }} 
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button 
            onClick={() => !isJoined && onJoin(tournament)} 
            disabled={(!isJoined && tournament.currentPlayers >= tournament.maxPlayers) || joining === tournament.id} 
            className={cn(
              "w-full h-11 rounded-xl font-black uppercase italic tracking-wider text-xs shadow-lg transition-all active:scale-95",
              isJoined ? "bg-green-600 hover:bg-green-700 border-none cursor-default" : "magma-gradient"
            )}
          >
            {joining === tournament.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isJoined ? (
              <><Check className="w-4 h-4 mr-2" /> JOINED</>
            ) : tournament.currentPlayers >= tournament.maxPlayers ? (
              <><Lock className="w-3.5 h-3.5 mr-2" /> Match Full</>
            ) : (
              'Join Match'
            )}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="h-9 rounded-lg text-[10px] font-bold uppercase flex-1 border-white/10 hover:bg-white/5">Slots</Button>
            <RoomDetailsSheet tournament={tournament} />
            <PrizeDistributionSheet tournament={tournament} />
          </div>
        </div>
      </div>
      <CountdownTimer startTime={tournament.startTime} />
    </Card>
  );
}

export default function PlayPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [joining, setJoining] = useState<string | null>(null);

  const tournamentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'), limit(20));
  }, [db]);

  const { data: tournaments, loading } = useCollection<any>(tournamentsQuery);

  const handleJoin = async (tournament: any) => {
    if (!db || !user) { 
      toast({ title: "Login Required", description: "Please login to join matches." }); 
      return; 
    }
    
    setJoining(tournament.id);
    try {
      const regRef = doc(db, 'tournaments', tournament.id, 'registrations', user.uid);
      await setDoc(regRef, {
        uid: user.uid,
        displayName: user.displayName || 'Player',
        timestamp: serverTimestamp()
      });
      const tRef = doc(db, 'tournaments', tournament.id);
      await updateDoc(tRef, { currentPlayers: increment(1) });
      toast({ title: "Joined Successfully!", description: "Check My Arena for match updates." });
    } finally {
      setJoining(null);
    }
  };

  const filteredTournaments = tournaments?.filter(t => 
    t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.matchId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md z-50 border-b border-white/5">
        <Link href="/" className="p-2 -ml-2 text-white"><ArrowLeft className="w-6 h-6" /></Link>
        <h1 className="text-lg font-black uppercase italic tracking-tighter">Active <span className="text-primary">Arenas</span></h1>
        <Button variant="outline" size="sm" className="bg-secondary/50 border-white/5 rounded-full text-[10px] font-bold h-7 px-3"><Globe className="w-3 h-3 mr-1.5" />বাংলা</Button>
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
            <TournamentCard 
              key={t.id} 
              tournament={t} 
              onJoin={handleJoin} 
              joining={joining} 
            />
          ))}
        </div>
      </main>
    </div>
  );
}
