
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
  Medal,
  Save,
  User,
  Wallet,
  CheckCircle2,
  XCircle,
  Search,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp, query, orderBy, limit, deleteDoc, updateDoc, getDocs, where, writeBatch, increment } from 'firebase/firestore';
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

  // --- MATCH DEPLOYMENT STATE ---
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

  // --- MANAGEMENT STATE ---
  const [editingRoom, setEditingRoom] = useState<{id: string, rid: string, rpass: string} | null>(null);
  const [managingResults, setManagingResults] = useState<{id: string, title: string} | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isSavingResults, setIsSavingResults] = useState(false);

  // --- PAYMENT APPROVE STATE ---
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // --- MANUAL RECHARGE STATE ---
  const [rechargeEmail, setRechargeEmail] = useState('');
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [isRecharging, setIsRecharging] = useState(false);

  const tournamentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'), limit(50));
  }, [db]);

  const { data: tournaments, loading: tournamentsLoading } = useCollection<any>(tournamentsQuery);

  const pendingPaymentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'transactions'), where('status', '==', 'pending'), orderBy('timestamp', 'desc'));
  }, [db]);
  const { data: livePendingPayments } = useCollection<any>(pendingPaymentsQuery);

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    if (!startTime) {
      toast({ variant: "destructive", title: "Wait!", description: "Select Launch Time" });
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
          p1: Number(p1), p2: Number(p2), p3: Number(p3), p4: Number(p4), p5: Number(p5),
        },
        createdAt: serverTimestamp(),
      });
      toast({ title: "Match Deployed", description: `Tournament ${matchId} is now live.` });
      setMatchTitle(''); setEntryFee(''); setPrizePool(''); setPerKill(''); setStartTime('');
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprovePayment = async (tx: any) => {
    if (!db) return;
    setIsProcessingPayment(true);
    try {
      const batch = writeBatch(db);
      const userRef = doc(db, 'users', tx.userId);
      const txRef = doc(db, 'transactions', tx.id);

      batch.update(userRef, { coins: increment(tx.amount) });
      batch.update(txRef, { status: 'approved' });

      await batch.commit();
      toast({ title: "Approved", description: `${tx.amount} coins added to user.` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleManualRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !rechargeEmail || !rechargeAmount) return;
    setIsRecharging(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', rechargeEmail.trim()), limit(1));
      const snap = await getDocs(q);

      if (snap.empty) {
        toast({ variant: "destructive", title: "Failed", description: "User not found with this email." });
        return;
      }

      const targetUser = snap.docs[0];
      await updateDoc(doc(db, 'users', targetUser.id), {
        coins: increment(Number(rechargeAmount))
      });

      await addDoc(collection(db, 'transactions'), {
        userId: targetUser.id,
        userEmail: rechargeEmail,
        amount: Number(rechargeAmount),
        status: 'approved',
        method: 'ADMIN_MANUAL',
        timestamp: serverTimestamp()
      });

      toast({ title: "Success", description: `Recharged ${rechargeAmount} coins to ${rechargeEmail}` });
      setRechargeEmail(''); setRechargeAmount('');
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsRecharging(false);
    }
  };

  const fetchRegistrations = async (tournamentId: string) => {
    if (!db) return;
    const q = collection(db, 'tournaments', tournamentId, 'registrations');
    const snap = await getDocs(q);
    const regs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRegistrations(regs);
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

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Secure Connection...</p>
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
          <TabsList className="grid grid-cols-4 bg-muted/30 h-12 rounded-2xl p-1 border border-white/5 overflow-x-auto no-scrollbar">
            <TabsTrigger value="create" className="rounded-xl font-black text-[9px] uppercase data-[state=active]:bg-primary transition-all">Deploy</TabsTrigger>
            <TabsTrigger value="manage" className="rounded-xl font-black text-[9px] uppercase data-[state=active]:bg-primary transition-all">Manage</TabsTrigger>
            <TabsTrigger value="approve" className="rounded-xl font-black text-[9px] uppercase data-[state=active]:bg-primary transition-all relative">
              Approve {livePendingPayments && livePendingPayments.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full flex items-center justify-center text-[7px]">{livePendingPayments.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="recharge" className="rounded-xl font-black text-[9px] uppercase data-[state=active]:bg-primary transition-all">Recharge</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
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
            <div className="space-y-3">
              {tournamentsLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
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
                      <DialogTrigger asChild><Button variant="outline" size="sm" onClick={() => { setManagingResults({id: match.id, title: match.title}); fetchRegistrations(match.id); }} className="flex-1 h-9 rounded-lg text-[10px] font-bold uppercase border-white/10"><Medal className="w-3.5 h-3.5 mr-1.5" /> Results</Button></DialogTrigger>
                      <DialogContent className="bg-card border-white/5 rounded-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>Match Winners</DialogTitle></DialogHeader>
                        <div className="space-y-3 py-4">
                          {registrations.map((reg) => (
                            <div key={reg.uid} className="p-3 bg-muted/30 rounded-xl flex items-center justify-between">
                              <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div><div><p className="text-xs font-black uppercase">{reg.ingameName || reg.displayName}</p></div></div>
                              <Input type="number" placeholder="TK" value={reg.wonAmount || ''} onChange={(e) => setRegistrations(prev => prev.map(r => r.uid === reg.uid ? { ...r, wonAmount: e.target.value } : r))} className="w-20 h-8 text-xs" />
                            </div>
                          ))}
                          <Button onClick={async () => {
                            for (const reg of registrations) await updateDoc(doc(db, 'tournaments', match.id, 'registrations', reg.uid), { wonAmount: Number(reg.wonAmount || 0) });
                            toast({ title: "Results Saved" }); setManagingResults(null);
                          }} className="w-full magma-gradient h-11 font-black uppercase italic">Save All Results</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="approve">
            <div className="space-y-3">
              {livePendingPayments?.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/5 rounded-3xl"><p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">No Pending Deposits</p></div>
              ) : livePendingPayments?.map((tx: any) => (
                <Card key={tx.id} className="border-white/5 bg-card/60 p-4 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Wallet className="w-5 h-5" /></div>
                      <div><h4 className="text-xs font-black uppercase">{tx.amount} TK Deposit</h4><p className="text-[8px] font-bold text-muted-foreground uppercase">{tx.method} • {tx.transactionId}</p></div>
                    </div>
                    <div className="text-right">
                       <p className="text-[8px] font-bold text-muted-foreground uppercase">{tx.userEmail}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => updateDoc(doc(db, 'transactions', tx.id), { status: 'rejected' })} className="flex-1 h-9 rounded-lg text-[10px] font-bold uppercase border-white/10 text-red-500"><XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject</Button>
                    <Button size="sm" onClick={() => handleApprovePayment(tx)} className="flex-1 h-9 rounded-lg text-[10px] font-bold uppercase magma-gradient"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Approve</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recharge">
            <Card className="border-white/5 bg-card/50 rounded-[2rem]">
              <CardHeader><CardTitle className="text-sm font-black uppercase italic flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Manual Coin Injection</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleManualRecharge} className="space-y-4">
                  <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase ml-1">User Email</Label><Input type="email" placeholder="player@example.com" value={rechargeEmail} onChange={(e) => setRechargeEmail(e.target.value)} className="bg-muted/50 border-white/5 h-11 rounded-xl" required /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase ml-1">Amount to Add</Label><Input type="number" placeholder="e.g. 500" value={rechargeAmount} onChange={(e) => setRechargeAmount(e.target.value)} className="bg-muted/50 border-white/5 h-11 rounded-xl" required /></div>
                  <Button type="submit" disabled={isRecharging} className="w-full h-12 magma-gradient font-black uppercase italic rounded-xl">
                    {isRecharging ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Inject Coins'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
