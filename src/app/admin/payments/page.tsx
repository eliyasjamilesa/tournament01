
"use client";

import { useState } from 'react';
import { Wallet, CheckCircle2, XCircle, Loader2, Clock, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, updateDoc, writeBatch, increment, query, where, orderBy, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function PaymentsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingPaymentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'transactions'), where('status', '==', 'pending'), orderBy('timestamp', 'desc'));
  }, [db]);
  const { data: pendingPayments, loading } = useCollection<any>(pendingPaymentsQuery);

  const handleApprove = async (tx: any) => {
    if (!db) return;
    setIsProcessing(true);
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'users', tx.userId), { coins: increment(tx.amount) });
      batch.update(doc(db, 'transactions', tx.id), { status: 'approved' });
      await batch.commit();
      toast({ title: "Request Approved", description: `${tx.amount} TK successfully credited.` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'transactions', id), { status: 'rejected' });
      toast({ title: "Rejected", description: "Payment request denied." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Pending <span className="text-primary">Deposits</span></h2>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Verify incoming recharge requests</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : pendingPayments?.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/5 rounded-[2.5rem] bg-card/20 flex flex-col items-center gap-3">
             <div className="w-12 h-12 rounded-full bg-muted/10 flex items-center justify-center"><Wallet className="w-6 h-6 text-muted-foreground opacity-30" /></div>
             <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">No Pending Requests</p>
          </div>
        ) : pendingPayments?.map((tx: any) => (
          <Card key={tx.id} className="border-white/5 bg-card/60 p-5 rounded-[2rem] overflow-hidden relative group">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20"><Wallet className="w-6 h-6" /></div>
                <div>
                  <h4 className="text-sm font-black text-white tracking-tight">{tx.amount} TK <span className="text-[10px] text-muted-foreground font-bold">RECHARGE</span></h4>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{tx.method} • {tx.transactionId}</p>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-[8px] font-black uppercase text-primary italic">Deposit Required</p>
                 <p className="text-[8px] font-bold text-muted-foreground uppercase">{tx.timestamp ? format(tx.timestamp.toDate(), 'hh:mm a') : 'Now'}</p>
              </div>
            </div>

            <div className="p-4 bg-black/30 rounded-2xl mb-5 space-y-2 border border-white/5">
               <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Warrior Email</span>
                  <span className="text-[10px] font-black uppercase text-white">{tx.userEmail}</span>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Reference ID</span>
                  <span className="text-[10px] font-black text-primary font-mono">{tx.transactionId}</span>
               </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleReject(tx.id)} className="flex-1 h-11 rounded-xl text-[10px] font-black uppercase border-white/10 text-red-500 hover:bg-red-500/5 hover:text-red-500">
                <XCircle className="w-4 h-4 mr-2" /> Reject
              </Button>
              <Button size="sm" disabled={isProcessing} onClick={() => handleApprove(tx)} className="flex-1 h-11 rounded-xl text-[10px] font-black uppercase magma-gradient shadow-lg">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
