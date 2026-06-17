
"use client";

import { useState } from 'react';
import { Wallet, CheckCircle2, XCircle, Loader2, Clock, User, Mail, Hash, ArrowUpRight, ArrowDownLeft, Phone, AlertTriangle, ShieldAlert, RefreshCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFirestore, useMemoFirebase, useCollection, useUser, useDoc } from '@/firebase';
import { doc, updateDoc, writeBatch, increment, query, where, orderBy, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function PaymentsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Fetch current user profile to verify admin role locally before querying
  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  const { data: profile, loading: profileLoading } = useDoc<any>(userDocRef);

  const pendingPaymentsQuery = useMemoFirebase(() => {
    // CRITICAL: Only run query if profile is loaded AND user is confirmed admin
    if (!db || !user || profileLoading || profile?.role !== 'admin') return null;
    
    // This query requires a composite index: transactions (status == ASC, timestamp == DESC)
    return query(
      collection(db, 'transactions'), 
      where('status', '==', 'pending'),
      orderBy('timestamp', 'desc')
    );
  }, [db, user, profile?.role, profileLoading]);

  const { data: pendingPayments, loading, error } = useCollection<any>(pendingPaymentsQuery);

  const handleApprove = async (tx: any) => {
    if (!db) return;
    setIsProcessing(tx.id);
    try {
      const batch = writeBatch(db);
      
      const userRef = doc(db, 'users', tx.userId);
      const txRef = doc(db, 'transactions', tx.id);

      if (tx.type === 'withdrawal') {
        // For withdrawal, deduct coins from user balance
        batch.update(userRef, { coins: increment(-tx.amount) });
        batch.update(txRef, { status: 'approved' });
      } else {
        // For deposit (default behavior or explicit type)
        batch.update(userRef, { coins: increment(tx.amount) });
        batch.update(txRef, { status: 'approved' });
      }
      
      await batch.commit();
      toast({ 
        title: "সফল", 
        description: tx.type === 'withdrawal' ? `${tx.amount} TK ইউজারের ব্যালেন্স থেকে কাটা হয়েছে।` : `${tx.amount} TK ইউজারের ব্যালেন্সে যোগ হয়েছে।` 
      });
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

  if (profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">অ্যাডমিন প্রোফাইল চেক হচ্ছে...</p>
      </div>
    );
  }

  if (profile && profile.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center border border-destructive/20">
          <ShieldAlert className="w-10 h-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black uppercase italic tracking-tighter">অ্যাডমিন এক্সেস <span className="text-destructive">নেই</span></h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest max-w-[280px]">
            আপনার প্রোফাইল অ্যাডমিন হিসেবে ভেরিফাইড নয়। অ্যাডমিন প্যানেল থেকে পাওয়ার নিন।
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    const isIndexError = error.message.toLowerCase().includes('index');
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center border border-destructive/20">
          <AlertTriangle className="w-10 h-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">লোডিং <span className="text-destructive">এরর</span></h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {isIndexError ? "ফায়ারস্টোর ইনডেক্স তৈরি হচ্ছে। দয়া করে ৫ মিনিট অপেক্ষা করুন।" : "ডাটাবেস কানেকশনে সমস্যা হচ্ছে।"}
          </p>
          <p className="text-[7px] font-mono text-muted-foreground opacity-50 mt-4 break-all bg-black/40 p-3 rounded-lg">
            {error.message}
          </p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()} className="h-10 rounded-xl uppercase font-black text-[10px] tracking-widest gap-2">
          <RefreshCcw className="w-3.5 h-3.5" /> রিফ্রেশ করুন
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">পেমেন্ট <span className="text-primary">চেক</span></h2>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ডিপোজিট ও উইথড্র ম্যানেজ করুন</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">পেমেন্ট লিস্ট লোড হচ্ছে...</p>
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
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center border",
                  tx.type === 'withdrawal' ? "bg-green-600/10 text-green-500 border-green-500/20" : "bg-primary/10 text-primary border-primary/20"
                )}>
                  {tx.type === 'withdrawal' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="text-lg font-black text-white italic tracking-tighter">{tx.amount} TK</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${tx.method === 'Bkash' ? 'bg-pink-600/20 text-pink-500' : 'bg-orange-600/20 text-orange-500'}`}>
                      {tx.method}
                    </span>
                    <span className="text-[7px] font-black uppercase text-muted-foreground tracking-widest">
                      {tx.type === 'withdrawal' ? 'উইথড্র' : 'ডিপোজিট'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" /> {tx.timestamp ? format(tx.timestamp.toDate(), 'hh:mm a') : 'Now'}
                 </p>
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
               {tx.type === 'withdrawal' ? (
                 <div className="p-4 bg-green-500/5 rounded-2xl border border-green-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-green-500" />
                      <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Number</span>
                    </div>
                    <span className="text-[11px] font-black text-white font-mono">{tx.phoneNumber}</span>
                 </div>
               ) : (
                 <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Hash className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-bold text-red-700 uppercase tracking-widest">TXID</span>
                    </div>
                    <span className="text-[11px] font-black text-primary font-mono">{tx.transactionId}</span>
                 </div>
               )}
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
                className={cn(
                  "flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg",
                  tx.type === 'withdrawal' ? "bg-green-600 hover:bg-green-700 shadow-green-600/20" : "magma-gradient shadow-primary/20"
                )}
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
