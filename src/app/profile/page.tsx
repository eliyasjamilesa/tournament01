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
  User
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
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
        { icon: Swords, label: 'My Matches', href: '/joined' },
        { icon: BarChart3, label: 'Leaderboard', href: '/results' },
        { icon: ShieldCheck, label: 'Tournament Rules', href: '#' },
      ]
    },
    {
      title: "Account & Settings",
      items: [
        { icon: Wallet, label: 'Wallet & Topup', href: '#' },
        { icon: Settings, label: 'Game Profile', href: '#' },
        { icon: Bell, label: 'Notifications', href: '#' },
      ]
    }
  ];

  return (
    <div className="min-h-screen pb-32 bg-background pt-12 overflow-x-hidden">
      {/* Profile Header */}
      <div className="flex flex-col items-center px-6 text-center">
        <div className="relative mb-6">
          {/* Static Glowing Rings for stability */}
          <div className="absolute inset-[-8px] rounded-full border border-primary/20" />
          <div className="absolute inset-[-4px] rounded-full border border-primary/40" />
          
          <div className="relative z-10 p-1 bg-background rounded-full">
            <Avatar className="w-24 h-24 rounded-full border-2 border-primary ring-4 ring-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
              <AvatarImage src={avatarUrl} className="object-cover" />
              <AvatarFallback className="bg-muted text-xl font-bold italic">V</AvatarFallback>
            </Avatar>
          </div>

          <button className="absolute bottom-0 right-0 z-20 bg-primary p-2 rounded-full shadow-lg border-2 border-background hover:scale-105 transition-transform">
            <Plus className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
            <Flame className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Pro Player • Level 42</span>
          </div>
          <h1 className="text-2xl font-headline font-bold tracking-tight uppercase italic text-glow">
            Viper<span className="text-primary">Elite</span>_99
          </h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">ID: 93350-XF</p>
        </div>
      </div>

      {/* Stats Row */}
      <section className="px-6 mt-10">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
              stat.highlight 
                ? 'bg-primary/5 border-primary/30 shadow-[0_0_15px_hsl(var(--primary)/0.1)]' 
                : 'bg-card/40 border-white/5'
            }`}>
              <stat.icon className={`w-3.5 h-3.5 mb-2 ${stat.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-lg font-headline font-bold tracking-tighter ${stat.highlight ? 'text-primary' : 'text-foreground'}`}>
                {stat.value}
              </span>
              <span className="text-[8px] font-bold uppercase text-muted-foreground tracking-widest">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Navigation Sections */}
      <div className="px-6 mt-10 space-y-8">
        {sections.map((section) => (
          <div key={section.title} className="space-y-3">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">
              {section.title}
            </h2>
            <div className="space-y-2">
              {section.items.map((item) => (
                <Link href={item.href} key={item.label} className="block group">
                  <div className="bg-card/50 border border-white/5 p-4 rounded-xl flex items-center justify-between group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-lg bg-muted/30 flex items-center justify-center border border-white/5 group-hover:border-primary/20">
                        <item.icon className="w-4.5 h-4.5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-sm font-semibold tracking-tight text-foreground/90">
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="px-6 mt-10 mb-8 flex justify-center">
        <button className="flex items-center gap-2 text-destructive/80 hover:text-destructive font-bold uppercase text-[10px] tracking-widest transition-colors py-3 px-8 rounded-full border border-destructive/10 hover:bg-destructive/5 bg-destructive/5">
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
