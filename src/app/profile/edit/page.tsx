
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle2,
  Camera,
  Gamepad2,
  Fingerprint
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, loading: profileLoading } = useDoc<any>(userDocRef);

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [ingameName, setIngameName] = useState('');
  const [ingameId, setIngameId] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || user?.displayName || '');
      setPhone(profile.phone || '');
      setPhotoURL(profile.photoURL || user?.photoURL || '');
      setIngameName(profile.ingameName || '');
      setIngameId(profile.ingameId || '');
    }
  }, [profile, user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;

    setIsUpdating(true);
    try {
      // Update Firebase Auth Profile
      await updateProfile(user, {
        displayName: displayName,
        photoURL: photoURL
      });

      // Update Firestore Profile
      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
        phone,
        photoURL,
        ingameName,
        ingameId
      });

      toast({
        title: "সফল!",
        description: "আপনার প্রোফাইল আপডেট করা হয়েছে।",
      });
      router.push('/profile');
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "প্রোফাইল আপডেট করতে সমস্যা হয়েছে।",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (userLoading || profileLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 pt-10 pb-6 flex items-center gap-4 border-b border-white/5 bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <Button 
          variant="ghost" 
          size="icon" 
          asChild
          className="rounded-full bg-white/5 h-10 w-10"
        >
          <Link href="/profile">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
        </Button>
        <h1 className="text-xl font-black uppercase italic tracking-tight text-white">Edit Profile</h1>
      </header>

      <main className="flex-1 p-6 pb-32 space-y-8 max-w-md mx-auto w-full overflow-y-auto no-scrollbar">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="w-24 h-24 border-2 border-primary/20">
              <AvatarImage src={photoURL} className="object-cover" />
              <AvatarFallback className="bg-muted text-xl font-bold uppercase">
                {displayName[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 p-1.5 bg-primary rounded-full border-2 border-background">
              <Camera className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">আপনার ছবি আপডেট করুন</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic border-l-2 border-primary pl-3">বেসিক ইনফো</h3>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">ডিসপ্লে নাম</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <Input 
                    placeholder="আপনার নাম দিন" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-muted/30 border-white/5 h-12 pl-12 rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">ফোন নম্বর</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <Input 
                    placeholder="01XXXXXXXXX" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-muted/30 border-white/5 h-12 pl-12 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">প্রোফাইল পিকচার লিংক (URL)</Label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <Input 
                    placeholder="https://image-link.com/photo.jpg" 
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    className="bg-muted/30 border-white/5 h-12 pl-12 rounded-xl font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic border-l-2 border-primary pl-3">গেমিং ইনফো (ফ্রি ফায়ার)</h3>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">গেমের নাম (In-game Name)</Label>
                <div className="relative">
                  <Gamepad2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <Input 
                    placeholder="E.g. ShadowSlayer" 
                    value={ingameName}
                    onChange={(e) => setIngameName(e.target.value)}
                    className="bg-muted/30 border-white/5 h-12 pl-12 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">প্লেয়ার আইডি (UID)</Label>
                <div className="relative">
                  <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <Input 
                    placeholder="E.g. 102938475" 
                    value={ingameId}
                    onChange={(e) => setIngameId(e.target.value)}
                    className="bg-muted/30 border-white/5 h-12 pl-12 rounded-xl font-bold font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isUpdating}
            className="w-full h-14 magma-gradient font-black uppercase italic tracking-widest rounded-2xl shadow-xl shadow-primary/20 text-sm"
          >
            {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <><CheckCircle2 className="w-4 h-4 mr-2" /> সব সেভ করুন</>
            )}
          </Button>
        </form>
      </main>
    </div>
  );
}
