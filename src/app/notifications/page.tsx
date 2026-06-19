
"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Loader2, Clock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';
import Link from 'next/link';

export default function NotificationsPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();

  const notificationsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'notifications'), orderBy('timestamp', 'desc'), limit(50));
  }, [db]);

  const { data: notifications, loading: notesLoading } = useCollection<any>(notificationsQuery);

  if (authLoading || notesLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Loading Notifications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="px-6 pt-10 pb-6 flex items-center gap-4 border-b border-white/5 bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push('/')}
          className="rounded-full bg-white/5"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Button>
        <h1 className="text-xl font-black uppercase italic tracking-tight text-white">Notifications</h1>
      </header>

      <main className="p-4 space-y-4 max-w-md mx-auto w-full">
        {notifications?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-4 opacity-40">
            <Bell className="w-16 h-16 text-muted-foreground" />
            <p className="text-[10px] font-black uppercase tracking-widest">কোন নতুন নোটিফিকেশন নেই</p>
          </div>
        ) : (
          notifications?.map((note: any) => (
            <Card key={note.id} className="bg-[#0a0a0a] border-white/5 p-6 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase italic tracking-tight leading-none">{note.title}</h4>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase flex items-center gap-1 mt-1.5">
                    <Clock className="w-2.5 h-2.5" />
                    {note.timestamp ? format(note.timestamp.toDate(), 'dd MMM yyyy, hh:mm a') : 'Now'}
                  </p>
                </div>
              </div>
              <p className="text-[11px] font-bold text-gray-400 uppercase leading-relaxed pl-1">
                {note.message}
              </p>
            </Card>
          ))
        )}
      </main>
    </div>
  );
}
