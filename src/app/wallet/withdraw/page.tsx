
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Wallet, 
  ArrowUpRight, 
  Loader2, 
  CircleDollarSign,
  AlertCircle,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function WithdrawPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  const { data: profile } = useDoc<any>(userDocRef);

  const [method, setMethod] = useState<'Bkash' | 'Nagad' | null>(null);
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user || !method || !amount || !phone || !profile) return;

    const withdrawAmount = Number(amount);
    if (withdrawAmount > (profile.coins || 0)) {
      toast({ variant: "destructive", title: "ব্যালেন্স নেই", description: "আপনার যথেষ্ট ব্যালেন্স নেই।" });
      return;
    }

    if (withdrawAmount < 100) {
      toast({ variant: "destructive", title: "লিমিট", description: "সর্বনিম্ন ১০০ টাকা উইথড্র করা যাবে।" });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        userEmail: user.email,
        amount: withdrawAmount,
        method: method,
        type: 'withdrawal',
        phoneNumber: phone,
        status: 'pending',
        timestamp: serverTimestamp()
      });
      toast({ title: "সফল", description: "আপনার উইথড্র রিকোয়েস্ট পাঠানো হয়েছে। অ্যাডমিন চেক করে টাকা পাঠিয়ে দেবে।" });
      router.push('/wallet');
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsSubmitting(false);
    }
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
        <h1 className="text-xl font-black uppercase italic tracking-tight text-white">Withdraw Money</h1>
      </header>

      <main className="flex-1 p-6 pb-32 space-y-8 max-w-md mx-auto w-full">
        <section className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-[10px]">1</span> 
            পেমেন্ট রিসিভ মেথড
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
              <span className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-[10px]">2</span> 
              উইথড্র ডিটেইলস
            </h2>

            <form onSubmit={handleWithdraw} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">অ্যামাউন্ট (TK)</Label>
                  <div className="relative">
                    <CircleDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                    <Input 
                      type="number" 
                      placeholder="E.g. 500" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-muted/30 border-white/5 h-12 pl-12 rounded-xl font-black text-green-500"
                      required
                    />
                  </div>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase ml-1">আপনার ব্যালেন্স: {profile?.coins || 0} TK</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">আপনার {method} নম্বর</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                    <Input 
                      type="tel"
                      placeholder="01XXXXXXXXX" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-muted/30 border-white/5 h-12 pl-12 rounded-xl font-black"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-muted/20 border border-white/5 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <p className="text-[9px] font-bold text-muted-foreground uppercase leading-relaxed">
                  উইথড্র রিকোয়েস্ট পাঠানোর পর অ্যাডমিন আপনার রিকোয়েস্টটি চেক করে ১-৬ ঘণ্টার মধ্যে পেমেন্ট পাঠিয়ে দেবে। পেমেন্ট পাঠানোর পর আপনার ব্যালেন্স থেকে টাকা কেটে নেওয়া হবে।
                </p>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting || !amount || !phone}
                className="w-full h-14 bg-green-600 hover:bg-green-700 font-black uppercase italic tracking-widest rounded-2xl shadow-xl shadow-green-600/20"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'উইথড্র রিকোয়েস্ট পাঠান'}
              </Button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
