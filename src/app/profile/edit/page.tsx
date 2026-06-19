
"use client";

import { useState, useEffect, useRef } from 'react';
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
  Fingerprint,
  Upload
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || user?.displayName || '');
      setPhone(profile.phone || '');
      setPhotoURL(profile.photoURL || user?.photoURL || '');
      setIngameName(profile.ingameName || '');
      setIngameId(profile.ingameId || '');
    }
  }, [profile, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit file size to 1MB for Firestore storage
    if (file.size > 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "দয়া করে ১ মেগাবাইটের নিচের ছবি আপলোড করুন।"
      });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPhotoURL(base64String);
      setIsUploading(false);
      toast({
        title: "ছবি সিলেক্ট হয়েছে",
        description: "সব সেভ করুন বাটনে ক্লিক করে নিশ্চিত করুন।"
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;

    setIsUpdating(true);
    try {
      // Update Firebase Auth Profile (Note: Auth has a limit on photoURL length, 
      // so if the base64 is too long it might fail, but we'll try)
      try {
        await updateProfile(user, {
          displayName: displayName,
          photoURL: photoURL.startsWith('data:') ? user.photoURL : photoURL 
        });
      } catch (authErr) {
        console.warn("Auth profile sync skipped due to URL size");
      }

      // Update Firestore Profile (This is our source of truth)
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
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <Avatar className="w-24 h-24 border-2 border-primary/20 transition-all group-hover:opacity-80">
              <AvatarImage src={photoURL} className="object-cover" />
              <AvatarFallback className="bg-muted text-xl font-bold uppercase">
                {displayName[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <Upload className="w-6 h-6 text-white" />
            </div>
            <div className="absolute bottom-0 right-0 p-1.5 bg-primary rounded-full border-2 border-background shadow-lg">
              {isUploading ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Camera className="w-3.5 h-3.5 text-white" />}
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ছবির উপর ক্লিক করে নতুন ছবি নিন</p>
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
                <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">প্রোফাইল পিকচার লিংক (ঐচ্ছিক)</Label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <Input 
                    placeholder="সরাসরি আপলোড করুন বা লিংক দিন" 
                    value={photoURL.startsWith('data:') ? 'Uploaded directly' : photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    className="bg-muted/30 border-white/5 h-12 pl-12 rounded-xl font-bold truncate"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic border-l-2 border-primary pl-3">게মিং ইনফো (ফ্রি ফায়ার)</h3>
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
