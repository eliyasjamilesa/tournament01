'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;
    
    setErrorMsg(null);

    // Strict Validation
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match!");
      toast({ variant: 'destructive', title: 'পাসওয়ার্ড মিলেনি', description: 'উভয় পাসওয়ার্ড একই হতে হবে।' });
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: name });
      
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        displayName: name,
        email: email.toLowerCase(),
        phone: phone,
        photoURL: '',
        coins: 0,
        xp: 0,
        totalWinnings: 0,
        role: 'user', 
        createdAt: serverTimestamp()
      }, { merge: true });

      toast({ title: "সফল", description: "আপনার প্রোফাইল তৈরি হয়েছে।" });
      router.push('/');
    } catch (error: any) {
      let message = "Signup Failed";
      if (error.code === 'auth/email-already-in-use') {
        message = "ইমেইলটি ইতিপূর্বে ব্যবহার করা হয়েছে।";
      } else if (error.code === 'auth/invalid-email') {
        message = "ইমেইল ফরম্যাট সঠিক নয়।";
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
          email: user.email?.toLowerCase(),
          photoURL: user.photoURL || '',
          coins: 0,
          xp: 0,
          totalWinnings: 0,
          role: 'user',
          createdAt: serverTimestamp()
        }, { merge: true });
      }

      router.push('/');
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        setErrorMsg("Google Connection Failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-6 max-w-md mx-auto relative overflow-x-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 bg-primary/5 blur-[100px] pointer-events-none" />
      
      <div className="flex flex-col items-center mt-12 space-y-8 w-full relative z-10">
        <div className="text-center space-y-1">
          <div className="w-16 h-16 rounded-[2rem] magma-gradient flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/20 rotate-3">
             <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-headline font-black text-white uppercase italic tracking-tighter leading-none">
            Join the <span className="text-primary">Arena</span>
          </h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.3em]">
            Elite Warrior Protocol
          </p>
        </div>

        {errorMsg && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive py-2.5 rounded-xl">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <AlertDescription className="text-[11px] font-bold uppercase">{errorMsg}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSignup} className="w-full space-y-5">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Warrior Name</Label>
            <Input 
              placeholder="E.g. ShadowSlayer" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-card border-white/5 h-14 rounded-2xl font-bold focus:border-primary text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
            <Input 
              type="email"
              placeholder="warrior@tstour.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-card border-white/5 h-14 rounded-2xl font-bold focus:border-primary text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">WhatsApp / Phone</Label>
            <Input 
              type="tel"
              placeholder="+8801XXXXXXXXX" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-card border-white/5 h-14 rounded-2xl font-bold focus:border-primary text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Secret Password</Label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-card border-white/5 h-14 rounded-2xl font-bold focus:border-primary text-sm pr-12"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm Identity Key</Label>
              <Input 
                type={showPassword ? "text" : "password"}
                placeholder="Repeat password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn(
                  "bg-card border-white/5 h-14 rounded-2xl font-bold focus:border-primary text-sm",
                  confirmPassword && password !== confirmPassword && "border-destructive text-destructive"
                )}
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full h-14 magma-gradient font-black uppercase italic tracking-widest rounded-2xl shadow-xl shadow-primary/20 mt-4 text-sm active:scale-95 transition-all">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-[10px] font-bold text-muted-foreground pt-4 pb-20 tracking-widest">
          OLD WARRIOR?{' '}
          <Link href="/login" className="text-primary font-black hover:underline uppercase italic">
            LOG IN HERE
          </Link>
        </p>
      </div>
    </div>
  );
}
