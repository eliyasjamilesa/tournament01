
"use client";

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Loader2, ArrowLeft, Key, Mail, CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const auth = useAuth();
  const { toast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setIsSent(true);
      toast({
        title: 'ইমেইল পাঠানো হয়েছে',
        description: 'আপনার ইনবক্স চেক করুন পাসওয়ার্ড রিসেট করার লিঙ্কের জন্য।',
      });
    } catch (error: any) {
      let message = "Request Failed";
      if (error.code === 'auth/user-not-found') {
        message = "এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি।";
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm space-y-8 relative z-10">
        <Link href="/login" className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mr-3 group-hover:bg-primary/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to Login
        </Link>

        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-[2rem] magma-gradient flex items-center justify-center shadow-2xl shadow-primary/30 rotate-3">
            <Key className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-1 pt-4">
             <h1 className="text-3xl font-headline font-black uppercase italic tracking-tighter text-white">Lost <span className="text-primary">Key?</span></h1>
             <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">পাসওয়ার্ড পুনরুদ্ধার করুন</p>
          </div>
        </div>

        <Card className="border-white/5 bg-card/40 backdrop-blur-xl rounded-[2rem] overflow-hidden shadow-2xl">
          <CardContent className="p-8">
            {!isSent ? (
              <form onSubmit={handleReset} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Registered Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="warrior@tstour.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-black/20 border-white/5 h-12 pl-12 rounded-xl font-bold focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full h-14 magma-gradient font-black uppercase italic tracking-widest rounded-xl shadow-xl shadow-primary/20">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'রিসেট লিঙ্ক পাঠান'}
                </Button>
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-[9px] text-muted-foreground font-bold uppercase leading-relaxed">
                    ইমেইল না পেলে আপনার <strong>Spam</strong> বা <strong>Promotions</strong> ফোল্ডারটি চেক করুন।
                  </p>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 space-y-6 animate-in zoom-in duration-500">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                   <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-black text-white uppercase italic">রিসেট লিঙ্ক পাঠানো হয়েছে!</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed">
                    আপনার ইমেইল <span className="text-primary">{email}</span> চেক করুন এবং লিঙ্কে ক্লিক করুন।
                  </p>
                  <p className="text-[9px] font-bold text-yellow-500 uppercase mt-2">
                    ইমেইল না পেলে 'Spam' ফোল্ডারটি চেক করুন।
                  </p>
                </div>
                <Button variant="outline" asChild className="w-full h-12 rounded-xl border-white/10 bg-white/5 font-black uppercase italic tracking-widest text-[10px]">
                  <Link href="/login">লগইন পেজে ফিরে যান</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
