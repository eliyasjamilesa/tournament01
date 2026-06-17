
"use client";

import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Wallet, 
  Trophy, 
  Plus, 
  ArrowUpRight, 
  History, 
  HelpCircle, 
  Gamepad2,
  ChevronRight,
  CircleDollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function WalletPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, loading: profileLoading } = useDoc<any>(userDocRef);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Loading Wallet...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="px-6 pt-10 pb-6 flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()} 
          className="rounded-full bg-white/5 h-10 w-10"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Button>
        <h1 className="text-xl font-black uppercase italic tracking-tight text-white">Wallet</h1>
      </header>

      <main className="px-6 space-y-6">
        {/* Main Balance Card */}
        <Card className="relative overflow-hidden border-none rounded-[2rem] p-8 h-56 bg-gradient-to-br from-red-600 to-orange-500 shadow-2xl shadow-primary/20">
          <div className="absolute top-0 right-0 p-6 opacity-20">
            <Wallet className="w-24 h-24 text-white" />
          </div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-md">
                <CircleDollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Ignite Arena Wallet</span>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Available Balance</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white italic tracking-tighter">৳{profile?.coins || 0}</span>
                <span className="text-sm font-black text-white/80 uppercase italic">TK</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-[#121212] border-white/5 p-5 rounded-2xl flex flex-col items-center text-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Deposited</p>
            <p className="text-lg font-black text-white italic tracking-tight">৳0</p>
          </Card>
          <Card className="bg-[#121212] border-white/5 p-5 rounded-2xl flex flex-col items-center text-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Winning</p>
            <p className="text-lg font-black text-white italic tracking-tight">৳0</p>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={() => router.push('/wallet/deposit')}
            className="h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black uppercase italic tracking-widest text-xs shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Money
          </Button>
          <Button 
            className="h-16 rounded-2xl bg-green-600 hover:bg-green-700 font-black uppercase italic tracking-widest text-xs shadow-lg shadow-green-600/20"
          >
            <ArrowUpRight className="w-5 h-5 mr-2" /> Withdraw
          </Button>
        </div>

        {/* Menu Links */}
        <div className="space-y-3 pt-4">
          {[
            { label: 'Transaction History', sub: 'View all your transactions', icon: History, color: 'text-red-500' },
            { label: 'How to add money?', sub: 'Learn how to deposit money', icon: HelpCircle, color: 'text-blue-500' },
            { label: 'How to join a match?', sub: 'Learn how to join ongoing matches', icon: Gamepad2, color: 'text-orange-500' },
          ].map((item, idx) => (
            <Card key={idx} className="bg-[#121212] border-white/5 p-4 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight">{item.label}</h4>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{item.sub}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
