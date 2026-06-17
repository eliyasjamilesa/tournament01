
"use client";

import { useState, useMemo } from 'react';
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
  ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, setDoc, updateDoc, increment, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function JoinMatchFlow() {
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

  const handleProceed = async () => {
    if (step === 1) {
      if (selectedSlot === null) {
        toast({ variant: "destructive", title: "স্লট সিলেক্ট করুন", description: "দয়া করে একটি স্লট পছন্দ করুন।" });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!ingameName || !ingameId) {
        toast({ variant: "destructive", title: "তথ্য প্রয়োজন", description: "গেমের নাম এবং আইডি দিন।" });
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!db || !user || !tournament || !profile || !tournamentId) return;
      
      const userCoins = profile.coins || 0;
      const entryFee = tournament.entryFee || 0;

      if (userCoins < entryFee) {
        toast({ 
          variant: "destructive", 
          title: "টাকা কম আছে", 
          description: `আপনার কাছে ${userCoins} TK আছে, কিন্তু জয়েন করতে ${entryFee} TK লাগবে।` 
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
          timestamp: serverTimestamp()
        });

        const tRef = doc(db, 'tournaments', tournamentId);
        batch.update(tRef, { currentPlayers: increment(1) });

        const uRef = doc(db, 'users', user.uid);
        batch.update(uRef, { coins: increment(-entryFee) });

        await batch.commit();
        setStep(4);
        toast({ title: "সফল!", description: "ম্যাচ জয়েন করা হয়েছে।" });
      } catch (err: any) {
        toast({ variant: "destructive", title: "Error", description: err.message });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!tournamentId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-black uppercase tracking-tight mb-2">ম্যাচ পাওয়া যায়নি</h2>
        <Button onClick={() => router.push('/play')} variant="outline">ফিরে যান</Button>
      </div>
    );
  }

  if (tournamentLoading || regsLoading || profileLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">ম্যাচ লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!tournament) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md z-50">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-white bg-white/5 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-black uppercase tracking-tight italic">
          {step === 1 ? 'স্লট সিলেক্ট করুন' : step === 2 ? 'আপনার গেম আইডি' : step === 3 ? 'নিশ্চিত করুন' : 'সফল'}
        </h1>
        <div className="w-9" />
      </header>

      <div className="px-10 py-6 flex items-center justify-between relative">
        <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-px bg-white/10" />
        {[1, 2, 3, 4].map((s) => (
          <div 
            key={s} 
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black relative z-10 transition-all",
              step === s ? "bg-primary text-white shadow-[0_0_15px_rgba(255,0,0,0.5)]" : 
              step > s ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"
            )}
          >
            {step > s ? <Check className="w-3.5 h-3.5" /> : s}
          </div>
        ))}
      </div>

      <main className="flex-1 px-6 pb-32 space-y-6 overflow-y-auto">
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">ফাঁকা স্লটগুলো পছন্দ করুন</span>
              <span className="text-[10px] font-black text-primary uppercase italic">{tournament.mode}</span>
            </div>
            
            <div className="space-y-4">
              {Array.from({ length: Math.ceil(slotConfig.total / slotConfig.perGroup) }).map((_, groupIndex) => (
                <div key={groupIndex} className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                      {slotConfig.type} {groupIndex + 1}
                    </span>
                    <div className="h-px flex-1 bg-white/5 ml-3" />
                  </div>
                  <div className={cn(
                    "grid gap-2 p-3 rounded-2xl bg-white/5 border border-white/5",
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
                            "aspect-square rounded-xl flex items-center justify-center transition-all border relative",
                            isOccupied ? "bg-red-950/20 border-red-900/30 text-muted-foreground/30" : 
                            isSelected ? "bg-primary border-primary text-white shadow-lg" : "bg-muted/30 border-white/5"
                          )}
                        >
                          <span className={cn("text-xs font-black", isOccupied && "line-through")}>{isOccupied ? '-' : slotNum}</span>
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
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-black uppercase italic tracking-tight">আপনার তথ্য দিন</h2>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">গেমের সঠিক তথ্য দিন</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">গেমের নাম (In-game Name)</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <Input 
                    placeholder="E.g. ShadowSlayer" 
                    value={ingameName}
                    onChange={(e) => setIngameName(e.target.value)}
                    className="bg-muted/30 border-white/5 h-12 pl-12 rounded-xl font-bold"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">গেম আইডি (Player UID)</Label>
                <div className="relative">
                  <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <Input 
                    placeholder="E.g. 102938475" 
                    value={ingameId}
                    onChange={(e) => setIngameId(e.target.value)}
                    className="bg-muted/30 border-white/5 h-12 pl-12 rounded-xl font-bold font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-primary/5 border border-primary/20 space-y-3 relative overflow-hidden group">
               <h3 className="text-[11px] font-black uppercase italic text-primary flex items-center gap-2">
                 <Info className="w-3.5 h-3.5" /> জরুরি নিয়ম
               </h3>
               <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed">
                 দয়া করে গেমের নাম এবং আইডি চেক করে দিন। ভুল তথ্য দিলে রেজাল্ট পাবেন না এবং টাকা রিফান্ড করা হবে না।
               </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="p-6 rounded-3xl bg-muted/20 border border-white/5 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Gamepad2 className="w-5 h-5 text-primary" /></div>
                <div>
                  <h3 className="text-sm font-black uppercase italic tracking-tight">{tournament.title}</h3>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">স্লট #{selectedSlot}</p>
                </div>
              </div>

              <div className="p-4 bg-background rounded-2xl space-y-3 border border-white/5">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                   <span className="text-muted-foreground">গেমের নাম</span>
                   <span className="text-white">{ingameName}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                   <span className="text-muted-foreground">গেম আইডি</span>
                   <span className="text-white font-mono">{ingameId}</span>
                </div>
              </div>
              
              <div className="p-4 bg-card/40 border border-white/5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2"><Wallet className="w-4 h-4 text-primary" /><span className="text-[10px] font-bold uppercase text-muted-foreground">আপনার ব্যালেন্স</span></div>
                <span className={cn("text-xs font-black", (profile?.coins || 0) < (tournament?.entryFee || 0) ? "text-destructive" : "text-green-500")}>
                  {profile?.coins || 0} TK
                </span>
              </div>

              <div className="flex justify-between items-center px-2">
                 <span className="text-[10px] font-black uppercase text-primary italic">এন্ট্রি ফি লাগবে</span>
                 <span className="text-lg font-black">{tournament.entryFee} TK</span>
              </div>
            </div>

            {(profile?.coins || 0) < (tournament?.entryFee || 0) && (
               <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3">
                 <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                 <p className="text-[10px] font-bold text-destructive uppercase leading-relaxed">আপনার ব্যালেন্স কম আছে। দয়া করে রিচার্জ করুন।</p>
               </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center justify-center py-10 space-y-6 animate-in zoom-in duration-500">
             <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center relative">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
             </div>
             <div className="text-center space-y-2">
                <h2 className="text-2xl font-black uppercase italic text-white tracking-tight">সফলভাবে জয়েন করেছেন</h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest max-w-[240px]">আপনি সফলভাবে <span className="text-primary">{tournament.title}</span>-এ জয়েন করেছেন।</p>
             </div>
             <Button onClick={() => router.push('/joined')} className="w-full h-12 bg-green-600 hover:bg-green-700 font-black uppercase italic rounded-xl shadow-lg mt-4">আমার ম্যাচ দেখুন</Button>
          </div>
        )}
      </main>

      {step < 4 && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-background/80 backdrop-blur-md border-t border-white/5 z-[60]">
          <div className="max-w-md mx-auto">
            <Button 
              disabled={isSubmitting || (step === 1 && selectedSlot === null)}
              onClick={handleProceed}
              className="w-full h-14 magma-gradient font-black uppercase italic tracking-widest rounded-xl shadow-xl text-sm"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : step === 3 ? 'জয়েন কনফার্ম করুন' : 'সামনে যান'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
