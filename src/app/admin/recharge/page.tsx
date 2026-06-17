
"use client";

import { useState } from 'react';
import { Zap, Loader2, Mail, Wallet, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, increment, collection, query, where, getDocs, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function RechargePage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !email || !amount) return;
    setIsProcessing(true);
    try {
      const q = query(collection(db, 'users'), where('email', '==', email.trim().toLowerCase()), limit(1));
      const snap = await getDocs(q);
      if (snap.empty) {
        toast({ variant: "destructive", title: "Warrior Not Found", description: "Ensure the email matches a registered account." });
        return;
      }
      const userDoc = snap.docs[0];
      await updateDoc(doc(db, 'users', userDoc.id), { coins: increment(Number(amount)) });
      await addDoc(collection(db, 'transactions'), {
        userId: userDoc.id,
        userEmail: email.toLowerCase(),
        amount: Number(amount),
        status: 'approved',
        method: 'ADMIN_MANUAL',
        timestamp: serverTimestamp(),
        transactionId: `ADM-${Math.floor(100000 + Math.random() * 900000)}`
      });
      toast({ title: "Injected Successfully", description: `${amount} TK added to ${email}` });
      setEmail(''); setAmount('');
    } catch (err: any) {
      toast({ variant: "destructive", title: "System Failure", description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Manual <span className="text-primary">Recharge</span></h2>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Directly inject coins into user accounts</p>
      </div>

      <Card className="border-white/5 bg-card/60 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <CardContent className="p-8 space-y-8">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 rounded-2xl magma-gradient flex items-center justify-center shadow-lg shadow-primary/20">
                <Zap className="w-7 h-7 text-white fill-white/20" />
             </div>
             <div>
                <h3 className="text-lg font-black uppercase italic text-white tracking-tight">Injection Console</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Administrative Override</p>
             </div>
          </div>

          <form onSubmit={handleRecharge} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Warrior Email Address</Label>
                <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                   <Input 
                    type="email" 
                    placeholder="warrior@ignite.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="bg-black/40 border-white/5 h-14 pl-12 rounded-2xl font-bold placeholder:text-muted-foreground/30" 
                    required 
                   />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Coin Injection Amount</Label>
                <div className="relative">
                   <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                   <Input 
                    type="number" 
                    placeholder="500" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    className="bg-black/40 border-white/5 h-14 pl-12 rounded-2xl font-black text-lg text-primary placeholder:text-muted-foreground/30" 
                    required 
                   />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-4">
               <ShieldCheck className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
               <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed">
                 Administrator, this action will immediately update the user&apos;s balance and log an approved transaction in the system.
               </p>
            </div>

            <Button type="submit" disabled={isProcessing} className="w-full h-14 magma-gradient font-black uppercase italic tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all">
              {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Execute Injection'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
