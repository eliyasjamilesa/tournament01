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
  const isJoiningFlow = pathname?.startsWith('/play/join');
  
  if (isAuthPage || isJoiningFlow || !user) return null;

  const navItems = [
    { label: 'খেলুন', icon: Play, href: '/' },
    { label: 'রেজাল্ট', icon: ListChecks, href: '/results' },
    { label: 'আমার ম্যাচ', icon: Trophy, href: '/joined' },
    { label: 'প্রোফাইল', icon: User, href: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[200] bg-background border-t border-white/5 w-full flex items-center justify-around h-16 px-2 safe-area-bottom">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-300",
              isActive ? "text-primary" : "text-muted-foreground hover:text-white"
            )}
          >
            <div className="relative">
              <Icon 
                className={cn("w-5 h-5", isActive && "stroke-[3px]")} 
              />
              {isActive && (
                <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_#ff0000]" />
              )}
            </div>
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest",
              isActive ? "opacity-100" : "opacity-60"
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
