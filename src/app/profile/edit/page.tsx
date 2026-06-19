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
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;

    setIsUpdating(true);
    try {
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
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col w-full text-white">
      <header className="px-6 py-4 flex items-center gap-4 border-b border-[#111111] bg-[#000000] sticky top-0 z-50">
        <button 
          onClick={() => router.push('/profile')}
          className="p-2 rounded-lg bg-[#111111] text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold uppercase tracking-tight">Edit Profile</h1>
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Update Info</p>
        </div>
      </header>

      <main className="flex-1 pb-20">
        <div className="p-6 max-w-md mx-auto w-full space-y-10">
          <div className="flex flex-col items-center">
            <div 
              className="relative w-24 h-24 bg-[#111111] rounded-full flex items-center justify-center overflow-hidden border border-[#222222]" 
              onClick={() => fileInputRef.current?.click()}
            >
              {photoURL ? (
                <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-gray-600" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
            {isUploading && <p className="mt-2 text-[10px] text-red-600 font-bold uppercase">Uploading...</p>}
          </div>

          <form onSubmit={handleUpdate} className="space-y-8">
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-600 border-l-2 border-red-600 pl-3">Basic Info</h3>
                
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-gray-500">Display Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-600" />
                    <Input 
                      placeholder="Enter your name" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-[#111111] border-[#222222] h-12 pl-12 rounded-xl focus:border-red-600 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-gray-500">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-600" />
                    <Input 
                      placeholder="01XXXXXXXXX" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-[#111111] border-[#222222] h-12 pl-12 rounded-xl focus:border-red-600 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-600 border-l-2 border-red-600 pl-3">Gaming Info</h3>
                
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-gray-500">In-game Name</Label>
                  <div className="relative">
                    <Gamepad2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-600" />
                    <Input 
                      placeholder="E.g. ShadowSlayer" 
                      value={ingameName}
                      onChange={(e) => setIngameName(e.target.value)}
                      className="bg-[#111111] border-[#222222] h-12 pl-12 rounded-xl focus:border-red-600 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-gray-500">Player UID</Label>
                  <div className="relative">
                    <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-600" />
                    <Input 
                      placeholder="E.g. 102938475" 
                      value={ingameId}
                      onChange={(e) => setIngameId(e.target.value)}
                      className="bg-[#111111] border-[#222222] h-12 pl-12 rounded-xl font-mono focus:border-red-600 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isUpdating}
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest rounded-xl"
            >
              {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <><CheckCircle2 className="w-4 h-4 mr-2" /> Save Profile</>
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
