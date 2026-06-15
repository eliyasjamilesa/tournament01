
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
  DollarSign,
  Trash2,
  AlertCircle,
  RefreshCcw
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminDashboard() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, loading: profileLoading, error: profileError } = useDoc<any>(userDocRef);

  // Tournament Collection
  const tournamentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'), limit(20));
  }, [db]);

  const { data: tournaments, loading: tournamentsLoading } = useCollection<any>(tournamentsQuery);

  // Match Form State
  const [matchTitle, setMatchTitle] = useState('');
  const [matchMode, setMatchMode] = useState('BR');
  const [entryFee, setEntryFee] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Admin Check Logic
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (userLoading || profileLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    // Logging for debug purposes
    console.log("Admin Check - UID:", user.uid);
    console.log("Admin Check - Role from DB:", profile?.role);

    if (!isAdmin) {
      // We don't redirect immediately to give the user a chance to see debug info if needed
      // but we show the error toast
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Your account does not have admin privileges in the database.",
      });
    }
  }, [user, profile, userLoading, profileLoading, router, toast, isAdmin]);

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setIsSubmitting(true);
    
    try {
      addDoc(collection(db, 'tournaments'), {
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
        description: `${matchTitle} has been added successfully.`,
      });
      
      setMatchTitle('');
      setEntryFee('');
      setPrizePool('');
    } catch (error: any) {
      console.error("Failed to add match:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "You don't have permission to create matches.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMatch = async (id: string) => {
    if (!db) return;
    if (!confirm('Are you sure you want to delete this match?')) return;
    
    try {
      deleteDoc(doc(db, 'tournaments', id));
      toast({
        title: "Match Deleted",
        description: "The match has been removed.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete match.",
      });
    }
  };

  if (userLoading || profileLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
          Authenticating Admin...
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-headline font-bold uppercase">Access Denied</h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            আপনার অ্যাকাউন্টে অ্যাডমিন পারমিশন নেই। ডাটাবেসে আপনার রোলটি চেক করুন।
          </p>
        </div>
        
        <Alert variant="destructive" className="bg-card border-white/5 text-left">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-xs font-bold uppercase tracking-wider">Debug Info</AlertTitle>
          <AlertDescription className="mt-2 space-y-1">
            <p className="text-[10px] font-mono break-all">UID: {user?.uid}</p>
            <p className="text-[10px] font-mono">Current Role: {profile?.role || 'null'}</p>
          </AlertDescription>
        </Alert>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
            <RefreshCcw className="w-4 h-4" /> Try Again
          </Button>
          <Button onClick={() => router.push('/')} variant="ghost">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 pb-24 animate-in fade-in duration-500">
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
             <h3 className="text-sm font-headline font-bold uppercase tracking-widest text-muted-foreground px-1">Active Matches</h3>
             {tournamentsLoading ? (
               <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
             ) : tournaments && tournaments.length === 0 ? (
               <div className="text-center py-8 text-muted-foreground text-xs uppercase font-bold tracking-widest border border-dashed border-white/10 rounded-xl">No matches found</div>
             ) : (
               <div className="space-y-3">
                 {tournaments?.map((match: any) => (
                   <Card key={match.id} className="border-white/5 bg-card/40 p-4">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                           <Swords className="w-5 h-5 text-primary" />
                         </div>
                         <div>
                           <span className="block text-sm font-bold">{match.title}</span>
                           <div className="flex items-center gap-2">
                             <Badge variant="outline" className="text-[8px] h-4 font-bold uppercase tracking-tighter border-white/10">{match.mode}</Badge>
                             <span className="text-[10px] font-bold text-muted-foreground uppercase">{match.currentPlayers}/{match.maxPlayers} Players</span>
                           </div>
                         </div>
                       </div>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="text-muted-foreground hover:text-destructive h-8 w-8"
                         onClick={() => handleDeleteMatch(match.id)}
                       >
                         <Trash2 className="w-4 h-4" />
                       </Button>
                     </div>
                   </Card>
                 ))}
               </div>
             )}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
           <Card className="border-white/5 bg-card/60 p-6 flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-headline font-bold text-lg uppercase italic">Publish Match Results</h3>
              <p className="text-muted-foreground text-xs max-max-w-[200px] mt-1">Select a completed tournament to distribute rewards and update leaderboards.</p>
              <Button className="mt-6 font-bold uppercase tracking-widest h-10 px-8" variant="secondary">Coming Soon</Button>
           </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
           <div className="grid grid-cols-2 gap-4">
              <Card className="border-white/5 bg-card/60 p-4 space-y-2">
                 <div className="flex items-center gap-2 text-yellow-500">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Pending Topups</span>
                 </div>
                 <span className="text-2xl font-black font-headline tracking-tighter">--</span>
              </Card>
              <Card className="border-white/5 bg-card/60 p-4 space-y-2">
                 <div className="flex items-center gap-2 text-primary">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Withdrawals</span>
                 </div>
                 <span className="text-2xl font-black font-headline tracking-tighter">--</span>
              </Card>
           </div>
           <Button className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/5 font-bold uppercase tracking-widest rounded-xl text-[11px]">
              View All Transactions (Coming Soon)
           </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
