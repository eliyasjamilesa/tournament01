
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Swords, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'Result', icon: Trophy, href: '/results' },
    { label: 'Joined', icon: Swords, href: '/joined' },
    { label: 'Profile', icon: User, href: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="max-w-md w-full px-4 pb-4 pointer-events-auto">
        <div className="bg-card/90 backdrop-blur-md border border-white/5 rounded-full px-6 py-3 flex items-center justify-between shadow-2xl">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-300",
                  isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-full transition-all",
                  isActive && "bg-primary/10 shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
                )}>
                  <Icon className={cn("w-6 h-6", isActive && "fill-primary/20")} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
