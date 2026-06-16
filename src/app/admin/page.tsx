
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
  Info,
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
  const [hasCheckedRole, setHasCheckedRole] = useState(false);

  useEffect(() => {
    if (!userLoading && !profileLoading) {
      console.log("Auth State:", { uid: user?.uid, role: profile?.role });
      setHasCheckedRole(true);
      
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
      
      // Reset form
      setMatchTitle(''); setEntryFee(''); setPrizePool(''); setPerKill(''); setStartTime('');
      setP1(''); setP2(''); setP3(''); setP4(''); setP5('');
    } catch (error: any) {
      console.error("Error creating match:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMatch = async (id: string) => {
    if (!db) return;
    if (!confirm('Are you sure you want to delete this match?')) return;
    deleteDoc(doc(db, 'tournaments', id));
  };

  // 1. Initial Loading
  if (userLoading || profileLoading || !hasCheckedRole) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Establishing Secure Uplink...</p>
      </div>
    );
  }

  // 2. Not Admin UI (Shown briefly before redirect if caught)
  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
          <ShieldAlert className="w-10 h-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-black uppercase italic italic text-primary">Access Forbidden</h1>
          <p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed">
            Administrative privileges required to access this command center.
          </p>
        </div>
        
        <Alert className="bg-white/5 border-white/5 max-w-sm rounded-2xl">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-[10px] font-bold text-left space-y-1">
            <span className="block opacity-50 uppercase">Debug Info</span>
            <span className="block">UID: <span className="text-primary font-mono select-all">{user?.uid}</span></span>
            <span className="block">Detected Role: <span className="text-primary uppercase">{profile?.role || 'Guest'}</span></span>
          </AlertDescription>
        </Alert>

        <div className="flex flex-col w-full max-w-[200px] gap-2">
          <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl font-bold uppercase text-[10px] h-11">
            <RefreshCcw className="w-4 h-4 mr-2" /> Refresh Now
          </Button>
          <Button onClick={() => router.push('/')} variant="ghost" className="text-[10px] uppercase font-bold text-muted-foreground">Return to Base</Button>
        </div>
      </div>
    );
  }

  // 3. Admin UI
  return (
    <div className="min-h-screen bg-background p-6 pb-32">
      <header className="flex items-center justify-between mb-8 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl magma-gradient flex items-center justify-center shadow-2xl shadow-primary/20">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">Admin <span className="text-primary">Panel</span></h1>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="text-[10px] font-bold uppercase tracking-widest h-8 border border-white/5 rounded-xl px-4">Exit</Button>
      </header>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid grid-cols-2 bg-[#0d0d0d] border border-white/5 h-14 rounded-2xl p-1.5">
          <TabsTrigger value="create" className="rounded-xl font-black text-[10px] uppercase tracking-widest">Create Match</TabsTrigger>
          <TabsTrigger value="manage" className="rounded-xl font-black text-[10px] uppercase tracking-widest">Manage List</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card className="border-white/5 bg-[#0d0d0d]/60 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black uppercase italic flex items-center gap-3">
                <Plus className="w-5 h-5 text-primary" /> Launch Tournament
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <form onSubmit={handleAddMatch} className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Title</Label>
                    <Input placeholder="e.g. Bermuda Night Solo" value={matchTitle} onChange={(e) => setMatchTitle(e.target.value)} className="input-simple" required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Mode</Label>
                      <Select value={matchMode} onValueChange={setMatchMode}>
                        <SelectTrigger className="input-simple"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Solo">Solo</SelectItem>
                          <SelectItem value="Duo">Duo</SelectItem>
                          <SelectItem value="Squad">Squad</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Map</Label>
                      <Select value={matchMap} onValueChange={setMatchMap}>
                        <SelectTrigger className="input-simple"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bermuda">Bermuda</SelectItem>
                          <SelectItem value="Purgatory">Purgatory</SelectItem>
                          <SelectItem value="Kalahari">Kalahari</SelectItem>
                          <SelectItem value="Alpine">Alpine</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Version</Label>
                      <Select value={matchVersion} onValueChange={setMatchVersion}>
                        <SelectTrigger className="input-simple"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TPP">TPP</SelectItem>
                          <SelectItem value="FPP">FPP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Start Time</Label>
                      <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="input-simple" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Fee</Label>
                      <Input type="number" value={entryFee} onChange={(e) => setEntryFee(e.target.value)} className="input-simple" required />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Prize</Label>
                      <Input type="number" value={prizePool} onChange={(e) => setPrizePool(e.target.value)} className="input-simple" required />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1 tracking-widest">Kill</Label>
                      <Input type="number" value={perKill} onChange={(e) => setPerKill(e.target.value)} className="input-simple" required />
                    </div>
                  </div>

                  <div className="p-6 border border-white/5 rounded-3xl bg-background/40 space-y-6">
                    <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-2 italic">
                      <Trophy className="w-4 h-4" /> Position Prize Pool
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {[1, 2, 3, 4, 5].map((pos) => (
                        <div key={pos} className="space-y-1.5">
                          <Label className="text-[8px] uppercase font-black text-muted-foreground tracking-widest">Position {pos}</Label>
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
                            className="input-simple h-11 text-xs" 
                            required 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full h-14 magma-gradient font-black uppercase italic tracking-[0.2em] rounded-2xl shadow-2xl active:scale-95 transition-all text-sm">
                  {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Launch Match'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <div className="space-y-4">
            {tournamentsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Scanning Databases...</p>
              </div>
            ) : tournaments?.length === 0 ? (
              <div className="text-center py-20 bg-[#0d0d0d]/40 rounded-[2.5rem] border border-white/5 border-dashed">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No Active Matches Found</p>
              </div>
            ) : tournaments?.map((match: any) => (
              <Card key={match.id} className="border-white/5 bg-[#0d0d0d] p-5 rounded-3xl group hover:border-primary/20 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/10">
                      <Swords className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="block text-sm font-black uppercase italic group-hover:text-primary transition-colors">{match.title} <span className="text-muted-foreground font-normal">|</span> <span className="text-primary">{match.matchId}</span></span>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{match.mode} • {match.map} • {match.entryFee} TK</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl w-10 h-10" onClick={() => handleDeleteMatch(match.id)}>
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
