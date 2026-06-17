
"use client";

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Plus, 
  Swords, 
  Loader2, 
  Trash2, 
  Key, 
  Medal, 
  User,
  Calendar,
  Layers,
  Monitor,
  Trophy,
  Map as MapIcon,
  Users,
  Target,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp, query, orderBy, limit, deleteDoc, updateDoc, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function MatchesPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'manage';
  
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
  const [editingRoom, setEditingRoom] = useState<{id: string, rid: string, rpass: string} | null>(null);
  const [editingResultsMatchId, setEditingResultsMatchId] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  const tournamentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'), limit(50));
  }, [db]);
  const { data: tournaments, loading: tournamentsLoading } = useCollection<any>(tournamentsQuery);

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !startTime) {
      toast({ variant: "destructive", title: "Missing Data", description: "Please select a start time." });
      return;
    }
    setIsSubmitting(true);
    try {
      const matchId = '#' + Math.floor(10000 + Math.random() * 90000);
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
        startTime: new Date(startTime).toISOString(),
        status: 'open',
        roomId: '',
        roomPassword: '',
        prizes: {
          p1: Number(p1 || 0),
          p2: Number(p2 || 0),
          p3: Number(p3 || 0),
          p4: Number(p4 || 0),
          p5: Number(p5 || 0),
        },
        createdAt: serverTimestamp(),
      });
      toast({ title: "Arena Deployed", description: "Match is now live for warriors." });
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
    await updateDoc(doc(db, 'tournaments', editingRoom.id), {
      roomId: editingRoom.rid,
      roomPassword: editingRoom.rpass
    });
    toast({ title: "Updated", description: "Room credentials pushed." });
    setEditingRoom(null);
  };

  const fetchRegistrations = async (tournamentId: string) => {
    if (!db) return;
    setEditingResultsMatchId(tournamentId);
    const snap = await getDocs(collection(db, 'tournaments', tournamentId, 'registrations'));
    setRegistrations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handlePublishResults = async () => {
    if (!db || !editingResultsMatchId) return;
    setIsPublishing(true);
    try {
      for (const reg of registrations) {
        const regRef = doc(db, 'tournaments', editingResultsMatchId, 'registrations', reg.id);
        await updateDoc(regRef, { 
          wonAmount: Number(reg.wonAmount || 0),
          kills: Number(reg.kills || 0)
        });
      }
      
      await updateDoc(doc(db, 'tournaments', editingResultsMatchId), { status: 'completed' });
      toast({ title: "Results Published", description: "Archive updated successfully." });
      setEditingResultsMatchId(null);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Publish Failed", description: err.message });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <Tabs defaultValue={initialTab} className="space-y-6">
        <TabsList className="bg-muted/30 h-11 p-1 rounded-xl border border-white/5 w-full">
          <TabsTrigger value="manage" className="flex-1 rounded-lg font-black text-[10px] uppercase tracking-widest">Manage</TabsTrigger>
          <TabsTrigger value="deploy" className="flex-1 rounded-lg font-black text-[10px] uppercase tracking-widest">Deploy</TabsTrigger>
        </TabsList>

        <TabsContent value="deploy" className="animate-in fade-in zoom-in-95 duration-300">
          <Card className="border-white/5 bg-card/40 rounded-3xl overflow-hidden shadow-2xl">
            <CardContent className="pt-6 space-y-6">
              <form onSubmit={handleAddMatch} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase ml-1 tracking-widest text-muted-foreground">Match Title</Label>
                    <Input placeholder="E.g. Sunday Night Rush" value={matchTitle} onChange={(e) => setMatchTitle(e.target.value)} className="bg-muted/50 border-white/5 h-12 rounded-xl font-bold" required />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase ml-1 tracking-widest text-muted-foreground">Mode</Label>
                      <Select value={matchMode} onValueChange={setMatchMode}>
                        <SelectTrigger className="bg-muted/50 border-white/5 h-12 rounded-xl font-bold"><SelectValue /></SelectTrigger>
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
                      <Label className="text-[10px] font-black uppercase ml-1 tracking-widest text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Start Time
                      </Label>
                      <Input 
                        type="datetime-local" 
                        value={startTime} 
                        onChange={(e) => setStartTime(e.target.value)} 
                        className="bg-muted/50 border-white/5 h-12 rounded-xl font-bold block" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase ml-1 tracking-widest text-muted-foreground">Map</Label>
                      <Select value={matchMap} onValueChange={setMatchMap}>
                        <SelectTrigger className="bg-muted/50 border-white/5 h-12 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bermuda">Bermuda</SelectItem>
                          <SelectItem value="Purgatory">Purgatory</SelectItem>
                          <SelectItem value="Kalahari">Kalahari</SelectItem>
                          <SelectItem value="Alpine">Alpine</SelectItem>
                          <SelectItem value="Nexterra">Nexterra</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase ml-1 tracking-widest text-muted-foreground">Version</Label>
                      <Select value={matchVersion} onValueChange={setMatchVersion}>
                        <SelectTrigger className="bg-muted/50 border-white/5 h-12 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TPP">TPP</SelectItem>
                          <SelectItem value="FPP">FPP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase ml-1 tracking-widest text-muted-foreground">Entry</Label>
                      <Input type="number" placeholder="50" value={entryFee} onChange={(e) => setEntryFee(e.target.value)} className="bg-muted/50 border-white/5 h-12 rounded-xl font-black text-center" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase ml-1 tracking-widest text-muted-foreground">Total</Label>
                      <Input type="number" placeholder="1000" value={prizePool} onChange={(e) => setPrizePool(e.target.value)} className="bg-muted/50 border-white/5 h-12 rounded-xl font-black text-center" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase ml-1 tracking-widest text-muted-foreground">Kill</Label>
                      <Input type="number" placeholder="10" value={perKill} onChange={(e) => setPerKill(e.target.value)} className="bg-muted/50 border-white/5 h-12 rounded-xl font-black text-center" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase ml-1 tracking-widest text-muted-foreground">Max</Label>
                      <Input type="number" placeholder="48" value={maxPlayers} onChange={(e) => setMaxPlayers(e.target.value)} className="bg-muted/50 border-white/5 h-12 rounded-xl font-black text-center" required />
                    </div>
                  </div>

                  <div className="pt-4 space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic border-l-2 border-primary pl-3">Prize Distribution</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-bold uppercase ml-1 text-muted-foreground">Pos 1 (Winner)</Label>
                        <Input type="number" placeholder="500" value={p1} onChange={(e) => setP1(e.target.value)} className="bg-primary/5 border-primary/20 h-11 rounded-xl font-bold" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-bold uppercase ml-1 text-muted-foreground">Pos 2</Label>
                        <Input type="number" placeholder="200" value={p2} onChange={(e) => setP2(e.target.value)} className="bg-muted/30 border-white/5 h-11 rounded-xl font-bold" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-bold uppercase ml-1 text-muted-foreground">Pos 3</Label>
                        <Input type="number" placeholder="100" value={p3} onChange={(e) => setP3(e.target.value)} className="bg-muted/30 border-white/5 h-11 rounded-xl font-bold" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-bold uppercase ml-1 text-muted-foreground">Pos 4</Label>
                        <Input type="number" placeholder="50" value={p4} onChange={(e) => setP4(e.target.value)} className="bg-muted/30 border-white/5 h-11 rounded-xl font-bold" />
                      </div>
                      <div className="col-span-2 space-y-1.5">
                        <Label className="text-[9px] font-bold uppercase ml-1 text-muted-foreground">Pos 5</Label>
                        <Input type="number" placeholder="20" value={p5} onChange={(e) => setP5(e.target.value)} className="bg-muted/30 border-white/5 h-11 rounded-xl font-bold" />
                      </div>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full h-14 magma-gradient font-black uppercase italic rounded-2xl shadow-xl shadow-primary/20 text-sm tracking-widest">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'DEPLOY TO ARENA'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="animate-in fade-in zoom-in-95 duration-300">
          <div className="space-y-4">
            {tournamentsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading Arenas...</p>
              </div>
            ) : tournaments?.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No Active Arenas</p>
              </div>
            ) : tournaments?.map((match: any) => (
              <Card key={match.id} className="border-white/5 bg-card/40 p-5 rounded-2xl overflow-hidden shadow-lg">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <Swords className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase italic text-white tracking-tight">{match.title}</h4>
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{match.matchId} • {match.mode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all" onClick={() => {
                      if(confirm('Warning: This will permanently delete this arena. Proceed?')) deleteDoc(doc(db, 'tournaments', match.id));
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-5">
                   <div className="p-2.5 rounded-xl bg-black/20 border border-white/5 flex items-center gap-2">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[9px] font-black text-white">{match.currentPlayers}/{match.maxPlayers} Joined</span>
                   </div>
                   <div className="p-2.5 rounded-xl bg-black/20 border border-white/5 flex items-center gap-2">
                      <MapIcon className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[9px] font-black text-white">{match.map} ({match.version})</span>
                   </div>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setEditingRoom({id: match.id, rid: match.roomId || '', rpass: match.roomPassword || ''})} className="flex-1 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                        <Key className="w-3.5 h-3.5 mr-2 text-primary" /> Room Info
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-white/10 rounded-[2rem] max-w-[340px]">
                      <DialogHeader>
                        <DialogTitle className="text-sm uppercase font-black italic tracking-widest text-center">Room Credentials</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-6">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Room ID</Label>
                          <Input value={editingRoom?.rid} onChange={(e) => setEditingRoom(prev => prev ? {...prev, rid: e.target.value} : null)} className="bg-muted/50 border-none h-12 rounded-xl font-black font-mono text-center text-lg" placeholder="1234567" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
                          <Input value={editingRoom?.rpass} onChange={(e) => setEditingRoom(prev => prev ? {...prev, rpass: e.target.value} : null)} className="bg-muted/50 border-none h-12 rounded-xl font-black font-mono text-center text-lg" placeholder="ABC@123" />
                        </div>
                        <Button onClick={handleUpdateRoom} className="w-full magma-gradient h-12 font-black uppercase italic rounded-xl mt-4 shadow-lg shadow-primary/20">PUSH TO PLAYERS</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={editingResultsMatchId === match.id} onOpenChange={(open) => !open && setEditingResultsMatchId(null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => fetchRegistrations(match.id)} className="flex-1 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                        <Medal className="w-3.5 h-3.5 mr-2 text-yellow-500" /> Results
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-white/10 rounded-[2rem] max-h-[85vh] overflow-y-auto max-w-[360px]">
                      <DialogHeader>
                        <DialogTitle className="text-sm uppercase font-black italic tracking-widest text-center">Warrior Ranking</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-6">
                        {registrations.length === 0 ? (
                           <div className="text-center py-10 opacity-50 flex flex-col items-center gap-2">
                             <User className="w-8 h-8" />
                             <p className="text-[10px] font-black uppercase tracking-widest">No registrations detected</p>
                           </div>
                        ) : registrations.map((reg) => (
                          <div key={reg.id} className="p-4 bg-muted/30 rounded-2xl space-y-3 border border-white/5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                  <User className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-tight text-white">{reg.ingameName || reg.displayName}</p>
                                  <p className="text-[8px] font-bold text-muted-foreground uppercase">Slot #{reg.slotNumber}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <Label className="text-[7px] font-black text-muted-foreground uppercase ml-1">Kills</Label>
                                <div className="relative">
                                  <Target className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                                  <Input 
                                    type="number" 
                                    placeholder="0" 
                                    value={reg.kills || ''} 
                                    onChange={(e) => setRegistrations(prev => prev.map(r => r.id === reg.id ? { ...r, kills: e.target.value } : r))} 
                                    className="w-full h-8 pl-7 text-[10px] font-black bg-background border-none rounded-lg" 
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[7px] font-black text-primary uppercase ml-1">Winnings</Label>
                                <div className="relative">
                                  <Trophy className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-primary" />
                                  <Input 
                                    type="number" 
                                    placeholder="0" 
                                    value={reg.wonAmount || ''} 
                                    onChange={(e) => setRegistrations(prev => prev.map(r => r.id === reg.id ? { ...r, wonAmount: e.target.value } : r))} 
                                    className="w-full h-8 pl-7 text-[10px] font-black bg-background border-none rounded-lg" 
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {registrations.length > 0 && (
                          <Button 
                            disabled={isPublishing}
                            onClick={handlePublishResults} 
                            className="w-full magma-gradient h-12 font-black uppercase italic rounded-xl mt-6 shadow-xl shadow-primary/20"
                          >
                            {isPublishing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'PUBLISH ARCHIVE'}
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
    </div>
  );
}
