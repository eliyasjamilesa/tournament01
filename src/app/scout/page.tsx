"use client";

import { useState } from 'react';
import { Zap, Loader2, MapPin, Sword, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

export default function ScoutPage() {
  const [matchType, setMatchType] = useState('BR E-sports');
  const [gameMetaData, setGameMetaData] = useState('');
  const [result, setResult] = useState<{ dropZoneStrategy: string; weaponStrategy: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Client-side tactical simulation (Replacing Server Action for Static Export)
  const handleScout = () => {
    if (!gameMetaData) return;
    setIsLoading(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      const strategies: Record<string, any> = {
        'BR E-sports': {
          dropZone: `Based on your metadata for ${gameMetaData}, we recommend dropping at central high-loot areas like Pochinok or Peak. Stay near the center of the first zone to minimize rotation risks.`,
          weapon: "Primary: M4A1-III or SCAR-L for stability. Secondary: MP40 or Shotgun for close-range survival in final zones."
        },
        'Clash Squad': {
          dropZone: "Focus on capturing high-ground positions early in the round. Control the center to force enemy rotations.",
          weapon: "Round 1: G18 or Desert Eagle. Advanced Rounds: Woodpecker for long-range pressure or Bizon for aggressive pushes."
        },
        'Lone Wolf': {
          dropZone: "Use walls and covers to close the distance. Avoid open areas.",
          weapon: "Shotgun (M1887) is essential for 1v1 duels. Use Flashbangs to disorient your opponent."
        }
      };

      const selected = strategies[matchType] || strategies['BR E-sports'];
      setResult({
        dropZoneStrategy: selected.dropZone,
        weaponStrategy: selected.weapon
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6 pb-32">
      <header className="space-y-1 pt-4">
        <div className="flex items-center gap-2">
          <Zap className="text-primary w-6 h-6 fill-primary/20" />
          <h1 className="text-2xl font-headline font-black uppercase italic tracking-tight">AI Tactical Scout</h1>
        </div>
        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Elite Strategic Analysis</p>
      </header>

      <Card className="border-white/5 bg-card/50 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Zap className="w-24 h-24 text-primary" />
        </div>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Match Type</Label>
            <Select value={matchType} onValueChange={setMatchType}>
              <SelectTrigger className="bg-background/50 border-white/10 h-12 rounded-xl">
                <SelectValue placeholder="Select Match Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BR E-sports">BR E-sports</SelectItem>
                <SelectItem value="Clash Squad">Clash Squad</SelectItem>
                <SelectItem value="Lone Wolf">Lone Wolf</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Map / Lobby Meta</Label>
            <Input 
              placeholder="e.g. Bermuda, Peak focus..." 
              value={gameMetaData}
              onChange={(e) => setGameMetaData(e.target.value)}
              className="bg-background/50 border-white/10 h-12 rounded-xl font-bold"
            />
            <p className="text-[9px] text-muted-foreground flex items-center gap-1 uppercase font-bold">
              <Info className="w-3 h-3" /> Provide map details for precision
            </p>
          </div>

          <Button 
            onClick={handleScout} 
            disabled={isLoading || !gameMetaData}
            className="w-full h-14 magma-gradient font-black uppercase italic tracking-widest rounded-xl shadow-xl shadow-primary/20 text-sm"
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Battlefield...</>
            ) : (
              'Initiate Tactical Analysis'
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-headline font-black uppercase italic tracking-tight">Tactical Report</h2>
            <Badge variant="outline" className="border-primary text-primary font-black italic tracking-widest text-[8px]">ANALYSIS READY</Badge>
          </div>

          <Card className="border-primary/20 bg-primary/5 shadow-inner rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-primary">
                <MapPin className="w-5 h-5" />
                <CardTitle className="text-xs uppercase font-black italic tracking-widest">Drop Zone Strategy</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-[11px] leading-relaxed text-foreground/90 font-bold uppercase">
                {result.dropZoneStrategy}
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 shadow-inner rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-white">
                <Sword className="w-5 h-5" />
                <CardTitle className="text-xs uppercase font-black italic tracking-widest">Weapon Loadout</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-[11px] leading-relaxed text-foreground/90 font-bold uppercase">
                {result.weaponStrategy}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
