
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ListChecks, Play, Trophy, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();

  // Hide nav on auth pages and joining flow
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';
  const isJoiningFlow = pathname?.startsWith('/play/join/');
  
  if (isAuthPage || isJoiningFlow || !user) return null;

  const navItems = [
    { label: 'খেলুন', icon: Play, href: '/', isMain: true },
    { label: 'রেজাল্ট', icon: ListChecks, href: '/results' },
    { label: 'আমার ম্যাচ', icon: Trophy, href: '/joined' },
    { label: 'প্রোফাইল', icon: User, href: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="max-w-md w-full px-4 pb-6 pointer-events-auto">
        <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/5 rounded-3xl px-2 py-3 flex items-center justify-around shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1.5 transition-all duration-300 relative flex-1",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <div className="absolute -top-3 w-8 h-0.5 bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary))]" />
                )}
                <div className={cn(
                  "p-2 rounded-xl transition-all",
                  item.isMain && isActive ? "text-primary" : ""
                )}>
                  <Icon className={cn("w-5 h-5", item.isMain && "w-6 h-6")} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
