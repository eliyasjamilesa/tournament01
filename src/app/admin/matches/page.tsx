
"use client";

import { useState } from 'react';
import { 
  Plus, 
  Swords, 
  Loader2, 
  Trash2, 
  Key, 
  Medal, 
  User,
  Trash
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp, query, orderBy, limit, deleteDoc, updateDoc, getDocs, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function MatchesPage() {
  const db = useFirestore();
  const { toast } = useToast();
  
  // Create Match State
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

  // Management State
  const [editingRoom, setEditingRoom] = useState<{id: string, rid: string, rpass: string} | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);

  const tournamentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'), limit(50));
  }, [db]);
  const { data: tournaments, loading: tournamentsLoading } = useCollection<any>(tournamentsQuery);

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !startTime) return;
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
          p1: Number(p1), p2: Number(p2), p3: Number(p3), p4: Number(p4), p5: Number(p5),
        },
        createdAt: serverTimestamp(),
      });
      toast({ title: "Deployed", description: "Match is now live." });
      setMatchTitle(''); setEntryFee(''); setPrizePool(''); setPerKill(''); setStartTime('');
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
    const snap = await getDocs(collection(db, 'tournaments', tournamentId, 'registrations'));
    setRegistrations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter">Arena <span className="text-primary">Management</span></h1>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Deploy and control tournaments</p>
      </div>

      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList className="bg-muted/30 h-11 p-1 rounded-xl border border-white/5">
          <TabsTrigger value="manage" className="rounded-lg font-black text-[10px] uppercase">Active Matches</TabsTrigger>
          <TabsTrigger value="deploy" className="rounded-lg font-black text-[10px] uppercase">Deploy New</TabsTrigger>
        </TabsList>

        <TabsContent value="deploy">
          <Card className="border-white/5 bg-card/50 rounded-[2rem]">
            <CardContent className="pt-6">
              <form onSubmit={handleAddMatch} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase ml-1">Match Title</Label><Input placeholder="Bermuda Rush" value={matchTitle} onChange={(e) => setMatchTitle(e.target.value)} className="bg-muted/50 border-white/5 h-11 rounded-xl" required /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase ml-1">Mode</Label>
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
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase ml-1">Launch Time</Label><Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="bg-muted/50 border-white/5 h-11 rounded-xl" required /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase ml-1">Entry Fee</Label><Input type="number" value={entryFee} onChange={(e) => setEntryFee(e.target.value)} className="bg-muted/50 border-white/5 h-11 rounded-xl" required /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase ml-1">Prize</Label><Input type="number" value={prizePool} onChange={(e) => setPrizePool(e.target.value)} className="bg-muted/50 border-white/5 h-11 rounded-xl" required /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase ml-1">Per Kill</Label><Input type="number" value={perKill} onChange={(e) => setPerKill(e.target.value)} className="bg-muted/50 border-white/5 h-11 rounded-xl" required /></div>
                  </div>
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full h-12 magma-gradient font-black uppercase italic rounded-xl">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Deploy Arena'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tournamentsLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            ) : tournaments?.map((match: any) => (
              <Card key={match.id} className="border-white/5 bg-card/60 p-4 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Swords className="w-5 h-5" /></div>
                    <div><h4 className="text-xs font-black uppercase italic">{match.title}</h4><p className="text-[8px] font-bold text-muted-foreground uppercase">{match.matchId} • {match.currentPlayers}/{match.maxPlayers}</p></div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600" onClick={() => deleteDoc(doc(db, 'tournaments', match.id))}><Trash2 className="w-4 h-4" /></Button>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild><Button variant="outline" size="sm" onClick={() => setEditingRoom({id: match.id, rid: match.roomId || '', rpass: match.roomPassword || ''})} className="flex-1 h-9 rounded-lg text-[10px] font-bold uppercase border-white/10"><Key className="w-3.5 h-3.5 mr-1.5" /> Room</Button></DialogTrigger>
                    <DialogContent className="bg-card border-white/5 rounded-3xl">
                      <DialogHeader><DialogTitle>Room Config</DialogTitle></DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-1.5"><Label>Room ID</Label><Input value={editingRoom?.rid} onChange={(e) => setEditingRoom(prev => prev ? {...prev, rid: e.target.value} : null)} className="bg-muted border-none" /></div>
                        <div className="space-y-1.5"><Label>Password</Label><Input value={editingRoom?.rpass} onChange={(e) => setEditingRoom(prev => prev ? {...prev, rpass: e.target.value} : null)} className="bg-muted border-none" /></div>
                        <Button onClick={handleUpdateRoom} className="w-full magma-gradient h-11 font-black uppercase">Update Room</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild><Button variant="outline" size="sm" onClick={() => fetchRegistrations(match.id)} className="flex-1 h-9 rounded-lg text-[10px] font-bold uppercase border-white/10"><Medal className="w-3.5 h-3.5 mr-1.5" /> Results</Button></DialogTrigger>
                    <DialogContent className="bg-card border-white/5 rounded-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader><DialogTitle>Match Winners</DialogTitle></DialogHeader>
                      <div className="space-y-3 py-4">
                        {registrations.map((reg) => (
                          <div key={reg.id} className="p-3 bg-muted/30 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-primary" />
                              <p className="text-xs font-black uppercase">{reg.ingameName || reg.displayName}</p>
                            </div>
                            <Input type="number" placeholder="Won" value={reg.wonAmount || ''} onChange={(e) => setRegistrations(prev => prev.map(r => r.id === reg.id ? { ...r, wonAmount: e.target.value } : r))} className="w-20 h-8 text-xs" />
                          </div>
                        ))}
                        <Button onClick={async () => {
                          for (const reg of registrations) await updateDoc(doc(db, 'tournaments', match.id, 'registrations', reg.id), { wonAmount: Number(reg.wonAmount || 0) });
                          toast({ title: "Results Saved" });
                        }} className="w-full magma-gradient h-11 font-black uppercase italic">Save All Results</Button>
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
