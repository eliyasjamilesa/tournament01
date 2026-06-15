
"use client";

import { Swords, Calendar, Users, ChevronRight, LayoutGrid } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function JoinedPage() {
  const joinedTournaments = [
    { 
      id: 1, 
      title: 'Bermuda King Pro', 
      mode: 'BR', 
      status: 'In Progress', 
      startTime: 'Started 20m ago',
      squad: 'Team Inferno',
      position: '#12 / 50'
    },
    { 
      id: 2, 
      title: 'Squad Chaos Cup', 
      mode: 'CS', 
      status: 'Lobby', 
      startTime: 'Starting in 5m',
      squad: 'Team Inferno',
      position: '-'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-1 pt-4">
        <h1 className="text-2xl font-headline font-bold uppercase tracking-tight">My Arena</h1>
        <p className="text-muted-foreground text-sm font-medium">Tournaments you are currently registered for.</p>
      </header>

      {joinedTournaments.length > 0 ? (
        <div className="space-y-4">
          {joinedTournaments.map((t) => (
            <Card key={t.id} className="border-white/5 bg-card/60 overflow-hidden hover:border-primary/30 transition-all">
              <CardContent className="p-0">
                <div className="p-4 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${t.status === 'In Progress' ? 'bg-primary pulse-glow' : 'bg-green-500'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t.status} • {t.startTime}</span>
                  </div>
                  <Badge variant="outline" className="border-white/10 text-[10px] font-bold">{t.mode}</Badge>
                </div>
                <div className="p-5 flex items-center justify-between">
                  <div className="space-y-2">
                    <h3 className="font-headline font-bold text-lg">{t.title}</h3>
                    <div className="flex flex-col gap-1">
                       <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                         <Users className="w-3 h-3" /> Squad: <span className="text-foreground">{t.squad}</span>
                       </span>
                       {t.position !== '-' && (
                         <span className="text-[10px] font-bold uppercase text-primary tracking-wider flex items-center gap-1">
                           <LayoutGrid className="w-3 h-3" /> Current Rank: {t.position}
                         </span>
                       )}
                    </div>
                  </div>
                  <Button size="sm" variant={t.status === 'In Progress' ? 'default' : 'outline'} className="font-bold uppercase text-[10px]">
                    {t.status === 'In Progress' ? 'Enter Match' : 'Lobby Info'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="font-headline font-bold text-lg">No Joined Arenas</h3>
            <p className="text-muted-foreground text-sm max-w-[200px] mx-auto">Explore active tournaments and join the battle!</p>
          </div>
          <Button asChild className="magma-gradient border-none font-bold uppercase">
            <a href="/play">Find Tournaments</a>
          </Button>
        </div>
      )}
    </div>
  );
}
