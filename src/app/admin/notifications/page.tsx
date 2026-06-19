
"use client";

import { useState } from 'react';
import { Bell, Loader2, Send, Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function AdminNotificationsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const notificationsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'notifications'), orderBy('timestamp', 'desc'), limit(20));
  }, [db]);

  const { data: notifications, loading } = useCollection<any>(notificationsQuery);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !title || !message) return;
    setIsSending(true);
    try {
      await addDoc(collection(db, 'notifications'), {
        title,
        message,
        type: 'general',
        timestamp: serverTimestamp()
      });
      toast({ title: "সফল", description: "নোটিফিকেশন পাঠানো হয়েছে।" });
      setTitle('');
      setMessage('');
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!db) return;
    if (confirm('এই নোটিফিকেশনটি মুছে ফেলতে চান?')) {
      await deleteDoc(doc(db, 'notifications', id));
      toast({ title: "মুছে ফেলা হয়েছে" });
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="space-y-1">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Notification <span className="text-primary">Control</span></h2>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ইউজারদের নোটিফিকেশন পাঠান</p>
      </div>

      <Card className="border-white/5 bg-[#0a0a0a] rounded-3xl overflow-hidden shadow-none">
        <CardContent className="p-6 space-y-6">
          <form onSubmit={handleSendNotification} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">টাইটেল</Label>
              <Input 
                placeholder="E.g. গুরুত্বপূর্ণ ঘোষণা" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-black/40 border-white/5 h-12 rounded-xl font-bold"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">মেসেজ</Label>
              <Textarea 
                placeholder="আপনার মেসেজটি এখানে লিখুন..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-black/40 border-white/5 min-h-[120px] rounded-xl font-bold"
                required
              />
            </div>
            <Button type="submit" disabled={isSending} className="w-full h-14 magma-gradient font-black uppercase italic rounded-xl">
              {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> মেসেজ পাঠান</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">আগের নোটিফিকেশনসমূহ</h3>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : notifications?.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl opacity-40">
            <p className="text-[10px] font-bold uppercase tracking-widest">কোন নোটিফিকেশন নেই</p>
          </div>
        ) : (
          notifications?.map((note: any) => (
            <Card key={note.id} className="bg-[#0a0a0a] border-white/5 p-5 rounded-2xl relative">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-sm font-black text-white italic">{note.title}</h4>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase">{note.timestamp ? format(note.timestamp.toDate(), 'dd MMM, hh:mm a') : 'Now'}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(note.id)} className="h-8 w-8 text-muted-foreground hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[11px] font-bold text-gray-400 uppercase leading-relaxed">{note.message}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
