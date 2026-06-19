
"use client";

import { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // States with default values
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [language, setLanguage] = useState('Bangla');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem('app_notifications');
      const savedSounds = localStorage.getItem('app_sounds');
      const savedLanguage = localStorage.getItem('app_language');

      if (savedNotifications !== null) setNotifications(savedNotifications === 'true');
      if (savedSounds !== null) setSounds(savedSounds === 'true');
      if (savedLanguage !== null) setLanguage(savedLanguage);
    } catch (e) {
      console.error("Failed to load settings from storage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Persist settings whenever they change
  const handleToggleNotifications = (val: boolean) => {
    setNotifications(val);
    localStorage.setItem('app_notifications', String(val));
    toast({
      title: val ? "নোটিফিকেশন চালু" : "নোটিফিকেশন বন্ধ",
      description: val ? "এখন থেকে আপনি সব আপডেট পাবেন।" : "আপনি এখন থেকে আর কোনো পুশ নোটিফিকেশন পাবেন না।",
    });
  };

  const handleToggleSounds = (val: boolean) => {
    setSounds(val);
    localStorage.setItem('app_sounds', String(val));
  };

  const handleToggleLanguage = () => {
    const newLang = language === 'Bangla' ? 'English' : 'Bangla';
    setLanguage(newLang);
    localStorage.setItem('app_language', newLang);
    toast({
      title: "ভাষা পরিবর্তন",
      description: `অ্যাপের ভাষা এখন ${newLang} এ সেট করা হয়েছে।`,
    });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Settings Loading...</p>
      </div>
    );
  }

  const settingsSections = [
    {
      title: "Preferences",
      items: [
        { 
          icon: Bell, 
          label: 'Notifications', 
          sub: 'নতুন ম্যাচের খবর পান', 
          control: <Switch checked={notifications} onCheckedChange={handleToggleNotifications} /> 
        },
        { 
          icon: Volume2, 
          label: 'Sound Effects', 
          sub: 'অ্যাপের সাউন্ড অন/অফ করুন', 
          control: <Switch checked={sounds} onCheckedChange={handleToggleSounds} /> 
        },
        { 
          icon: Globe, 
          label: 'Language', 
          sub: 'ভাষা পরিবর্তন করুন', 
          control: (
            <button 
              onClick={handleToggleLanguage} 
              className="text-[10px] font-black uppercase text-primary italic px-3 py-1 bg-primary/10 rounded-lg border border-primary/20"
            >
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
          href: 'https://t.me/ignitearena',
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
      <header className="px-6 py-8 flex items-center gap-4 border-b border-[#111111] bg-[#000000] sticky top-0 z-50">
        <button 
          onClick={() => router.push('/profile')}
          className="p-2.5 rounded-xl bg-[#111111] text-white border border-white/5"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black uppercase italic tracking-tight">Settings</h1>
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">App Preferences</p>
        </div>
      </header>

      <main className="flex-1 pb-32">
        <div className="p-4 space-y-8 max-w-md mx-auto w-full">
          {settingsSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-1 italic">
                {section.title}
              </h2>
              <Card className="bg-[#050505] border border-[#111111] rounded-[2rem] overflow-hidden shadow-none">
                <div className="divide-y divide-[#111111]">
                  {section.items.map((item, idx) => (
                    <div key={idx} className="p-5 flex items-center justify-between hover:bg-white/5 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-[#111111] flex items-center justify-center border border-white/5">
                          <item.icon className={`w-5 h-5 ${item.color || 'text-white'}`} />
                        </div>
                        <div>
                          <p className="text-[13px] font-black text-gray-200 tracking-tight">{item.label}</p>
                          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{item.sub}</p>
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

          <div className="pt-10 text-center space-y-2 opacity-20">
             <div className="w-14 h-14 rounded-[1.5rem] bg-[#111111] flex items-center justify-center mx-auto mb-3 border border-white/5">
                <Settings className="w-7 h-7 text-gray-500" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em]">Ignite Arena v1.0.4-Stable</p>
             <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-primary italic">Born for the Arena</p>
          </div>
        </div>
      </main>
    </div>
  );
}
