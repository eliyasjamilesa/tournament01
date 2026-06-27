"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Trophy, 
  Crown, 
  Target, 
  Zap, 
  TrendingUp,
  User,
  Loader2,
  DollarSign,
  Star
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { cn } from '@/lib/utils';

type SortType = 'xp' | 'winnings';

export default function LeaderboardPage() {
  const router = useRouter();
  const { user: currentUser } = useUser();
  const db = useFirestore();
  const [sortBy, setSortBy] = useState<SortType>('xp');

  // Dynamic Query based on selected tab (No composite index required!)
  const leaderboardQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'users'),
      orderBy(sortBy === 'xp' ? 'xp' : 'totalWinnings', 'desc'),
      limit(50)
    );
  }, [db, sortBy]);

  const { data: users, loading } = useCollection<any>(leaderboardQuery);

  // Find current user's rank in this list
  const currentUserRank = useMemo(() => {
    if (!users || !currentUser) return null;
    const index = users.findIndex((u: any) => u.uid === currentUser.uid);
    return index !== -1 ? index + 1 : null;
  }, [users, currentUser]);

  return (
    <div className="min-h-screen bg-background pb-32 text-white relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="px-6 pt-10 pb-4 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md z-50 border-b border-white/5">
        <button 
          onClick={() => router.push('/profile')}
          className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl text-white border border-white/5 active:scale-95 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
           <h1 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary italic leading-none mb-1">TS Tour</h1>
           <p className="text-[10px] font-bold text-muted-foreground uppercase">Leaderboard</p>
        </div>
        <div className="w-10" />
      </header>

      <main className="p-4 space-y-6 max-w-md mx-auto w-full">
        {/* Toggle Sorting Switcher */}
        <div className="bg-[#0c0c0c] border border-white/5 p-1 rounded-2xl flex gap-1 shadow-inner">
          <button
            onClick={() => setSortBy('xp')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              sortBy === 'xp'
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-white bg-transparent"
            )}
          >
            <Star className="w-3.5 h-3.5" />
            Level & XP
          </button>
          <button
            onClick={() => setSortBy('winnings')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              sortBy === 'winnings'
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-white bg-transparent"
            )}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Total Earnings
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Calculating Rankings...</p>
          </div>
        ) : (
          <>
            {/* Top 3 Premium Podium Section */}
            {users && users.length > 0 && (
              <div className="flex items-end justify-center gap-2.5 pt-8 pb-4 relative">
                
                {/* Rank 2 (Left) */}
                {users[1] && (
                  <div className="flex-1 flex flex-col items-center bg-white/5 border border-white/5 rounded-3xl p-3.5 relative pt-12 min-w-0 max-w-[110px] h-[210px] justify-between animate-in slide-in-from-bottom-6 duration-500 delay-100">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                      <div className="relative">
                        <Avatar className="w-14 h-14 border-2 border-slate-400">
                          <AvatarImage src={users[1].photoURL} />
                          <AvatarFallback className="bg-slate-800 text-xs font-black">{users[1].displayName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-slate-400 text-black text-[9px] font-black px-2 py-0.5 rounded-full shadow-md">#2</div>
                      </div>
                    </div>
                    <div className="text-center w-full mt-2 space-y-0.5">
                      <p className="text-xs font-black uppercase italic truncate w-full">{users[1].displayName}</p>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">LVL {Math.floor((users[1].xp || 0) / 1000) + 1}</span>
                    </div>
                    <div className="w-full text-center space-y-0.5 bg-slate-400/10 p-2 rounded-xl border border-slate-400/10">
                      <p className="text-xs font-black text-white italic tracking-tighter">
                        {sortBy === 'xp' ? `${users[1].xp || 0} XP` : `৳${users[1].totalWinnings || 0}`}
                      </p>
                      <p className="text-[7px] font-bold text-slate-400 uppercase tracking-wider">
                        {sortBy === 'xp' ? "Total XP" : "Total Win"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Rank 1 (Middle - Elevated) */}
                {users[0] && (
                  <div className="flex-1 flex flex-col items-center bg-[#0e0e0e] border border-yellow-500/20 rounded-[2rem] p-4 relative pt-14 min-w-0 max-w-[125px] h-[245px] justify-between shadow-2xl shadow-yellow-500/5 animate-in slide-in-from-bottom-8 duration-500">
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2">
                      <div className="relative">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce">
                          <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500/25" />
                        </div>
                        <Avatar className="w-16 h-16 border-4 border-yellow-500 shadow-lg shadow-yellow-500/20">
                          <AvatarImage src={users[0].photoURL} />
                          <AvatarFallback className="bg-yellow-900 text-sm font-black text-yellow-500">{users[0].displayName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-lg">#1</div>
                      </div>
                    </div>
                    <div className="text-center w-full mt-2 space-y-0.5">
                      <p className="text-xs font-black uppercase italic truncate w-full text-yellow-500">{users[0].displayName}</p>
                      <span className="text-[9px] font-bold text-yellow-500/80 uppercase tracking-widest block">LVL {Math.floor((users[0].xp || 0) / 1000) + 1}</span>
                    </div>
                    <div className="w-full text-center space-y-0.5 bg-yellow-500/10 p-2 rounded-xl border border-yellow-500/20">
                      <p className="text-xs font-black text-yellow-500 italic tracking-tighter">
                        {sortBy === 'xp' ? `${users[0].xp || 0} XP` : `৳${users[0].totalWinnings || 0}`}
                      </p>
                      <p className="text-[7px] font-bold text-yellow-500/80 uppercase tracking-wider">
                        {sortBy === 'xp' ? "Total XP" : "Total Win"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Rank 3 (Right) */}
                {users[2] && (
                  <div className="flex-1 flex flex-col items-center bg-white/5 border border-white/5 rounded-3xl p-3.5 relative pt-12 min-w-0 max-w-[110px] h-[210px] justify-between animate-in slide-in-from-bottom-6 duration-500 delay-200">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                      <div className="relative">
                        <Avatar className="w-14 h-14 border-2 border-amber-700">
                          <AvatarImage src={users[2].photoURL} />
                          <AvatarFallback className="bg-amber-900 text-xs font-black text-amber-700">{users[2].displayName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-amber-700 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md">#3</div>
                      </div>
                    </div>
                    <div className="text-center w-full mt-2 space-y-0.5">
                      <p className="text-xs font-black uppercase italic truncate w-full">{users[2].displayName}</p>
                      <span className="text-[9px] font-bold text-amber-700 uppercase tracking-widest block">LVL {Math.floor((users[2].xp || 0) / 1000) + 1}</span>
                    </div>
                    <div className="w-full text-center space-y-0.5 bg-amber-700/10 p-2 rounded-xl border border-amber-700/10">
                      <p className="text-xs font-black text-white italic tracking-tighter">
                        {sortBy === 'xp' ? `${users[2].xp || 0} XP` : `৳${users[2].totalWinnings || 0}`}
                      </p>
                      <p className="text-[7px] font-bold text-amber-700 uppercase tracking-wider">
                        {sortBy === 'xp' ? "Total XP" : "Total Win"}
                      </p>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Global Rankings List (Ranks 4-50) */}
            <div className="space-y-3.5">
              {users && users.slice(3).map((u: any, idx: number) => {
                const isMe = u.uid === currentUser?.uid;
                const rank = idx + 4;
                const level = Math.floor((u.xp || 0) / 1000) + 1;
                
                return (
                  <Card 
                    key={u.id || u.uid} 
                    className={cn(
                      "rounded-2xl transition-all border overflow-hidden",
                      isMe 
                        ? "bg-primary/5 border-primary/40 shadow-lg shadow-primary/5" 
                        : "bg-[#0a0a0a] border-white/5 hover:border-white/10"
                    )}
                  >
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Rank indicator */}
                        <div className="w-6 flex items-center justify-center shrink-0">
                          <span className={cn(
                            "text-xs font-black",
                            isMe ? "text-primary" : "text-muted-foreground/60"
                          )}>
                            {rank}
                          </span>
                        </div>

                        {/* Avatar */}
                        <Avatar className="w-10 h-10 border border-white/5 shrink-0">
                          <AvatarImage src={u.photoURL} />
                          <AvatarFallback className="bg-white/5 text-xs font-black uppercase">{u.displayName?.[0] || '?'}</AvatarFallback>
                        </Avatar>

                        {/* Player details */}
                        <div className="min-w-0">
                          <p className={cn(
                            "text-sm font-black uppercase italic tracking-tight truncate",
                            isMe ? "text-primary" : "text-white"
                          )}>
                            {u.displayName || 'Gamer'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-black text-muted-foreground uppercase">LVL {level}</span>
                            <span className="w-1 h-1 rounded-full bg-white/10" />
                            <span className="text-[9px] font-bold text-muted-foreground/50 uppercase">{u.xp || 0} XP</span>
                          </div>
                        </div>
                      </div>

                      {/* Earnings/Score */}
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-white italic tracking-tighter">৳{u.totalWinnings || 0}</p>
                        <p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">Total Win</p>
                      </div>
                    </div>
                  </Card>
                );
              })}

              {users && users.length === 0 && (
                <div className="text-center py-20 opacity-30">
                  <User className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                  <p className="text-xs font-bold uppercase tracking-widest">No rankings available yet</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
