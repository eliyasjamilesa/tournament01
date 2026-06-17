
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Trophy, 
  Loader2, 
  Calendar, 
  Clock, 
  Wallet, 
  Hash,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';

export default function JoinedPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [joinedMatches, setJoinedMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    async function fetchMyMatches() {
      if (!db || !user) return;
      
      try {
        // Fetch tournaments sorted by newest first
        const tournamentsSnap = await getDocs(query(collection(db, 'tournaments'), orderBy('createdAt', 'desc')));
        
        // Parallelize registration checks to significantly speed up loading
        const matchPromises = tournamentsSnap.docs.map(async (tDoc) => {
          const regRef = doc(db, 'tournaments', tDoc.id, 'registrations', user.uid);
          const regSnap = await getDoc(regRef);

          if (regSnap.exists()) {
            const tData = tDoc.data();
            const rData = regSnap.data();
            return {
              id: tDoc.id,
              ...tData,
              joinedAt: rData.timestamp?.toDate ? rData.timestamp.toDate() : new Date(),
              wonAmount: rData.wonAmount || 0
            };
          }
          return null;
        });

        const results = await Promise.all(matchPromises);
        setJoinedMatches(results.filter(m => m !== null));
      } catch (error) {
        console.error("Error fetching joined matches:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMyMatches();
  }, [user, authLoading, db, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <Trophy className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary animate-pulse">Syncing My Arena...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="px-6 pt-12 pb-6 text-center">
        <h1 className="text-xl font-black uppercase tracking-tight text-white italic">My Matches</h1>
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">আপনার জয়েন করা সব ম্যাচ</p>
      </header>

      <main className="px-4 space-y-4">
        {joinedMatches.length > 0 ? (
          joinedMatches.map((match) => (
            <Card 
              key={match.id} 
              onClick={() => router.push(`/play?mode=${encodeURIComponent(match.mode)}`)}
              className="bg-[#0d0d0d] border border-white/5 rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all hover:border-primary/20"
            >
              <CardContent className="p-5 space-y-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <p className="text-[13px] font-bold text-gray-200 leading-tight">
                      {match.title} | {match.mode} | Normal
                    </p>
                  </div>
                  <Badge variant="outline" className="border-primary/50 text-primary text-[10px] font-black px-3 py-1 bg-primary/5 shrink-0 uppercase italic">
                    {match.mode}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-y-6">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Match Start Time</span>
                    <span className="text-[13px] font-black text-white block">
                      {match.startTime ? format(new Date(match.startTime), 'dd MMM yyyy') : 'TBA'}
                    </span>
                    <span className="text-[11px] font-bold text-primary block">
                      {match.startTime ? format(new Date(match.startTime), 'h:mm a') : ''}
                    </span>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Joined Date</span>
                    <span className="text-[13px] font-black text-white block">
                      {format(match.joinedAt, 'dd MMM yyyy')}
                    </span>
                    <span className="text-[11px] font-bold text-muted-foreground block">
                      {format(match.joinedAt, 'hh:mm a')}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Entry Fee</span>
                    <div className="flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[14px] font-black text-white">{match.entryFee} TK</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Won Amount</span>
                    <span className={`text-[14px] font-black ${match.wonAmount > 0 ? 'text-green-500' : 'text-primary'}`}>
                      {match.wonAmount} TK
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Match ID</span>
                  <span className="text-[13px] font-black text-primary font-mono">{match.matchId || '#-----'}</span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-muted/10 flex items-center justify-center border border-white/5">
              <Trophy className="w-10 h-10 text-muted-foreground opacity-20" />
            </div>
            <div className="space-y-1">
              <h3 className="font-headline font-black text-lg text-white uppercase italic">No Matches Found</h3>
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest max-w-[200px] mx-auto opacity-50">আপনি এখনও কোনো ম্যাচে জয়েন করেননি।</p>
            </div>
            <Button asChild className="magma-gradient h-12 px-8 rounded-xl font-black uppercase italic tracking-widest text-xs shadow-lg mt-4">
              <a href="/">নতুন ম্যাচ খুঁজুন</a>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
