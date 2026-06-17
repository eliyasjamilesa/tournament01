
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Wallet, 
  Plus, 
  Loader2, 
  CircleDollarSign,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Link from 'next/link';

export default function DepositPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [method, setMethod] = useState<'Bkash' | 'Nagad' | null>(null);
  const [amount, setAmount] = useState('');
  const [txId, setTxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const bkashNumber = "+8801305525266";
  const nagadNumber = "+8801712109801";

  const currentNumber = method === 'Bkash' ? bkashNumber : nagadNumber;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast({ title: "Copied!", description: "Number copied to clipboard." });
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user || !method || !amount || !txId) return;

    setIsSubmitting(true);
    const depositData = {
      userId: user.uid,
      userEmail: user.email,
      amount: Number(amount),
      method: method,
      type: 'deposit',
      transactionId: txId,
      status: 'pending',
      timestamp: serverTimestamp()
    };

    addDoc(collection(db, 'transactions'), depositData)
      .then(() => {
        toast({ title: "সফল", description: "আপনার রিকোয়েস্ট পাঠানো হয়েছে। চেক করে অ্যাড করা হবে।" });
        router.push('/wallet');
      })
      .catch(async (error) => {
        if (error.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: 'transactions',
            operation: 'create',
            requestResourceData: depositData
          });
          errorEmitter.emit('permission-error', permissionError);
        } else {
          toast({ variant: "destructive", title: "Error", description: error.message });
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
        <h1 className="text-xl font-black uppercase italic tracking-tight text-white">Add Money</h1>
      </header>

      <main className="flex-1 p-6 pb-32 space-y-8 max-w-md mx-auto w-full">
        <section className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">1</span> 
            পেমেন্ট মেথড সিলেক্ট করুন
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setMethod('Bkash')}
              className={cn(
                "h-20 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all",
                method === 'Bkash' ? "bg-pink-600/10 border-pink-500 shadow-lg shadow-pink-500/20" : "bg-muted/30 border-white/5"
              )}
            >
              <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-black italic">b</div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white">bKash</span>
            </button>
            <button 
              onClick={() => setMethod('Nagad')}
              className={cn(
                "h-20 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all",
                method === 'Nagad' ? "bg-orange-600/10 border-orange-500 shadow-lg shadow-orange-500/20" : "bg-muted/30 border-white/5"
              )}
            >
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-black italic">n</div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Nagad</span>
            </button>
          </div>
        </section>

        {method && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">2</span> 
              টাকা পাঠিয়ে তথ্য দিন
            </h2>

            <Card className="bg-primary/5 border-primary/20 rounded-3xl overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="text-center space-y-1">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Send Money to this {method} number</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl font-black text-white italic tracking-tighter">{currentNumber}</span>
                    <Button size="icon" variant="ghost" onClick={handleCopy} className="h-8 w-8 bg-white/5">
                      {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-primary" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <form onSubmit={handleDeposit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">অ্যামাউন্ট (TK)</Label>
                  <div className="relative">
                    <CircleDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                    <Input 
                      type="number" 
                      placeholder="E.g. 500" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-muted/30 border-white/5 h-12 pl-12 rounded-xl font-black"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">ট্রানজ্যাকশন আইডি (TXID)</Label>
                  <div className="relative">
                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                    <Input 
                      placeholder="E.g. 8A72B3C" 
                      value={txId}
                      onChange={(e) => setTxId(e.target.value)}
                      className="bg-muted/30 border-white/5 h-12 pl-12 rounded-xl font-black font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-muted/20 border border-white/5 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                <p className="text-[9px] font-bold text-muted-foreground uppercase leading-relaxed">
                  পেমেন্ট পাঠানোর পর আপনার ট্রানজ্যাকশন আইডিটি এখানে দিন। ৫-১০ মিনিটের মধ্যে আপনার ব্যালেন্স আপডেট করে দেওয়া হবে।
                </p>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting || !amount || !txId}
                className="w-full h-14 magma-gradient font-black uppercase italic tracking-widest rounded-2xl shadow-xl shadow-primary/20"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'রিকোয়েস্ট পাঠান'}
              </Button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
