
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Flame, Loader2, User, Mail, Lock, Phone, Eye, EyeOff, Globe, AlertCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const appLogo = PlaceHolderImages.find(img => img.id === 'app-logo')?.imageUrl || '';

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: name });
      
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        displayName: name,
        email: user.email,
        phone: phone,
        photoURL: user.photoURL || '',
        coins: 100,
        level: 1,
        createdAt: new Date().toISOString()
      }, { merge: true });

      router.push('/');
    } catch (error: any) {
      let message = "সাইন আপ ব্যর্থ হয়েছে।";
      if (error.code === 'auth/email-already-in-use') {
        message = "এই ইমেইলটি আগে থেকেই নিবন্ধিত।";
      } else if (error.code === 'auth/weak-password') {
        message = "পাসওয়ার্ডটি খুবই দুর্বল। অন্তত ৬টি অক্ষর দিন।";
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

  const handleGoogleSignup = async () => {
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
        setErrorMsg(`এই ডোমেইনটি (${domain}) Firebase-এ অনুমোদিত নয়।`);
      } else if (error.code !== 'auth/popup-closed-by-user') {
        setErrorMsg("গুগল কানেকশন ব্যর্থ হয়েছে।");
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
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-primary/30 logo-glow">
            <Image 
              src={appLogo} 
              alt="App Logo" 
              width={96} 
              height={96} 
              className="object-cover"
              data-ai-hint="gaming logo"
            />
          </div>
          <div className="absolute -top-2 -right-2 bg-green-500 p-1.5 rounded-lg shadow-lg">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-headline font-black text-primary uppercase italic tracking-tight">
            BECOME A LEGEND
          </h1>
          <p className="text-muted-foreground text-[9px] font-bold uppercase tracking-[0.2em]">
            Join 1M+ active warriors
          </p>
        </div>

        {errorMsg && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs font-bold">{errorMsg}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSignup} className="w-full space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Warrior Name</Label>
            <div className="input-container-custom">
              <User className="input-icon-red" />
              <Input 
                placeholder="Unique Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent border-none focus-visible:ring-0 p-0 h-10 text-sm font-bold"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Terminal</Label>
            <div className="input-container-custom">
              <Mail className="input-icon-red" />
              <Input 
                type="email"
                placeholder="warrior@ignite.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none focus-visible:ring-0 p-0 h-10 text-sm font-bold"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Comms (Phone)</Label>
            <div className="input-container-custom">
              <span className="text-primary font-black text-[10px] mr-2">+88</span>
              <Input 
                type="tel"
                placeholder="01XXXXXXXXX" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-transparent border-none focus-visible:ring-0 p-0 h-10 text-sm font-bold"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Secure Key</Label>
            <div className="input-container-custom">
              <Lock className="input-icon-red" />
              <Input 
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-none focus-visible:ring-0 p-0 h-10 text-sm font-bold"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full h-14 magma-gradient font-black uppercase italic tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 mt-4 text-md active:scale-95 transition-all">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Create Profile'}
          </Button>
        </form>

        <div className="relative w-full py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/5" />
          </div>
          <div className="relative flex justify-center text-[9px] uppercase font-black tracking-widest">
            <span className="bg-background px-4 text-muted-foreground">OR QUICK SIGNUP</span>
          </div>
        </div>

        <Button 
          variant="outline" 
          onClick={handleGoogleSignup} 
          disabled={isLoading}
          className="w-full h-14 bg-[#1a1a1a] border-white/5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] gap-3 active:scale-95 transition-all"
        >
          <svg className="h-5 w-5" viewBox="0 0 488 512">
            <path fill="#EA4335" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
          </svg>
          Google Warrior
        </Button>

        <p className="text-center text-[10px] font-bold text-muted-foreground pt-4 pb-12 tracking-widest">
          ALREADY A WARRIOR?{' '}
          <Link href="/login" className="text-primary font-black hover:underline uppercase italic">
            Login Now
          </Link>
        </p>
      </div>
    </div>
  );
}
