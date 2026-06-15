
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
  CreditCard
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';

export default function ProfilePage() {
  const avatarUrl = PlaceHolderImages.find(img => img.id === 'player-avatar')?.imageUrl;

  const stats = [
    { label: 'Total Matches', value: '124' },
    { label: 'Coin Balance', value: '450', highlight: true },
    { label: 'Total Won', value: '28' },
  ];

  const menuItems = [
    { icon: Wallet, label: 'Wallet', href: '#', color: 'text-red-500' },
    { icon: FileText, label: 'All Rules', href: '#', color: 'text-red-500' },
    { icon: BarChart3, label: 'Leaderboard', href: '/results', color: 'text-red-500' },
    { icon: Swords, label: 'My Matches', href: '/joined', color: 'text-red-500' },
    { icon: Settings, label: 'Account Settings', href: '#', color: 'text-red-500' },
  ];

  return (
    <div className="min-h-screen pb-32 bg-background pt-10">
      {/* Top Header / Avatar Area */}
      <div className="flex flex-col items-center space-y-6 px-6">
        <div className="relative">
          {/* Glowing Outer Ring */}
          <div className="absolute inset-[-8px] rounded-full border-2 border-dashed border-primary/40 animate-[spin_10s_linear_infinite]" />
          <div className="absolute inset-[-4px] rounded-full border-2 border-primary pulse-glow" />
          
          <Avatar className="w-32 h-32 border-4 border-background rounded-full relative z-10">
            <AvatarImage src={avatarUrl} className="object-cover" />
            <AvatarFallback className="bg-muted text-2xl font-bold italic">VE</AvatarFallback>
          </Avatar>

          {/* Add/Edit Badge */}
          <button className="absolute bottom-0 right-0 z-20 bg-primary p-2 rounded-full shadow-lg border-4 border-background hover:scale-110 transition-transform">
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="text-center space-y-1">
          <Button variant="outline" size="sm" className="h-8 rounded-full border-primary/30 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest px-4">
            <User className="w-3 h-3 mr-2" /> Edit Profile
          </Button>
          <div className="pt-4">
            <h1 className="text-3xl font-headline font-bold tracking-tight text-glow uppercase italic">ViperElite_99</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mt-1">IGNITE ID #93350</p>
          </div>
          <div className="w-12 h-1 bg-primary mx-auto mt-2 rounded-full" />
        </div>
      </div>

      {/* Stats Cards Section */}
      <section className="grid grid-cols-3 gap-3 px-6 mt-10">
        {stats.map((stat) => (
          <Card 
            key={stat.label} 
            className={`bg-card/40 text-center p-4 border-white/5 relative overflow-hidden transition-all group ${
              stat.highlight ? 'border-primary/50 shadow-[0_0_20px_hsl(var(--primary)/0.2)] scale-105 z-10' : ''
            }`}
          >
            <div className="space-y-1 flex flex-col items-center justify-center min-h-[70px]">
              <span className={`text-2xl font-headline font-bold tracking-tighter ${stat.highlight ? 'text-primary text-glow' : 'text-foreground'}`}>
                {stat.value}
              </span>
              <span className="text-[8px] font-bold uppercase text-muted-foreground tracking-widest leading-tight max-w-[50px]">
                {stat.label}
              </span>
            </div>
            {stat.highlight && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
            )}
          </Card>
        ))}
      </section>

      {/* Action List Section */}
      <section className="px-6 mt-10 space-y-3">
        {menuItems.map((item) => (
          <Link href={item.href} key={item.label} className="block">
            <Card className="bg-card/40 border-white/5 hover:border-primary/30 transition-all group overflow-hidden">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <span className="font-bold text-sm uppercase tracking-wide group-hover:text-primary transition-colors">
                    {item.label}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      {/* Logout Action */}
      <div className="px-6 mt-8">
        <Button variant="ghost" className="w-full h-12 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive font-bold uppercase text-xs tracking-[0.2em] border border-destructive/10">
          <LogOut className="w-4 h-4 mr-2" /> Logout Session
        </Button>
      </div>
    </div>
  );
}
