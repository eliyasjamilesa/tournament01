"use client";

import { 
  Settings, 
  Flame, 
  Swords, 
  LogOut, 
  ChevronRight, 
  Wallet, 
  Trophy, 
  User, 
  FileText, 
  Plus,
  BarChart3,
  ShieldCheck,
  Bell
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
        { icon: Swords, label: 'My Matches', href: '/joined', color: 'text-primary' },
        { icon: BarChart3, label: 'Leaderboard', href: '/results', color: 'text-primary' },
        { icon: ShieldCheck, label: 'Tournament Rules', href: '#', color: 'text-primary' },
      ]
    },
    {
      title: "Account & Billing",
      items: [
        { icon: Wallet, label: 'Wallet Balance', href: '#', color: 'text-primary' },
        { icon: Settings, label: 'Account Settings', href: '#', color: 'text-primary' },
        { icon: Bell, label: 'Notifications', href: '#', color: 'text-primary' },
      ]
    }
  ];

  return (
    <div className="min-h-screen pb-32 bg-background pt-12">
      {/* Top Header / Profile Info */}
      <div className="flex flex-col items-center px-6 text-center">
        <div className="relative mb-6">
          {/* Animated Background Rings */}
          <div className="absolute inset-[-12px] rounded-full border border-primary/20 animate-pulse" />
          <div className="absolute inset-[-6px] rounded-full border-2 border-primary/40" />
          
          <div className="relative z-10 p-1 bg-background rounded-full">
            <Avatar className="w-28 h-28 rounded-full border-2 border-primary ring-4 ring-primary/20">
              <AvatarImage src={avatarUrl} className="object-cover" />
              <AvatarFallback className="bg-muted text-2xl font-bold italic">VE</AvatarFallback>
            </Avatar>
          </div>

          <button className="absolute bottom-1 right-1 z-20 bg-primary p-2 rounded-full shadow-xl border-4 border-background hover:scale-110 transition-all hover:rotate-90">
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full mb-2">
            <Flame className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Elite Level 42</span>
          </div>
          <h1 className="text-3xl font-headline font-bold tracking-tighter uppercase italic text-glow">
            Viper<span className="text-primary">Elite</span>_99
          </h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em]">ID: 93350-XF</p>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <section className="px-6 mt-12 grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="relative group">
            <div className={`p-4 rounded-2xl border bg-card/40 transition-all duration-300 flex flex-col items-center justify-center space-y-1 ${
              stat.highlight 
                ? 'border-primary shadow-[0_0_30px_hsl(var(--primary)/0.25)]' 
                : 'border-white/5 hover:border-primary/30'
            }`}>
              <stat.icon className={`w-4 h-4 mb-1 ${stat.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-xl font-headline font-bold tracking-tighter ${stat.highlight ? 'text-primary text-glow' : 'text-foreground'}`}>
                {stat.value}
              </span>
              <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">
                {stat.label}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Action Sections */}
      <div className="px-6 mt-12 space-y-10">
        {sections.map((section) => (
          <div key={section.title} className="space-y-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground px-1">
              {section.title}
            </h2>
            <div className="space-y-2">
              {section.items.map((item) => (
                <Link href={item.href} key={item.label} className="block group">
                  <div className="bg-card/30 border border-white/5 p-4 rounded-2xl flex items-center justify-between group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center border border-white/5 group-hover:border-primary/30 transition-colors">
                        <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-sm font-bold uppercase tracking-wide group-hover:text-foreground transition-colors">
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Minimal Logout Button */}
      <div className="px-6 mt-12 mb-8 text-center">
        <button className="inline-flex items-center gap-2 text-destructive hover:text-destructive/80 font-bold uppercase text-[10px] tracking-widest transition-colors py-3 px-6 rounded-full border border-destructive/10 hover:bg-destructive/5">
          <LogOut className="w-4 h-4" />
          Logout Session
        </button>
      </div>
    </div>
  );
}
