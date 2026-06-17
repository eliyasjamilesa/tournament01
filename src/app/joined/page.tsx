
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
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';
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
        const tournamentsSnap = await getDocs(collection(db, 'tournaments'));
        const matches = [];

        for (const tDoc of tournamentsSnap.docs) {
          const regRef = doc(db, 'tournaments', tDoc.id, 'registrations', user.uid);
          const regSnap = await getDoc(regRef);

          if (regSnap.exists()) {
            const tData = tDoc.data();
            const rData = regSnap.data();
            matches.push({
              id: tDoc.id,
              ...tData,
              joinedAt: rData.timestamp?.toDate ? rData.timestamp.toDate() : new Date(),
              wonAmount: rData.wonAmount || 0
            });
          }
        }
        setJoinedMatches(matches);
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
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Syncing My Arena...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="px-6 pt-12 pb-6 text-center">
        <h1 className="text-xl font-black uppercase tracking-tight text-white">My Matches</h1>
      </header>

      <main className="px-4 space-y-4">
        {joinedMatches.length > 0 ? (
          joinedMatches.map((match) => (
            <Card 
              key={match.id} 
              onClick={() => router.push(`/play?mode=${encodeURIComponent(match.mode)}`)}
              className="bg-[#0d0d0d] border border-red-900/30 rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all"
            >
              <CardContent className="p-5 space-y-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <p className="text-[13px] font-bold text-gray-200 leading-tight">
                      {match.title} | Normal | 🚫ম্যাচ এ জয়েন করার আগে রুলস পরে নেন। 🚫রুলস ফলো না করলে রিওয়ার্ড দেয়া হবে না & রিফান্ড পাবেন না
                    </p>
                  </div>
                  <Badge variant="outline" className="border-green-500/50 text-green-500 text-[10px] font-black px-3 py-1 bg-green-500/5 shrink-0">
                    {match.mode}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-y-6">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Match Start Time</span>
                    <span className="text-[13px] font-black text-white block">
                      {match.startTime ? format(new Date(match.startTime), 'dd MMM yyyy') : 'TBA'}
                    </span>
                    <span className="text-[13px] font-black text-white block">
                      {match.startTime ? format(new Date(match.startTime), 'h:mm a') : ''}
                    </span>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Joined</span>
                    <span className="text-[13px] font-black text-white block">
                      {format(match.joinedAt, 'dd MMM yyyy')}
                    </span>
                    <span className="text-[13px] font-black text-white block">
                      {format(match.joinedAt, 'hh:mm a')}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Entry Fee</span>
                    <span className="text-[14px] font-black text-white">{match.entryFee} TK</span>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Won Amount</span>
                    <span className={`text-[14px] font-black ${match.wonAmount > 0 ? 'text-green-500' : 'text-[#008080]'}`}>
                      {match.wonAmount} TK
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Match ID</span>
                  <span className="text-[13px] font-black text-primary">{match.matchId || '#-----'}</span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-muted-foreground opacity-30" />
            </div>
            <div className="space-y-1">
              <h3 className="font-headline font-bold text-lg text-white">No Joined Arenas</h3>
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest max-w-[200px] mx-auto opacity-50">Explore active tournaments and join the battle!</p>
            </div>
            <Button asChild className="magma-gradient h-11 px-8 rounded-xl font-black uppercase italic tracking-widest text-xs shadow-lg mt-4">
              <a href="/">Find Tournaments</a>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
