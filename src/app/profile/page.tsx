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
  Bell
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    <div className="min-h-screen pb-32 bg-background pt-12">
      {/* Profile Header */}
      <div className="flex flex-col items-center px-6 text-center">
        <div className="relative mb-6">
          <Avatar className="w-24 h-24 rounded-full border border-border">
            <AvatarImage src={avatarUrl} className="object-cover" />
            <AvatarFallback className="bg-muted text-xl font-bold">V</AvatarFallback>
          </Avatar>
          <button className="absolute bottom-0 right-0 bg-primary p-2 rounded-full shadow-md border border-background">
            <Plus className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-headline font-bold uppercase tracking-tight">
            ViperElite_99
          </h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-widest">Level 42</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Pro Player</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <section className="px-6 mt-10">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card">
              <span className={`text-lg font-headline font-bold tracking-tighter ${stat.highlight ? 'text-primary' : 'text-foreground'}`}>
                {stat.value}
              </span>
              <span className="text-[8px] font-bold uppercase text-muted-foreground tracking-widest mt-1">
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
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
              {section.title}
            </h2>
            <div className="space-y-1">
              {section.items.map((item) => (
                <Link href={item.href} key={item.label} className="block">
                  <div className="bg-card border border-border p-4 rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="px-6 mt-10 flex justify-center">
        <button className="flex items-center gap-2 text-destructive font-bold uppercase text-[10px] tracking-widest py-3 px-8 rounded-full border border-destructive/20 hover:bg-destructive/10 transition-colors">
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
