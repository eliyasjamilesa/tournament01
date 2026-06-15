'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
      let message = error.message;
      if (error.code === 'auth/user-not-found') {
        message = "No account found with this email. Please sign up first.";
      } else if (error.code === 'auth/wrong-password') {
        message = "Incorrect password. Please try again.";
      } else if (error.code === 'auth/invalid-credential') {
        message = "Invalid email or password. Please check your credentials.";
      }
      
      setErrorMsg(message);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (error: any) {
      setErrorMsg(error.message);
      toast({
        variant: 'destructive',
        title: 'Google Login Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-6 max-w-md mx-auto relative overflow-x-hidden">
      {/* Language Header */}
      <div className="absolute top-6 right-6 z-10">
        <Button variant="outline" size="sm" className="bg-[#1a1a1a]/80 border-white/5 rounded-full text-[10px] font-bold uppercase tracking-wider h-8 px-4 gap-2">
          <Globe className="w-3.5 h-3.5 text-primary" />
          বাংল।
        </Button>
      </div>

      <div className="flex flex-col items-center mt-12 space-y-6 w-full">
        {/* Logo Section */}
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

        {/* Title Section */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-headline font-bold text-primary text-glow-red uppercase italic">
            Welcome Back
          </h1>
          <p className="text-muted-foreground text-sm font-medium tracking-tight">
            Log in to access the arena
          </p>
        </div>

        {errorMsg && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-xs font-bold uppercase">Error</AlertTitle>
            <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
          </Alert>
        )}

        {/* Form Section */}
        <form onSubmit={handleEmailLogin} className="w-full space-y-6 mt-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
            <div className="input-container-custom">
              <Mail className="input-icon-red" />
              <Input 
                type="email"
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none focus-visible:ring-0 p-0 h-10 text-sm font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
              <Link href="/forgot-password" title="Forgot Password" className="text-[10px] font-bold uppercase text-primary hover:underline">
                Forgot?
              </Link>
            </div>
            <div className="input-container-custom">
              <Lock className="input-icon-red" />
              <Input 
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password" 
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

          <div className="flex items-center space-x-2">
            <Checkbox id="remember" className="border-white/20 data-[state=checked]:bg-primary" />
            <Label htmlFor="remember" className="text-xs font-medium text-muted-foreground leading-none">
              Remember me
            </Label>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full h-14 magma-gradient font-bold uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-primary/20 mt-4">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
          </Button>
        </form>

        <div className="relative w-full mt-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/5" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
            <span className="bg-background px-4 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button 
          variant="outline" 
          onClick={handleGoogleLogin} 
          disabled={isLoading}
          className="w-full h-14 bg-[#1a1a1a] border-white/5 rounded-2xl font-bold uppercase tracking-widest text-[11px] gap-3"
        >
          <svg className="h-5 w-5" viewBox="0 0 488 512">
            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
          </svg>
          Google
        </Button>

        <p className="text-center text-xs font-medium text-muted-foreground pt-4 pb-12">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary font-bold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}