
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  Swords, 
  Loader2,
  Trash2,
  Trophy,
  Plus,
  Key,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp, query, orderBy, limit, deleteDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AdminDashboard() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  // Use a status state to manage the flow strictly
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, loading: profileLoading } = useDoc<any>(userDocRef);

  useEffect(() => {
    // Wait until both auth and profile are done loading
    if (userLoading || profileLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (profile?.role === 'admin') {
      setStatus('authorized');
    } else {
      // Only redirect if we are SURE they are not an admin
      if (profile && profile.role !== 'admin') {
        setStatus('unauthorized');
        router.replace('/');
      }
    }
  }, [user, userLoading, profile, profileLoading, router]);

  // Form states
  const [matchTitle, setMatchTitle] = useState('');
  const [matchMode, setMatchMode] = useState('Solo');
  const [matchMap, setMatchMap] = useState('Bermuda');
  const [matchVersion, setMatchVersion] = useState('TPP');
  const [entryFee, setEntryFee] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const [perKill, setPerKill] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('48');
  const [startTime, setStartTime] = useState('');
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [p3, setP3] = useState('');
  const [p4, setP4] = useState('');
  const [p5, setP5] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingRoom, setEditingRoom] = useState<{id: string, rid: string, rpass: string} | null>(null);

  const tournamentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'), limit(50));
  }, [db]);

  const { data: tournaments, loading: tournamentsLoading } = useCollection<any>(tournamentsQuery);

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setIsSubmitting(true);
    
    try {
      const matchId = '#' + Math.floor(10000 + Math.random() * 90000);
      addDoc(collection(db, 'tournaments'), {
        matchId,
        title: matchTitle,
        mode: matchMode,
        map: matchMap,
        version: matchVersion,
        entryFee: Number(entryFee),
        prizePool: Number(prizePool),
        perKill: Number(perKill),
        maxPlayers: Number(maxPlayers),
        currentPlayers: 0,
        startTime: new Date(startTime).toISOString(),
        status: 'open',
        roomId: '',
        roomPassword: '',
        prizes: {
          p1: Number(p1), p2: Number(p2), p3: Number(p3), p4: Number(p4), p5: Number(p5),
        },
        createdAt: serverTimestamp(),
      });
      toast({ title: "Success", description: `Match ${matchId} deployed.` });
      setMatchTitle(''); setEntryFee(''); setPrizePool(''); setPerKill(''); setStartTime('');
      setP1(''); setP2(''); setP3(''); setP4(''); setP5('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRoom = async () => {
    if (!db || !editingRoom) return;
    const ref = doc(db, 'tournaments', editingRoom.id);
    updateDoc(ref, {
      roomId: editingRoom.rid,
      roomPassword: editingRoom.rpass
    });
    toast({ title: "Updated", description: "Room ID & Password shared with players." });
    setEditingRoom(null);
  };

  const handleDeleteMatch = async (id: string) => {
    if (!db) return;
    if (confirm('Delete this tournament?')) {
      deleteDoc(doc(db, 'tournaments', id));
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Establishing Secure Connection...</p>
      </div>
    );
  }

  if (status === 'unauthorized') return null;

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="px-6 pt-10 pb-6 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md z-50 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl magma-gradient flex items-center justify-center shadow-lg shadow-primary/20">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black uppercase italic tracking-tighter">Command <span className="text-primary">Center</span></h1>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Authorized Personnel Only</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="text-[10px] font-bold uppercase gap-2">
          <ChevronLeft className="w-3 h-3" /> Exit
        </Button>
      </header>

      <main className="p-6">
        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid grid-cols-2 bg-muted/30 h-12 rounded-2xl p-1 border border-white/5">
            <TabsTrigger value="create" className="rounded-xl font-black text-[10px] uppercase data-[state=active]:bg-primary data-[state=active]:text-white transition-all">New Deployment</TabsTrigger>
            <TabsTrigger value="manage" className="rounded-xl font-black text-[10px] uppercase data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Active Matches</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card className="border-white/5 bg-card/50 rounded-[2rem] overflow-hidden">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-sm font-black uppercase italic flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" /> Match Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleAddMatch} className="space-y-6">
                  <div className="grid gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">Match Title</Label>
                      <Input placeholder="e.g. Bermuda Night Solo" value={matchTitle} onChange={(e) => setMatchTitle(e.target.value)} className="bg-muted/50 border-white/5 h-11 rounded-xl" required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Mode</Label>
                        <Select value={matchMode} onValueChange={setMatchMode}>
                          <SelectTrigger className="bg-muted/50 border-white/5 h-11 rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="Solo">Solo</SelectItem><SelectItem value="Duo">Duo</SelectItem><SelectItem value="Squad">Squad</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Map</Label>
                        <Select value={matchMap} onValueChange={setMatchMap}>
                          <SelectTrigger className="bg-muted/50 border-white/5 h-11 rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="Bermuda">Bermuda</SelectItem><SelectItem value="Purgatory">Purgatory</SelectItem><SelectItem value="Kalahari">Kalahari</SelectItem><SelectItem value="Alpine">Alpine</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Perspective</Label>
                        <Select value={matchVersion} onValueChange={setMatchVersion}>
                          <SelectTrigger className="bg-muted/50 border-white/5 h-11 rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="TPP">TPP</SelectItem><SelectItem value="FPP">FPP</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Launch Time</Label>
                        <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="bg-muted/50 border-white/5 h-11 rounded-xl" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Fee</Label><Input type="number" value={entryFee} onChange={(e) => setEntryFee(e.target.value)} className="bg-muted/50 border-white/5 h-11 rounded-xl" required /></div>
                      <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Total Prize</Label><Input type="number" value={prizePool} onChange={(e) => setPrizePool(e.target.value)} className="bg-muted/50 border-white/5 h-11 rounded-xl" required /></div>
                      <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Per Kill</Label><Input type="number" value={perKill} onChange={(e) => setPerKill(e.target.value)} className="bg-muted/50 border-white/5 h-11 rounded-xl" required /></div>
                    </div>
                    <div className="p-5 bg-muted/20 rounded-[1.5rem] border border-white/5 space-y-4">
                      <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><Trophy className="w-3.5 h-3.5" /> Position Rewards</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4, 5].map((pos) => (
                          <div key={pos} className="space-y-1">
                            <Label className="text-[8px] font-bold text-muted-foreground uppercase ml-1">Rank {pos}</Label>
                            <Input type="number" value={pos === 1 ? p1 : pos === 2 ? p2 : pos === 3 ? p3 : pos === 4 ? p4 : p5} onChange={(e) => { const v = e.target.value; if(pos === 1) setP1(v); else if(pos === 2) setP2(v); else if(pos === 3) setP3(v); else if(pos === 4) setP4(v); else setP5(v); }} className="bg-background border-white/5 h-10 text-xs rounded-lg" required />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full h-12 magma-gradient font-black uppercase italic tracking-widest rounded-xl shadow-lg active:scale-[0.98] transition-all">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Deploy Match'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            <div className="space-y-3">
              {tournamentsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
                  <p className="text-[8px] font-bold text-muted-foreground uppercase">Syncing Battlefield...</p>
                </div>
              ) : tournaments?.length === 0 ? (
                <div className="text-center py-20 border border-white/5 border-dashed rounded-3xl">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No Active Match Operations</p>
                </div>
              ) : tournaments?.map((match: any) => (
                <Card key={match.id} className="border-white/5 bg-card/60 p-5 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <Swords className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase italic">{match.title} <span className="text-primary ml-1">{match.matchId}</span></h4>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{match.mode} • {match.entryFee} TK • {match.currentPlayers}/{match.maxPlayers}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setEditingRoom({id: match.id, rid: match.roomId || '', rpass: match.roomPassword || ''})} className="h-9 rounded-lg text-[10px] font-bold uppercase border-white/10 hover:bg-primary hover:text-white hover:border-none transition-all">
                          <Key className="w-3.5 h-3.5 mr-1.5" /> Room
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-white/5 rounded-3xl p-8">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-black uppercase italic tracking-tight">Access Credentials</DialogTitle>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Set Room ID and Password for players</p>
                        </DialogHeader>
                        <div className="space-y-5 py-6">
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Room ID</Label>
                            <Input value={editingRoom?.rid} onChange={(e) => setEditingRoom(prev => prev ? {...prev, rid: e.target.value} : null)} className="bg-muted border-none h-12 rounded-xl text-lg font-black font-mono" />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Password</Label>
                            <Input value={editingRoom?.rpass} onChange={(e) => setEditingRoom(prev => prev ? {...prev, rpass: e.target.value} : null)} className="bg-muted border-none h-12 rounded-xl text-lg font-black font-mono" />
                          </div>
                          <Button onClick={handleUpdateRoom} className="w-full magma-gradient h-12 font-black uppercase italic tracking-widest rounded-xl shadow-lg mt-2">Publish Credentials</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-9 w-9 bg-muted/30 rounded-lg" onClick={() => handleDeleteMatch(match.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
