
import type {Metadata} from 'next';
import './globals.css';
import { BottomNav } from '@/components/layout/BottomNav';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { PushNotificationManager } from '@/components/PushNotificationManager';

export const metadata: Metadata = {
  title: 'Ts Tour | Free Fire Tournament App',
  description: 'High-stakes Free Fire tournaments and AI scouting',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased pb-20 selection:bg-primary/30">
        <FirebaseClientProvider>
          <PushNotificationManager />
          <div className="min-h-screen bg-background relative w-full overflow-x-hidden">
            {children}
            <BottomNav />
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
