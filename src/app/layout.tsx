
import type {Metadata} from 'next';
import './globals.css';
import { BottomNav } from '@/components/layout/BottomNav';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'IgniteArena | Free Fire Tournament App',
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
        <div className="max-w-md mx-auto min-h-screen bg-background border-x border-border/50 relative">
          {children}
          <BottomNav />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
