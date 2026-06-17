
"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Swords, 
  Wallet, 
  Zap, 
  ChevronLeft,
  Loader2,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, loading: profileLoading } = useDoc<any>(userDocRef);

  useEffect(() => {
    if (authLoading || profileLoading) return;
    if (!user || profile?.role !== 'admin') {
      router.replace('/');
    } else {
      setIsAuthorized(true);
    }
  }, [user, authLoading, profile, profileLoading, router]);

  if (authLoading || profileLoading || !isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Verifying Admin Access...</p>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Matches', href: '/admin/matches', icon: Swords },
    { label: 'Payments', href: '/admin/payments', icon: Wallet },
    { label: 'Recharge', href: '/admin/recharge', icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden px-6 py-4 flex items-center justify-between border-b border-white/5 sticky top-0 bg-background/95 backdrop-blur-md z-[100]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-primary" />
          <span className="font-black uppercase italic text-xs tracking-tighter">Admin <span className="text-primary">Center</span></span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </header>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-card border-r border-white/5 z-[110] transform transition-transform duration-300 md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 hidden md:block">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl magma-gradient flex items-center justify-center shadow-lg shadow-primary/20">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase italic tracking-tighter">Command <span className="text-primary">Center</span></h1>
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Administrator</p>
            </div>
          </div>
        </div>

        <nav className="px-4 space-y-2 mt-4 md:mt-0">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all",
                  isActive ? "magma-gradient text-white shadow-lg" : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-8 left-0 right-0 px-4">
          <Button variant="ghost" className="w-full justify-start gap-3 text-[10px] font-bold uppercase" asChild>
            <Link href="/"><ChevronLeft className="w-4 h-4" /> Back to Arena</Link>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-[105] md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  );
}
