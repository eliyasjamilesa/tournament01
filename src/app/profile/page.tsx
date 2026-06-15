"use client";

import { Settings, Shield, Flame, Swords, LogOut, ChevronRight, LayoutGrid, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function ProfilePage() {
  const avatarUrl = PlaceHolderImages.find(img => img.id === 'player-avatar')?.imageUrl;

  const stats = [
    { label: 'Level', value: '42', icon: Shield, color: 'text-primary' },
    { label: 'Win Rate', value: '18%', icon: Flame, color: 'text-orange-500' },
    { label: 'K/D Ratio', value: '2.4', icon: Swords, color: 'text-secondary' },
  ];

  const matchHistory = [
    { id: 1, tournament: 'Bermuda King', result: '#4 / 50', kills: 12, date: 'Yesterday' },
    { id: 2, tournament: 'CS Squad Rush', result: 'L / 4v4', kills: 4, date: '2 days ago' },
    { id: 3, tournament: 'Lone Wolf 1v1', result: 'W / 1v1', kills: 5, date: '3 days ago' },
  ];

  return (
    <div className="pb-8">
      <div className="h-32 magma-gradient relative">
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="px-6 -mt-12 space-y-6">
        <header className="space-y-3">
          <div className="flex items-end gap-4">
            <Avatar className="w-24 h-24 border-4 border-background rounded-2xl shadow-2xl">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="pb-2 space-y-1">
              <h1 className="text-2xl font-headline font-bold tracking-tight">ViperElite_99</h1>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Master III</span>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
             <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
               <span className="text-muted-foreground">Experience to Lv. 43</span>
               <span className="text-primary">840 / 1000 XP</span>
             </div>
             <Progress value={84} className="h-1.5 bg-white/5" />
          </div>
        </header>

        <section className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-card border-white/5 text-center p-3 shadow-lg">
              <div className="flex flex-col items-center gap-1">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-lg font-headline font-bold">{stat.value}</span>
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">{stat.label}</span>
              </div>
            </Card>
          ))}
        </section>

        <Tabs defaultValue="matches" className="w-full">
          <TabsList className="w-full bg-white/5 border border-white/5 p-1 rounded-xl">
            <TabsTrigger value="matches" className="flex-1 font-bold text-xs uppercase data-[state=active]:bg-card">My Matches</TabsTrigger>
            <TabsTrigger value="inventory" className="flex-1 font-bold text-xs uppercase data-[state=active]:bg-card">Vault</TabsTrigger>
          </TabsList>
          
          <TabsContent value="matches" className="space-y-3 mt-4">
            {matchHistory.map((match) => (
              <div key={match.id} className="bg-card/50 border border-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-card transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{match.tournament}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{match.date} • {match.kills} KILLS</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-headline font-bold text-sm ${match.result.includes('W') || match.result.includes('#1') || match.result.includes('#4') ? 'text-primary' : 'text-muted-foreground'}`}>
                    {match.result}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
            <button className="w-full py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2">
              View All History <LayoutGrid className="w-3 h-3" />
            </button>
          </TabsContent>
          
          <TabsContent value="inventory" className="mt-4">
             <div className="bg-card/30 border-2 border-dashed border-white/5 rounded-2xl h-32 flex flex-col items-center justify-center text-muted-foreground">
               <Shield className="w-8 h-8 mb-2 opacity-20" />
               <p className="text-xs font-bold uppercase tracking-wider">No active skins</p>
             </div>
          </TabsContent>
        </Tabs>

        <button className="w-full py-4 border border-destructive/20 rounded-xl text-destructive font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-destructive/10 transition-all">
          <LogOut className="w-4 h-4" /> Logout Account
        </button>
      </div>
    </div>
  );
}
