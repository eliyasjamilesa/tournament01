
"use client";

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  ChevronRight, 
  Loader2, 
  Check, 
  Users, 
  Gamepad2, 
  Clock, 
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
import { format } from 'date-fns';

export default function JoinMatchFlow() {
  const params = useParams();
  const tournamentId = params.id as string;
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [ingameName, setIngameName] = useState('');
  const [ingameId, setIngameId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Tournament Data
  const tournamentRef = useMemoFirebase(() => {
    if (!db || !tournamentId) return null;
    return doc(db, 'tournaments', tournamentId);
  }, [db, tournamentId]);
  const { data: tournament, loading: tournamentLoading } = useDoc<any>(tournamentRef);

  // Fetch User Profile for Balance Check
  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  const { data: profile, loading: profileLoading } = useDoc<any>(userRef);

  // Fetch Existing Registrations
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
    if (!tournament) return { total: 48, layout: 'single' };
    const mode = (tournament.mode || '').toUpperCase();
    if (mode.includes('BR')) return { total: 48, layout: 'single' };
    if (mode.includes('CS')) return { total: 8, layout: 'team' };
    if (mode.includes('LW 1V1') || mode === 'LW HEADSHOT') return { total: 2, layout: 'single' };
    if (mode.includes('LW 2V2')) return { total: 4, layout: 'team' };
    return { total: 48, layout: 'single' };
  }, [tournament]);

  const handleProceed = async () => {
    if (step === 1) {
      if (selectedSlot === null) {
        toast({ variant: "destructive", title: "Wait!", description: "Please select a slot first." });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!ingameName || !ingameId) {
        toast({ variant: "destructive", title: "Required", description: "Please enter your Game Name and Player ID." });
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!db || !user || !tournament || !profile) return;
      
      const userCoins = profile.coins || 0;
      const entryFee = tournament.entryFee || 0;

      if (userCoins < entryFee) {
        toast({ 
          variant: "destructive", 
          title: "Insufficient Balance", 
          description: `You need ${entryFee} TK but have only ${userCoins} TK.` 
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
        toast({ title: "Joined!", description: "Coins deducted and match joined successfully." });
      } catch (err: any) {
        toast({ variant: "destructive", title: "Error", description: err.message });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (tournamentLoading || regsLoading || profileLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Arena Initializing...</p>
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
          {step === 1 ? 'Select Slot' : step === 2 ? 'Game Profile' : step === 3 ? 'Confirm' : 'Authorized'}
        </h1>
        <div className="w-9" />
      </header>

      {/* Progress Stepper */}
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
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Available Battle Slots</span>
              <span className="text-[10px] font-black text-primary uppercase italic">{tournament.mode}</span>
            </div>
            <div className={cn("grid gap-3", slotConfig.total <= 8 ? "grid-cols-4" : "grid-cols-5")}>
              {Array.from({ length: slotConfig.total }).map((_, i) => {
                const slotNum = i + 1;
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
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-black uppercase italic tracking-tight">Warrior Credentials</h2>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Verify your in-game identity</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">In-game Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <Input 
                    placeholder="e.g. ShadowSlayer" 
                    value={ingameName}
                    onChange={(e) => setIngameName(e.target.value)}
                    className="bg-muted/30 border-white/5 h-12 pl-12 rounded-xl font-bold"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">In-game Player ID (UID)</Label>
                <div className="relative">
                  <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <Input 
                    placeholder="e.g. 102938475" 
                    value={ingameId}
                    onChange={(e) => setIngameId(e.target.value)}
                    className="bg-muted/30 border-white/5 h-12 pl-12 rounded-xl font-bold font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-primary/5 border border-primary/20 space-y-3 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:rotate-12 transition-transform">
                  <ShieldAlert className="w-12 h-12 text-primary" />
               </div>
               <h3 className="text-[11px] font-black uppercase italic text-primary flex items-center gap-2">
                 <Info className="w-3.5 h-3.5" /> Tactical Instruction
               </h3>
               <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed">
                 Warrior, ensure your <span className="text-white">In-game Name</span> and <span className="text-white">Player ID</span> exactly match your game profile. Discrepancies may lead to <span className="text-primary">Disqualification</span> from the arena without refund.
               </p>
               <div className="flex items-center gap-2 pt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground">Double check before proceeding</span>
               </div>
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
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">Slot #{selectedSlot}</p>
                </div>
              </div>

              <div className="p-4 bg-background rounded-2xl space-y-3 border border-white/5">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                   <span className="text-muted-foreground">In-game Name</span>
                   <span className="text-white">{ingameName}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                   <span className="text-muted-foreground">Game ID</span>
                   <span className="text-white font-mono">{ingameId}</span>
                </div>
              </div>
              
              <div className="p-4 bg-card/40 border border-white/5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2"><Wallet className="w-4 h-4 text-primary" /><span className="text-[10px] font-bold uppercase text-muted-foreground">Your Balance</span></div>
                <span className={cn("text-xs font-black", (profile?.coins || 0) < (tournament?.entryFee || 0) ? "text-destructive" : "text-green-500")}>
                  {profile?.coins || 0} TK
                </span>
              </div>

              <div className="flex justify-between items-center px-2">
                 <span className="text-[10px] font-black uppercase text-primary italic">Required Entry Fee</span>
                 <span className="text-lg font-black">{tournament.entryFee} TK</span>
              </div>
            </div>

            {(profile?.coins || 0) < (tournament?.entryFee || 0) && (
               <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3">
                 <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                 <p className="text-[10px] font-bold text-destructive uppercase leading-relaxed">Insufficient coins to join this arena. Recharge your wallet to proceed.</p>
               </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center justify-center py-10 space-y-6 animate-in zoom-in duration-500">
             <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center relative">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
                <div className="absolute inset-0 rounded-full border-2 border-green-500 animate-ping opacity-20" />
             </div>
             <div className="text-center space-y-2">
                <h2 className="text-2xl font-black uppercase italic text-white tracking-tight">Mission Confirmed</h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest max-w-[240px]">Registration successful for <span className="text-primary">{tournament.title}</span>.</p>
             </div>
             <Button onClick={() => router.push('/joined')} className="w-full h-12 bg-green-600 hover:bg-green-700 font-black uppercase italic rounded-xl shadow-lg mt-4">View My Matches</Button>
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
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : step === 3 ? 'CONFIRM DEPLOYMENT' : 'PROCEED'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
