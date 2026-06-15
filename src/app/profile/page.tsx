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
  Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser, useFirestore, useDoc, useAuth, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

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

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  };

  if (userLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const stats = [
    { label: 'MATCHES', value: '124', icon: Swords },
    { label: 'COINS', value: profile?.coins || '100', highlight: true, icon: Wallet },
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
          <div className="p-1 rounded-full border border-white/10">
            <Avatar className="w-24 h-24 rounded-full border-2 border-background">
              <AvatarImage src={profile?.photoURL || user?.photoURL} className="object-cover" />
              <AvatarFallback className="bg-muted text-xl font-bold">
                {profile?.displayName?.[0] || user?.displayName?.[0] || 'V'}
              </AvatarFallback>
            </Avatar>
          </div>
          <button className="absolute bottom-1 right-1 bg-primary p-2 rounded-full shadow-lg border-2 border-background">
            <Plus className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        <div className="space-y-4 w-full max-w-[280px]">
          <div className="space-y-1">
            <h1 className="text-2xl font-headline font-bold uppercase tracking-tight">
              {profile?.displayName || user?.displayName || 'Unknown Player'}
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Pro Arena Member
            </p>
          </div>
          
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              <span>Level {profile?.level || 1}</span>
              <span>85% to Lvl {(profile?.level || 1) + 1}</span>
            </div>
            <Progress value={85} className="h-1.5 bg-background" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <section className="px-6 mt-8">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center justify-center py-4 rounded-xl border border-white/5 bg-card/40 backdrop-blur-sm transition-all hover:bg-white/5">
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

      {/* Navigation Sections */}
      <div className="px-6 mt-10 space-y-8">
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

      {/* Logout */}
      <div className="px-6 mt-12">
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
