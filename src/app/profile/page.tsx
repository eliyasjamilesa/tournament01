
"use client";

import { 
  Settings, 
  Flame, 
  Swords, 
  LogOut, 
  ChevronRight, 
  Wallet, 
  Trophy, 
  Plus,
  BarChart3,
  ShieldCheck,
  Bell,
  CreditCard,
  UserCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

export default function ProfilePage() {
  const avatarUrl = PlaceHolderImages.find(img => img.id === 'player-avatar')?.imageUrl;

  const stats = [
    { label: 'MATCHES', value: '124', icon: Swords },
    { label: 'COINS', value: '450', highlight: true, icon: Wallet },
    { label: 'WINS', value: '28', icon: Trophy },
  ];

  const sections = [
    {
      title: "Gaming & Arena",
      items: [
        { icon: Swords, label: 'My Matches', href: '/joined', color: 'text-blue-500' },
        { icon: BarChart3, label: 'Leaderboard', href: '/results', color: 'text-yellow-500' },
        { icon: ShieldCheck, label: 'Tournament Rules', href: '#', color: 'text-green-500' },
      ]
    },
    {
      title: "Account & Settings",
      items: [
        { icon: CreditCard, label: 'Wallet & Topup', href: '#', color: 'text-primary' },
        { icon: UserCircle, label: 'Game Profile', href: '#', color: 'text-muted-foreground' },
        { icon: Bell, label: 'Notifications', href: '#', color: 'text-orange-500' },
        { icon: Settings, label: 'App Settings', href: '#', color: 'text-muted-foreground' },
      ]
    }
  ];

  return (
    <div className="min-h-screen pb-32 bg-background pt-12">
      {/* Profile Header */}
      <div className="flex flex-col items-center px-6 text-center">
        <div className="relative mb-6">
          <div className="p-1 rounded-full border-2 border-primary/20">
            <Avatar className="w-24 h-24 rounded-full border-2 border-background">
              <AvatarImage src={avatarUrl} className="object-cover" />
              <AvatarFallback className="bg-muted text-xl font-bold">V</AvatarFallback>
            </Avatar>
          </div>
          <button className="absolute bottom-1 right-1 bg-primary p-2 rounded-full shadow-lg border-2 border-background">
            <Plus className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        <div className="space-y-3 w-full max-w-[240px]">
          <div className="space-y-1">
            <h1 className="text-2xl font-headline font-bold uppercase tracking-tight">
              ViperElite_99
            </h1>
            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Pro Member</span>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <span>Level 42</span>
              <span>85% to Lvl 43</span>
            </div>
            <Progress value={85} className="h-1.5 bg-white/5" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <section className="px-6 mt-10">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center justify-center py-4 px-2 rounded-2xl border border-white/5 bg-card/40 backdrop-blur-sm">
              <span className={`text-xl font-headline font-bold tracking-tighter ${stat.highlight ? 'text-primary' : 'text-foreground'}`}>
                {stat.value}
              </span>
              <span className="text-[8px] font-bold uppercase text-muted-foreground tracking-widest mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Enhanced Navigation Sections */}
      <div className="px-6 mt-10 space-y-8">
        {sections.map((section) => (
          <div key={section.title} className="space-y-4">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">
              {section.title}
            </h2>
            <Card className="border-white/5 bg-card/30 overflow-hidden">
              <div className="divide-y divide-white/5">
                {section.items.map((item) => (
                  <Link href={item.href} key={item.label} className="block group">
                    <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <item.icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <span className="text-sm font-semibold text-foreground/90">
                          {item.label}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="px-6 mt-12 flex justify-center">
        <button className="flex items-center gap-2 text-destructive font-bold uppercase text-[10px] tracking-widest py-3 px-10 rounded-xl border border-destructive/10 bg-destructive/5 hover:bg-destructive/10 transition-all">
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
