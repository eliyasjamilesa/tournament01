
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
  RefreshCcw
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

type AuthStatus = 'checking' | 'authorized' | 'unauthorized';

export default function AdminDashboard() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, loading: profileLoading } = useDoc<any>(userDocRef);

  useEffect(() => {
    if (userLoading || profileLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (profile) {
      if (profile.role === 'admin') {
        setAuthStatus('authorized');
      } else {
        setAuthStatus('unauthorized');
        router.replace('/');
      }
    } else {
      // Profile data not found yet, but authenticated. 
      // Could be a slow firestore response. We stay on 'checking'.
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
        title: "Success",
        description: `Match ${matchId} deployed.`,
      });
      
      setMatchTitle(''); setEntryFee(''); setPrizePool(''); setPerKill(''); setStartTime('');
      setP1(''); setP2(''); setP3(''); setP4(''); setP5('');
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMatch = async (id: string) => {
    if (!db) return;
    if (confirm('Delete this tournament?')) {
      deleteDoc(doc(db, 'tournaments', id));
    }
  };

  if (authStatus === 'checking') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Verifying Authority...</p>
      </div>
    );
  }

  if (authStatus === 'unauthorized') return null;

  return (
    <div className="min-h-screen bg-background p-6 pb-32">
      <header className="flex items-center justify-between mb-8 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-black uppercase italic">Admin <span className="text-primary">Panel</span></h1>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="text-[10px] font-bold uppercase">Exit</Button>
      </header>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid grid-cols-2 bg-muted h-12 rounded-xl p-1">
          <TabsTrigger value="create" className="rounded-lg font-black text-[10px] uppercase">New Match</TabsTrigger>
          <TabsTrigger value="manage" className="rounded-lg font-black text-[10px] uppercase">All Matches</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card className="border-white/5 bg-card/50 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-black uppercase italic flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" /> Match Specs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMatch} className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Title</Label>
                    <Input placeholder="e.g. Bermuda Night Solo" value={matchTitle} onChange={(e) => setMatchTitle(e.target.value)} className="bg-muted border-none h-11" required />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Mode</Label>
                      <Select value={matchMode} onValueChange={setMatchMode}>
                        <SelectTrigger className="bg-muted border-none h-11"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Solo">Solo</SelectItem>
                          <SelectItem value="Duo">Duo</SelectItem>
                          <SelectItem value="Squad">Squad</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Map</Label>
                      <Select value={matchMap} onValueChange={setMatchMap}>
                        <SelectTrigger className="bg-muted border-none h-11"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bermuda">Bermuda</SelectItem>
                          <SelectItem value="Purgatory">Purgatory</SelectItem>
                          <SelectItem value="Kalahari">Kalahari</SelectItem>
                          <SelectItem value="Alpine">Alpine</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Perspective</Label>
                      <Select value={matchVersion} onValueChange={setMatchVersion}>
                        <SelectTrigger className="bg-muted border-none h-11"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TPP">TPP</SelectItem>
                          <SelectItem value="FPP">FPP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Launch Time</Label>
                      <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="bg-muted border-none h-11" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Entry</Label>
                      <Input type="number" value={entryFee} onChange={(e) => setEntryFee(e.target.value)} className="bg-muted border-none h-11" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Total</Label>
                      <Input type="number" value={prizePool} onChange={(e) => setPrizePool(e.target.value)} className="bg-muted border-none h-11" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Kill</Label>
                      <Input type="number" value={perKill} onChange={(e) => setPerKill(e.target.value)} className="bg-muted border-none h-11" required />
                    </div>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-xl space-y-4">
                    <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                      <Trophy className="w-3.5 h-3.5" /> Position Prizes
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[1, 2, 3, 4, 5].map((pos) => (
                        <div key={pos} className="space-y-1">
                          <Label className="text-[8px] font-bold text-muted-foreground">Rank {pos}</Label>
                          <Input 
                            type="number" 
                            value={pos === 1 ? p1 : pos === 2 ? p2 : pos === 3 ? p3 : pos === 4 ? p4 : p5} 
                            onChange={(e) => {
                              const v = e.target.value;
                              if(pos === 1) setP1(v);
                              else if(pos === 2) setP2(v);
                              else if(pos === 3) setP3(v);
                              else if(pos === 4) setP4(v);
                              else setP5(v);
                            }} 
                            className="bg-muted border-none h-10 text-xs" 
                            required 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full h-12 font-black uppercase italic tracking-widest rounded-xl shadow-lg">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Deploy Match'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <div className="space-y-3">
            {tournamentsLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
              </div>
            ) : tournaments?.map((match: any) => (
              <Card key={match.id} className="border-white/5 bg-card/60 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Swords className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase italic">{match.title} <span className="text-primary">{match.matchId}</span></h4>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase">{match.mode} • {match.map} • {match.entryFee} TK</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8" onClick={() => handleDeleteMatch(match.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
