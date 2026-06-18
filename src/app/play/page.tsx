
"use client";

import { useState, useEffect, useMemo, Suspense } from 'react';
import { 
  Trophy, Search, Map as MapIcon, Skull, Wallet, Gamepad2, Calendar, Layers, Monitor, ArrowLeft, Lock, Loader2, Key, CheckCircle2, AlertCircle, Check, Clock, Swords
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, orderBy, limit, doc } from 'firebase/firestore';
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useSearchParams, useRouter } from 'next/navigation';

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
  return <div className="w-full bg-green-600 py-2 flex items-center justify-center border-t border-white/5"><span className="text-white text-[10px] font-black uppercase tracking-widest">{timeLeft}</span></div>;
}

function SlotsSheet({ tournament }: { tournament: any }) {
  const { user } = useUser();
  const db = useFirestore();
  
  const regDocRef = useMemoFirebase(() => {
    if (!db || !user || !tournament.id) return null;
    return doc(db, 'tournaments', tournament.id, 'registrations', user.uid);
  }, [db, user, tournament.id]);

  const { data: registration } = useDoc<any>(regDocRef);
  const isJoined = !!registration;

  const registrationsQuery = useMemoFirebase(() => {
    if (!db || !tournament.id) return null;
    return collection(db, 'tournaments', tournament.id, 'registrations');
  }, [db, tournament.id]);

  const { data: slots, loading: slotsLoading } = useCollection<any>(registrationsQuery);

  const slotConfig = useMemo(() => {
    if (!tournament) return { total: 48, perGroup: 1, type: 'SOLO' };
    const mode = (tournament.mode || '').toUpperCase();
    if (mode === 'BR SOLO') return { total: 48, perGroup: 1, type: 'SOLO' };
    if (mode === 'BR DUO') return { total: 48, perGroup: 2, type: 'DUO' };
    if (mode === 'BR SQUAD') return { total: 48, perGroup: 4, type: 'SQUAD' };
    if (mode.includes('CS')) return { total: 8, perGroup: 4, type: 'TEAM' };
    if (mode.includes('LW 1V1') || mode === 'LW HEADSHOT') return { total: 2, perGroup: 1, type: 'TEAM' };
    if (mode.includes('LW 2V2')) return { total: 4, perGroup: 2, type: 'TEAM' };
    return { total: 48, perGroup: 1, type: 'SOLO' };
  }, [tournament]);

  const findSlotData = (slotNum: number) => {
    return slots?.find((s: any) => s.slotNumber === slotNum);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-9 rounded-lg text-[10px] font-bold uppercase flex-1 border-white/10 hover:bg-white/5">Slots</Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-[2.5rem] bg-[#050505] border-t border-red-500/20 px-4 pb-10 overflow-y-auto no-scrollbar">
        <SheetHeader className="sr-only">
          <SheetTitle>Tournament Slots - {tournament.matchId}</SheetTitle>
          <SheetDescription>View registered players for this match.</SheetDescription>
        </SheetHeader>
        
        <div className="flex justify-center mb-6 pt-4">
          <div className="bg-red-600 text-white px-6 py-1.5 rounded-full text-xs font-black tracking-widest shadow-lg shadow-red-600/20">
            {tournament.matchId || '#-----'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-red-500/10 border border-red-500/20 rounded-2xl overflow-hidden mb-8">
          {[
            { label: 'Match Type', val: tournament.mode, icon: Gamepad2 },
            { label: 'Date', val: tournament.startTime ? format(new Date(tournament.startTime), 'dd MMM yyyy') : 'TBA', icon: Calendar },
            { label: 'Time', val: tournament.startTime ? format(new Date(tournament.startTime), 'hh:mm a') : 'TBA', icon: Clock },
            { label: 'Entry Fee', val: `${tournament.entryFee} TK`, icon: Wallet }
          ].map((item, i) => (
            <div key={i} className="bg-black/40 p-5 flex flex-col items-center justify-center gap-1.5">
              <div className="flex items-center gap-1.5">
                <item.icon className="w-3.5 h-3.5 text-red-500" />
                <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">{item.label}</span>
              </div>
              <span className="text-xs font-black uppercase text-white tracking-tight">{item.val}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6 px-2">
           <h3 className="text-lg font-black uppercase italic text-white">Slots List</h3>
           <span className="text-[10px] font-bold text-muted-foreground uppercase">{tournament.currentPlayers} Joined</span>
        </div>

        <div className="min-h-[400px] border border-white/5 rounded-[2rem] bg-card/20 flex flex-col p-4 space-y-6">
          {!isJoined ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-20">
              <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-2">
                <Lock className="w-10 h-10 text-red-600" />
              </div>
              <h4 className="text-2xl font-black uppercase italic text-red-600 tracking-tight">Not Joined</h4>
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Join match to view players</p>
            </div>
          ) : slotsLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-red-500" /></div>
          ) : (
            <div className="space-y-6">
              {Array.from({ length: Math.ceil(slotConfig.total / slotConfig.perGroup) }).map((_, groupIndex) => (
                <div key={groupIndex} className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                      {slotConfig.type} {groupIndex + 1}
                    </span>
                    <div className="h-px flex-1 bg-white/5 ml-3" />
                  </div>
                  <div className="grid grid-cols-1 gap-2 p-1">
                    {Array.from({ length: slotConfig.perGroup }).map((_, i) => {
                      const slotNum = (groupIndex * slotConfig.perGroup) + i + 1;
                      if (slotNum > slotConfig.total) return null;
                      const player = findSlotData(slotNum);
                      
                      return (
                        <div key={slotNum} className={cn(
                          "flex items-center justify-between p-4 rounded-xl border transition-all",
                          player ? "bg-white/5 border-white/10" : "bg-black/20 border-white/5 opacity-40"
                        )}>
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-red-500 w-6">#{slotNum}</span>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white uppercase tracking-tight">
                                {player ? (player.ingameName || player.displayName) : 'Empty Slot'}
                              </span>
                              {player && (
                                <span className="text-[8px] text-muted-foreground font-mono">ID: {player.ingameId || '---'}</span>
                              )}
                            </div>
                          </div>
                          {player && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function PrizeDistributionSheet({ tournament }: { tournament: any }) {
  const prizes = tournament.prizes || {};
  
  const activePrizes = [1, 2, 3, 4, 5]
    .map(pos => ({ pos, amount: (prizes as any)[`p${pos}`] || 0 }))
    .filter(item => item.amount > 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-9 rounded-lg text-[10px] font-bold uppercase flex-1 border-white/10 hover:bg-white/5"><Trophy className="w-3 h-3 mr-1.5" /> Prizes</Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl bg-background border-t border-white/5 px-4 pb-10">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-black uppercase italic text-center">Prize Pool Details</SheetTitle>
          <SheetDescription className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rank-wise distribution of the total pool.</SheetDescription>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {activePrizes.map((item) => (
            <div key={item.pos} className="p-3 rounded-xl bg-muted/50 border border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Pos {item.pos}</span>
              <span className="font-bold text-sm">{item.amount} TK</span>
            </div>
          ))}
          {Number(tournament.perKill || 0) > 0 && (
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-primary">Per Kill</span>
              <span className="font-bold text-sm text-primary">{tournament.perKill || 0} TK</span>
            </div>
          )}
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
      <SheetContent side="bottom" className="rounded-t-[2.5rem] bg-[#0d0d0d] border-t border-white/5 px-4 pb-12">
        <SheetHeader className="sr-only">
          <SheetTitle>Room ID & Password</SheetTitle>
          <SheetDescription>Access credentials for joined players.</SheetDescription>
        </SheetHeader>
        
        <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-8" />
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-primary items-center justify-center shadow-lg shadow-primary/20 flex">
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

function TournamentCard({ tournament }: { tournament: any }) {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  
  const regDocRef = useMemoFirebase(() => {
    if (!db || !user || !tournament.id) return null;
    return doc(db, 'tournaments', tournament.id, 'registrations', user.uid);
  }, [db, user, tournament.id]);

  const { data: registration } = useDoc<any>(regDocRef);
  const isJoined = !!registration;

  return (
    <Card key={tournament.id} className="border-white/5 bg-[#0a0a0a] overflow-hidden rounded-2xl shadow-xl">
      <div className="p-5 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Gamepad2 className="text-primary w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase italic tracking-tight leading-none mb-1">{tournament.title}</h3>
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase">
                <Calendar className="w-3 h-3 text-primary" />
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
            <div key={i} className="bg-muted/10 rounded-xl p-2.5 flex flex-col items-center justify-center border border-white/5">
              <span className="text-[7px] font-bold uppercase text-muted-foreground mb-1">{stat.label}</span>
              <span className="text-[9px] font-black truncate w-full text-center text-white">{stat.val}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold uppercase text-muted-foreground">Registered Players</span>
            <span className="text-[10px] font-black">{tournament.currentPlayers}/{tournament.maxPlayers}</span>
          </div>
          <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500" 
              style={{ width: `${Math.min(100, (tournament.currentPlayers / (tournament.maxPlayers || 48)) * 100)}%` }} 
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {isJoined ? (
            <Button 
              className="w-full h-11 rounded-xl font-black uppercase italic tracking-wider text-xs shadow-lg bg-green-600 hover:bg-green-700 border-none cursor-default"
            >
              <Check className="w-4 h-4 mr-2" /> JOINED
            </Button>
          ) : (
            <Button 
              onClick={() => router.push(`/play/join?id=${tournament.id}`)}
              disabled={tournament.currentPlayers >= tournament.maxPlayers} 
              className={cn(
                "w-full h-11 rounded-xl font-black uppercase italic tracking-wider text-xs shadow-lg transition-all active:scale-95 magma-gradient"
              )}
            >
              {tournament.currentPlayers >= tournament.maxPlayers ? (
                <><Lock className="w-3.5 h-3.5 mr-2" /> Match Full</>
              ) : (
                'Join Match'
              )}
            </Button>
          )}
          <div className="flex gap-2">
            <SlotsSheet tournament={tournament} />
            <RoomDetailsSheet tournament={tournament} />
            <PrizeDistributionSheet tournament={tournament} />
          </div>
        </div>
      </div>
      <CountdownTimer startTime={tournament.startTime} />
    </Card>
  );
}

function PlayContent() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeFilter = searchParams.get('mode');
  
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const tournamentsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'), limit(50));
  }, [db, user]);

  const { data: tournaments, loading } = useCollection<any>(tournamentsQuery);

  const filteredTournaments = tournaments?.filter(t => {
    const matchesSearch = t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.matchId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMode = modeFilter ? t.mode === modeFilter : true;
    
    return matchesSearch && matchesMode;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <Swords className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary animate-pulse">Syncing Battlefields...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-32 w-full">
      <header className="px-4 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md z-50 border-b border-white/5">
        <Link href="/" className="p-2 -ml-2 text-white"><ArrowLeft className="w-6 h-6" /></Link>
        <h1 className="text-lg font-black uppercase italic tracking-tighter">
          {modeFilter ? <><span className="text-primary">{modeFilter}</span> Arenas</> : <>Active <span className="text-primary">Arenas</span></>}
        </h1>
        <div className="w-9" />
      </header>

      <main className="p-4 space-y-6 w-full">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by ID or Title..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="pl-11 bg-muted/10 border-white/5 h-11 rounded-xl text-sm" 
          />
        </div>

        <div className="space-y-6 w-full">
          {filteredTournaments?.length === 0 ? (
            <div className="text-center py-20 bg-muted/5 rounded-3xl border border-white/5 border-dashed">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {modeFilter ? `No ${modeFilter} Battlefields Detected` : 'No Battlefields Detected'}
              </p>
            </div>
          ) : filteredTournaments?.map((t) => (
            <TournamentCard 
              key={t.id} 
              tournament={t} 
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <PlayContent />
    </Suspense>
  );
}
