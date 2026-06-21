
"use client";

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Trophy, 
  Medal, 
  Loader2, 
  Crown, 
  Target, 
  Zap, 
  TrendingUp,
  User
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export default function LeaderboardPage() {
  const router = useRouter();
  const { user: currentUser } = useUser();
  const db = useFirestore();

  const leaderboardQuery = useMemoFirebase(() => {
    if (!db) return null;
    // Ranked by XP (Level) first, then Total Winnings
    return query(
      collection(db, 'users'),
      orderBy('xp', 'desc'),
      orderBy('totalWinnings', 'desc'),
      limit(50)
    );
  }, [db]);

  const { data: users, loading } = useCollection<any>(leaderboardQuery);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Hall of Fame Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-32 text-white">
      <header className="px-6 pt-10 pb-6 flex items-center gap-4 border-b border-white/5 bg-black sticky top-0 z-50">
        <button 
          onClick={() => router.push('/profile')}
          className="p-2.5 rounded-xl bg-white/5 text-white border border-white/5"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black uppercase italic tracking-tight">Leaderboard</h1>
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Global Ranking</p>
        </div>
      </header>

      <main className="p-4 space-y-8 max-w-md mx-auto w-full">
        {/* Top 3 Podium */}
        <div className="flex items-end justify-center gap-2 pt-10 pb-4">
           {/* Rank 2 */}
           {users?.[1] && (
             <div className="flex flex-col items-center gap-3 animate-in slide-in-from-bottom-6 duration-700 delay-100">
                <div className="relative">
                   <Avatar className="w-16 h-16 border-2 border-slate-400">
                      <AvatarImage src={users[1].photoURL} />
                      <AvatarFallback className="bg-slate-800 text-xs">{users[1].displayName?.[0]}</AvatarFallback>
                   </Avatar>
                   <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full">#2</div>
                </div>
                <div className="text-center">
                   <p className="text-[10px] font-black uppercase italic truncate w-20">{users[1].displayName}</p>
                   <p className="text-[8px] font-bold text-slate-400">LVL {Math.floor((users[1].xp || 0) / 1000) + 1}</p>
                </div>
                <div className="w-20 h-24 bg-slate-400/10 rounded-t-xl border-x border-t border-slate-400/20" />
             </div>
           )}

           {/* Rank 1 */}
           {users?.[0] && (
             <div className="flex flex-col items-center gap-3 animate-in slide-in-from-bottom-8 duration-700">
                <div className="relative">
                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce">
                      <Crown className="w-8 h-8 text-yellow-500 fill-yellow-500/20" />
                   </div>
                   <Avatar className="w-20 h-20 border-4 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                      <AvatarImage src={users[0].photoURL} />
                      <AvatarFallback className="bg-yellow-900 text-lg font-black">{users[0].displayName?.[0]}</AvatarFallback>
                   </Avatar>
                   <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[11px] font-black px-3 py-1 rounded-full shadow-lg">#1</div>
                </div>
                <div className="text-center">
                   <p className="text-xs font-black uppercase italic truncate w-24">{users[0].displayName}</p>
                   <p className="text-[9px] font-bold text-yellow-500">LVL {Math.floor((users[0].xp || 0) / 1000) + 1}</p>
                </div>
                <div className="w-24 h-32 bg-yellow-500/10 rounded-t-2xl border-x border-t border-yellow-500/20" />
             </div>
           )}

           {/* Rank 3 */}
           {users?.[2] && (
             <div className="flex flex-col items-center gap-3 animate-in slide-in-from-bottom-6 duration-700 delay-200">
                <div className="relative">
                   <Avatar className="w-14 h-14 border-2 border-amber-700">
                      <AvatarImage src={users[2].photoURL} />
                      <AvatarFallback className="bg-amber-900 text-[10px]">{users[2].displayName?.[0]}</AvatarFallback>
                   </Avatar>
                   <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full">#3</div>
                </div>
                <div className="text-center">
                   <p className="text-[10px] font-black uppercase italic truncate w-20">{users[2].displayName}</p>
                   <p className="text-[8px] font-bold text-amber-700">LVL {Math.floor((users[2].xp || 0) / 1000) + 1}</p>
                </div>
                <div className="w-20 h-20 bg-amber-700/10 rounded-t-xl border-x border-t border-amber-700/20" />
             </div>
           )}
        </div>

        {/* Full List */}
        <div className="space-y-3">
           {users?.slice(3).map((u: any, idx: number) => {
             const isMe = u.uid === currentUser?.uid;
             const rank = idx + 4;
             const level = Math.floor((u.xp || 0) / 1000) + 1;
             
             return (
               <div 
                key={u.id} 
                className={cn(
                  "p-4 rounded-2xl border flex items-center justify-between transition-all",
                  isMe ? "bg-primary/5 border-primary/30" : "bg-[#0a0a0a] border-white/5"
                )}
               >
                  <div className="flex items-center gap-4">
                     <span className={cn(
                       "text-[10px] font-black w-5 text-center",
                       isMe ? "text-primary" : "text-gray-600"
                     )}>
                       {rank}
                     </span>
                     <Avatar className="w-10 h-10 border border-white/5">
                        <AvatarImage src={u.photoURL} />
                        <AvatarFallback className="bg-muted text-xs">{u.displayName?.[0]}</AvatarFallback>
                     </Avatar>
                     <div>
                        <p className={cn(
                          "text-xs font-black uppercase italic tracking-tight",
                          isMe ? "text-white" : "text-gray-300"
                        )}>
                          {u.displayName}
                        </p>
                        <div className="flex items-center gap-2">
                           <span className="text-[8px] font-bold text-primary uppercase">LVL {level}</span>
                           <span className="w-1 h-1 rounded-full bg-white/10" />
                           <span className="text-[8px] font-bold text-gray-500 uppercase">{u.xp || 0} XP</span>
                        </div>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[11px] font-black text-white italic tracking-tighter">৳{u.totalWinnings || 0}</p>
                     <p className="text-[7px] font-bold text-gray-600 uppercase tracking-widest">Total Win</p>
                  </div>
               </div>
             );
           })}
        </div>

        {users?.length === 0 && (
           <div className="text-center py-20 opacity-30">
              <User className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No rankings yet</p>
           </div>
        )}
      </main>
    </div>
  );
}
