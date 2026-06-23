'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ListChecks, Play, Trophy, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();

  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';
  // Corrected check to include /play/join without trailing slash
  const isJoiningFlow = pathname?.startsWith('/play/join');
  
  if (isAuthPage || isJoiningFlow || !user) return null;

  const navItems = [
    { label: 'খেলুন', icon: Play, href: '/', isMain: true },
    { label: 'রেজাল্ট', icon: ListChecks, href: '/results' },
    { label: 'আমার ম্যাচ', icon: Trophy, href: '/joined' },
    { label: 'প্রোফাইল', icon: User, href: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[200] flex items-center justify-center pointer-events-none w-full">
      <div className="w-full max-w-md px-4 pb-4 pointer-events-auto">
        <div className="bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] px-4 py-3 flex items-center justify-around shadow-[0_10px_40px_rgba(0,0,0,0.8)] nav-glow">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-300 relative flex-1 py-1",
                  isActive ? "text-primary scale-105" : "text-muted-foreground hover:text-white"
                )}
              >
                {isActive && (
                  <div className="absolute -top-3 w-8 h-1 bg-primary rounded-full shadow-[0_0_15px_#ff0000]" />
                )}
                <div className={cn(
                  "p-1.5 rounded-xl transition-all",
                  isActive && "text-glow-red"
                )}>
                  <Icon className={cn("w-5 h-5", item.isMain && isActive && "animate-pulse")} strokeWidth={isActive ? 3 : 2} />
                </div>
                <span className={cn("text-[8px] font-black uppercase tracking-widest", isActive ? "opacity-100" : "opacity-50")}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
