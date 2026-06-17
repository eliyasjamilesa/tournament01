
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
        toast({ variant: "destructive", title: "ইউজার পাওয়া যায়নি" });
        return;
      }
      const userDoc = snap.docs[0];
      await updateDoc(doc(db, 'users', userDoc.id), { coins: increment(Number(amount)) });
      await addDoc(collection(db, 'transactions'), {
        userId: userDoc.id,
        userEmail: email.toLowerCase(),
        amount: Number(amount),
        status: 'approved',
        method: 'ADMIN_SEND',
        timestamp: serverTimestamp(),
        transactionId: `ADM-${Math.floor(100000 + Math.random() * 900000)}`
      });
      toast({ title: "সাফল", description: `${amount} TK ইউজারের ওয়ালেটে পাঠানো হয়েছে।` });
      setEmail(''); setAmount('');
    } catch (err: any) {
      toast({ variant: "destructive", title: "ব্যর্থ হয়েছে", description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">কয়েন <span className="text-primary">পাঠান</span></h2>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ম্যানুয়াল রিচার্জ করুন</p>
      </div>

      <Card className="border-white/5 bg-card/40 rounded-3xl overflow-hidden shadow-none">
        <CardContent className="p-6 space-y-6">
          <form onSubmit={handleRecharge} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">ইউজারের ইমেইল</Label>
                <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                   <Input 
                    type="email" 
                    placeholder="warrior@ignite.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="bg-black/20 border-white/5 h-12 pl-12 rounded-xl font-bold" 
                    required 
                   />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">কয়েন অ্যামাউন্ট (TK)</Label>
                <div className="relative">
                   <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                   <Input 
                    type="number" 
                    placeholder="500" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    className="bg-black/20 border-white/5 h-12 pl-12 rounded-xl font-black text-primary" 
                    required 
                   />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isProcessing} className="w-full h-14 magma-gradient font-black uppercase italic rounded-xl shadow-lg">
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'কয়েন পাঠিয়ে দিন'}
            </Button>
          </form>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3">
             <ShieldCheck className="w-4 h-4 text-green-500 mt-0.5" />
             <p className="text-[8px] font-bold text-muted-foreground uppercase leading-relaxed">অ্যাডমিন, এই অ্যাকশনটি করার সাথে সাথে ইউজারের ব্যালেন্স বেড়ে যাবে। সাবধানে করুন।</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
