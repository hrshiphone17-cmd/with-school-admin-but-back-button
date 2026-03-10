interface DailyStreakProps {
  streak: number;
}

export function DailyStreak({ streak }: DailyStreakProps) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-playful flex items-center gap-4">
      <div className="text-4xl animate-wiggle">🔥</div>
      <div>
        <p className="font-fredoka text-2xl font-bold">{streak} Days</p>
        <p className="text-sm text-muted-foreground">Daily Streak!</p>
      </div>
      <div className="ml-auto flex gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full ${
              i < Math.min(streak, 7) ? "bg-peach" : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
