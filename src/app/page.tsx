import { Flame, Users, User, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const modes = [
    {
      id: 'br',
      name: 'BR E-Sports',
      desc: 'Tactical survival matches',
      matches: 24,
      image: PlaceHolderImages.find(img => img.id === 'br-mode')?.imageUrl,
      color: 'hsl(var(--primary))',
    },
    {
      id: 'cs',
      name: 'Clash Squad',
      desc: 'Intense 4v4 team battles',
      matches: 18,
      image: PlaceHolderImages.find(img => img.id === 'cs-mode')?.imageUrl,
      color: 'hsl(var(--secondary))',
    },
    {
      id: 'lw',
      name: 'Lone Wolf',
      desc: 'Pure 1v1 duels',
      matches: 12,
      image: PlaceHolderImages.find(img => img.id === 'lw-mode')?.imageUrl,
      color: '#A855F7',
    }
  ];

  return (
    <div className="p-6 space-y-8">
      <header className="flex items-center justify-between pt-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-bold text-glow">
            IGNITE<span className="text-primary">ARENA</span>
          </h1>
          <p className="text-muted-foreground text-xs uppercase tracking-widest font-semibold">Elite Tournament Hub</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
           <Flame className="text-primary w-6 h-6 animate-pulse" />
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-headline font-bold uppercase tracking-tight">Game Modes</h2>
          <span className="text-xs font-bold text-primary">Live Now</span>
        </div>

        <div className="grid gap-4">
          {modes.map((mode) => (
            <Link href={`/play?mode=${mode.id}`} key={mode.id}>
              <Card className="overflow-hidden group relative border-white/5 hover:border-primary/50 transition-all duration-500 hover:scale-[1.02] shadow-lg bg-card">
                <div className="absolute inset-0 z-0">
                  <Image 
                    src={mode.image || ''} 
                    alt={mode.name}
                    fill
                    className="object-cover opacity-40 group-hover:opacity-60 transition-opacity"
                    data-ai-hint={PlaceHolderImages.find(img => img.id === `${mode.id}-mode`)?.imageHint}
                  />
                  <div className="absolute inset-0 magma-overlay" />
                </div>
                <CardContent className="relative z-10 p-6 flex flex-col justify-end min-h-[140px]">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <Badge className="mb-2 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
                        {mode.matches} Active Matches
                      </Badge>
                      <h3 className="text-2xl font-headline font-bold tracking-tight">{mode.name}</h3>
                      <p className="text-muted-foreground text-sm font-medium">{mode.desc}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center group-hover:bg-primary transition-colors">
                      <ArrowRight className="text-white w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="p-5 rounded-2xl magma-gradient flex items-center justify-between overflow-hidden relative group">
          <div className="relative z-10 space-y-1">
            <h3 className="text-lg font-headline font-bold uppercase text-white leading-tight">Elite Membership</h3>
            <p className="text-white/80 text-xs font-medium max-w-[180px]">Unlock special rewards and faster match entries.</p>
            <button className="mt-2 bg-white text-primary font-bold px-4 py-1.5 rounded-full text-xs hover:bg-white/90 transition-all">
              Join Elite
            </button>
          </div>
          <Flame className="w-24 h-24 absolute -right-4 -bottom-4 text-white/20 group-hover:scale-110 transition-transform" />
        </div>
      </section>
    </div>
  );
}
