
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Flame, Loader2, Mail, Lock, Eye, EyeOff, Globe, AlertCircle, Smartphone } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
        const message = `এই ডোমেইনটি (${domain}) Firebase-এ অনুমোদিত নয়। অনুগ্রহ করে Firebase কনসোলে Authorized Domains তালিকায় এটি যোগ করুন।`;
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
        <Button variant="outline" size="sm" className="bg-[#1a1a1a]/80 border-white/5 rounded-full text-[10px] font-bold uppercase tracking-wider h-8 px-4 gap-2">
          <Globe className="w-3.5 h-3.5 text-primary" />
          বাংলা
        </Button>
      </div>

      <div className="flex flex-col items-center mt-12 space-y-6 w-full">
        <div className="relative group">
          <div className="w-28 h-28 rounded-3xl overflow-hidden border-2 border-primary/50 logo-glow rotate-3 transition-transform group-hover:rotate-0">
            <Image 
              src={appLogo} 
              alt="App Logo" 
              width={112} 
              height={112} 
              className="object-cover"
              data-ai-hint="gaming logo"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-primary p-2 rounded-xl shadow-lg animate-bounce">
            <Flame className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-headline font-black text-primary text-glow-red uppercase italic tracking-tighter">
            IGNITE ARENA
          </h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.3em]">
            The Ultimate Combat Experience
          </p>
        </div>

        {errorMsg && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-[10px] font-bold uppercase italic tracking-wider">Authentication Error</AlertTitle>
            <AlertDescription className="text-xs font-medium leading-relaxed">{errorMsg}</AlertDescription>
          </Alert>
        )}

        <div className="w-full space-y-4">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Warrior ID (Email)</Label>
              <div className="input-container-custom group-focus-within:ring-2 ring-primary/20">
                <Mail className="input-icon-red group-focus-within:scale-110 transition-transform" />
                <Input 
                  type="email"
                  placeholder="name@warrior.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-none focus-visible:ring-0 p-0 h-10 text-sm font-bold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Access Key (Password)</Label>
                <Link href="/forgot-password" title="পাসওয়ার্ড ভুলে গেছেন?" className="text-[9px] font-black uppercase text-primary hover:text-white transition-colors">
                  Lost Key?
                </Link>
              </div>
              <div className="input-container-custom group-focus-within:ring-2 ring-primary/20">
                <Lock className="input-icon-red group-focus-within:scale-110 transition-transform" />
                <Input 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border-none focus-visible:ring-0 p-0 h-10 text-sm font-bold"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-white transition-colors ml-2"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-14 magma-gradient font-black uppercase italic tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 mt-2 text-md transition-all active:scale-95">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Enter Arena'}
            </Button>
          </form>

          <div className="relative w-full py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-[9px] uppercase font-black tracking-[0.3em]">
              <span className="bg-background px-4 text-muted-foreground">OR CONNECT WITH</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Button 
              variant="outline" 
              onClick={handleGoogleLogin} 
              disabled={isLoading}
              className="w-full h-14 bg-[#1a1a1a] border-white/5 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] gap-3 hover:bg-white/5 transition-all active:scale-95 group"
            >
              <svg className="h-5 w-5 group-hover:scale-110 transition-transform" viewBox="0 0 488 512">
                <path fill="#EA4335" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
              Google Account
            </Button>
          </div>
        </div>

        <p className="text-center text-[10px] font-bold text-muted-foreground pt-4 pb-12 tracking-wider">
          NEW WARRIOR?{' '}
          <Link href="/signup" className="text-primary font-black hover:underline uppercase italic">
            Create Profile
          </Link>
        </p>
      </div>
    </div>
  );
}
