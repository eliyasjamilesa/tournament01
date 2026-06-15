
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  Plus, 
  Trophy, 
  CreditCard, 
  Settings, 
  Users, 
  Swords, 
  ChevronRight, 
  Loader2,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

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

  // Match Form State
  const [matchTitle, setMatchTitle] = useState('');
  const [matchMode, setMatchMode] = useState('BR');
  const [entryFee, setEntryFee] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!userLoading && !profileLoading) {
      if (!user || profile?.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, profile, userLoading, profileLoading, router]);

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'tournaments'), {
        title: matchTitle,
        mode: matchMode,
        entryFee: Number(entryFee),
        prizePool: prizePool,
        status: 'open',
        currentPlayers: 0,
        maxPlayers: matchMode === 'BR' ? 50 : 16,
        createdAt: serverTimestamp(),
      });
      toast({
        title: "Match Created",
        description: `${matchTitle} has been added to the arena.`,
      });
      setMatchTitle('');
      setEntryFee('');
      setPrizePool('');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (userLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <header className="space-y-2 pt-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl magma-gradient flex items-center justify-center shadow-lg shadow-primary/20">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-black uppercase italic tracking-tight">Admin <span className="text-primary">Panel</span></h1>
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Arena Management System</p>
          </div>
        </div>
      </header>

      <Tabs defaultValue="matches" className="space-y-6">
        <TabsList className="grid grid-cols-3 bg-card border border-white/5 h-12 rounded-xl p-1">
          <TabsTrigger value="matches" className="rounded-lg font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">
            Matches
          </TabsTrigger>
          <TabsTrigger value="results" className="rounded-lg font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">
            Results
          </TabsTrigger>
          <TabsTrigger value="payments" className="rounded-lg font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">
            Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="space-y-6">
          <Card className="border-white/5 bg-card/60">
            <CardHeader>
              <CardTitle className="text-lg font-headline font-bold uppercase italic tracking-tight">Add New Match</CardTitle>
              <CardDescription className="text-xs">Configure and launch a new tournament lobby.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMatch} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Tournament Title</Label>
                  <Input 
                    placeholder="e.g. Bermuda King Pro" 
                    value={matchTitle}
                    onChange={(e) => setMatchTitle(e.target.value)}
                    className="input-simple"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Game Mode</Label>
                    <select 
                      value={matchMode}
                      onChange={(e) => setMatchMode(e.target.value)}
                      className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 h-12 text-sm font-medium focus:ring-1 focus:ring-primary/20 appearance-none text-foreground"
                    >
                      <option value="BR">Battle Royale</option>
                      <option value="CS">Clash Squad</option>
                      <option value="LW">Lone Wolf</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Entry Fee (Coins)</Label>
                    <Input 
                      type="number" 
                      placeholder="0 for Free" 
                      value={entryFee}
                      onChange={(e) => setEntryFee(e.target.value)}
                      className="input-simple"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Prize Pool</Label>
                  <Input 
                    placeholder="e.g. $500 or 1000 Coins" 
                    value={prizePool}
                    onChange={(e) => setPrizePool(e.target.value)}
                    className="input-simple"
                    required
                  />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full h-12 magma-gradient font-black uppercase italic tracking-widest rounded-xl shadow-lg mt-2">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Launch Tournament'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
             <h3 className="text-sm font-headline font-bold uppercase tracking-widest text-muted-foreground px-1">Active Lobby Management</h3>
             <Card className="border-white/5 bg-card/40 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Swords className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold">Current Active Matches</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">14 Lobbies Online</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 text-[9px] font-bold uppercase tracking-widest">View All</Button>
                </div>
             </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
           <Card className="border-white/5 bg-card/60 p-6 flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-headline font-bold text-lg uppercase italic">Publish Match Results</h3>
              <p className="text-muted-foreground text-xs max-w-[200px] mt-1">Select a completed tournament to distribute rewards and update leaderboards.</p>
              <Button className="mt-6 font-bold uppercase tracking-widest h-10 px-8">Select Tournament</Button>
           </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
           <div className="grid grid-cols-2 gap-4">
              <Card className="border-white/5 bg-card/60 p-4 space-y-2">
                 <div className="flex items-center gap-2 text-yellow-500">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Pending Topups</span>
                 </div>
                 <span className="text-2xl font-black font-headline tracking-tighter">24</span>
              </Card>
              <Card className="border-white/5 bg-card/60 p-4 space-y-2">
                 <div className="flex items-center gap-2 text-primary">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Withdrawals</span>
                 </div>
                 <span className="text-2xl font-black font-headline tracking-tighter">08</span>
              </Card>
           </div>
           <Button className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/5 font-bold uppercase tracking-widest rounded-xl text-[11px]">
              View All Transactions
           </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
