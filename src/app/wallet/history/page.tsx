
"use client";

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  History,
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useUser, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function TransactionHistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();

  const transactionsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'transactions'), 
      where('userId', '==', user.uid)
    );
  }, [db, user]);

  const { data: rawTransactions, loading: txLoading } = useCollection<any>(transactionsQuery);

  // Client-side sorting for latest first
  const transactions = useMemo(() => {
    if (!rawTransactions) return [];
    return [...rawTransactions].sort((a, b) => {
      const timeA = a.timestamp?.toMillis?.() || 0;
      const timeB = b.timestamp?.toMillis?.() || 0;
      return timeB - timeA;
    });
  }, [rawTransactions]);

  if (authLoading || txLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Fetching History...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="px-6 pt-10 pb-6 flex items-center gap-4 border-b border-white/5 bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <Button 
          variant="ghost" 
          size="icon" 
          asChild
          className="rounded-full bg-white/5"
        >
          <Link href="/wallet">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
        </Button>
        <h1 className="text-xl font-black uppercase italic tracking-tight text-white">History</h1>
      </header>

      <main className="p-4 space-y-4 max-w-md mx-auto w-full">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 opacity-40">
            <History className="w-16 h-16 text-muted-foreground" />
            <p className="text-[10px] font-black uppercase tracking-widest">No Transactions Found</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <Card key={tx.id} className="bg-[#0a0a0a] border-white/5 p-5 rounded-2xl relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center border",
                    tx.type === 'withdrawal' ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-green-500/10 border-green-500/20 text-green-500"
                  )}>
                    {tx.type === 'withdrawal' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white italic tracking-tighter">
                      ৳{tx.amount}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                        {tx.type === 'withdrawal' ? 'Withdraw' : tx.type === 'recharge' ? 'Recharge' : 'Deposit'}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-white/10" />
                      <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                        {tx.method}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1.5">
                   <div className={cn(
                     "flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase italic",
                     tx.status === 'approved' ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                     tx.status === 'rejected' ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                     "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                   )}>
                     {tx.status === 'approved' ? <CheckCircle2 className="w-3 h-3" /> :
                      tx.status === 'rejected' ? <XCircle className="w-3 h-3" /> :
                      <Clock className="w-3 h-3" />}
                     {tx.status}
                   </div>
                   <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {tx.timestamp ? format(tx.timestamp.toDate(), 'dd MMM, hh:mm a') : 'TBA'}
                   </p>
                </div>
              </div>

              {tx.transactionId && (
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Transaction ID</span>
                  <span className="text-[9px] font-black text-primary font-mono select-all">{tx.transactionId}</span>
                </div>
              )}
              {tx.phoneNumber && (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Phone Number</span>
                  <span className="text-[9px] font-black text-white font-mono">{tx.phoneNumber}</span>
                </div>
              )}
            </Card>
          ))
        )}
      </main>
    </div>
  );
}
