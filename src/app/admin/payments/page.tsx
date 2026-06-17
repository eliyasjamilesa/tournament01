
"use client";

import { useState } from 'react';
import { Wallet, CheckCircle2, XCircle, Loader2, Clock, User, Mail, Hash } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, updateDoc, writeBatch, increment, query, where, orderBy, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function PaymentsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const pendingPaymentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'transactions'), where('status', '==', 'pending'), orderBy('timestamp', 'desc'));
  }, [db]);
  const { data: pendingPayments, loading } = useCollection<any>(pendingPaymentsQuery);

  const handleApprove = async (tx: any) => {
    if (!db) return;
    setIsProcessing(tx.id);
    try {
      const batch = writeBatch(db);
      
      // Update user coins
      const userRef = doc(db, 'users', tx.userId);
      batch.update(userRef, { coins: increment(tx.amount) });
      
      // Update transaction status
      const txRef = doc(db, 'transactions', tx.id);
      batch.update(txRef, { status: 'approved' });
      
      await batch.commit();
      toast({ title: "সফল", description: `${tx.amount} TK ইউজারের ব্যালেন্সে যোগ হয়েছে।` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "ব্যর্থ হয়েছে", description: err.message });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'transactions', id), { status: 'rejected' });
      toast({ title: "বাতিল করা হয়েছে" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "এরর", description: err.message });
    }
  };

  return (
    <div className="space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">পেমেন্ট <span className="text-primary">চেক</span></h2>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ডিপোজিট রিকোয়েস্ট ম্যানেজ করুন</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">লোডিং হচ্ছে...</p>
          </div>
        ) : pendingPayments?.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-white/5 rounded-[2.5rem] space-y-3">
             <div className="w-16 h-16 rounded-full bg-muted/5 flex items-center justify-center mx-auto">
               <Wallet className="w-8 h-8 text-muted-foreground opacity-20" />
             </div>
             <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">কোন পেন্ডিং রিকোয়েস্ট নেই</p>
          </div>
        ) : pendingPayments?.map((tx: any) => (
          <Card key={tx.id} className="border-white/5 bg-[#0a0a0a] p-6 rounded-[2rem] overflow-hidden relative shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white italic tracking-tighter">{tx.amount} TK</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${tx.method === 'Bkash' ? 'bg-pink-600/20 text-pink-500' : 'bg-orange-600/20 text-orange-500'}`}>
                      {tx.method}
                    </span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {tx.timestamp ? format(tx.timestamp.toDate(), 'hh:mm a') : 'Now'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-[8px] font-black text-primary uppercase mb-1">Status</p>
                 <span className="text-[9px] font-black text-yellow-500 uppercase italic">Pending</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 mb-6">
               <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">User Email</span>
                  </div>
                  <span className="text-[11px] font-black text-white">{tx.userEmail}</span>
               </div>
               <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Hash className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">TXID</span>
                  </div>
                  <span className="text-[11px] font-black text-primary font-mono">{tx.transactionId}</span>
               </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleReject(tx.id)} 
                className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10"
              >
                বাতিল করুন
              </Button>
              <Button 
                size="sm" 
                disabled={isProcessing === tx.id} 
                onClick={() => handleApprove(tx)} 
                className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest magma-gradient shadow-lg shadow-primary/20"
              >
                {isProcessing === tx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'অ্যাপ্রুভ করুন'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
