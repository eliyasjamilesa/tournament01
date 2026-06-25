"use client";

import { useState, useMemo, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Check, 
  Loader2, 
  Users, 
  Gamepad2, 
  Wallet,
  CheckCircle2,
  AlertCircle,
  User,
  Fingerprint,
  Info,
  ShieldAlert,
  Percent,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, setDoc, updateDoc, increment, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

function JoinMatchContent() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get('id');
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [ingameName, setIngameName] = useState('');
  const [ingameId, setIngameId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tournamentRef = useMemoFirebase(() => {
    if (!db || !tournamentId) return null;
    return doc(db, 'tournaments', tournamentId);
  }, [db, tournamentId]);
  const { data: tournament, loading: tournamentLoading } = useDoc<any>(tournamentRef);

  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  const { data: profile, loading: profileLoading } = useDoc<any>(userRef);

  const registrationsRef = useMemoFirebase(() => {
    if (!db || !tournamentId) return null;
    return collection(db, 'tournaments', tournamentId, 'registrations');
  }, [db, tournamentId]);
  const { data: registrations, loading: regsLoading } = useCollection<any>(registrationsRef);

  useEffect(() => {
    if (profile) {
      if (profile.ingameName && !ingameName) setIngameName(profile.ingameName);
      if (profile.ingameId && !ingameId) setIngameId(profile.ingameId);
    }
  }, [profile]);

  const occupiedSlots = useMemo(() => {
    if (!registrations) return new Set<number>();
    return new Set(registrations.map((r: any) => r.slotNumber));
  }, [registrations]);

  const slotConfig = useMemo(() => {
    if (!tournament) return { total: 48, perGroup: 1, type: 'SOLO' };
    const mode = (tournament.mode || '').toUpperCase();
    if (mode === 'BR SOLO') return { total: 48, perGroup: 1, type: 'SOLO' };
    if (mode === 'BR DUO') return { total: 48, perGroup: 2, type: 'DUO' };
    if (mode === 'BR SQUAD') return { total: 48, perGroup: 4, type: 'SQUAD' };
    if (mode.includes('CS')) return { total: 8, perGroup: 4, type: 'TEAM' };
    if (mode.includes('LW 1V1') || mode === 'LW HEADSHOT') return { total: 2, perGroup: 1, type: 'TEAM' };
    if (mode.includes('LW 2V2')) return { total: 4, perGroup: 2, type: 'TEAM' };
    return { total: 48, perGroup: 1, type: 'SOLO' };
  }, [tournament]);

  const feeCalculation = useMemo(() => {
    if (!tournament || !profile) return { base: 0, final: 0, hasDiscount: false };
    const baseFee = Number(tournament.entryFee || 0);
    const totalXP = profile.xp || 0;
    const currentLevel = Math.floor(totalXP / 1000) + 1;
    
    if (currentLevel >= 20) {
      const discount = baseFee * 0.05;
      const finalFee = Math.floor(baseFee - discount);
      return { base: baseFee, final: finalFee, hasDiscount: true };
    }
    
    return { base: baseFee, final: baseFee, hasDiscount: false };
  }, [tournament, profile]);

  const handleProceed = async () => {
    if (step === 1) {
      if (selectedSlot === null) {
        toast({ variant: "destructive", title: "স্লট সিলেক্ট করুন", description: "দয়া করে একটি স্লট পছন্দ করুন।" });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!ingameName.trim() || !ingameId.trim()) {
        toast({ variant: "destructive", title: "তথ্য প্রয়োজন", description: "গেমের নাম এবং আইডি দিন।" });
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!db || !user || !tournament || !profile || !tournamentId) return;
      
      const userCoins = Number(profile.coins || 0);
      const entryFeeToPay = feeCalculation.final;

      if (userCoins < entryFeeToPay) {
        toast({ 
          variant: "destructive", 
          title: "ব্যালেন্স অপর্যাপ্ত", 
          description: `জয়েন করতে ${entryFeeToPay} TK লাগবে। আপনার আছে ${userCoins} TK।` 
        });
        return;
      }

      setIsSubmitting(true);
      try {
        const batch = writeBatch(db);
        const regRef = doc(db, 'tournaments', tournamentId, 'registrations', user.uid);
        batch.set(regRef, {
          uid: user.uid,
          displayName: profile.displayName || user.displayName || 'Player',
          ingameName: ingameName,
          ingameId: ingameId,
          slotNumber: selectedSlot,
          timestamp: serverTimestamp(),
          wonAmount: 0,
          kills: 0,
          xpAwarded: false
        });

        const tRef = doc(db, 'tournaments', tournamentId);
        batch.update(tRef, { currentPlayers: increment(1) });

        const uRef = doc(db, 'users', user.uid);
        batch.update(uRef, { 
          coins: increment(-entryFeeToPay),
          xp: increment(10)
        });

        const xpLogRef = doc(collection(db, 'users', user.uid, 'xpHistory'));
        batch.set(xpLogRef, {
          userId: user.uid,
          amount: 10,
          reason: `Match Join: ${tournament.title}`,
          timestamp: serverTimestamp()
        });

        await batch.commit();
        setStep(4);
        toast({ title: "সফল!", description: "ম্যাচ জয়েন করা হয়েছে।" });
      } catch (err: any) {
        console.error("Error joining match:", err);
        toast({ 
          variant: "destructive", 
          title: "Error", 
          description: `জয়েন করতে সমস্যা হয়েছে: ${err.message}` 
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleGoBack = () => {
    if (step > 1 && step < 4) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  if (tournamentLoading || regsLoading || profileLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">তৈরি হচ্ছে...</p>
      </div>
    );
  }

  if (!tournament) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="px-6 pt-10 pb-4 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md z-50 border-b border-white/5">
        <button onClick={handleGoBack} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl text-white active:scale-95 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
           <h1 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary italic leading-none mb-1">Join Flow</h1>
           <p className="text-[10px] font-bold text-muted-foreground uppercase">{step === 1 ? 'Slot Selection' : step === 2 ? 'Gamer Info' : step === 3 ? 'Final Checkout' : 'Mission Success'}</p>
        </div>
        <div className="w-10" />
      </header>

      {/* Progress Steps */}
      <div className="px-10 py-8 flex items-center justify-between relative max-w-sm mx-auto w-full">
        <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-[2px] bg-white/5" />
        {[1, 2, 3, 4].map((s) => (
          <div 
            key={s} 
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black relative z-10 transition-all duration-500 border-2",
              step === s ? "bg-primary border-primary text-white shadow-[0_0_20px_rgba(255,0,0,0.4)]" : 
              step > s ? "bg-green-600 border-green-600 text-white" : "bg-card border-white/5 text-muted-foreground"
            )}
          >
            {step > s ? <Check className="w-4 h-4" /> : s}
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 px-5 pb-40 overflow-y-auto no-scrollbar max-w-md mx-auto w-full">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">আপনার স্লট বেছে নিন</span>
              <span className="bg-primary/10 text-primary text-[9px] font-black px-3 py-1 rounded-full border border-primary/20 uppercase italic">{tournament.mode}</span>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {Array.from({ length: Math.ceil(slotConfig.total / slotConfig.perGroup) }).map((_, groupIndex) => (
                <div key={groupIndex} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest whitespace-nowrap">
                      {slotConfig.type} {groupIndex + 1}
                    </span>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                  <div className={cn(
                    "grid gap-2.5 p-4 rounded-[2rem] bg-[#0a0a0a] border border-white/5 shadow-inner",
                    slotConfig.perGroup === 1 ? "grid-cols-4" : 
                    slotConfig.perGroup === 2 ? "grid-cols-2" : 
                    "grid-cols-4"
                  )}>
                    {Array.from({ length: slotConfig.perGroup }).map((_, i) => {
                      const slotNum = (groupIndex * slotConfig.perGroup) + i + 1;
                      if (slotNum > slotConfig.total) return null;
                      const isOccupied = occupiedSlots.has(slotNum);
                      const isSelected = selectedSlot === slotNum;
                      return (
                        <button
                          key={slotNum}
                          disabled={isOccupied}
                          onClick={() => setSelectedSlot(slotNum)}
                          className={cn(
                            "aspect-square rounded-2xl flex flex-col items-center justify-center transition-all border-2 relative",
                            isOccupied ? "bg-black/40 border-white/5 opacity-20 cursor-not-allowed" : 
                            isSelected ? "bg-primary border-primary text-white shadow-xl scale-105" : "bg-white/5 border-transparent text-white/60 hover:bg-white/10"
                          )}
                        >
                          <span className={cn("text-xs font-black", isOccupied && "line-through")}>{slotNum}</span>
                          {!isOccupied && isSelected && <Check className="w-3 h-3 absolute top-1.5 right-1.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                 <Gamepad2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Enter Battlefield Info</h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">গেমের সঠিক তথ্য প্রদান করুন</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">In-game Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <Input 
                    placeholder="ShadowWarrior_07" 
                    value={ingameName}
                    onChange={(e) => setIngameName(e.target.value)}
                    className="bg-card border-white/5 h-14 pl-12 rounded-2xl font-bold focus:border-primary transition-all text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Player ID (UID)</Label>
                <div className="relative">
                  <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <Input 
                    placeholder="1029384756" 
                    value={ingameId}
                    onChange={(e) => setIngameId(e.target.value)}
                    className="bg-card border-white/5 h-14 pl-12 rounded-2xl font-black font-mono focus:border-primary transition-all text-sm tracking-widest"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-[2.5rem] bg-yellow-500/5 border border-yellow-500/20 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-3 opacity-10"><ShieldAlert className="w-12 h-12 text-yellow-500" /></div>
               <h3 className="text-[11px] font-black uppercase italic text-yellow-500 flex items-center gap-2 mb-2">
                 <AlertCircle className="w-4 h-4" /> সতর্কবার্তা
               </h3>
               <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed">
                 ভুল গেম আইডি দিলে ম্যাচ এন্ট্রি পাবেন না এবং রিফান্ড করা হবে না। সাবধানে তথ্য দিন।
               </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <Card className="rounded-[2.5rem] bg-[#0d0d0d] border border-white/5 overflow-hidden shadow-2xl">
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase italic tracking-tight">{tournament.title}</h3>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Match Slot: <span className="text-primary">#{selectedSlot}</span></p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                     <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">In-game Name</span>
                     <span className="text-xs font-black uppercase italic">{ingameName}</span>
                  </div>
                  <div className="flex justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                     <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Game ID</span>
                     <span className="text-xs font-black font-mono tracking-widest">{ingameId}</span>
                  </div>
                </div>
                
                <div className="p-5 bg-primary/5 border border-primary/10 rounded-[1.5rem] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Your Balance</span>
                  </div>
                  <span className={cn("text-sm font-black italic", Number(profile?.coins || 0) < feeCalculation.final ? "text-red-500" : "text-green-500")}>
                    ৳{profile?.coins || 0}
                  </span>
                </div>

                <div className="px-2 pt-2 flex items-center justify-between">
                   <div className="space-y-0.5">
                      <span className="text-[11px] font-black uppercase text-primary italic">Payable Amount</span>
                      {feeCalculation.hasDiscount && (
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-green-500 uppercase tracking-widest">
                          <Percent className="w-3 h-3" /> Level 20 Loyalty Discount (5%)
                        </div>
                      )}
                   </div>
                   <div className="text-right">
                      {feeCalculation.hasDiscount && (
                        <span className="text-[11px] font-bold text-muted-foreground line-through block opacity-40">
                          ৳{feeCalculation.base}
                        </span>
                      )}
                      <span className="text-2xl font-black italic tracking-tighter">৳{feeCalculation.final}</span>
                   </div>
                </div>
              </div>
            </Card>

            {Number(profile?.coins || 0) < feeCalculation.final && (
               <div className="p-5 bg-red-600/10 border border-red-600/20 rounded-2xl flex items-center gap-4 animate-pulse">
                 <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                 <p className="text-[10px] font-bold text-red-500 uppercase leading-tight">ব্যালেন্স পর্যাপ্ত নয়! দয়া করে রিচার্জ করে আবার চেষ্টা করুন।</p>
               </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center justify-center py-10 space-y-8 animate-in zoom-in duration-500">
             <div className="relative">
                <div className="w-32 h-32 rounded-full bg-green-600/10 border-2 border-green-600/20 flex items-center justify-center">
                   <CheckCircle2 className="w-16 h-16 text-green-500" />
                </div>
                <div className="absolute -top-2 -right-2 bg-primary text-white p-2 rounded-xl shadow-lg rotate-12">
                   <Check className="w-4 h-4" />
                </div>
             </div>
             
             <div className="text-center space-y-2">
                <h2 className="text-3xl font-black uppercase italic text-white tracking-tighter leading-none">Joined Successfully</h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest max-w-[260px] mx-auto leading-relaxed">
                   আপনার স্লটটি কনফার্ম করা হয়েছে। রুম আইডি ও পাসওয়ার্ড গেম শুরুর ৫-১০ মিনিট আগে শেয়ার করা হবে।
                </p>
             </div>

             <div className="w-full space-y-3">
               <Button onClick={() => router.push('/joined')} className="w-full h-14 bg-green-600 hover:bg-green-700 font-black uppercase italic rounded-2xl shadow-xl shadow-green-600/20 text-sm tracking-widest">
                  MY MATCHES
               </Button>
               <Button variant="ghost" onClick={() => router.push('/')} className="w-full h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  GO TO HOME
               </Button>
             </div>
          </div>
        )}
      </main>

      {/* Persistent Bottom Action Bar */}
      {step < 4 && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-background/80 backdrop-blur-xl border-t border-white/5 z-[60] safe-area-bottom">
          <div className="max-w-md mx-auto flex flex-col gap-3">
            <Button 
              disabled={isSubmitting || (step === 1 && selectedSlot === null) || (step === 3 && Number(profile?.coins || 0) < feeCalculation.final)}
              onClick={handleProceed}
              className="w-full h-14 magma-gradient font-black uppercase italic tracking-widest rounded-2xl shadow-xl shadow-primary/20 text-sm active:scale-95 transition-all"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Processing...</div>
              ) : step === 1 ? (
                'Next: Gamer Info'
              ) : step === 2 ? (
                'Next: Final Review'
              ) : (
                `Pay ৳${feeCalculation.final} & Join`
              )}
            </Button>
            
            <p className="text-[8px] text-center font-bold text-muted-foreground uppercase tracking-[0.2em]">Step {step} of 3 • Secure Arena Payment</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JoinMatchFlow() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <JoinMatchContent />
    </Suspense>
  );
}
