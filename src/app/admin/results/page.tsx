
"use client";

import { useState, useMemo } from 'react';
import { 
  Trophy, 
  Loader2, 
  Search, 
  User, 
  Target, 
  Crown,
  ArrowLeft,
  ChevronRight,
  Save,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, limit, getDocs, writeBatch, increment, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function AdminResultsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const tournamentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'), limit(50));
  }, [db]);
  const { data: tournaments, loading: tournamentsLoading } = useCollection<any>(tournamentsQuery);

  const currentMatch = useMemo(() => {
    return tournaments?.find(t => t.id === selectedMatchId);
  }, [tournaments, selectedMatchId]);

  const fetchRegistrations = async (tournamentId: string) => {
    if (!db) return;
    setSelectedMatchId(tournamentId);
    try {
      const snap = await getDocs(collection(db, 'tournaments', tournamentId, 'registrations'));
      setRegistrations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load players." });
    }
  };

  const handleUpdateReg = (regId: string, field: string, value: string | number) => {
    setRegistrations(prev => prev.map(r => 
      r.id === regId ? { ...r, [field]: value } : r
    ));
  };

  const handleBooyahShortcut = (regId: string) => {
    if (!currentMatch) return;
    const winAmount = Number(currentMatch.prizes?.p1 || 0);
    setRegistrations(prev => prev.map(r => 
      r.id === regId ? { ...r, wonAmount: winAmount } : r
    ));
    toast({ title: "Winner Selected", description: `${winAmount} TK set for player.` });
  };

  const handlePublishResults = async () => {
    if (!db || !selectedMatchId || !currentMatch) return;
    setIsPublishing(true);
    try {
      const batch = writeBatch(db);
      const isAlreadyCompleted = currentMatch.status === 'completed';
      
      for (const reg of registrations) {
        const regRef = doc(db, 'tournaments', selectedMatchId, 'registrations', reg.id);
        const winAmount = Number(reg.wonAmount || 0);
        const killCount = Number(reg.kills || 0);
        
        // Update registration record
        batch.update(regRef, { 
          wonAmount: winAmount,
          kills: killCount,
          xpAwarded: true
        });

        // UPDATE USER STATS (Only if match status is changing from open/live to completed)
        if (!isAlreadyCompleted) {
          const userRef = doc(db, 'users', reg.id);
          const killXP = killCount * 5; 
          const winXP = winAmount > 0 ? 50 : 0;
          const totalXP = killXP + winXP;
          
          const userUpdate: any = {};
          if (totalXP > 0) userUpdate.xp = increment(totalXP);
          if (winAmount > 0) userUpdate.totalWinnings = increment(winAmount);
          
          // Note: Level is derived from XP in profile page, no need to update level field if we use derivation
          
          if (Object.keys(userUpdate).length > 0) {
            batch.update(userRef, userUpdate);
          }

          // LOG XP HISTORY
          if (totalXP > 0) {
            const xpLogRef = doc(collection(db, 'users', reg.id, 'xpHistory'));
            batch.set(xpLogRef, {
              userId: reg.id,
              amount: totalXP,
              reason: `Match Results: ${currentMatch.title} (${killCount} Kills ${winXP > 0 ? '+ Booyah' : ''})`,
              timestamp: serverTimestamp()
            });
          }
        }
      }
      
      const tournamentRef = doc(db, 'tournaments', selectedMatchId);
      batch.update(tournamentRef, { status: 'completed' });
      
      await batch.commit();
      toast({ title: "সফল", description: "ম্যাচ রেজাল্ট পাবলিশ হয়েছে। প্লেয়াররা XP এবং উইনিং রেকর্ড পেয়েছে।" });
      setSelectedMatchId(null);
    } catch (err: any) {
      toast({ variant: "destructive", title: "ব্যর্থ হয়েছে", description: err.message });
    } finally {
      setIsPublishing(false);
    }
  };

  const filteredMatches = tournaments?.filter(t => 
    t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.matchId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedMatchId && currentMatch) {
    return (
      <div className="space-y-6 pb-32 animate-in fade-in slide-in-from-right-4 duration-500">
        <header className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setSelectedMatchId(null)} className="rounded-full bg-white/5">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-lg font-black uppercase italic tracking-tight">{currentMatch.title}</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">{currentMatch.matchId} • {registrations.length} Players</p>
          </div>
        </header>

        <div className="space-y-4">
          {registrations.length === 0 ? (
            <div className="text-center py-20 bg-muted/5 rounded-3xl border border-white/5 border-dashed">
               <p className="text-[10px] font-bold text-muted-foreground uppercase">এই ম্যাচে কেউ জয়েন করেনি</p>
            </div>
          ) : (
            registrations.sort((a, b) => a.slotNumber - b.slotNumber).map((reg) => (
              <Card key={reg.id} className="border-white/5 bg-card/40 overflow-hidden rounded-2xl">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black italic">
                        #{reg.slotNumber}
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase italic text-white">{reg.ingameName || reg.displayName}</h4>
                        <p className="text-[8px] font-bold text-muted-foreground font-mono">UID: {reg.ingameId || '---'}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleBooyahShortcut(reg.id)}
                      className={cn(
                        "h-8 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest gap-1.5",
                        Number(reg.wonAmount) > 0 ? "bg-yellow-500 border-yellow-500 text-black" : "border-white/10 bg-white/5"
                      )}
                    >
                      <Crown className="w-3 h-3" /> Booyah
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[8px] font-black uppercase text-muted-foreground ml-1">Kills</Label>
                      <div className="relative">
                        <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-primary" />
                        <Input 
                          type="number" 
                          value={reg.kills || ''} 
                          onChange={(e) => handleUpdateReg(reg.id, 'kills', e.target.value)}
                          placeholder="0"
                          className="h-9 bg-black/20 border-white/5 pl-8 text-xs font-black"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[8px] font-black uppercase text-muted-foreground ml-1">Winning (TK)</Label>
                      <div className="relative">
                        <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-yellow-500" />
                        <Input 
                          type="number" 
                          value={reg.wonAmount || ''} 
                          onChange={(e) => handleUpdateReg(reg.id, 'wonAmount', e.target.value)}
                          placeholder="0"
                          className="h-9 bg-black/20 border-white/5 pl-8 text-xs font-black text-yellow-500"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-background/80 backdrop-blur-md border-t border-white/5 z-[100]">
          <div className="max-w-md mx-auto">
            <Button 
              disabled={isPublishing || registrations.length === 0}
              onClick={handlePublishResults}
              className="w-full h-14 magma-gradient font-black uppercase italic tracking-widest rounded-xl shadow-xl text-sm gap-2"
            >
              {isPublishing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> পাবলিশ করুন</>}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Match <span className="text-primary">Results</span></h2>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">রেজাল্ট দেওয়ার জন্য একটি ম্যাচ সিলেক্ট করুন</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="সার্চ করুন (ID বা নাম)..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-muted/30 border-white/5 h-12 pl-12 rounded-xl text-sm"
        />
      </div>

      <div className="space-y-4">
        {tournamentsLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" /></div>
        ) : filteredMatches?.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/5 rounded-3xl">
             <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">ম্যাচ পাওয়া যায়নি</p>
          </div>
        ) : filteredMatches?.map((match) => (
          <Card 
            key={match.id} 
            onClick={() => fetchRegistrations(match.id)}
            className="border-white/5 bg-card/40 p-5 rounded-2xl cursor-pointer hover:bg-white/5 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center text-primary border border-white/5 group-hover:scale-105 transition-transform">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-tight">{match.title}</h4>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">{match.matchId} • {match.mode}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="text-right">
                    <p className="text-[8px] font-black text-primary uppercase">Status</p>
                    <p className={cn("text-[9px] font-black uppercase italic", match.status === 'completed' ? 'text-green-500' : 'text-yellow-500')}>
                      {match.status === 'completed' ? 'পাবলিশড' : 'বাকি আছে'}
                    </p>
                 </div>
                 <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
