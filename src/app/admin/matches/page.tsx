
"use client";

import { useState, useEffect } from 'react';
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
  Monitor
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
      <Tabs defaultValue={initialTab} className="space-y-6">
        <TabsList className="bg-muted/30 h-11 p-1 rounded-xl border border-white/5 w-full">
          <TabsTrigger value="manage" className="flex-1 rounded-lg font-black text-[10px] uppercase">Active Matches</TabsTrigger>
          <TabsTrigger value="deploy" className="flex-1 rounded-lg font-black text-[10px] uppercase">Deploy New</TabsTrigger>
        </TabsList>

        <TabsContent value="deploy" className="animate-in fade-in slide-in-from-right-4 duration-500">
          <Card className="border-white/5 bg-card/50 rounded-3xl overflow-hidden">
            <CardContent className="pt-6">
              <form onSubmit={handleAddMatch} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase ml-1">Match Title</Label>
                    <Input placeholder="Bermuda Rush" value={matchTitle} onChange={(e) => setMatchTitle(e.target.value)} className="bg-muted/50 border-white/5 h-12 rounded-xl" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase ml-1">Mode</Label>
                      <Select value={matchMode} onValueChange={setMatchMode}>
                        <SelectTrigger className="bg-muted/50 border-white/5 h-12 rounded-xl"><SelectValue /></SelectTrigger>
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
                      <Label className="text-[10px] font-bold uppercase ml-1">Launch Time</Label>
                      <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="bg-muted/50 border-white/5 h-12 rounded-xl" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase ml-1">Entry Fee</Label><Input type="number" value={entryFee} onChange={(e) => setEntryFee(e.target.value)} className="bg-muted/50 border-white/5 h-12 rounded-xl" required /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase ml-1">Prize</Label><Input type="number" value={prizePool} onChange={(e) => setPrizePool(e.target.value)} className="bg-muted/50 border-white/5 h-12 rounded-xl" required /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase ml-1">Per Kill</Label><Input type="number" value={perKill} onChange={(e) => setPerKill(e.target.value)} className="bg-muted/50 border-white/5 h-12 rounded-xl" required /></div>
                  </div>
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full h-14 magma-gradient font-black uppercase italic rounded-xl shadow-lg">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Deploy Arena'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="space-y-4">
            {tournamentsLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : tournaments?.length === 0 ? (
               <div className="text-center py-20 border border-dashed border-white/5 rounded-3xl">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">No matches found</p>
               </div>
            ) : tournaments?.map((match: any) => (
              <Card key={match.id} className="border-white/5 bg-card/60 p-5 rounded-2xl overflow-hidden relative group">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20"><Swords className="w-6 h-6" /></div>
                    <div>
                      <h4 className="text-sm font-black uppercase italic text-white tracking-tight">{match.title}</h4>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase">{match.matchId} • {match.mode}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-red-600 rounded-full" onClick={() => {
                    if(confirm('Are you sure you want to delete this arena?')) deleteDoc(doc(db, 'tournaments', match.id));
                  }}><Trash2 className="w-4 h-4" /></Button>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-5">
                   {[
                     { icon: Calendar, label: 'Fee', val: match.entryFee },
                     { icon: Layers, label: 'Mode', val: match.mode.split(' ')[1] },
                     { icon: Monitor, label: 'Slots', val: `${match.currentPlayers}/${match.maxPlayers}` }
                   ].map((s, i) => (
                     <div key={i} className="bg-white/5 rounded-xl p-2.5 flex flex-col items-center justify-center text-center">
                       <span className="text-[7px] font-bold text-muted-foreground uppercase mb-1">{s.label}</span>
                       <span className="text-[9px] font-black text-white">{s.val}</span>
                     </div>
                   ))}
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setEditingRoom({id: match.id, rid: match.roomId || '', rpass: match.roomPassword || ''})} className="flex-1 h-10 rounded-xl text-[10px] font-black uppercase border-white/10"><Key className="w-3.5 h-3.5 mr-2 text-primary" /> Room Info</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-white/5 rounded-3xl max-w-[340px]">
                      <DialogHeader><DialogTitle className="text-sm uppercase font-black italic">Update Room</DialogTitle></DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase ml-1">Room ID</Label><Input value={editingRoom?.rid} onChange={(e) => setEditingRoom(prev => prev ? {...prev, rid: e.target.value} : null)} className="bg-muted/50 border-none h-11 rounded-xl" /></div>
                        <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase ml-1">Password</Label><Input value={editingRoom?.rpass} onChange={(e) => setEditingRoom(prev => prev ? {...prev, rpass: e.target.value} : null)} className="bg-muted/50 border-none h-11 rounded-xl" /></div>
                        <Button onClick={handleUpdateRoom} className="w-full magma-gradient h-12 font-black uppercase italic rounded-xl mt-2">Push Credentials</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => fetchRegistrations(match.id)} className="flex-1 h-10 rounded-xl text-[10px] font-black uppercase border-white/10"><Medal className="w-3.5 h-3.5 mr-2 text-yellow-500" /> Results</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-white/5 rounded-3xl max-h-[80vh] overflow-y-auto max-w-[340px]">
                      <DialogHeader><DialogTitle className="text-sm uppercase font-black italic">Winner Statistics</DialogTitle></DialogHeader>
                      <div className="space-y-3 py-4">
                        {registrations.length === 0 ? (
                           <p className="text-center text-[10px] text-muted-foreground uppercase font-bold py-10">No registrations found</p>
                        ) : registrations.map((reg) => (
                          <div key={reg.id} className="p-4 bg-muted/30 rounded-2xl flex items-center justify-between border border-white/5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div>
                              <div>
                                <p className="text-[10px] font-black uppercase">{reg.ingameName || reg.displayName}</p>
                                <p className="text-[8px] font-bold text-muted-foreground uppercase">Slot #{reg.slotNumber}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-muted-foreground">TK</span>
                              <Input type="number" placeholder="0" value={reg.wonAmount || ''} onChange={(e) => setRegistrations(prev => prev.map(r => r.id === reg.id ? { ...r, wonAmount: e.target.value } : r))} className="w-16 h-8 text-[10px] font-black bg-background border-none text-right" />
                            </div>
                          </div>
                        ))}
                        {registrations.length > 0 && (
                          <Button onClick={async () => {
                            for (const reg of registrations) await updateDoc(doc(db, 'tournaments', match.id, 'registrations', reg.id), { wonAmount: Number(reg.wonAmount || 0) });
                            toast({ title: "Results Published" });
                          }} className="w-full magma-gradient h-12 font-black uppercase italic rounded-xl shadow-lg mt-4">Save All Winners</Button>
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
