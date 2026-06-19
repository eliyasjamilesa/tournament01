
"use client";

import { 
  PlusCircle, 
  Trophy, 
  Wallet, 
  Zap, 
  ChevronRight,
  ShieldCheck,
  Medal,
  Bell
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AdminMenu() {
  const adminSections = [
    {
      title: "ম্যাচ কন্ট্রোল",
      items: [
        { icon: PlusCircle, label: 'Match Upload', sub: 'নতুন ম্যাচ চালু করুন', href: '/admin/matches?tab=deploy', color: 'text-primary' },
        { icon: Medal, label: 'Result Publish', sub: 'বিজেতা এবং প্রাইজ দিন', href: '/admin/results', color: 'text-yellow-500' },
      ]
    },
    {
      title: "টাকা ও ওয়ালেট",
      items: [
        { icon: Wallet, label: 'Payment Receive', sub: 'ইউজারদের পেমেন্ট চেক করুন', href: '/admin/payments', color: 'text-green-500' },
        { icon: Zap, label: 'Payment Send', sub: 'কয়েন রিচার্জ করে দিন', href: '/admin/recharge', color: 'text-orange-500' },
      ]
    },
    {
      title: "যোগাযোগ ও ঘোষণা",
      items: [
        { icon: Bell, label: 'Push Notification', sub: 'ইউজারদের মেসেজ পাঠান', href: '/admin/notifications', color: 'text-blue-500' },
      ]
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">অ্যাডমিন <span className="text-primary">মেনু</span></h2>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Admin Control</p>
      </div>

      <div className="space-y-8">
        {adminSections.map((section) => (
          <div key={section.title} className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">
              {section.title}
            </h3>
            <Card className="border-white/5 bg-card/30 overflow-hidden shadow-none">
              <div className="divide-y divide-white/5">
                {section.items.map((item) => (
                  <Link href={item.href} key={item.label} className="block group">
                    <div className="p-5 flex items-center justify-between hover:bg-white/5 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-secondary/30 flex items-center justify-center">
                          <item.icon className={cn("w-5 h-5", item.color)} />
                        </div>
                        <div>
                          <span className="block text-sm font-bold text-foreground/90 tracking-tight">{item.label}</span>
                          <span className="text-[8px] font-bold text-muted-foreground uppercase">{item.sub}</span>
                        </div>
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

      <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-4">
        <ShieldCheck className="w-6 h-6 text-primary" />
        <div>
          <p className="text-[9px] font-black text-primary uppercase">Elite Access Enabled</p>
          <p className="text-[8px] font-bold text-muted-foreground uppercase">সিস্টেম নিরাপদ আছে।</p>
        </div>
      </div>
    </div>
  );
}
