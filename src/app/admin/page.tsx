
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Swords, Wallet, Users, Zap, TrendingUp, Clock } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const db = useFirestore();

  const tournamentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'tournaments'), limit(50));
  }, [db]);
  const { data: tournaments, loading: tournamentsLoading } = useCollection<any>(tournamentsQuery);

  const pendingPaymentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'transactions'), where('status', '==', 'pending'));
  }, [db]);
  const { data: pendingPayments } = useCollection<any>(pendingPaymentsQuery);

  const stats = [
    { label: 'Total Matches', value: tournaments?.length || 0, icon: Swords, color: 'text-primary' },
    { label: 'Pending Payouts', value: pendingPayments?.length || 0, icon: Wallet, color: 'text-yellow-500' },
    { label: 'Active Players', value: tournaments?.reduce((acc, t) => acc + (t.currentPlayers || 0), 0) || 0, icon: Users, color: 'text-blue-500' },
    { label: 'Total Volume', value: '12.4K', icon: TrendingUp, color: 'text-green-500' },
  ];

  if (tournamentsLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter">Operations <span className="text-primary">Overview</span></h1>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Real-time metrics & system status</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-white/5 bg-card/50 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <stat.icon className="w-12 h-12" />
            </div>
            <CardContent className="pt-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">{stat.label}</p>
              <h3 className={cn("text-2xl font-black", stat.color)}>{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-white/5 bg-card/50">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase italic flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tournaments?.slice(0, 5).map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                         <Zap className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase">{t.title}</p>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase">{t.matchId}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black">{t.currentPlayers}/{t.maxPlayers}</p>
                      <p className="text-[8px] font-bold text-green-500 uppercase">Active</p>
                   </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');
