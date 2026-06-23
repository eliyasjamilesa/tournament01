# Ts Tour - Free Fire Tournament App

এই প্রোজেক্টটি সফলভাবে GitHub-এ পুশ করা হয়েছে। এখন GitHub Actions ব্যবহার করে অটোমেটিক APK তৈরি হচ্ছে।

## 📱 অ্যাপ আইকন সেট করার নিয়ম (৩টি ধাপ)

আপনার অ্যাপের নিজস্ব আইকন দিতে নিচের ধাপগুলো অনুসরণ করুন:

১. **ফাইল তৈরি:** আপনার লোগোটি `icon.png` নামে (১০২৪x১০২৪ সাইজ) এবং একটি স্প্ল্যাশ ইমেজ `splash.png` নামে (২৭৩২x২৭৩২ সাইজ) তৈরি করুন।
২. **ফোল্ডার:** প্রজেক্টের একদম বাইরে (Root-এ) `assets` নামে একটি ফোল্ডার খুলে তার ভেতরে ছবি দুটি রাখুন।
৩. **পুশ:** ফাইলগুলো গিটহাবে পুশ করুন। GitHub Actions অটোমেটিক আইকন জেনারেট করে APK বিল্ড করবে।

## 🔔 নোটিফিকেশন সমস্যা সমাধান (google-services.json)
যদি নোটিফিকেশন পারমিশন দিলে অ্যাপ বন্ধ হয়ে যায়, তবে বুঝে নিতে হবে আপনার অ্যান্ড্রয়েড প্রজেক্টে **`google-services.json`** ফাইলটি নেই। এটি পাওয়ার নিয়ম:

১. [Firebase Console](https://console.firebase.google.com/)-এ যান।
২. আপনার প্রজেক্ট সিলেক্ট করে **Project Settings**-এ যান।
৩. **Your apps** সেকশন থেকে অ্যান্ড্রয়েড অ্যাপের জন্য `google-services.json` ফাইলটি ডাউনলোড করুন। (প্যাকেজ নাম: `com.tstour.app`)
৪. ফাইলটি আপনার প্রজেক্টের **`android/app/`** ফোল্ডারে রাখুন এবং গিটহাবে পুশ করুন।

## 🚀 APK ডাউনলোড করার নিয়ম
১. GitHub-এর **Actions** ট্যাবে যান।
২. **"Build Android APK"** ওয়ার্কফ্লোটি সিলেক্ট করুন।
৩. বিল্ড সফল হলে নিচে **Artifacts** সেকশনে `ts-tour-debug-apk` ফাইলটি পাবেন।

## প্রযুক্তিগত তথ্য
- **Frontend:** Next.js 15 (Static Export)
- **Backend:** Firebase Firestore & Auth
- **APK Engine:** Capacitor
- **CI/CD:** GitHub Actions

© Ts Tour Team
