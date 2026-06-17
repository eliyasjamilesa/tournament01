
"use client";

import { useState } from 'react';
import { 
  Trophy, 
  Loader2, 
  Search, 
  User, 
  Target, 
  CheckCircle2, 
  Crown,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, limit, updateDoc, getDocs, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function AdminResultsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all active or completed matches to manage results
  const tournamentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'), limit(50));
  }, [db]);
  const { data: tournaments, loading: tournamentsLoading } = useCollection<any>(tournamentsQuery);

  const fetchRegistrations = async (tournamentId: string) => {
    if (!db) return;
    setSelectedMatchId(tournamentId);
    const snap = await getDocs(collection(db, 'tournaments', tournamentId, 'registrations'));
    setRegistrations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleBooyahShortcut = (regId: string, winAmount: number) => {
    setRegistrations(prev => prev.map(r => 
      r.id === regId ? { ...r, wonAmount: winAmount } : r
    ));
  };

  const handlePublishResults = async () => {
    if (!db || !selectedMatchId) return;
    setIsPublishing(true);
    try {
      for (const reg of registrations) {
        const regRef = doc(db, 'tournaments', selectedMatchId, 'registrations', reg.id);
        await updateDoc(regRef, { 
          wonAmount: Number(reg.wonAmount || 0),
          kills: Number(reg.kills || 0)
        });
      }
      
      await updateDoc(doc(db, 'tournaments', selectedMatchId), { status: 'completed' });
      toast({ title: "Results Published", description: "Match results updated and archived." });
      setSelectedMatchId(null);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Publish Failed", description: err.message });
    } finally {
      setIsPublishing(false);
    }
  };

  const currentMatch = tournaments?.find(t => t.id === selectedMatchId);
  const filteredMatches = tournaments?.filter(t => 
    t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.matchId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedMatchId && currentMatch) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-32">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSelectedMatchId(null)} className="rounded-full bg-white/5">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter">{currentMatch.title}</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Publishing Final Results</p>
          </div>
        </div>

        <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between">
           <div>
              <p className="text-[8px] font-black text-primary uppercase tracking-widest mb-1">Booyah Prize (Pos 1)</p>
              <p className="text-lg font-black text-white">{currentMatch.prizes?.p1 || 0} TK</p>
           </div>
           <Badge variant="outline" className="border-primary/30 text-primary text-[8px] font-black uppercase italic h-fit">
             {currentMatch.mode}
           </Badge>
        </div>

        <div className="space-y-4">
          {registrations.length === 0 ? (
            <div className="text-center py-20 opacity-50">
              <p className="text-[10px] font-black uppercase tracking-widest">No Warriors Detected</p>
            </div>
          ) : registrations.map((reg) => (
            <Card key={reg.id} className="border-white/5 bg-card/40 p-4 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">{reg.ingameName || reg.displayName}</h4>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Slot #{reg.slotNumber} • ID: {reg.ingameId || '---'}</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleBooyahShortcut(reg.id, currentMatch.prizes?.p1 || 0)}
                  className={cn(
                    "h-8 rounded-lg text-[10px] font-black uppercase tracking-widest px-4 transition-all",
                    Number(reg.wonAmount) === currentMatch.prizes?.p1 ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20" : "bg-white/5 border border-white/10 hover:bg-yellow-500/20"
                  )}
                >
                  <Crown className="w-3.5 h-3.5 mr-1.5" /> Booyah
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[8px] font-black uppercase text-muted-foreground ml-1">Kills</Label>
                  <div className="relative">
                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input 
                      type="number" 
                      placeholder="0"
                      value={reg.kills || ''}
                      onChange={(e) => setRegistrations(prev => prev.map(r => r.id === reg.id ? { ...r, kills: e.target.value } : r))}
                      className="bg-black/30 border-none h-10 pl-9 rounded-xl font-black text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[8px] font-black uppercase text-primary ml-1">Winnings (TK)</Label>
                  <div className="relative">
                    <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary" />
                    <Input 
                      type="number" 
                      placeholder="0"
                      value={reg.wonAmount || ''}
                      onChange={(e) => setRegistrations(prev => prev.map(r => r.id === reg.id ? { ...r, wonAmount: e.target.value } : r))}
                      className="bg-black/30 border-none h-10 pl-9 rounded-xl font-black text-xs text-primary"
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button 
          disabled={isPublishing} 
          onClick={handlePublishResults}
          className="w-full h-14 magma-gradient font-black uppercase italic tracking-widest rounded-2xl shadow-xl shadow-primary/20 mt-4"
        >
          {isPublishing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'CONFIRM & PUBLISH ARCHIVE'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Result <span className="text-primary">Publish</span></h2>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select an arena to declare winners</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search match title or ID..." 
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
             <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">No matches found</p>
          </div>
        ) : filteredMatches?.map((match) => (
          <Card 
            key={match.id} 
            onClick={() => fetchRegistrations(match.id)}
            className="border-white/5 bg-card/40 p-5 rounded-2xl cursor-pointer hover:bg-white/5 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center text-primary border border-white/5 group-hover:scale-110 transition-transform">
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
                      {match.status === 'completed' ? 'ARCHIVED' : 'PENDING'}
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
