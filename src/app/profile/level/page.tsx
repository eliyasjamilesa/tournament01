
"use client";

import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Medal, 
  Star, 
  Zap, 
  ShieldCheck, 
  Trophy, 
  Info, 
  Swords, 
  Users,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function LevelPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, loading: profileLoading } = useDoc<any>(userDocRef);

  if (userLoading || profileLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Loading My Rank...</p>
      </div>
    );
  }

  const currentLevel = profile?.level || 1;
  const currentXP = profile?.xp || 0;
  const xpProgress = currentXP % 100;
  const xpToNextLevel = 100 - xpProgress;

  const missions = [
    { title: "ম্যাচ খেলুন", desc: "প্রতিটি ম্যাচে জয়েন করলে ৫ XP পাবেন।", icon: Swords, color: "text-blue-500" },
    { title: "বুইয়াহ (Booyah)", desc: "প্রতিটি ম্যাচ জিতলে ২০ XP পাবেন।", icon: Trophy, color: "text-yellow-500" },
    { title: "প্রতি কিল (Per Kill)", desc: "প্রতিটি কিলের জন্য ২ XP পাবেন।", icon: Zap, color: "text-primary" },
    { title: "বন্ধু ইনভাইট", desc: "বন্ধু জয়েন করলে ৫০ XP পাবেন।", icon: Users, color: "text-green-500" },
  ];

  const perks = [
    { level: 5, title: "Elite Member Badge", desc: "আপনার নামের পাশে স্পেশাল মেডেল দেখা যাবে।" },
    { level: 10, title: "Priority Support", desc: "যেকোনো সমস্যায় অ্যাডমিন দ্রুত রিপ্লাই দেবে।" },
    { level: 20, title: "Entry Discount", desc: "সব ম্যাচে ৫% এন্ট্রি ফি ছাড় পাওয়া যাবে।" },
    { level: 50, title: "Legendary Arena King", desc: "আপনি হয়ে যাবেন এই অ্যারেনার রাজা।" },
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="px-6 pt-10 pb-6 flex items-center gap-4 border-b border-white/5 bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push('/profile')}
          className="rounded-full bg-white/5"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Button>
        <h1 className="text-xl font-black uppercase italic tracking-tight text-white">My Rank & Level</h1>
      </header>

      <main className="p-4 space-y-8 max-w-md mx-auto w-full">
        {/* Level Badge Area */}
        <section className="flex flex-col items-center justify-center py-10 space-y-6 bg-gradient-to-b from-primary/10 to-transparent rounded-[3rem] border border-primary/5">
           <div className="relative">
              <div className="w-32 h-32 rounded-full magma-gradient flex items-center justify-center shadow-[0_0_40px_rgba(255,0,0,0.3)] border-4 border-white/10">
                 <Medal className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-white flex items-center justify-center border-4 border-background shadow-xl">
                 <span className="text-xl font-black text-primary italic">{currentLevel}</span>
              </div>
           </div>
           
           <div className="text-center space-y-2">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Level {currentLevel}</h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rank: Bronze Warrior</p>
           </div>

           <div className="w-full px-8 space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                 <span className="text-muted-foreground">Current XP: {currentXP}</span>
                 <span className="text-primary">{xpToNextLevel} XP needed for Lvl {currentLevel + 1}</span>
              </div>
              <Progress value={xpProgress} className="h-2.5 bg-background border border-white/5 shadow-inner" />
           </div>
        </section>

        {/* Missions / How to level up */}
        <section className="space-y-4">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-2 flex items-center gap-2">
              <Star className="w-3 h-3 text-primary" /> How to Level Up
           </h3>
           <div className="grid grid-cols-1 gap-3">
              {missions.map((mission, idx) => (
                <Card key={idx} className="bg-[#0a0a0a] border-white/5 rounded-2xl overflow-hidden">
                   <div className="p-4 flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${mission.color}`}>
                         <mission.icon className="w-5 h-5" />
                      </div>
                      <div>
                         <h4 className="text-sm font-black uppercase italic tracking-tight text-white">{mission.title}</h4>
                         <p className="text-[9px] font-bold text-muted-foreground uppercase">{mission.desc}</p>
                      </div>
                   </div>
                </Card>
              ))}
           </div>
        </section>

        {/* Level Perks / Benefits */}
        <section className="space-y-4">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-2 flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-primary" /> Rank Benefits
           </h3>
           <Card className="bg-[#0a0a0a] border-white/5 rounded-[2rem] overflow-hidden">
              <div className="divide-y divide-white/5">
                 {perks.map((perk, idx) => (
                   <div key={idx} className={`p-5 flex items-start gap-4 ${currentLevel >= perk.level ? 'opacity-100' : 'opacity-30'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${currentLevel >= perk.level ? 'bg-primary/20 text-primary' : 'bg-muted/20 text-muted-foreground'}`}>
                         <span className="text-xs font-black italic">{perk.level}</span>
                      </div>
                      <div className="space-y-1">
                         <div className="flex items-center gap-2">
                            <h4 className="text-[11px] font-black uppercase italic tracking-tight text-white">{perk.title}</h4>
                            {currentLevel >= perk.level && <ShieldCheck className="w-3 h-3 text-green-500" />}
                         </div>
                         <p className="text-[9px] font-bold text-muted-foreground uppercase leading-relaxed">{perk.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </Card>
        </section>

        <section className="p-6 rounded-3xl bg-primary/5 border border-primary/20 flex items-start gap-4">
           <Info className="w-5 h-5 text-primary shrink-0" />
           <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed">
             আপনার লেভেল যত বাড়বে, অ্যারেনাতে আপনার সম্মান এবং সুযোগ তত বেশি হবে। নিয়মিত ম্যাচ খেলুন এবং টপ র‍্যাঙ্কে পৌঁছান।
           </p>
        </section>
      </main>
    </div>
  );
}

