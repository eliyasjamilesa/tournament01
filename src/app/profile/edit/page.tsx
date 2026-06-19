"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Loader2, 
  CheckCircle2,
  Camera,
  Gamepad2,
  Fingerprint
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
        description: "সেভ বাটনে ক্লিক করুন।"
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;

    setIsUpdating(true);
    try {
      try {
        await updateProfile(user, {
          displayName: displayName,
          photoURL: photoURL.length < 50000 ? photoURL : user.photoURL 
        });
      } catch (authErr) {
        console.error("Auth update skip:", authErr);
      }

      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
        phone,
        photoURL,
        ingameName,
        ingameId
      });

      toast({
        title: "সফল!",
        description: "প্রোফাইল আপডেট হয়েছে।",
      });
      router.push('/profile');
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "আপডেট ব্যর্থ হয়েছে।",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (userLoading || profileLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      <header className="px-6 py-6 flex items-center gap-4 border-b border-white/5 bg-[#050505] sticky top-0 z-50">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push('/profile')}
          className="rounded-xl bg-[#121212] h-10 w-10 flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-lg font-black uppercase italic tracking-tighter text-white">Edit Profile</h1>
          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Update Info</p>
        </div>
      </header>

      <main className="flex-1 pb-32">
        <div className="p-6 max-w-md mx-auto w-full space-y-10">
          <div className="flex flex-col items-center">
            <div 
              className="relative cursor-pointer w-24 h-24" 
              onClick={() => fileInputRef.current?.click()}
            >
              <Avatar className="w-24 h-24 border border-white/10 mx-auto rounded-full overflow-hidden">
                <AvatarImage src={photoURL} className="object-cover" />
                <AvatarFallback className="bg-[#121212] text-xl font-black uppercase">
                  {displayName[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 p-2 bg-primary rounded-full border border-background">
                {isUploading ? <Loader2 className="w-3 h-3 text-white animate-spin" /> : <Camera className="w-3 h-3 text-white" />}
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
            <p className="mt-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Change Photo</p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic border-l-2 border-primary pl-4">বেসিক ইনফো</h3>
                <div className="grid gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">ডিসপ্লে নাম</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                      <Input 
                        placeholder="নাম দিন" 
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="bg-[#121212] border-white/10 h-12 pl-12 rounded-xl font-bold text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">ফোন নম্বর</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                      <Input 
                        placeholder="01XXXXXXXXX" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-[#121212] border-white/10 h-12 pl-12 rounded-xl font-bold text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic border-l-2 border-primary pl-4">গেমিং ইনফো</h3>
                <div className="grid gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">ইন-গেম নাম</Label>
                    <div className="relative">
                      <Gamepad2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                      <Input 
                        placeholder="E.g. ShadowSlayer" 
                        value={ingameName}
                        onChange={(e) => setIngameName(e.target.value)}
                        className="bg-[#121212] border-white/10 h-12 pl-12 rounded-xl font-bold text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black uppercase text-muted-foreground ml-1">প্লেয়ার আইডি (UID)</Label>
                    <div className="relative">
                      <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                      <Input 
                        placeholder="E.g. 102938475" 
                        value={ingameId}
                        onChange={(e) => setIngameId(e.target.value)}
                        className="bg-[#121212] border-white/10 h-12 pl-12 rounded-xl font-bold font-mono text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isUpdating}
              className="w-full h-14 magma-gradient font-black uppercase italic tracking-widest rounded-xl text-xs shadow-none border-none"
            >
              {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <><CheckCircle2 className="w-4 h-4 mr-2" /> সব সেভ করুন</>
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
