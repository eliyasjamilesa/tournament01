
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
  Loader2,
  Lock,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Loading Rank...</p>
      </div>
    );
  }

  // Level Logic: 1000 XP per level
  const totalXP = profile?.xp || 0;
  const currentLevel = Math.floor(totalXP / 1000) + 1;
  const xpInsideCurrentLevel = totalXP % 1000;
  const xpProgressPercent = (xpInsideCurrentLevel / 1000) * 100;
  const xpToNextLevel = 1000 - xpInsideCurrentLevel;

  const missions = [
    { title: "ম্যাচ খেলুন", desc: "প্রতিটি ম্যাচে জয়েন করলে ১০ XP পাবেন।", icon: Swords, color: "text-blue-500" },
    { title: "বুইয়াহ (Booyah)", desc: "প্রতিটি ম্যাচ জিতলে ৫০ XP পাবেন।", icon: Trophy, color: "text-yellow-500" },
    { title: "প্রতি কিল (Per Kill)", desc: "প্রতিটি কিলের জন্য ১০ XP পাবেন।", icon: Zap, color: "text-primary" },
    { title: "বন্ধু ইনভাইট", desc: "বন্ধু জয়েন করলে ৫০ XP পাবেন।", icon: Users, color: "text-green-500" },
  ];

  const perks = [
    { level: 5, title: "Elite Member Badge", desc: "আপনার প্রোফাইলে স্পেশাল মেডেল যুক্ত হবে যা সবাই দেখতে পাবে।" },
    { level: 10, title: "Priority Support", desc: "যেকোনো সমস্যায় অ্যাডমিন থেকে ৩ গুণ দ্রুত রিপ্লাই পাবেন।" },
    { level: 20, title: "Entry Discount", desc: "সব ধরণের টুর্নামেন্ট এন্ট্রি ফি তে ৫% সরাসরি ছাড় পাবেন।" },
    { level: 35, title: "Withdraw Priority", desc: "উইথড্র করার সাথে সাথে পেমেন্ট পাওয়ার সুযোগ থাকবে।" },
    { level: 50, title: "Legendary Arena King", desc: "আপনি হয়ে যাবেন এই অ্যারেনার রাজা। বিশেষ কাস্টম ব্যাজ পাবেন।" },
  ];

  return (
    <div className="min-h-screen bg-black pb-32 text-white">
      <header className="px-6 py-8 flex items-center gap-4 border-b border-[#111111] bg-black sticky top-0 z-50">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push('/profile')}
          className="rounded-xl bg-[#111111] border border-[#222222]"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Button>
        <div>
          <h1 className="text-xl font-black uppercase italic tracking-tight">Rank & Level</h1>
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Progress Stats</p>
        </div>
      </header>

      <main className="p-4 space-y-10 max-w-md mx-auto w-full">
        {/* Level Badge Area - Simple Solid Design */}
        <section className="flex flex-col items-center justify-center py-10 space-y-6 bg-[#0a0a0a] rounded-[2.5rem] border border-[#111111]">
           <div className="relative">
              <div className="w-28 h-24 bg-primary rounded-2xl flex items-center justify-center border-4 border-white/10">
                 <Medal className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-xl bg-white flex items-center justify-center border-4 border-[#0a0a0a]">
                 <span className="text-lg font-black text-primary italic">{currentLevel}</span>
              </div>
           </div>
           
           <div className="text-center space-y-1">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Level {currentLevel}</h2>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Rank Status: Active Warrior</p>
           </div>

           <div className="w-full px-8 space-y-3">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                 <span className="text-gray-500">XP: {totalXP}</span>
                 <span className="text-primary">{xpToNextLevel} XP to Lvl {currentLevel + 1}</span>
              </div>
              <Progress value={xpProgressPercent} className="h-2 bg-black border border-[#222222]" />
           </div>
        </section>

        {/* Missions Section */}
        <section className="space-y-4">
           <div className="flex items-center gap-3 px-2">
              <div className="h-[1px] flex-1 bg-white/5" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 italic">How to Level Up</h3>
              <div className="h-[1px] flex-1 bg-white/5" />
           </div>
           <div className="grid grid-cols-1 gap-3">
              {missions.map((mission, idx) => (
                <Card key={idx} className="bg-[#0a0a0a] border-[#111111] rounded-2xl p-4 flex items-center gap-4 transition-all hover:border-primary/20">
                    <div className="w-11 h-11 rounded-xl bg-[#111111] flex items-center justify-center shrink-0 border border-white/5">
                        <mission.icon className={`w-5 h-5 ${mission.color}`} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-black uppercase italic text-white leading-tight">{mission.title}</h4>
                        <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">{mission.desc}</p>
                    </div>
                </Card>
              ))}
           </div>
        </section>

        {/* Rank Benefits - Refined Design */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 px-2">
              <div className="h-[1px] flex-1 bg-white/5" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Rank Benefits</h3>
              <div className="h-[1px] flex-1 bg-white/5" />
           </div>
           
           <div className="space-y-4">
              {perks.map((perk, idx) => {
                const isUnlocked = currentLevel >= perk.level;
                return (
                  <Card 
                    key={idx} 
                    className={cn(
                      "rounded-[1.5rem] border overflow-hidden transition-all duration-300",
                      isUnlocked 
                        ? "bg-[#0d0d0d] border-primary/20" 
                        : "bg-black border-[#111111] opacity-40"
                    )}
                  >
                    <div className="flex items-stretch min-h-[80px]">
                      {/* Level Indicator Side */}
                      <div className={cn(
                        "w-14 flex flex-col items-center justify-center border-r",
                        isUnlocked ? "bg-primary/10 border-primary/20" : "bg-black border-[#111111]"
                      )}>
                        <span className={cn(
                          "text-[8px] font-black uppercase tracking-widest mb-1",
                          isUnlocked ? "text-primary/60" : "text-gray-700"
                        )}>LVL</span>
                        <span className={cn(
                          "text-xl font-black italic tracking-tighter",
                          isUnlocked ? "text-white" : "text-gray-700"
                        )}>{perk.level}</span>
                      </div>

                      {/* Content Side */}
                      <div className="flex-1 p-4 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={cn(
                            "text-xs font-black uppercase italic tracking-tight",
                            isUnlocked ? "text-white" : "text-gray-500"
                          )}>
                            {perk.title}
                          </h4>
                          {isUnlocked ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <Lock className="w-3 h-3 text-gray-700" />
                          )}
                        </div>
                        <p className={cn(
                          "text-[9px] font-bold uppercase leading-relaxed",
                          isUnlocked ? "text-gray-400" : "text-gray-600"
                        )}>
                          {perk.desc}
                        </p>
                      </div>

                      {/* Right Arrow/Status */}
                      <div className="px-4 flex items-center justify-center">
                         {isUnlocked ? (
                           <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(255,0,0,0.5)]" />
                         ) : (
                           <ChevronRight className="w-3 h-3 text-gray-800" />
                         )}
                      </div>
                    </div>
                  </Card>
                );
              })}
           </div>
        </section>

        <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-[#111111] flex items-start gap-4">
           <div className="w-10 h-10 rounded-xl bg-[#111111] border border-white/5 flex items-center justify-center shrink-0">
             <Info className="w-5 h-5 text-primary" />
           </div>
           <p className="text-[10px] font-bold text-gray-500 uppercase leading-relaxed">
             আপনার লেভেল বাড়াতে নিয়মিত টুর্নামেন্টে অংশ নিন। প্রতিটি কিল এবং বুইয়াহ আপনাকে আরও দ্রুত টপ র‍্যাঙ্কে নিয়ে যাবে এবং নতুন সুবিধা আনলক করবে।
           </p>
        </div>
      </main>
    </div>
  );
}
