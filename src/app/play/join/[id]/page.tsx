
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
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Tournament Data
  const tournamentRef = useMemoFirebase(() => {
    if (!db || !tournamentId) return null;
    return doc(db, 'tournaments', tournamentId);
  }, [db, tournamentId]);
  const { data: tournament, loading: tournamentLoading } = useDoc<any>(tournamentRef);

  // Fetch Existing Registrations to see occupied slots
  const registrationsRef = useMemoFirebase(() => {
    if (!db || !tournamentId) return null;
    return collection(db, 'tournaments', tournamentId, 'registrations');
  }, [db, tournamentId]);
  const { data: registrations, loading: regsLoading } = useCollection<any>(registrationsRef);

  const occupiedSlots = useMemo(() => {
    if (!registrations) return new Set<number>();
    return new Set(registrations.map((r: any) => r.slotNumber));
  }, [registrations]);

  // Generate Slots based on Match Type
  const slotConfig = useMemo(() => {
    if (!tournament) return { total: 48, layout: 'single' };
    const mode = tournament.mode || '';
    if (mode.includes('SOLO')) return { total: 48, layout: 'single' };
    if (mode.includes('DUO')) return { total: 48, layout: 'dual' }; // 24 groups of 2
    if (mode.includes('SQUAD')) return { total: 48, layout: 'squad' }; // 12 groups of 4
    if (mode.includes('CS RANK')) return { total: 8, layout: 'team' }; // 4 vs 4
    if (mode.includes('LW 1V1')) return { total: 2, layout: 'single' };
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
      if (!db || !user || !tournament) return;
      setIsSubmitting(true);
      try {
        const regRef = doc(db, 'tournaments', tournamentId, 'registrations', user.uid);
        await setDoc(regRef, {
          uid: user.uid,
          displayName: user.displayName || 'Player',
          slotNumber: selectedSlot,
          timestamp: serverTimestamp()
        });
        const tRef = doc(db, 'tournaments', tournamentId);
        await updateDoc(tRef, { currentPlayers: increment(1) });
        
        setStep(3);
        toast({ title: "Joined!", description: "You have successfully joined the match." });
      } catch (err: any) {
        toast({ variant: "destructive", title: "Error", description: err.message });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (tournamentLoading || regsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Initializing Arena...</p>
      </div>
    );
  }

  if (!tournament) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col pb-32">
      <header className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md z-50">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-white bg-white/5 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-black uppercase tracking-tight italic">
          {step === 1 ? 'Select a Slot' : step === 2 ? 'Confirm Entry' : 'Deployment Success'}
        </h1>
        <div className="w-9" /> {/* Spacer */}
      </header>

      {/* Progress Stepper */}
      <div className="px-10 py-6 flex items-center justify-between relative">
        <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-px bg-white/10" />
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black relative z-10 transition-all",
              step === s ? "bg-primary text-white shadow-[0_0_15px_rgba(255,0,0,0.5)]" : 
              step > s ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"
            )}
          >
            {step > s ? <Check className="w-4 h-4" /> : s}
          </div>
        ))}
      </div>

      <main className="flex-1 px-6 space-y-6 overflow-y-auto">
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Available Slots</span>
              <span className="text-[10px] font-black text-primary uppercase italic">{tournament.mode}</span>
            </div>

            <div className={cn(
              "grid gap-3",
              slotConfig.layout === 'single' ? "grid-cols-5" : 
              slotConfig.layout === 'dual' ? "grid-cols-4" : 
              slotConfig.layout === 'team' ? "grid-cols-4" : "grid-cols-5"
            )}>
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
                      isOccupied 
                        ? "bg-red-950/20 border-red-900/30 text-muted-foreground/30 cursor-not-allowed" 
                        : isSelected 
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105" 
                        : "bg-muted/30 border-white/5 text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    <span className={cn(
                      "text-xs font-black",
                      isOccupied && "line-through"
                    )}>
                      {isOccupied ? '-' : slotNum}
                    </span>
                    {isSelected && !isOccupied && (
                       <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                       </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="p-6 rounded-3xl bg-muted/20 border border-white/5 space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Gamepad2 className="w-5 h-5 text-primary" />
                   </div>
                   <div>
                      <h3 className="text-sm font-black uppercase italic tracking-tight">{tournament.title}</h3>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">{tournament.matchId}</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden">
                   <div className="p-4 bg-background flex flex-col items-center gap-1">
                      <span className="text-[8px] font-bold uppercase text-muted-foreground">Selected Slot</span>
                      <span className="text-xl font-black text-primary">#{selectedSlot}</span>
                   </div>
                   <div className="p-4 bg-background flex flex-col items-center gap-1">
                      <span className="text-[8px] font-bold uppercase text-muted-foreground">Entry Fee</span>
                      <span className="text-xl font-black text-white">{tournament.entryFee} TK</span>
                   </div>
                </div>

                <div className="space-y-3 pt-2">
                   <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                         <Clock className="w-3.5 h-3.5" />
                         <span className="text-[10px] font-bold uppercase">Launch Time</span>
                      </div>
                      <span className="text-[10px] font-black">{format(new Date(tournament.startTime), 'hh:mm a, dd MMM')}</span>
                   </div>
                   <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                         <Wallet className="w-3.5 h-3.5" />
                         <span className="text-[10px] font-bold uppercase">Payment Mode</span>
                      </div>
                      <span className="text-[10px] font-black">Virtual Coins</span>
                   </div>
                </div>
             </div>

             <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex gap-3">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                   <Check className="w-3 h-3 text-white" />
                </div>
                <p className="text-[9px] font-bold text-muted-foreground leading-relaxed uppercase">
                   By proceeding, <span className="text-white">TK {tournament.entryFee}</span> will be deducted from your virtual wallet. Ensure you are ready for deployment at the specified time.
                </p>
             </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-10 space-y-6 animate-in zoom-in duration-500">
             <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center relative">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
                <div className="absolute inset-0 rounded-full border-2 border-green-500 animate-ping opacity-20" />
             </div>
             
             <div className="text-center space-y-2">
                <h2 className="text-2xl font-black uppercase italic text-white tracking-tight">Mission Confirmed</h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest max-w-[240px]">
                   You are now registered in <span className="text-primary">{tournament.title}</span>. Standby for room credentials.
                </p>
             </div>

             <div className="w-full bg-muted/20 border border-white/5 rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-bold uppercase text-muted-foreground">Assigned Slot</span>
                   <span className="text-sm font-black text-primary">SLOT #{selectedSlot}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-bold uppercase text-muted-foreground">Status</span>
                   <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Authorized</span>
                </div>
             </div>

             <Button onClick={() => router.push('/joined')} className="w-full h-12 bg-green-600 hover:bg-green-700 font-black uppercase italic tracking-widest rounded-xl shadow-lg mt-4">
                View My Matches
             </Button>
          </div>
        )}
      </main>

      {step < 3 && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-background/80 backdrop-blur-md border-t border-white/5 z-50">
          <div className="max-w-md mx-auto">
            <Button 
              disabled={isSubmitting || (step === 1 && selectedSlot === null)}
              onClick={handleProceed}
              className="w-full h-14 magma-gradient font-black uppercase italic tracking-widest rounded-xl shadow-xl active:scale-95 transition-all text-sm"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : step === 1 ? 'PROCEED' : 'CONFIRM DEPLOYMENT'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
