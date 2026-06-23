
# Ts Tour - Free Fire Tournament App

এই প্রোজেক্টটি সফলভাবে GitHub-এ পুশ করা হয়েছে। এখন GitHub Actions ব্যবহার করে অটোমেটিক APK তৈরি হচ্ছে।

## APK ডাউনলোড করার নিয়ম

১. এই রিপোজিটরির **Actions** ট্যাবে যান।
২. **"Build Android APK"** ওয়ার্কফ্লোটি সিলেক্ট করুন।
৩. বিল্ড সফল হলে (সবুজ টিক ✅ আসলে), ওই রানটির ভেতরে প্রবেশ করুন।
৪. নিচে **Artifacts** সেকশনে `ts-tour-debug-apk` নামে একটি জিপ ফাইল পাবেন। সেটি ডাউনলোড করে আনজিপ করলেই আপনার **APK** ফাইলটি পেয়ে যাবেন।

## প্রোজেক্ট আপডেট করার নিয়ম (ভবিষ্যতে)

আপনি যদি কোডে কোনো পরিবর্তন করেন, তবে নিচের কমান্ডগুলো দিয়ে আবার GitHub-এ পুশ করবেন:
```bash
git add .
git commit -m "Update features"
git push origin main
```
পুশ করার সাথে সাথে আবার নতুন APK বিল্ড হওয়া শুরু হবে।

## প্রযুক্তিগত তথ্য
- **Frontend:** Next.js 15 (Static Export)
- **Backend:** Firebase Firestore & Auth
- **APK Engine:** Capacitor
- **CI/CD:** GitHub Actions

© Ts Tour Team
