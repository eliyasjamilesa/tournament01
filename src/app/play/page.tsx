
"use client";

import { useState } from 'react';
import { Timer, Users, Trophy, ChevronRight, Search, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

export default function PlayPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const tournaments = [
    { id: 1, title: 'Bermuda King Pro', mode: 'BR', entry: 'Free', pool: '$500', players: '42/50', status: 'Live', time: 'Started 12m ago' },
    { id: 2, title: 'Squad Chaos Cup', mode: 'CS', entry: '10 Coins', pool: '$200', players: '12/16', status: 'Lobby', time: 'Starts in 5m' },
    { id: 3, title: 'Lone Survivor', mode: 'LW', entry: '5 Coins', pool: '$100', players: '8/20', status: 'Lobby', time: 'Starts in 15m' },
    { id: 4, title: 'Purgatory Masters', mode: 'BR', entry: 'Free', pool: '$300', players: '30/50', status: 'Lobby', time: 'Starts in 30m' },
  ];

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-headline font-bold uppercase tracking-tight">Active Arenas</h1>
          <Badge className="bg-secondary/20 text-secondary border-secondary/30">Lobbies: 14</Badge>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search tournaments..." className="pl-9 bg-card border-white/5" />
          </div>
          <Button variant="outline" size="icon" className="border-white/5 bg-card">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="space-y-4">
        {tournaments.map((t) => (
          <Card key={t.id} className="border-white/5 bg-card/60 overflow-hidden hover:border-primary/30 transition-all">
            <CardContent className="p-0">
              <div className="p-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${t.status === 'Live' ? 'bg-primary pulse-glow' : 'bg-green-500'}`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t.status} • {t.time}</span>
                </div>
                <Badge variant="outline" className="border-white/10 text-[10px] font-bold">{t.mode}</Badge>
              </div>
              <div className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-headline font-bold text-lg">{t.title}</h3>
                  <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {t.players}</span>
                    <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-primary" /> {t.pool}</span>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className={t.status === 'Live' ? 'bg-muted' : 'bg-primary hover:bg-primary/90'}>
                      {t.status === 'Live' ? 'Spectate' : 'Join'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-white/10">
                    <DialogHeader>
                      <DialogTitle className="font-headline font-bold text-xl uppercase">Register for Tournament</DialogTitle>
                      <DialogDescription className="font-medium">
                        Confirm your squad details for <span className="text-primary">{t.title}</span>.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="playerId">Your Player ID</Label>
                        <Input id="playerId" placeholder="e.g. 293849102" className="bg-background border-white/10" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="squad">Squad Name</Label>
                        <Input id="squad" placeholder="Team Inferno" className="bg-background border-white/10" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button className="w-full magma-gradient font-bold uppercase" onClick={() => setIsRegistering(true)}>
                        Confirm Entry
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
