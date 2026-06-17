# Ignite Arena - Free Fire Tournament App

এই অ্যাপটি Next.js, Firebase এবং Capacitor ব্যবহার করে তৈরি করা হয়েছে। আপনি খুব সহজেই GitHub Actions ব্যবহার করে এই অ্যাপটির APK বিল্ড করতে পারবেন।

## GitHub-এ কোড পুশ করার নিয়ম

আপনি যদি আপনার পিসি থেকে GitHub-এ কোড পুশ করতে চান, তবে নিচের কমান্ডগুলো ব্যবহার করুন:

1. প্রথমে আপনার প্রোজেক্ট ফোল্ডারে টার্মিনাল ওপেন করুন।
2. গিট ইনিশিয়ালাইজ করুন (যদি আগে না করা থাকে):
   ```bash
   git init
   ```
3. আপনার GitHub রিপোজিটরি কানেক্ট করুন:
   ```bash
   git remote add origin https://github.com/আপনার-ইউজারনেম/আপনার-রিপোজিটরির-নাম.git
   ```
4. সব ফাইল অ্যাড করুন:
   ```bash
   git add .
   ```
5. একটি কমেন্টসহ সেভ করুন:
   ```bash
   git commit -m "Initial commit for APK build"
   ```
6. GitHub-এ পাঠিয়ে দিন:
   ```bash
   git push -u origin main
   ```

### যদি `Rejected` বা `unmerged files` এরর দেখায় (সমাধান):
যদি পুশ করার সময় এরর দেয়, তবে নিচের কমান্ডগুলো দিয়ে জোরপূর্বক পুশ করুন:
```bash
git add .
git commit -m "Fixing conflicts"
git push -u origin main --force
```

## অটোমেটিক APK বিল্ড করার নিয়ম

১. কোডটি GitHub-এ পুশ করার পর, আপনার রিপোজিটরির **Actions** ট্যাবে যান।
২. সেখানে **"Build Android APK"** নামে একটি প্রসেস দেখতে পাবেন। এটি শেষ হওয়া পর্যন্ত অপেক্ষা করুন।
৩. প্রসেসটি সফলভাবে শেষ হলে (সবুজ টিক মার্ক আসলে), ওই প্রসেসটির ভেতরে ক্লিক করুন।
৪. নিচে **Artifacts** সেকশনে `ignite-arena-debug-apk` নামে একটি ফাইল পাবেন। সেটি ডাউনলোড করুন।
৫. জিপ ফাইলটি আনজিপ করলে আপনি আপনার **APK** ফাইলটি পেয়ে যাবেন।

## প্রযুক্তিগত তথ্য
- **Frontend:** Next.js 15 (App Router)
- **Database:** Firebase Firestore
- **Auth:** Firebase Authentication
- **APK Builder:** Capacitor with GitHub Actions
- **AI:** Genkit AI for Tactical Scouting

© Ignite Arena Team
