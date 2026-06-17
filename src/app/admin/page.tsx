
"use client";

import { 
  Swords, 
  Wallet, 
  Zap, 
  Trophy, 
  ChevronRight,
  PlusCircle,
  FileCheck
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function AdminMenu() {
  const adminSections = [
    {
      title: "Tournament Control",
      items: [
        { icon: PlusCircle, label: 'Deploy New Match', sub: 'Launch BR or CS matches', href: '/admin/matches?tab=deploy', color: 'text-primary' },
        { icon: Trophy, label: 'Publish Results', sub: 'Add winners & prizes', href: '/admin/matches?tab=manage', color: 'text-yellow-500' },
      ]
    },
    {
      title: "Finance & Wallet",
      items: [
        { icon: Wallet, label: 'Payment Requests', sub: 'Approve user deposits', href: '/admin/payments', color: 'text-green-500' },
        { icon: Zap, label: 'Manual Recharge', sub: 'Direct coin injection', href: '/admin/recharge', color: 'text-orange-500' },
      ]
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Operations <span className="text-primary">Menu</span></h2>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select an action to proceed</p>
      </div>

      <div className="space-y-8">
        {adminSections.map((section) => (
          <div key={section.title} className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">
              {section.title}
            </h3>
            <div className="space-y-3">
              {section.items.map((item) => (
                <Link href={item.href} key={item.label} className="block group">
                  <Card className="border-white/5 bg-card/40 backdrop-blur-sm p-5 transition-all active:scale-[0.98] hover:bg-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                          <item.icon className={cn("w-6 h-6", item.color)} />
                        </div>
                        <div>
                          <span className="block text-sm font-black uppercase italic text-white tracking-tight">{item.label}</span>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase">{item.sub}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');
