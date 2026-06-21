
"use client";

import { 
  Settings, 
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
  UserCircle,
  ShieldAlert,
  User,
  Medal
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser, useFirestore, useDoc, useAuth, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collectionGroup, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, loading: profileLoading } = useDoc<any>(userDocRef);

  // Fetch all registrations for this user across all tournaments
  const registrationsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collectionGroup(db, 'registrations'), where('uid', '==', user.uid));
  }, [db, user]);

  const { data: userRegistrations, loading: regsLoading } = useCollection<any>(registrationsQuery);

  const stats = useMemo(() => {
    if (!userRegistrations) return { matches: 0, coins: profile?.coins || 0, wins: profile?.totalWinnings || 0, level: 1, xp: profile?.xp || 0 };
    
    const totalXP = profile?.xp || 0;
    const derivedLevel = Math.floor(totalXP / 1000) + 1; // 1000 XP per level
    
    return {
      matches: userRegistrations.length,
      coins: profile?.coins || 0,
      wins: profile?.totalWinnings || 0,
      level: derivedLevel,
      xp: totalXP
    };
  }, [userRegistrations, profile?.coins, profile?.xp, profile?.totalWinnings]);

  // Level Logic: 1000 XP per level
  const nextLevelPercent = (stats.xp % 1000) / 10;

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  };

  if (userLoading || profileLoading || regsLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <User className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary animate-pulse">Accessing Profile...</p>
      </div>
    );
  }

  const isAdmin = profile?.role === 'admin';

  const sections = [
    {
      title: "Gaming & Arena",
      items: [
        { icon: Swords, label: 'My Matches', href: '/joined', color: 'text-blue-500' },
        { icon: BarChart3, label: 'Leaderboard', href: '/leaderboard', color: 'text-yellow-500' },
        { icon: ShieldCheck, label: 'Tournament Rules', href: '#', color: 'text-green-500' },
      ]
    },
    {
      title: "Account & Settings",
      items: [
        { icon: CreditCard, label: 'Wallet & Topup', href: '/wallet', color: 'text-primary' },
        { icon: UserCircle, label: 'Game Profile', href: '/profile/edit', color: 'text-muted-foreground' },
        { icon: Bell, label: 'Notifications', href: '/notifications', color: 'text-orange-500' },
        { icon: Settings, label: 'App Settings', href: '/settings', color: 'text-muted-foreground' },
      ]
    }
  ];

  return (
    <div className="min-h-screen pb-32 bg-background pt-12 w-full">
      <div className="flex flex-col items-center px-4 text-center">
        <div className="relative mb-6">
          <div className="p-1 rounded-full border border-white/10">
            <Avatar className="w-24 h-24 rounded-full border-2 border-background">
              <AvatarImage src={profile?.photoURL || user?.photoURL} className="object-cover" />
              <AvatarFallback className="bg-muted text-xl font-bold">
                {profile?.displayName?.[0] || user?.displayName?.[0] || 'V'}
              </AvatarFallback>
            </Avatar>
          </div>
          <Link href="/profile/edit" className="absolute bottom-1 right-1 bg-primary p-2 rounded-full shadow-lg border-2 border-background">
            <Plus className="w-3.5 h-3.5 text-white" />
          </Link>
        </div>

        <div className="space-y-4 w-full">
          <div className="space-y-1">
            <h1 className="text-2xl font-headline font-bold uppercase tracking-tight">
              {profile?.displayName || user?.displayName || 'Unknown Player'}
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              {isAdmin ? 'ADMIN COMMANDER' : 'Pro Arena Member'}
            </p>
          </div>
          
          <Link href="/profile/level" className="block w-full active:scale-[0.98] transition-transform">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 group">
              <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                <span className="flex items-center gap-1"><Medal className="w-3 h-3 text-primary" /> Level {stats.level}</span>
                <span className="group-hover:text-primary transition-colors">{Math.floor(nextLevelPercent)}% to Lvl {stats.level + 1} <ChevronRight className="w-2 h-2 inline" /></span>
              </div>
              <Progress value={nextLevelPercent} className="h-1.5 bg-background" />
            </div>
          </Link>
        </div>
      </div>

      <section className="px-4 mt-8">
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center justify-center py-4 rounded-xl border border-white/5 bg-card/40 backdrop-blur-sm transition-all hover:bg-white/5">
            <span className="text-xl font-headline font-bold tracking-tighter text-foreground">
              {stats.matches}
            </span>
            <span className="text-[8px] font-bold uppercase text-muted-foreground tracking-widest mt-1">
              MATCHES
            </span>
          </div>
          <div className="flex flex-col items-center justify-center py-4 rounded-xl border border-white/5 bg-card/40 backdrop-blur-sm transition-all hover:bg-white/5">
            <span className="text-xl font-headline font-bold tracking-tighter text-primary">
              {stats.coins}
            </span>
            <span className="text-[8px] font-bold uppercase text-muted-foreground tracking-widest mt-1">
              COINS
            </span>
          </div>
          <div className="flex flex-col items-center justify-center py-4 rounded-xl border border-white/5 bg-card/40 backdrop-blur-sm transition-all hover:bg-white/5">
            <span className="text-xl font-headline font-bold tracking-tighter text-foreground">
              ৳{stats.wins}
            </span>
            <span className="text-[8px] font-bold uppercase text-muted-foreground tracking-widest mt-1">
              WINS (TK)
            </span>
          </div>
        </div>
      </section>

      {isAdmin && (
        <div className="px-4 mt-8">
          <Link href="/admin">
            <Card className="border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <span className="block text-sm font-black uppercase italic text-primary">Admin Control Panel</span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Manage Matches & Users</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-primary" />
              </div>
            </Card>
          </Link>
        </div>
      )}

      <div className="px-4 mt-10 space-y-8">
        {sections.map((section) => (
          <div key={section.title} className="space-y-3">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">
              {section.title}
            </h2>
            <Card className="border-white/5 bg-card/30 overflow-hidden shadow-none">
              <div className="divide-y divide-white/5">
                {section.items.map((item) => (
                  <Link href={item.href} key={item.label} className="block group">
                    <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-secondary/30 flex items-center justify-center transition-colors">
                          <item.icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <span className="text-sm font-bold text-foreground/80 tracking-tight">
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

      <div className="px-4 mt-12">
        <Button 
          variant="destructive" 
          onClick={handleSignOut}
          className="w-full h-12 rounded-xl font-headline font-bold uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-destructive/20"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
        <p className="text-center text-[9px] text-muted-foreground/40 mt-6 uppercase font-bold tracking-widest">
          App Version 1.0.4-Stable
        </p>
      </div>
    </div>
  );
}
