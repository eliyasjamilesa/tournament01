
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  Swords, 
  Loader2,
  Trash2,
  Trophy,
  Skull,
  Plus,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp, query, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminDashboard() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, loading: profileLoading } = useDoc<any>(userDocRef);

  const tournamentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'), limit(50));
  }, [db]);

  const { data: tournaments, loading: tournamentsLoading } = useCollection<any>(tournamentsQuery);

  // Match Form State
  const [matchTitle, setMatchTitle] = useState('');
  const [matchMode, setMatchMode] = useState('Solo');
  const [matchMap, setMatchMap] = useState('Bermuda');
  const [matchVersion, setMatchVersion] = useState('TPP');
  const [entryFee, setEntryFee] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const [perKill, setPerKill] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('48');
  const [startTime, setStartTime] = useState('');
  
  // Prize Breakdown
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [p3, setP3] = useState('');
  const [p4, setP4] = useState('');
  const [p5, setP5] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Debugging logs
    if (!userLoading && !profileLoading) {
      console.log("Auth User:", user?.uid);
      console.log("Profile Role:", profile?.role);
      
      if (!user) {
        router.replace('/login');
      } else if (profile && profile.role !== 'admin') {
        router.replace('/');
      }
    }
  }, [user, userLoading, profile, profileLoading, router]);

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
        prizes: {
          p1: Number(p1),
          p2: Number(p2),
          p3: Number(p3),
          p4: Number(p4),
          p5: Number(p5),
        },
        createdAt: serverTimestamp(),
      });
      
      toast({
        title: "Match Created",
        description: `Tournament ${matchId} has been launched!`,
      });
      
      setMatchTitle('');
      setEntryFee('');
      setPrizePool('');
      setPerKill('');
      setStartTime('');
      setP1(''); setP2(''); setP3(''); setP4(''); setP5('');
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMatch = async (id: string) => {
    if (!db) return;
    if (!confirm('Are you sure you want to delete this match?')) return;
    deleteDoc(doc(db, 'tournaments', id));
  };

  // While loading, show a centered spinner
  if (userLoading || profileLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Authenticating Commander...</p>
      </div>
    );
  }

  // If data loaded but not admin, show a small debug message before redirect effect kicks in
  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <Alert variant="destructive" className="max-w-xs border-primary/20 bg-primary/5">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs font-bold uppercase tracking-tight">
            Administrative Privileges Required
            <span className="block mt-2 opacity-50 text-[10px]">UID: {user?.uid}</span>
          </AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()} variant="link" className="mt-4 text-[10px] uppercase font-bold tracking-widest">Retry Connection</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <header className="flex items-center justify-between mb-8 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl magma-gradient flex items-center justify-center shadow-lg shadow-primary/20">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-headline font-black uppercase italic tracking-tight">Admin <span className="text-primary">Panel</span></h1>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="text-[10px] font-bold uppercase tracking-widest h-8 border border-white/5 rounded-lg">Exit</Button>
      </header>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid grid-cols-2 bg-card border border-white/5 h-12 rounded-xl p-1">
          <TabsTrigger value="create" className="rounded-lg font-bold text-[10px] uppercase tracking-widest">Create Match</TabsTrigger>
          <TabsTrigger value="manage" className="rounded-lg font-bold text-[10px] uppercase tracking-widest">Manage List</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card className="border-white/5 bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-headline font-bold uppercase italic flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" /> Launch Tournament
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMatch} className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Title</Label>
                    <Input placeholder="e.g. Bermuda Night Solo" value={matchTitle} onChange={(e) => setMatchTitle(e.target.value)} className="input-simple" required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Mode</Label>
                      <Select value={matchMode} onValueChange={setMatchMode}>
                        <SelectTrigger className="input-simple"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Solo">Solo</SelectItem>
                          <SelectItem value="Duo">Duo</SelectItem>
                          <SelectItem value="Squad">Squad</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Map</Label>
                      <Select value={matchMap} onValueChange={setMatchMap}>
                        <SelectTrigger className="input-simple"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bermuda">Bermuda</SelectItem>
                          <SelectItem value="Purgatory">Purgatory</SelectItem>
                          <SelectItem value="Kalahari">Kalahari</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Version</Label>
                      <Select value={matchVersion} onValueChange={setMatchVersion}>
                        <SelectTrigger className="input-simple"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TPP">TPP</SelectItem>
                          <SelectItem value="FPP">FPP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Start Time</Label>
                      <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="input-simple" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Fee (TK)</Label>
                      <Input type="number" value={entryFee} onChange={(e) => setEntryFee(e.target.value)} className="input-simple" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Total Prize</Label>
                      <Input type="number" value={prizePool} onChange={(e) => setPrizePool(e.target.value)} className="input-simple" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Per Kill</Label>
                      <Input type="number" value={perKill} onChange={(e) => setPerKill(e.target.value)} className="input-simple" required />
                    </div>
                  </div>

                  <div className="p-4 border border-white/5 rounded-2xl bg-background/40 space-y-4">
                    <h4 className="text-[10px] font-bold uppercase text-primary tracking-widest flex items-center gap-2">
                      <Trophy className="w-3 h-3" /> Position Prize Pool
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[8px] uppercase font-bold text-muted-foreground">1st Winner</Label>
                        <Input type="number" value={p1} onChange={(e) => setP1(e.target.value)} className="input-simple h-10 text-xs" required />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[8px] uppercase font-bold text-muted-foreground">2nd Position</Label>
                        <Input type="number" value={p2} onChange={(e) => setP2(e.target.value)} className="input-simple h-10 text-xs" required />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[8px] uppercase font-bold text-muted-foreground">3rd Position</Label>
                        <Input type="number" value={p3} onChange={(e) => setP3(e.target.value)} className="input-simple h-10 text-xs" required />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[8px] uppercase font-bold text-muted-foreground">4th Position</Label>
                        <Input type="number" value={p4} onChange={(e) => setP4(e.target.value)} className="input-simple h-10 text-xs" required />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[8px] uppercase font-bold text-muted-foreground">5th Position</Label>
                        <Input type="number" value={p5} onChange={(e) => setP5(e.target.value)} className="input-simple h-10 text-xs" required />
                      </div>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full h-12 magma-gradient font-black uppercase italic tracking-widest rounded-xl shadow-lg active:scale-95 transition-all">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Launch Match'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <div className="space-y-4">
            {tournamentsLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" /></div>
            ) : tournaments?.length === 0 ? (
              <div className="text-center py-20 bg-card/20 rounded-3xl border border-white/5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No Active Matches</p>
              </div>
            ) : tournaments?.map((match: any) => (
              <Card key={match.id} className="border-white/5 bg-card/40 p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Swords className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="block text-sm font-black uppercase italic">{match.title} <span className="text-primary">{match.matchId}</span></span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{match.mode} • {match.map} • {match.entryFee} TK</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive rounded-xl" onClick={() => handleDeleteMatch(match.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
