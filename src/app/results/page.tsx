import { Trophy, Medal, Star, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function ResultsPage() {
  const leaderboards = [
    { rank: 1, name: 'ShadowSlayer', kills: 42, wins: 8, points: 1250 },
    { rank: 2, name: 'PyroGamer', kills: 38, wins: 6, points: 1100 },
    { rank: 3, name: 'FrostBite', kills: 35, wins: 5, points: 980 },
    { rank: 4, name: 'VortexOne', kills: 31, wins: 4, points: 850 },
  ];

  const recentMatches = [
    { id: 1, title: 'Sunday Clash', winner: 'Team Alpha', prize: '$100', date: '2h ago' },
    { id: 2, title: 'Midnight BR', winner: 'ViperX', prize: '$50', date: '5h ago' },
    { id: 3, title: 'Elite Duels', winner: 'KageZ', prize: '$20', date: '1d ago' },
  ];

  return (
    <div className="p-6 space-y-8">
      <header className="space-y-1 pt-4">
        <h1 className="text-2xl font-headline font-bold uppercase tracking-tight">Hall of Flame</h1>
        <p className="text-muted-foreground text-sm font-medium">Top performers and recent winners.</p>
      </header>

      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
          <Medal className="w-4 h-4" /> Season Ranking
        </h2>
        <Card className="border-white/5 bg-card shadow-xl overflow-hidden">
          <div className="bg-primary/10 p-4 flex items-center justify-between border-b border-white/5">
             <div className="flex items-center gap-3">
               <Trophy className="text-primary w-5 h-5" />
               <span className="font-headline font-bold uppercase text-xs tracking-wider">Top Global Elites</span>
             </div>
             <span className="text-[10px] font-bold text-muted-foreground">REFRESHES IN 2D</span>
          </div>
          <CardContent className="p-0">
            {leaderboards.map((player) => (
              <div key={player.rank} className="p-4 flex items-center justify-between border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <span className={`w-6 text-center font-headline font-bold ${player.rank === 1 ? 'text-primary' : player.rank === 2 ? 'text-secondary' : 'text-muted-foreground'}`}>
                    {player.rank}
                  </span>
                  <Avatar className="w-8 h-8 border border-white/10">
                    <AvatarImage src={`https://picsum.photos/seed/${player.name}/100/100`} />
                    <AvatarFallback>{player.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{player.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{player.kills} KILLS • {player.wins} WINS</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-primary">
                    <Star className="w-3 h-3 fill-primary" />
                    <span className="font-headline font-bold text-sm">{player.points}</span>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">PTS</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          Recent Victories
        </h2>
        <div className="grid gap-3">
          {recentMatches.map((match) => (
            <div key={match.id} className="bg-card border border-white/5 rounded-xl p-4 flex items-center justify-between hover:border-primary/20 transition-all">
              <div className="space-y-1">
                <h4 className="font-bold text-sm">{match.title}</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] h-4 bg-primary/20 text-primary border-none">WINNER: {match.winner}</Badge>
                  <span className="text-[10px] font-bold text-muted-foreground">{match.date}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-primary font-headline font-bold text-sm">{match.prize}</span>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
