
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Settings, 
  Bell, 
  Globe, 
  Volume2, 
  ShieldCheck, 
  Info,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';

export default function SettingsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [language, setLanguage] = useState('Bangla');

  const settingsSections = [
    {
      title: "Preferences",
      items: [
        { 
          icon: Bell, 
          label: 'Notifications', 
          sub: 'নতুন ম্যাচের খবর পান', 
          control: <Switch checked={notifications} onCheckedChange={setNotifications} /> 
        },
        { 
          icon: Volume2, 
          label: 'Sound Effects', 
          sub: 'অ্যাপের সাউন্ড অন/অফ করুন', 
          control: <Switch checked={sounds} onCheckedChange={setSounds} /> 
        },
        { 
          icon: Globe, 
          label: 'Language', 
          sub: 'ভাষা পরিবর্তন করুন', 
          control: (
            <button onClick={() => setLanguage(l => l === 'Bangla' ? 'English' : 'Bangla')} className="text-[10px] font-black uppercase text-primary italic">
              {language}
            </button>
          )
        },
      ]
    },
    {
      title: "Support & Legal",
      items: [
        { 
          icon: MessageSquare, 
          label: 'Join Telegram', 
          sub: 'হেল্প এবং সাপোর্টের জন্য', 
          href: '#',
          color: 'text-blue-500'
        },
        { 
          icon: ShieldCheck, 
          label: 'Privacy Policy', 
          sub: 'আমাদের গোপনীয়তা নীতি', 
          href: '#',
          color: 'text-green-500'
        },
        { 
          icon: Info, 
          label: 'About Ignite Arena', 
          sub: 'অ্যাপ সম্পর্কে জানুন', 
          href: '#',
          color: 'text-muted-foreground'
        },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col w-full text-white">
      <header className="px-6 py-4 flex items-center gap-4 border-b border-[#111111] bg-[#000000] sticky top-0 z-50">
        <button 
          onClick={() => router.push('/profile')}
          className="p-2 rounded-lg bg-[#111111] text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold uppercase tracking-tight">Settings</h1>
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">App Preferences</p>
        </div>
      </header>

      <main className="flex-1 pb-32">
        <div className="p-4 space-y-8 max-w-md mx-auto w-full">
          {settingsSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-1">
                {section.title}
              </h2>
              <Card className="bg-[#0a0a0a] border border-[#111111] rounded-2xl overflow-hidden shadow-none">
                <div className="divide-y divide-[#111111]">
                  {section.items.map((item, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#111111] flex items-center justify-center">
                          <item.icon className={`w-5 h-5 ${item.color || 'text-white'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-200 tracking-tight">{item.label}</p>
                          <p className="text-[9px] font-bold text-gray-500 uppercase">{item.sub}</p>
                        </div>
                      </div>
                      {item.control ? item.control : (
                         <ChevronRight className="w-4 h-4 text-gray-700" />
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ))}

          <div className="pt-10 text-center space-y-2 opacity-30">
             <div className="w-12 h-12 rounded-2xl bg-[#111111] flex items-center justify-center mx-auto mb-2">
                <Settings className="w-6 h-6 text-gray-500" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest">Ignite Arena v1.0.4-Stable</p>
             <p className="text-[8px] font-bold uppercase tracking-[0.2em]">Developed by Elite Tech Team</p>
          </div>
        </div>
      </main>
    </div>
  );
}
