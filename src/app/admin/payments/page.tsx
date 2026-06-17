
"use client";

import { useState } from 'react';
import { Wallet, CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';
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
      toast({ title: "সফল", description: `${tx.amount} TK ইউজারের ব্যালেন্সে যোগ হয়েছে।` });
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
      toast({ title: "বাতিল করা হয়েছে" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">পেমেন্ট <span className="text-primary">চেক</span></h2>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ডিপোজিট রিকোয়েস্ট চেক করুন</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : pendingPayments?.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/5 rounded-3xl">
             <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">কোন রিকোয়েস্ট নেই</p>
          </div>
        ) : pendingPayments?.map((tx: any) => (
          <Card key={tx.id} className="border-white/5 bg-card/40 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20"><Wallet className="w-5 h-5" /></div>
                <div>
                  <h4 className="text-sm font-black text-white">{tx.amount} TK</h4>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase">{tx.method} • {tx.transactionId}</p>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-[8px] font-bold text-muted-foreground uppercase">{tx.timestamp ? format(tx.timestamp.toDate(), 'hh:mm a') : 'Now'}</p>
              </div>
            </div>

            <div className="p-3 bg-black/30 rounded-xl mb-4 text-[9px] font-bold text-muted-foreground uppercase space-y-1">
               <div className="flex justify-between"><span>Email</span><span className="text-white">{tx.userEmail}</span></div>
               <div className="flex justify-between"><span>ট্রানজ্যাকশন আইডি</span><span className="text-primary font-mono">{tx.transactionId}</span></div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleReject(tx.id)} className="flex-1 h-10 rounded-xl text-[9px] font-black uppercase border-white/5 bg-white/5 text-red-500">বাতিল করুন</Button>
              <Button size="sm" disabled={isProcessing} onClick={() => handleApprove(tx)} className="flex-1 h-10 rounded-xl text-[9px] font-black uppercase magma-gradient">অ্যাপ্রুভ করুন</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
