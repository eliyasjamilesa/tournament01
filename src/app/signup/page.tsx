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
        <Button variant="outline" size="sm" className="bg-[#1a1a1a]/80 border-white/5 rounded-full text-[9px] font-bold uppercase tracking-wider h-7 px-3 gap-1.5">
          <Globe className="w-3 h-3 text-primary" />
          বাংলা
        </Button>
      </div>

      <div className="flex flex-col items-center mt-8 space-y-6 w-full">
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
          <div className="absolute -top-1 -right-1 bg-green-500 p-1 rounded-lg shadow-lg">
            <ShieldCheck className="w-3 h-3 text-white" />
          </div>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-xl font-headline font-black text-primary uppercase italic tracking-tight">
            Become a Legend
          </h1>
          <p className="text-muted-foreground text-[8px] font-bold uppercase tracking-[0.2em]">
            Join the Global Arena
          </p>
        </div>

        {errorMsg && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive py-2 px-3">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription className="text-[10px] font-bold">{errorMsg}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSignup} className="w-full space-y-3.5">
          <div className="space-y-1">
            <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Warrior Name</Label>
            <div className="input-container-custom">
              <User className="input-icon-red" />
              <Input 
                placeholder="Unique Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent border-none focus-visible:ring-0 p-0 h-10 text-xs font-bold"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Terminal</Label>
            <div className="input-container-custom">
              <Mail className="input-icon-red" />
              <Input 
                type="email"
                placeholder="warrior@ignite.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none focus-visible:ring-0 p-0 h-10 text-xs font-bold"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Comms (Phone)</Label>
            <div className="input-container-custom">
              <span className="text-primary font-black text-[9px] mr-2">+88</span>
              <Input 
                type="tel"
                placeholder="01XXXXXXXXX" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-transparent border-none focus-visible:ring-0 p-0 h-10 text-xs font-bold"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Secure Key</Label>
            <div className="input-container-custom">
              <Lock className="input-icon-red" />
              <Input 
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-none focus-visible:ring-0 p-0 h-10 text-xs font-bold"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full h-12 magma-gradient font-black uppercase italic tracking-[0.1em] rounded-xl shadow-lg shadow-primary/10 mt-3 text-sm active:scale-95 transition-all">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Profile'}
          </Button>
        </form>

        <div className="relative w-full py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/5" />
          </div>
          <div className="relative flex justify-center text-[8px] uppercase font-black tracking-widest">
            <span className="bg-background px-4 text-muted-foreground">Quick Signup</span>
          </div>
        </div>

        <Button 
          variant="outline" 
          onClick={handleGoogleSignup} 
          disabled={isLoading}
          className="w-full h-12 bg-[#0d0d0d] border-white/5 rounded-xl font-bold uppercase tracking-[0.1em] text-[10px] gap-3 active:scale-95 transition-all"
        >
          <svg className="h-4 w-4" viewBox="0 0 488 512">
            <path fill="#EA4335" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
          </svg>
          Google Warrior
        </Button>

        <p className="text-center text-[9px] font-bold text-muted-foreground pt-2 pb-10 tracking-widest">
          Already a Warrior?{' '}
          <Link href="/login" className="text-primary font-black hover:underline uppercase italic">
            Login Now
          </Link>
        </p>
      </div>
    </div>
  );
}