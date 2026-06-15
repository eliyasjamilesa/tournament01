"use client";

import { Settings, Shield, Flame, Swords, LogOut, ChevronRight, LayoutGrid, Clock, Target, Trophy, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function ProfilePage() {
  const avatarUrl = PlaceHolderImages.find(img => img.id === 'player-avatar')?.imageUrl;

  const stats = [
    { label: 'Level', value: '42', icon: Shield, color: 'text-primary', subValue: 'PRO' },
    { label: 'Win Rate', value: '18%', icon: Trophy, color: 'text-yellow-500', subValue: 'Top 5%' },
    { label: 'K/D Ratio', value: '2.4', icon: Swords, color: 'text-red-500', subValue: '+0.2' },
  ];

  const matchHistory = [
    { id: 1, tournament: 'Bermuda King', result: 'Rank #4', kills: 12, date: 'Yesterday', type: 'BR' },
    { id: 2, tournament: 'CS Squad Rush', result: 'Victory', kills: 4, date: '2 days ago', type: 'CS' },
    { id: 3, tournament: 'Lone Wolf 1v1', result: 'Defeat', kills: 5, date: '3 days ago', type: 'LW' },
  ];

  return (
    <div className="pb-28">
      {/* Cinematic Header Background */}
      <div className="h-44 magma-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 magma-overlay opacity-80" />
        <div className="absolute top-6 right-6 flex gap-2 z-20">
          <button className="p-2.5 rounded-xl bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-white/10 transition-all shadow-xl">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="px-6 -mt-16 space-y-6 relative z-10">
        {/* Profile Info Header */}
        <header className="space-y-4">
          <div className="flex items-end gap-5">
            <div className="relative group">
              <Avatar className="w-28 h-28 border-4 border-background rounded-3xl shadow-2xl overflow-hidden ring-4 ring-primary/20">
                <AvatarImage src={avatarUrl} className="object-cover" />
                <AvatarFallback className="bg-muted text-2xl font-bold">VE</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-primary p-2 rounded-xl shadow-lg border-4 border-background animate-pulse">
                <Flame className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <div className="pb-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-headline font-bold tracking-tight text-glow uppercase italic">ViperElite_99</h1>
                <Badge variant="outline" className="border-primary/50 text-primary text-[10px] bg-primary/5">LVL 42</Badge>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Master III Tier</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`w-1 h-3 rounded-full ${i <= 3 ? 'bg-primary' : 'bg-white/10'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <Card className="bg-card/40 border-white/5 backdrop-blur-sm p-4 overflow-hidden">
             <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Season Pass Progress</span>
                  <span className="text-[10px] font-bold text-primary uppercase">Tier 64 / 100</span>
                </div>
                <div className="relative h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="absolute top-0 left-0 h-full magma-gradient rounded-full shadow-[0_0_15px_hsl(var(--primary)/0.5)]" style={{ width: '64%' }} />
                </div>
             </div>
          </Card>
        </header>

        {/* Elite Stats Grid */}
        <section className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-card/60 border-white/5 text-center p-3 relative group hover:border-primary/30 transition-all card-glow overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
              <div className="flex flex-col items-center gap-1.5 py-1">
                <stat.icon className={`w-4 h-4 ${stat.color} mb-1`} />
                <span className="text-xl font-headline font-bold tracking-tighter">{stat.value}</span>
                <div className="space-y-0.5">
                  <span className="text-[9px] block font-bold uppercase text-muted-foreground tracking-tight">{stat.label}</span>
                  <span className="text-[8px] block font-bold text-primary/80 tracking-widest">{stat.subValue}</span>
                </div>
              </div>
            </Card>
          ))}
        </section>

        {/* Content Tabs */}
        <Tabs defaultValue="matches" className="w-full">
          <TabsList className="w-full bg-white/5 border border-white/5 p-1 rounded-2xl h-12">
            <TabsTrigger value="matches" className="flex-1 rounded-xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xl transition-all">
              History
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex-1 rounded-xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xl transition-all">
              Vault
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="matches" className="space-y-3 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {matchHistory.map((match) => (
              <div key={match.id} className="bg-card/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-card/80 hover:border-primary/20 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-primary/20 transition-all">
                    <Target className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{match.tournament}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[8px] h-4 py-0 font-bold uppercase border-white/10 px-1.5">{match.type}</Badge>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{match.date} • {match.kills} KILLS</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className={`font-headline font-bold text-sm ${match.result === 'Victory' || match.result.includes('#1') || match.result.includes('#4') ? 'text-primary' : 'text-muted-foreground'}`}>
                      {match.result}
                    </span>
                    <p className="text-[9px] font-bold text-muted-foreground/50 uppercase">RESULT</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary/50 transition-all group-hover:translate-x-0.5" />
                </div>
              </div>
            ))}
            <Button variant="ghost" className="w-full py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all">
              Access Full Archives <LayoutGrid className="w-3 h-3 ml-2" />
            </Button>
          </TabsContent>
          
          <TabsContent value="inventory" className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="bg-card/30 border-2 border-dashed border-white/5 rounded-3xl h-44 flex flex-col items-center justify-center text-center p-8">
               <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                 <Shield className="w-8 h-8 text-muted-foreground opacity-20" />
               </div>
               <h4 className="text-xs font-bold uppercase tracking-widest mb-1">Vault Locked</h4>
               <p className="text-[10px] font-medium text-muted-foreground max-w-[180px]">Participate in Elite tournaments to unlock rare weapon skins and character items.</p>
             </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="pt-4 grid grid-cols-2 gap-3">
          <Button variant="outline" className="border-white/5 bg-card/40 font-bold uppercase text-[10px] tracking-widest h-12 rounded-xl hover:bg-white/5 transition-all">
            <User className="w-4 h-4 mr-2" /> Edit Profile
          </Button>
          <Button variant="outline" className="border-destructive/20 text-destructive bg-destructive/5 font-bold uppercase text-[10px] tracking-widest h-12 rounded-xl hover:bg-destructive hover:text-white transition-all">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
