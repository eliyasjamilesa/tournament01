"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  ShieldCheck, 
  Gamepad2, 
  Skull, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Video, 
  DollarSign,
  HelpCircle,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type TabType = 'overall' | 'br_solo_duo' | 'br_squad' | 'cs_rank' | 'long_wolf' | 'headshot';

export default function RulesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overall');

  const tabs = [
    { id: 'overall', label: 'সার্বিক নিয়ম', icon: ShieldCheck },
    { id: 'br_solo_duo', label: 'BR Solo & Duo', icon: Gamepad2 },
    { id: 'br_squad', label: 'BR Squad', icon: Users },
    { id: 'cs_rank', label: 'CS Ranked', icon: Trophy },
    { id: 'long_wolf', label: 'Lone Wolf', icon: Skull },
    { id: 'headshot', label: 'Headshot Only', icon: HelpCircle },
  ] as const;

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden pb-20">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 bg-primary/5 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="px-6 pt-10 pb-4 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md z-50 border-b border-white/5">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl text-white active:scale-95 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
           <h1 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary italic leading-none mb-1">TS Tour</h1>
           <p className="text-[10px] font-bold text-muted-foreground uppercase">Rules & Guidelines</p>
        </div>
        <div className="w-10" />
      </header>

      {/* Tabs Navigation */}
      <div className="px-4 py-4 flex gap-2 overflow-x-auto no-scrollbar border-b border-white/5 bg-[#070707] sticky top-[73px] z-40">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border",
                isActive 
                  ? "bg-primary border-primary text-white shadow-[0_0_15px_rgba(255,0,0,0.3)]" 
                  : "bg-card border-white/5 text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 px-5 pt-6 max-w-md mx-auto w-full space-y-6">
        
        {/* Render Overall Rules */}
        {activeTab === 'overall' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-black uppercase italic tracking-tight text-white flex items-center justify-center gap-2">
                <ShieldCheck className="w-6 h-6 text-primary" /> সার্বিক নিয়মাবলী
              </h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ম্যাচে জয়েন করার আগে নিচের নিয়মগুলো পড়ে নিন</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  num: "১",
                  title: "স্লট নাম্বার নির্বাচন",
                  desc: "ম্যাচে জয়েন করার সময় আপনি নিজের পছন্দমতো Slot Number নির্বাচন করতে পারবেন। জয়েন করার পর অবশ্যই আপনার স্লট নাম্বারটি মনে রাখবেন।"
                },
                {
                  num: "২",
                  title: "কাস্টম রুমে প্রবেশের নিয়ম",
                  desc: "রুম ডিটেইলস থেকে Room ID ও Password সংগ্রহ করুন। Free Fire-এর Custom Section-এ গিয়ে Room ID দিয়ে সার্চ করুন। এরপর Password দিয়ে রুমে প্রবেশ করুন।"
                },
                {
                  num: "৩",
                  title: "Observer থেকে নিজের স্লটে যাওয়া",
                  desc: "রুমে ঢোকার পর সরাসরি কোনো স্লটে বসবেন না। প্রথমে Observer Mode-এ যান। তারপর আপনার নির্ধারিত Slot Number অনুযায়ী সঠিক স্লটে বসুন।"
                },
                {
                  num: "৪",
                  title: "স্লট সংক্রান্ত সমস্যা হলে করণীয়",
                  desc: "যদি দেখেন আপনার স্লটে অন্য কেউ বসে আছে, তাহলে চ্যাটে মেসেজ না দিয়ে সরাসরি Voice On করে Host-কে জানান। উদাহরণ: “ভাই, আমার স্লট নাম্বার [আপনার নাম্বার], আমাকে আমার স্লটটা দিন।” মনে রাখবেন, চ্যাট মেসেজ অনেক সময় নজরে নাও আসতে পারে, তাই Voice ব্যবহার করাই উত্তম।"
                },
                {
                  num: "৫",
                  title: "শৃঙ্খলা বজায় রাখা",
                  desc: "অপ্রয়োজনীয়ভাবে Voice On করে চিৎকার বা বিশৃঙ্খলা সৃষ্টি করবেন না। টুর্নামেন্টের পরিবেশ সুন্দর রাখা সকলের দায়িত্ব।"
                },
                {
                  num: "৬",
                  title: "Screen Record বাধ্যতামূলক",
                  desc: "Room ID ও Password নেওয়া থেকে শুরু করে ম্যাচ শুরু হওয়া পর্যন্ত পুরো প্রক্রিয়াটি Screen Record করে রাখবেন। কোনো প্রকার Refund দাবি করতে হলে Video Proof থাকা আবশ্যক। Video Proof ছাড়া কোনো অভিযোগ গ্রহণযোগ্য হবে না।"
                }
              ].map((rule, idx) => (
                <Card key={idx} className="border-white/5 bg-[#0a0a0a] rounded-2xl overflow-hidden">
                  <CardContent className="p-5 flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 font-black text-primary text-sm">
                      {rule.num}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white tracking-tight">{rule.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{rule.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Render BR Solo & Duo Rules */}
        {activeTab === 'br_solo_duo' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-black uppercase italic tracking-tight text-white flex items-center justify-center gap-2">
                <Gamepad2 className="w-6 h-6 text-primary" /> BR Solo & Duo Rules
              </h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ম্যাচ খেলার পূর্বে অবশ্যই নিয়মগুলো মেনে চলুন</p>
            </div>

            {/* Allowed & Banned Items */}
            <Card className="border-white/5 bg-[#0a0a0a] rounded-2xl overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-white/5 pb-2">Weapon & Character Rules</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground font-bold">Double Vector & Charge Booster নিষিদ্ধ</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground font-bold">All Sniper Gun ব্যবহার সম্পূর্ণ নিষিদ্ধ</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground font-bold">Only Kord Gun ব্যবহার করা যাবে না</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground font-bold">Vehicle (গাড়ি / Monster Truck) নিষিদ্ধ</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground font-bold">Irish Character ব্যবহার সম্পূর্ণ নিষিদ্ধ</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground font-bold">M590 Gun ব্যবহার করা যাবে</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Restrictions */}
            <Card className="border-white/5 bg-[#0a0a0a] rounded-2xl overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-white/5 pb-2">Special Restrictions</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground">ID লেভেল কমপক্ষে ৫০ হতে হবে। লেভেল কম থাকার কারণে Kick করা হলে কোনো Refund দেওয়া হবে না।</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground">Root করা ফোন বা PC Emulator ব্যবহার করলে সরাসরি BAN করা হবে।</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground">Hack, Mod, বা Teaming করলে সরাসরি অ্যাকাউন্ট Permanent BAN হবে।</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* General Instructions */}
            <Card className="border-white/5 bg-[#0a0a0a] rounded-2xl overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-white/5 pb-2">Room & Refund Policy</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Video className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground">কাস্টম রুমে ঢুকে প্রথমে <strong>Observer Mode</strong> এ যাবেন, এরপর নিজের সিলেক্টেড স্লটে বসবেন।</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Video className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground">রুম আইডি নেওয়া থেকে গেম শুরু পর্যন্ত স্ক্রিন রেকর্ড থাকা বাধ্যতামূলক। ভিডিও প্রুফ ছাড়া কিক বা অন্য সমস্যায় রিফান্ড পাওয়া যাবে না।</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <DollarSign className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground">ম্যাচের উইনিং ও কিল রিওয়ার্ড গেম শেষের ৩০–৪০ মিনিটের মধ্যে এড হয়ে যাবে। প্রতিদিন সর্বোচ্চ ২ বার লিমিট ছাড়া উইথড্র করতে পারবেন।</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Render BR Squad Rules */}
        {activeTab === 'br_squad' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-black uppercase italic tracking-tight text-white flex items-center justify-center gap-2">
                <Users className="w-6 h-6 text-primary" /> BR Squad Rules
              </h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">স্কোয়াড লিগের পয়েন্ট টেবিল ও নিয়মাবলী</p>
            </div>

            {/* Point System Table */}
            <Card className="border-white/5 bg-[#0a0a0a] rounded-2xl overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-white/5 pb-2 flex items-center gap-2">
                  <Trophy className="w-4 h-4" /> Point System
                </h3>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-muted-foreground font-bold">🥇 Top 1</span> <span className="font-black text-white">12 Pts</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-muted-foreground font-bold">🥈 Top 2</span> <span className="font-black text-white">9 Pts</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-muted-foreground font-bold">🥉 Top 3</span> <span className="font-black text-white">8 Pts</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-muted-foreground">Top 4</span> <span className="font-black text-white">7 Pts</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-muted-foreground">Top 5</span> <span className="font-black text-white">6 Pts</span></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-muted-foreground">Top 6</span> <span className="font-black text-white">5 Pts</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-muted-foreground">Top 7</span> <span className="font-black text-white">4 Pts</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-muted-foreground">Top 8</span> <span className="font-black text-white">3 Pts</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-muted-foreground">Top 9</span> <span className="font-black text-white">2 Pts</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-muted-foreground">Top 10</span> <span className="font-black text-white">1 Pt</span></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs bg-primary/5 p-3 rounded-xl border border-primary/20">
                  <span className="font-black text-primary uppercase">💀 Per Kill Reward</span>
                  <span className="font-black text-primary">1 Point</span>
                </div>
              </CardContent>
            </Card>

            {/* Allowed & Prohibited */}
            <Card className="border-white/5 bg-[#0a0a0a] rounded-2xl overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-white/5 pb-2">Gameplay Rules</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground font-bold">All Guns & Sniper Allowed (ফুল টুর্নামেন্ট স্টাইল)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground font-bold">Vehicle (গাড়ি) ব্যবহার করা যাবে</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground font-bold">Misha Character ব্যবহার সম্পূর্ণ নিষিদ্ধ</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground">আইডি লেভেল ৫০+ হতে হবে। স্কোয়াডের কোনো মেম্বার টাইমে না ঢুকলে বাকি মেম্বার নিয়ে খেলতে হবে।</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Render CS Ranked Rules */}
        {activeTab === 'cs_rank' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-black uppercase italic tracking-tight text-white flex items-center justify-center gap-2">
                <Trophy className="w-6 h-6 text-primary" /> Clash Squad Ranked Rules
              </h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">CS ম্যাচের সেটিং ও বিশেষ বিধিনিষেধ</p>
            </div>

            {/* Match Settings */}
            <Card className="border-white/5 bg-[#0a0a0a] rounded-2xl overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-white/5 pb-2">Match Settings</h3>
                
                <div className="grid grid-cols-2 gap-4 text-xs mb-2">
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                    <span className="text-[8px] font-bold text-muted-foreground uppercase block mb-1">Total Round</span>
                    <span className="font-black text-white text-sm">9 Rounds</span>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                    <span className="text-[8px] font-bold text-muted-foreground uppercase block mb-1">Initial Coins</span>
                    <span className="font-black text-white text-sm">9500 Coins</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground font-bold">Character Skill, Gun Attributes Disabled</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground font-bold">Limited Ammo Disabled (আনলিমিটেড গ্লুওয়াল)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground font-bold">Grenade / Throwable items সম্পূর্ণ নিষিদ্ধ</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground font-bold">Airdrop & Loadout ব্যবহার করা যাবে না</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Restrictions */}
            <Card className="border-white/5 bg-[#0a0a0a] rounded-2xl overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-white/5 pb-2">Security & Identity</h3>
                <div className="space-y-3 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>হ্যাক বা প্যানেল ব্যবহার করলে সরাসরি BAN করা হবে।</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <span>রেজিস্ট্রেশনকৃত নামের সাথে গেমের নামের মিল থাকতে হবে। না মিললে কিক করা হবে।</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>একই প্লেয়ার পরপর ২ ম্যাচে খেলতে পারবে না। স্ক্রিন রেকর্ড ও প্রতিটি রাউন্ড শেষে স্ক্রিনশট রাখা বাধ্যতামূলক।</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Render Lone Wolf Rules */}
        {activeTab === 'long_wolf' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-black uppercase italic tracking-tight text-white flex items-center justify-center gap-2">
                <Skull className="w-6 h-6 text-primary" /> Lone Wolf (1v1 & 2v2)
              </h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">লোন উলফ ম্যাচের নিয়ম ও গেমপ্লে ফরম্যাট</p>
            </div>

            <Card className="border-white/5 bg-[#0a0a0a] rounded-2xl overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-white/5 pb-2">Match Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground font-bold">Round: 9 Rounds, Limited Ammo Allowed</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground font-bold">All Guns, Grenade & Flash Allowed</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground font-bold">Character Skills & Gun Attributes নিষিদ্ধ</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/5 bg-[#0a0a0a] rounded-2xl overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-white/5 pb-2">Format & Play Rules</h3>
                <div className="space-y-3 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>2v2 ম্যাচ ফরম্যাট: স্লট ১ ও ৩ বনাম ২ ও ৪ (1&3 vs 2&4)।</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <span>প্লেয়ার কম হলে ম্যাচটি 1v1 এ রূপান্তর হবে এবং অতিরিক্ত প্লেয়ারকে রিফান্ড দেওয়া হবে।</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>ম্যাচ ফিক্সিং, ইচ্ছাকৃত টিমিং বা জোন এলিমিনেশন করলে পয়েন্ট বাতিল ও ব্যালেন্স জরিমানা করা হবে।</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Render Headshot Only Rules */}
        {activeTab === 'headshot' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-black uppercase italic tracking-tight text-white flex items-center justify-center gap-2">
                <HelpCircle className="w-6 h-6 text-primary" /> Headshot Only Rules
              </h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ওয়ান ট্যাপ ও হেডশট ম্যাচের স্পেশাল রুলস</p>
            </div>

            <Card className="border-white/5 bg-[#0a0a0a] rounded-2xl overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-white/5 pb-2">Settings & Gameplay</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground font-bold">শুধুমাত্র Headshot Damage কার্যকর হবে (বডি ড্যামেজ কাজ করবে না)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground font-bold">All Guns Allowed (Custom Preset ওয়ান ট্যাপ এনাবল থাকবে)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground">প্লেয়ার লেভেল অবশ্যই ৫০+ হতে হবে। রেজিস্ট্রেশনে ব্যবহৃত নামের সাথে ইন-গেম নেম মিলতে হবে।</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/5 bg-[#0a0a0a] rounded-2xl overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-white/5 pb-2">Important Instructions</h3>
                <div className="space-y-3 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2.5">
                    <Video className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>রুম আইডি নেওয়ার সময় থেকে গেম শুরু হওয়া পর্যন্ত পুরো স্ক্রিন রেকর্ড থাকা আবশ্যক।</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>হ্যাক বা সন্দেহজনক প্যানেল ব্যবহার করলে প্রমাণ যাচাই করে স্থায়ীভাবে ব্যান করা হবে।</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </main>
    </div>
  );
}
