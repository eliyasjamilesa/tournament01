
"use client";

import { useState } from 'react';
import { Wallet, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, updateDoc, writeBatch, increment, query, where, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

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
      toast({ title: "Approved", description: `${tx.amount} coins added.` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter">Payment <span className="text-primary">Approvals</span></h1>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Verify and process coin deposits</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        ) : pendingPayments?.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/5 rounded-3xl">
             <p className="text-[10px] font-bold uppercase text-muted-foreground">No Pending Requests</p>
          </div>
        ) : pendingPayments?.map((tx: any) => (
          <Card key={tx.id} className="border-white/5 bg-card/60 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Wallet className="w-5 h-5" /></div>
                <div><h4 className="text-xs font-black uppercase">{tx.amount} TK Deposit</h4><p className="text-[8px] font-bold text-muted-foreground uppercase">{tx.method} • {tx.transactionId}</p></div>
              </div>
              <p className="text-[8px] font-bold text-muted-foreground uppercase">{tx.userEmail}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => updateDoc(doc(db, 'transactions', tx.id), { status: 'rejected' })} className="flex-1 h-9 rounded-lg text-[10px] font-bold uppercase border-white/10 text-red-500"><XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject</Button>
              <Button size="sm" disabled={isProcessing} onClick={() => handleApprove(tx)} className="flex-1 h-9 rounded-lg text-[10px] font-bold uppercase magma-gradient"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Approve</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
