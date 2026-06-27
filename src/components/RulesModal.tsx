"use client";

import { useState } from 'react';
import { 
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
  Trophy,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type TabType = 'overall' | 'br_solo_duo' | 'br_squad' | 'cs_rank' | 'long_wolf' | 'headshot';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: TabType;
}

export function RulesModal({ isOpen, onClose, defaultTab = 'overall' }: RulesModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);

  const tabs = [
    { id: 'overall', label: 'সার্বিক নিয়ম', icon: ShieldCheck },
    { id: 'br_solo_duo', label: 'BR Solo & Duo', icon: Gamepad2 },
    { id: 'br_squad', label: 'BR Squad', icon: Users },
    { id: 'cs_rank', label: 'CS Ranked', icon: Trophy },
    { id: 'long_wolf', label: 'Lone Wolf', icon: Skull },
    { id: 'headshot', label: 'Headshot Only', icon: HelpCircle },
  ] as const;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="bg-[#0c0c0c] border-white/5 rounded-[2.5rem] max-w-lg w-[92%] max-h-[85vh] flex flex-col p-0 overflow-hidden shadow-2xl">
        
        {/* Header */}
        <DialogHeader className="px-6 pt-8 pb-4 border-b border-white/5 flex flex-row items-center justify-between shrink-0">
          <div className="space-y-1 text-left">
            <DialogTitle className="text-xl font-black uppercase italic tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="w-5.5 h-5.5 text-primary" /> Tournament Rules
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              ম্যাচ খেলার পূর্বে নিয়মগুলো দেখে নিন
            </DialogDescription>
          </div>
          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-all active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar border-b border-white/5 bg-[#070707] shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border",
                  isActive 
                    ? "bg-primary border-primary text-white shadow-[0_0_12px_rgba(255,0,0,0.3)]" 
                    : "bg-card border-white/5 text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Rules Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
          
          {/* Render Overall Rules */}
          {activeTab === 'overall' && (
            <div className="space-y-4 animate-in fade-in duration-250">
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
                <Card key={idx} className="border-white/5 bg-white/5 rounded-2xl overflow-hidden shadow-none">
                  <CardContent className="p-4 flex gap-4">
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
          )}

          {/* Render BR Solo & Duo Rules */}
          {activeTab === 'br_solo_duo' && (
            <div className="space-y-4 animate-in fade-in duration-250">
              <Card className="border-white/5 bg-white/5 rounded-2xl overflow-hidden shadow-none">
                <CardContent className="p-4 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-white/5 pb-1.5">Weapon & Character Rules</h3>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground font-bold">Double Vector & Charge Booster নিষিদ্ধ</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground font-bold">All Sniper Gun ব্যবহার সম্পূর্ণ নিষিদ্ধ</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground font-bold">Only Kord Gun ব্যবহার করা যাবে না</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground font-bold">Vehicle (গাড়ি / Monster Truck) নিষিদ্ধ</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground font-bold">Irish Character ব্যবহার সম্পূর্ণ নিষিদ্ধ</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground font-bold">M590 Gun ব্যবহার করা যাবে</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/5 bg-white/5 rounded-2xl overflow-hidden shadow-none">
                <CardContent className="p-4 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-white/5 pb-1.5">Special Restrictions</h3>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground">ID লেভেল কমপক্ষে ৫০ হতে হবে। লেভেল কম থাকার কারণে Kick করা হলে কোনো Refund দেওয়া হবে না।</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground">Root করা ফোন বা PC Emulator ব্যবহার করলে সরাসরি BAN করা হবে।</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground">Hack, Mod, বা Teaming করলে সরাসরি অ্যাকাউন্ট Permanent BAN হবে।</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/5 bg-white/5 rounded-2xl overflow-hidden shadow-none">
                <CardContent className="p-4 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-white/5 pb-1.5">Room & Refund Policy</h3>
                  <div className="space-y-2.5 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Video className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>কাস্টম রুমে ঢুকে প্রথমে <strong>Observer Mode</strong> এ যাবেন, এরপর নিজের সিলেক্টেড স্লটে বসবেন।</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Video className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>স্ক্রিন রেকর্ড থাকা বাধ্যতামূলক। ভিডিও প্রুফ ছাড়া কিক বা অন্য সমস্যায় রিফান্ড পাওয়া যাবে না।</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <DollarSign className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>ম্যাচের উইনিং ও কিল রিওয়ার্ড গেম শেষের ৩০–৪০ মিনিটের মধ্যে এড হয়ে যাবে। প্রতিদিন সর্বোচ্চ ২ বার লিমিট ছাড়া উইথড্র করতে পারবেন।</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Render BR Squad Rules */}
          {activeTab === 'br_squad' && (
            <div className="space-y-4 animate-in fade-in duration-250">
              <Card className="border-white/5 bg-white/5 rounded-2xl overflow-hidden shadow-none">
                <CardContent className="p-4 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-white/5 pb-1.5 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4" /> Point System
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs mb-1">
                    <div className="space-y-1.5">
                      <div className="flex justify-between border-b border-white/5 pb-0.5"><span className="text-muted-foreground font-bold">🥇 Top 1</span> <span className="font-black text-white">12 Pts</span></div>
                      <div className="flex justify-between border-b border-white/5 pb-0.5"><span className="text-muted-foreground font-bold">🥈 Top 2</span> <span className="font-black text-white">9 Pts</span></div>
                      <div className="flex justify-between border-b border-white/5 pb-0.5"><span className="text-muted-foreground font-bold">🥉 Top 3</span> <span className="font-black text-white">8 Pts</span></div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between border-b border-white/5 pb-0.5"><span className="text-muted-foreground">Top 4-5</span> <span className="font-black text-white">7-6 Pts</span></div>
                      <div className="flex justify-between border-b border-white/5 pb-0.5"><span className="text-muted-foreground">Top 6-8</span> <span className="font-black text-white">5-3 Pts</span></div>
                      <div className="flex justify-between border-b border-white/5 pb-0.5"><span className="text-muted-foreground">Top 9-10</span> <span className="font-black text-white">2-1 Pts</span></div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs bg-primary/5 p-2.5 rounded-xl border border-primary/20">
                    <span className="font-black text-primary uppercase">💀 Per Kill Reward</span>
                    <span className="font-black text-primary">1 Point</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/5 bg-white/5 rounded-2xl overflow-hidden shadow-none">
                <CardContent className="p-4 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-white/5 pb-1.5">Gameplay Rules</h3>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground font-bold">All Guns & Sniper Allowed (Esports Style)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground font-bold">Vehicle (গাড়ি) ব্যবহার করা যাবে</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground font-bold">Misha Character ব্যবহার সম্পূর্ণ নিষিদ্ধ</span>
                    </div>
                    <div className="flex items-start gap-2">
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
            <div className="space-y-4 animate-in fade-in duration-250">
              <Card className="border-white/5 bg-white/5 rounded-2xl overflow-hidden shadow-none">
                <CardContent className="p-4 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-white/5 pb-1.5">Match Settings</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs mb-1">
                    <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 text-center">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase block mb-0.5">Total Round</span>
                      <span className="font-black text-white">9 Rounds</span>
                    </div>
                    <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 text-center">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase block mb-0.5">Initial Coins</span>
                      <span className="font-black text-white">9500 Coins</span>
                    </div>
                  </div>
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground font-bold">Character Skill, Gun Attributes Disabled</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground font-bold">Limited Ammo Disabled (আনলিমিটেড গ্লুওয়াল)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground font-bold">Grenade / Throwable items সম্পূর্ণ নিষিদ্ধ</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/5 bg-white/5 rounded-2xl overflow-hidden shadow-none">
                <CardContent className="p-4 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-white/5 pb-1.5">Security & Identity</h3>
                  <div className="space-y-2.5 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span>হ্যাক বা প্যানেল ব্যবহার করলে সরাসরি BAN করা হবে।</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      <span>রেজিস্ট্রেশনকৃত নামের সাথে গেমের নামের মিল থাকতে হবে।</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>পরপর ২ ম্যাচ একই প্লেয়ার খেলতে পারবে না। রিপ্লে রেকর্ড ও স্ক্রিনশট রাখা বাধ্যতামূলক।</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Render Lone Wolf Rules */}
          {activeTab === 'long_wolf' && (
            <div className="space-y-4 animate-in fade-in duration-250">
              <Card className="border-white/5 bg-white/5 rounded-2xl overflow-hidden shadow-none">
                <CardContent className="p-4 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-white/5 pb-1.5">Match Settings</h3>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground font-bold">Round: 9 Rounds, Limited Ammo Allowed</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground font-bold">All Guns, Grenade & Flash Allowed</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground font-bold">Character Skills & Gun Attributes নিষিদ্ধ</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/5 bg-white/5 rounded-2xl overflow-hidden shadow-none">
                <CardContent className="p-4 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-white/5 pb-1.5">Format & Play Rules</h3>
                  <div className="space-y-2.5 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>2v2 ম্যাচ ফরম্যাট: স্লট ১ ও ৩ বনাম ২ ও ৪।</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      <span>প্লেয়ার কম হলে 1v1 ম্যাচ হবে এবং বাকিদের রিফান্ড দেওয়া হবে।</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Render Headshot Only Rules */}
          {activeTab === 'headshot' && (
            <div className="space-y-4 animate-in fade-in duration-250">
              <Card className="border-white/5 bg-white/5 rounded-2xl overflow-hidden shadow-none">
                <CardContent className="p-4 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-white/5 pb-1.5">Settings & Gameplay</h3>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground font-bold">শুধুমাত্র Headshot Damage কার্যকর হবে (বডি ড্যামেজ কাজ করবে না)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground font-bold">All Guns Allowed (ওয়ান ট্যাপ মোড এনাবল)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground">প্লেয়ার লেভেল অবশ্যই ৫০+ হতে হবে এবং স্ক্রিন রেকর্ড থাকতে হবে।</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
