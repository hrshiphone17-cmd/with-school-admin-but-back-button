import { Progress } from "@/components/ui/progress";

interface XPProgressBarProps {
  currentXP: number;
  level: number;
  xpForNextLevel?: number;
}

export function XPProgressBar({ currentXP, level, xpForNextLevel = 500 }: XPProgressBarProps) {
  const xpInCurrentLevel = currentXP % xpForNextLevel;
  const percentage = (xpInCurrentLevel / xpForNextLevel) * 100;

  return (
    <div className="bg-card rounded-2xl p-4 shadow-playful">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          <span className="font-fredoka text-lg font-bold">Level {level}</span>
        </div>
        <span className="text-sm font-semibold text-muted-foreground">
          {xpInCurrentLevel} / {xpForNextLevel} XP
        </span>
      </div>
      <div className="relative">
        <Progress value={percentage} className="h-4 rounded-full bg-muted [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-pastel-purple [&>div]:rounded-full" />
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {xpForNextLevel - xpInCurrentLevel} XP to Level {level + 1}
      </p>
    </div>
  );
}
