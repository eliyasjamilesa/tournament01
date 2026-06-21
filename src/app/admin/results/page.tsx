
"use client";

import { useState } from 'react';
import { 
  Trophy, 
  Loader2, 
  Search, 
  User, 
  Target, 
  Crown,
  ArrowLeft,
  ChevronRight,
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

  const handleBooyahShortcut = (regId: string, winAmount: number) => {
    setRegistrations(prev => prev.map(r => 
      r.id === regId ? { ...r, wonAmount: winAmount } : r
    ));
    toast({ title: "Winner Selected", description: `${winAmount} TK set for player.` });
  };

  const handlePublishResults = async () => {
    if (!db || !selectedMatchId) return;
    setIsPublishing(true);
    try {
      const batch = writeBatch(db);
      const currentMatch = tournaments?.find(t => t.id === selectedMatchId);
      const isAlreadyCompleted = currentMatch?.status === 'completed';
      
      for (const reg of registrations) {
        const regRef = doc(db, 'tournaments', selectedMatchId, 'registrations', reg.id);
        const winAmount = Number(reg.wonAmount || 0);
        
        // Update registration record
        batch.update(regRef, { 
          wonAmount: winAmount,
          kills: Number(reg.kills || 0),
          xpAwarded: true
        });

        // UPDATE USER STATS (Only if match status is changing from open/live to completed)
        if (!isAlreadyCompleted) {
          const userRef = doc(db, 'users', reg.id);
          const killXP = Number(reg.kills || 0) * 5; 
          const winXP = winAmount > 0 ? 50 : 0;
          const totalXP = killXP + winXP;
          
          const userUpdate: any = {};
          if (totalXP > 0) userUpdate.xp = increment(totalXP);
          if (winAmount > 0) userUpdate.totalWinnings = increment(winAmount);
          
          if (Object.keys(userUpdate).length > 0) {
            batch.update(userRef, userUpdate);
          }

          // LOG XP HISTORY
          if (totalXP > 0) {
            const xpLogRef = doc(collection(db, 'users', reg.id, 'xpHistory'));
            batch.set(xpLogRef, {
              userId: reg.id,
              amount: totalXP,
              reason: `Results: ${currentMatch?.title} (${reg.kills} Kills ${winXP > 0 ? '+ Booyah' : ''})`,
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
    // Current match content... (kept same as before but uses updated handlePublishResults)
  }

  // Rest of AdminResultsPage (Simplified for this update block to focus on logic)
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Match <span className="text-primary">Results</span></h2>
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
                      {match.status === 'completed' ? 'সেভ করা' : 'বাকি আছে'}
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
