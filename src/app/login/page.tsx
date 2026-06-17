
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Flame, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
      let message = "Login Failed";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = "Incorrect Email or Password";
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
          role: 'user',
          createdAt: serverTimestamp()
        }, { merge: true });
      }

      router.push('/');
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'your-domain';
        setErrorMsg(`Domain (${domain}) is not authorized.`);
      } else if (error.code !== 'auth/popup-closed-by-user') {
        setErrorMsg("Google Login Failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-6 max-w-md mx-auto relative">
      <div className="flex flex-col items-center mt-12 space-y-6 w-full">
        <div className="relative group">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-primary/20 logo-glow">
            <Image 
              src={appLogo} 
              alt="App Logo" 
              width={64} 
              height={64} 
              className="object-cover"
              data-ai-hint="gaming logo"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-primary p-1 rounded-lg">
            <Flame className="w-3 h-3 text-white" />
          </div>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-xl font-headline font-black text-primary uppercase italic tracking-tight">
            IGNITE ARENA
          </h1>
          <p className="text-muted-foreground text-[8px] font-bold uppercase tracking-[0.2em]">
            Elite Tournament Platform
          </p>
        </div>

        {errorMsg && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive py-2 px-3">
            <AlertCircle className="h-3 w-3 shrink-0" />
            <AlertDescription className="text-[10px] font-bold">{errorMsg}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleEmailLogin} className="w-full space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
            <Input 
              type="email"
              placeholder="warrior@ignite.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-simple"
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
              <Link href="/forgot-password" className="text-[9px] font-bold uppercase text-primary hover:text-white">
                Lost Key?
              </Link>
            </div>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"}
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-simple pr-12"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full h-12 magma-gradient font-black uppercase italic tracking-widest rounded-xl shadow-lg mt-2 text-sm active:scale-95 transition-all">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enter Arena'}
          </Button>
        </form>

        <div className="relative w-full py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/5" />
          </div>
          <div className="relative flex justify-center text-[9px] uppercase font-bold tracking-widest">
            <span className="bg-background px-4 text-muted-foreground">Or Connect</span>
          </div>
        </div>

        <Button 
          variant="outline" 
          onClick={handleGoogleLogin} 
          disabled={isLoading}
          className="w-full h-12 bg-[#0d0d0d] border-white/10 rounded-xl font-bold uppercase tracking-widest text-[11px] gap-3 active:scale-95 transition-all"
        >
          <svg className="h-4 w-4" viewBox="0 0 488 512">
            <path fill="#EA4335" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
          </svg>
          Google Warrior
        </Button>

        <p className="text-center text-[10px] font-bold text-muted-foreground pt-4 tracking-widest">
          NEW WARRIOR?{' '}
          <Link href="/signup" className="text-primary font-black hover:underline uppercase italic">
            CREATE PROFILE
          </Link>
        </p>
      </div>
    </div>
  );
}
