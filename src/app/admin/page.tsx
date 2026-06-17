
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
  ChevronLeft,
  CalendarDays,
  Medal,
  Save,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp, query, orderBy, limit, deleteDoc, updateDoc, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<'checking' | 'authorized' | 'unauthorized'>('checking');

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, loading: profileLoading } = useDoc<any>(userDocRef);

  useEffect(() => {
    if (authLoading || profileLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (profile && profile.role === 'admin') {
      setStatus('authorized');
    } else if (profile) {
      setStatus('unauthorized');
      router.replace('/');
    }
  }, [user, authLoading, profile, profileLoading, router]);

  // Create Match States
  const [matchTitle, setMatchTitle] = useState('');
  const [matchMode, setMatchMode] = useState('BR SOLO');
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

  // Manage States
  const [editingRoom, setEditingRoom] = useState<{id: string, rid: string, rpass: string} | null>(null);
  const [managingResults, setManagingResults] = useState<{id: string, title: string} | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isSavingResults, setIsSavingResults] = useState(false);

  const tournamentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'), limit(50));
  }, [db]);

  const { data: tournaments, loading: tournamentsLoading } = useCollection<any>(tournamentsQuery);

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    if (!startTime) {
      toast({ variant: "destructive", title: "Error", description: "Please select a launch time." });
      return;
    }
    setIsSubmitting(true);
    try {
      const matchId = '#' + Math.floor(10000 + Math.random() * 90000);
      const launchDate = new Date(startTime);
      await addDoc(collection(db, 'tournaments'), {
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
        startTime: launchDate.toISOString(),
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
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRoom = async () => {
    if (!db || !editingRoom) return;
    const ref = doc(db, 'tournaments', editingRoom.id);
    await updateDoc(ref, {
      roomId: editingRoom.rid,
      roomPassword: editingRoom.rpass
    });
    toast({ title: "Updated", description: "Room credentials updated." });
    setEditingRoom(null);
  };

  const fetchRegistrations = async (tournamentId: string) => {
    if (!db) return;
    const q = collection(db, 'tournaments', tournamentId, 'registrations');
    const snap = await getDocs(q);
    const regs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRegistrations(regs);
  };

  const handleSaveResults = async () => {
    if (!db || !managingResults) return;
    setIsSavingResults(true);
    try {
      for (const reg of registrations) {
        const regRef = doc(db, 'tournaments', managingResults.id, 'registrations', reg.uid);
        await updateDoc(regRef, {
          wonAmount: Number(reg.wonAmount || 0)
        });
      }
      toast({ title: "Results Saved", description: "Winner amounts updated successfully." });
      setManagingResults(null);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsSavingResults(false);
    }
  };

  const updateRegWonAmount = (uid: string, amount: string) => {
    setRegistrations(prev => prev.map(r => r.uid === uid ? { ...r, wonAmount: amount } : r));
  };

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Verifying Authority...</p>
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
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Administrator</p>
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
            <TabsTrigger value="manage" className="rounded-xl font-black text-[10px] uppercase data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Manage Active</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card className="border-white/5 bg-card/50 rounded-[2rem] overflow-hidden">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-sm font-black uppercase italic flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" /> Match Specs
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleAddMatch} className="space-y-6">
                  <div className="grid gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">Title</Label>
                      <Input placeholder="e.g. Bermuda Night Fight" value={matchTitle} onChange={(e) => setMatchTitle(e.target.value)} className="bg-muted/50 border-white/5 h-11 rounded-xl" required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Mode</Label>
                        <Select value={matchMode} onValueChange={setMatchMode}>
                          <SelectTrigger className="bg-muted/50 border-white/5 h-11 rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BR SOLO">BR SOLO</SelectItem>
                            <SelectItem value="BR DUO">BR DUO</SelectItem>
                            <SelectItem value="BR SQUAD">BR SQUAD</SelectItem>
                            <SelectItem value="CS RANK">CS RANK</SelectItem>
                            <SelectItem value="CS HEADSHOT">CS HEADSHOT</SelectItem>
                            <SelectItem value="LW 1V1">LW 1V1</SelectItem>
                            <SelectItem value="LW 2V2">LW 2V2</SelectItem>
                            <SelectItem value="LW HEADSHOT">LW HEADSHOT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Map</Label>
                        <Select value={matchMap} onValueChange={setMatchMap}>
                          <SelectTrigger className="bg-muted/50 border-white/5 h-11 rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Bermuda">Bermuda</SelectItem>
                            <SelectItem value="Purgatory">Purgatory</SelectItem>
                            <SelectItem value="Kalahari">Kalahari</SelectItem>
                            <SelectItem value="Alpine">Alpine</SelectItem>
                            <SelectItem value="Nexterra">Nexterra</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Launch Time</Label>
                        <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="bg-muted/50 border-white/5 h-11 rounded-xl" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Fee</Label>
                        <Input type="number" value={entryFee} onChange={(e) => setEntryFee(e.target.value)} className="bg-muted/50 border-white/5 h-11 rounded-xl" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Prize</Label><Input type="number" value={prizePool} onChange={(e) => setPrizePool(e.target.value)} className="bg-muted/50 border-white/5 h-11 rounded-xl" required /></div>
                      <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Kill</Label><Input type="number" value={perKill} onChange={(e) => setPerKill(e.target.value)} className="bg-muted/50 border-white/5 h-11 rounded-xl" required /></div>
                      <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Max Players</Label><Input type="number" value={maxPlayers} onChange={(e) => setMaxPlayers(e.target.value)} className="bg-muted/50 border-white/5 h-11 rounded-xl" required /></div>
                    </div>
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full h-12 magma-gradient font-black uppercase italic tracking-widest rounded-xl">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Deploy Match'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            <div className="space-y-3">
              {tournamentsLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : tournaments?.map((match: any) => (
                <Card key={match.id} className="border-white/5 bg-card/60 p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Swords className="w-5 h-5" /></div>
                      <div>
                        <h4 className="text-xs font-black uppercase italic">{match.title}</h4>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase">{match.matchId} • {match.currentPlayers}/{match.maxPlayers}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8" onClick={() => deleteDoc(doc(db, 'tournaments', match.id))}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setEditingRoom({id: match.id, rid: match.roomId || '', rpass: match.roomPassword || ''})} className="flex-1 h-9 rounded-lg text-[10px] font-bold uppercase border-white/10">
                          <Key className="w-3.5 h-3.5 mr-1.5" /> Room
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-white/5 rounded-3xl">
                        <DialogHeader>
                          <DialogTitle>Access Credentials</DialogTitle>
                          <DialogDescription>Set Room ID and Password</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-1.5"><Label>Room ID</Label><Input value={editingRoom?.rid} onChange={(e) => setEditingRoom(prev => prev ? {...prev, rid: e.target.value} : null)} className="bg-muted border-none h-11" /></div>
                          <div className="space-y-1.5"><Label>Password</Label><Input value={editingRoom?.rpass} onChange={(e) => setEditingRoom(prev => prev ? {...prev, rpass: e.target.value} : null)} className="bg-muted border-none h-11" /></div>
                          <Button onClick={handleUpdateRoom} className="w-full magma-gradient h-11 font-black uppercase italic">Save Room</Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => { setManagingResults({id: match.id, title: match.title}); fetchRegistrations(match.id); }} className="flex-1 h-9 rounded-lg text-[10px] font-bold uppercase border-white/10">
                          <Medal className="w-3.5 h-3.5 mr-1.5" /> Results
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-white/5 rounded-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Award Winnings</DialogTitle>
                          <DialogDescription>Set Won Amount for players in {managingResults?.title}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          {registrations.length === 0 ? (
                            <p className="text-center text-[10px] text-muted-foreground font-bold uppercase py-10">No players registered</p>
                          ) : (
                            registrations.map((reg) => (
                              <div key={reg.uid} className="p-3 bg-muted/30 rounded-xl border border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div>
                                  <div>
                                    <p className="text-xs font-black uppercase tracking-tight">{reg.ingameName || reg.displayName}</p>
                                    <p className="text-[8px] font-bold text-muted-foreground font-mono">ID: {reg.ingameId}</p>
                                  </div>
                                </div>
                                <div className="w-24">
                                  <Input 
                                    type="number" 
                                    placeholder="Won TK" 
                                    value={reg.wonAmount || ''} 
                                    onChange={(e) => updateRegWonAmount(reg.uid, e.target.value)}
                                    className="h-8 text-xs bg-background border-white/10"
                                  />
                                </div>
                              </div>
                            ))
                          )}
                          {registrations.length > 0 && (
                            <Button onClick={handleSaveResults} disabled={isSavingResults} className="w-full magma-gradient h-11 font-black uppercase italic flex items-center gap-2">
                              {isSavingResults ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                              Save Results
                            </Button>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
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
