
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Flame, Loader2, User, Mail, Lock, Phone, Eye, EyeOff, Globe, AlertCircle } from 'lucide-react';
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
      setDoc(userRef, {
        uid: user.uid,
        displayName: name,
        email: user.email,
        phone: phone,
        photoURL: user.photoURL || '',
        coins: 100,
        level: 1,
      }, { merge: true }).catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: userRef.path,
          operation: 'create',
          requestResourceData: { uid: user.uid, displayName: name },
        }));
      });

      router.push('/');
    } catch (error: any) {
      let message = error.message;
      if (error.code === 'auth/email-already-in-use') {
        message = "এই ইমেইলটি আগে থেকেই নিবন্ধিত। লগইন করার চেষ্টা করুন।";
      } else if (error.code === 'auth/weak-password') {
        message = "পাসওয়ার্ডটি খুবই দুর্বল। অন্তত ৬টি অক্ষর ব্যবহার করুন।";
      }
      
      setErrorMsg(message);
      toast({
        variant: 'destructive',
        title: 'সাইন আপ ব্যর্থ',
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
        setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName || 'Player',
          email: user.email,
          photoURL: user.photoURL || '',
          coins: 100,
          level: 1,
        }, { merge: true }).catch(async (err) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: userRef.path,
            operation: 'create',
            requestResourceData: { uid: user.uid },
          }));
        });
      }

      router.push('/');
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'your-domain';
        const message = `এই ডোমেইনটি (${domain}) Firebase-এ অনুমোদিত নয়। অনুগ্রহ করে Firebase কনসোলে এই ডোমেইনটি 'Authorized Domains' তালিকায় যোগ করুন।`;
        setErrorMsg(message);
        toast({
          variant: 'destructive',
          title: 'Unauthorized Domain',
          description: message,
        });
      } else if (error.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(error.message);
        toast({
          variant: 'destructive',
          title: 'গুগল সাইন আপ ব্যর্থ',
          description: error.message,
        });
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
          <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-primary/50 logo-glow">
            <Image 
              src={appLogo} 
              alt="App Logo" 
              width={112} 
              height={112} 
              className="object-cover"
              data-ai-hint="gaming logo"
            />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-headline font-bold text-primary text-glow-red uppercase italic">
            অ্যাকাউন্ট তৈরি করুন
          </h1>
          <p className="text-muted-foreground text-sm font-medium tracking-tight">
            আজই আপনার যাত্রা শুরু করুন
          </p>
        </div>

        {errorMsg && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-xs font-bold uppercase italic">Error Found</AlertTitle>
            <AlertDescription className="text-xs font-medium">{errorMsg}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSignup} className="w-full space-y-6 mt-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Username</Label>
            <div className="input-container-custom">
              <User className="input-icon-red" />
              <Input 
                placeholder="আপনার নাম লিখুন" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent border-none focus-visible:ring-0 p-0 h-10 text-sm font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
            <div className="input-container-custom">
              <Mail className="input-icon-red" />
              <Input 
                type="email"
                placeholder="আপনার ইমেইল দিন" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none focus-visible:ring-0 p-0 h-10 text-sm font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Phone Number</Label>
            <div className="input-container-custom">
              <span className="text-primary font-bold text-xs mr-3">+88</span>
              <Input 
                type="tel"
                placeholder="১১ ডিজিটের নম্বর দিন" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-transparent border-none focus-visible:ring-0 p-0 h-10 text-sm font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
            <div className="input-container-custom">
              <Lock className="input-icon-red" />
              <Input 
                type={showPassword ? "text" : "password"}
                placeholder="পাসওয়ার্ড দিন" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-none focus-visible:ring-0 p-0 h-10 text-sm font-medium"
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

          <Button type="submit" disabled={isLoading} className="w-full h-14 magma-gradient font-bold uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-primary/20 mt-4">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
          </Button>
        </form>

        <div className="relative w-full mt-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/5" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
            <span className="bg-background px-4 text-muted-foreground">অথবা কন্টিনিউ করুন</span>
          </div>
        </div>

        <Button 
          variant="outline" 
          onClick={handleGoogleSignup} 
          disabled={isLoading}
          className="w-full h-14 bg-[#1a1a1a] border-white/5 rounded-2xl font-bold uppercase tracking-widest text-[11px] gap-3 hover:bg-white/5 transition-colors"
        >
          <svg className="h-5 w-5" viewBox="0 0 488 512">
            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
          </svg>
          Continue with Google
        </Button>

        <p className="text-center text-xs font-medium text-muted-foreground pt-4 pb-12">
          অ্যাকাউন্ট আছে?{' '}
          <Link href="/login" className="text-primary font-bold hover:underline">
            লগইন করুন
          </Link>
        </p>
      </div>
    </div>
  );
}
