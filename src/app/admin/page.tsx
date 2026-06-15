
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  Trophy, 
  CreditCard, 
  Swords, 
  Loader2,
  Trash2,
  DollarSign,
  PlusCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp, query, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!userLoading && !profileLoading) {
      if (!user) {
        router.replace('/login');
        return;
      }
      if (profile?.role !== 'admin') {
        const timer = setTimeout(() => {
          router.replace('/');
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [user, userLoading, profileLoading, profile, router]);

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
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create match.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMatch = async (id: string) => {
    if (!db) return;
    if (!confirm('Are you sure you want to delete this match?')) return;
    deleteDoc(doc(db, 'tournaments', id));
  };

  if (userLoading || profileLoading || !profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
          Verifying Identity...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <header className="flex items-center justify-between mb-8 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl magma-gradient flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-headline font-black uppercase italic tracking-tight">Admin <span className="text-primary">Panel</span></h1>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="text-[10px] font-bold uppercase tracking-widest">Exit</Button>
      </header>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid grid-cols-3 bg-card border border-white/5 h-12 rounded-xl p-1">
          <TabsTrigger value="create" className="rounded-lg font-bold text-[10px] uppercase tracking-widest">Create</TabsTrigger>
          <TabsTrigger value="manage" className="rounded-lg font-bold text-[10px] uppercase tracking-widest">Manage</TabsTrigger>
          <TabsTrigger value="finance" className="rounded-lg font-bold text-[10px] uppercase tracking-widest">Finance</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card className="border-white/5 bg-card/60">
            <CardHeader>
              <CardTitle className="text-lg font-headline font-bold uppercase italic">Launch Tournament</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMatch} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Title</Label>
                  <Input placeholder="e.g. Bermuda Night Solo" value={matchTitle} onChange={(e) => setMatchTitle(e.target.value)} className="input-simple" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Mode</Label>
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
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Map</Label>
                    <Select value={matchMap} onValueChange={setMatchMap}>
                      <SelectTrigger className="input-simple"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bermuda">Bermuda</SelectItem>
                        <SelectItem value="Purgatory">Purgatory</SelectItem>
                        <SelectItem value="Kalahari">Kalahari</SelectItem>
                        <SelectItem value="Nexterra">Nexterra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Version</Label>
                    <Select value={matchVersion} onValueChange={setMatchVersion}>
                      <SelectTrigger className="input-simple"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TPP">TPP</SelectItem>
                        <SelectItem value="FPP">FPP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Start Time</Label>
                    <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="input-simple" required />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Fee (TK)</Label>
                    <Input type="number" value={entryFee} onChange={(e) => setEntryFee(e.target.value)} className="input-simple" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Prize (TK)</Label>
                    <Input type="number" value={prizePool} onChange={(e) => setPrizePool(e.target.value)} className="input-simple" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Kill (TK)</Label>
                    <Input type="number" value={perKill} onChange={(e) => setPerKill(e.target.value)} className="input-simple" required />
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full h-12 magma-gradient font-black uppercase italic tracking-widest rounded-xl shadow-lg mt-2">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Launch Tournament'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <div className="space-y-4">
            {tournamentsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : tournaments?.map((match: any) => (
              <Card key={match.id} className="border-white/5 bg-card/40 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Swords className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold">{match.title} <span className="text-primary">{match.matchId}</span></span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{match.mode} • {match.map} • {match.currentPlayers}/{match.maxPlayers}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDeleteMatch(match.id)}>
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
