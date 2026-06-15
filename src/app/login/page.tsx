'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Flame, Loader2, Mail, Lock, Eye, EyeOff, Globe, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const appLogo = PlaceHolderImages.find(img => img.id === 'app-logo')?.imageUrl || '';

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error: any) {
      let message = "লগইন ব্যর্থ হয়েছে।";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = "ইমেইল বা পাসওয়ার্ড সঠিক নয়। আবার চেষ্টা করুন।";
      }
      setErrorMsg(message);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth || !db) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName || 'Player',
          email: user.email,
          photoURL: user.photoURL || '',
          coins: 100,
          level: 1,
          createdAt: new Date().toISOString()
        }, { merge: true });
      }

      router.push('/');
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'your-domain';
        const message = `এই ডোমেইনটি (${domain}) Firebase-এ অনুমোদিত নয়। অনুগ্রহ করে Firebase কনসোলে এটি যোগ করুন।`;
        setErrorMsg(message);
      } else if (error.code !== 'auth/popup-closed-by-user') {
        setErrorMsg("গুগল লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-6 max-w-md mx-auto relative overflow-x-hidden">
      <div className="absolute top-6 right-6 z-10">
        <Button variant="outline" size="sm" className="bg-[#1a1a1a]/80 border-white/5 rounded-full text-[9px] font-bold uppercase tracking-wider h-7 px-3 gap-1.5">
          <Globe className="w-3 h-3 text-primary" />
          বাংলা
        </Button>
      </div>

      <div className="flex flex-col items-center mt-10 space-y-6 w-full">
        <div className="relative group">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border border-primary/30 logo-glow rotate-2 transition-transform group-hover:rotate-0">
            <Image 
              src={appLogo} 
              alt="App Logo" 
              width={80} 
              height={80} 
              className="object-cover"
              data-ai-hint="gaming logo"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-primary p-1.5 rounded-lg shadow-lg">
            <Flame className="w-3 h-3 text-white" />
          </div>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-headline font-black text-primary text-glow-red uppercase italic tracking-tighter">
            IGNITE ARENA
          </h1>
          <p className="text-muted-foreground text-[8px] font-bold uppercase tracking-[0.2em]">
            Ultimate Tournament Experience
          </p>
        </div>

        {errorMsg && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive py-2 px-3">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription className="text-[10px] font-bold">{errorMsg}</AlertDescription>
          </Alert>
        )}

        <div className="w-full space-y-4">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Warrior ID</Label>
              <div className="input-container-custom group">
                <Mail className="input-icon-red" />
                <Input 
                  type="email"
                  placeholder="name@warrior.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-none focus-visible:ring-0 p-0 h-10 text-xs font-bold placeholder:text-muted-foreground/40"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Access Key</Label>
                <Link href="/forgot-password" global-ai-hint="forgot password" className="text-[8px] font-bold uppercase text-primary hover:text-white transition-colors">
                  Lost Key?
                </Link>
              </div>
              <div className="input-container-custom group">
                <Lock className="input-icon-red" />
                <Input 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border-none focus-visible:ring-0 p-0 h-10 text-xs font-bold placeholder:text-muted-foreground/40"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-white transition-colors ml-2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-12 magma-gradient font-black uppercase italic tracking-[0.1em] rounded-xl shadow-lg shadow-primary/10 mt-2 text-sm active:scale-95 transition-all">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enter Arena'}
            </Button>
          </form>

          <div className="relative w-full py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-[8px] uppercase font-black tracking-[0.2em]">
              <span className="bg-background px-4 text-muted-foreground">Or connect with</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={handleGoogleLogin} 
            disabled={isLoading}
            className="w-full h-12 bg-[#0d0d0d] border-white/5 rounded-xl font-bold uppercase tracking-[0.1em] text-[10px] gap-3 hover:bg-white/5 active:scale-95 transition-all"
          >
            <svg className="h-4 w-4" viewBox="0 0 488 512">
              <path fill="#EA4335" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
            Google Account
          </Button>
        </div>

        <p className="text-center text-[9px] font-bold text-muted-foreground pt-2 pb-10 tracking-wider">
          New Warrior?{' '}
          <Link href="/signup" className="text-primary font-black hover:underline uppercase italic">
            Create Profile
          </Link>
        </p>
      </div>
    </div>
  );
}