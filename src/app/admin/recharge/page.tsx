
"use client";

import { useState } from 'react';
import { Zap, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      const q = query(collection(db, 'users'), where('email', '==', email.trim()), limit(1));
      const snap = await getDocs(q);
      if (snap.empty) {
        toast({ variant: "destructive", title: "Error", description: "User not found." });
        return;
      }
      const userDoc = snap.docs[0];
      await updateDoc(doc(db, 'users', userDoc.id), { coins: increment(Number(amount)) });
      await addDoc(collection(db, 'transactions'), {
        userId: userDoc.id,
        userEmail: email,
        amount: Number(amount),
        status: 'approved',
        method: 'ADMIN_MANUAL',
        timestamp: serverTimestamp()
      });
      toast({ title: "Success", description: `Injected ${amount} coins to ${email}` });
      setEmail(''); setAmount('');
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter">Manual <span className="text-primary">Recharge</span></h1>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Directly inject coins into user wallets</p>
      </div>

      <Card className="border-white/5 bg-card/50 rounded-[2rem] max-w-lg">
        <CardHeader><CardTitle className="text-sm font-black uppercase italic flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Coin Injection</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleRecharge} className="space-y-4">
            <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase ml-1">User Email</Label><Input type="email" placeholder="warrior@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-muted/50 border-white/5 h-11 rounded-xl" required /></div>
            <div className="space-y-1.5"><Label className="text-[10px] font-bold uppercase ml-1">Coin Amount</Label><Input type="number" placeholder="500" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-muted/50 border-white/5 h-11 rounded-xl" required /></div>
            <Button type="submit" disabled={isProcessing} className="w-full h-12 magma-gradient font-black uppercase italic rounded-xl">
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Inject Coins'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
