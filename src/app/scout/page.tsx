
"use client";

import { useState } from 'react';
import { Zap, Loader2, MapPin, Sword, Info } from 'lucide-react';
import { aiTacticalScout, AiTacticalScoutOutput } from '@/ai/flows/ai-tactical-scout-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

export default function ScoutPage() {
  const [matchType, setMatchType] = useState('BR E-sports');
  const [gameMetaData, setGameMetaData] = useState('');
  const [result, setResult] = useState<AiTacticalScoutOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleScout = async () => {
    if (!gameMetaData) return;
    setIsLoading(true);
    try {
      const output = await aiTacticalScout({ matchType, gameMetaData });
      setResult(output);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-1 pt-4">
        <div className="flex items-center gap-2">
          <Zap className="text-primary w-6 h-6 fill-primary/20" />
          <h1 className="text-2xl font-headline font-bold uppercase tracking-tight">AI Tactical Scout</h1>
        </div>
        <p className="text-muted-foreground text-sm font-medium">GenAI strategic analysis for peak performance.</p>
      </header>

      <Card className="border-white/5 bg-card/50 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Zap className="w-24 h-24 text-primary" />
        </div>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Match Type</Label>
            <Select value={matchType} onValueChange={setMatchType}>
              <SelectTrigger className="bg-background/50 border-white/10">
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
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Map / Lobby Meta</Label>
            <Input 
              placeholder="e.g. Bermuda, Heavy player density in north..." 
              value={gameMetaData}
              onChange={(e) => setGameMetaData(e.target.value)}
              className="bg-background/50 border-white/10"
            />
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Info className="w-3 h-3" /> Provide map details for better strategy
            </p>
          </div>

          <Button 
            onClick={handleScout} 
            disabled={isLoading || !gameMetaData}
            className="w-full font-headline font-bold uppercase tracking-widest h-12 magma-gradient hover:opacity-90 transition-all border-none"
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
            ) : (
              'Initiate Scouting'
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-headline font-bold uppercase tracking-tight">Scout Report</h2>
            <Badge variant="outline" className="border-primary text-primary font-bold">LATEST</Badge>
          </div>

          <Card className="border-primary/20 bg-primary/5 shadow-inner">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-primary">
                <MapPin className="w-5 h-5" />
                <CardTitle className="text-sm uppercase font-bold tracking-wider">Drop Zone Strategy</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground/90 font-medium">
                {result.dropZoneStrategy}
              </p>
            </CardContent>
          </Card>

          <Card className="border-secondary/20 bg-secondary/5 shadow-inner">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-secondary">
                <Sword className="w-5 h-5" />
                <CardTitle className="text-sm uppercase font-bold tracking-wider">Weapon Strategy</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground/90 font-medium">
                {result.weaponStrategy}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
