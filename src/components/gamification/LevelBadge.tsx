interface LevelBadgeProps {
  level: number;
  size?: "sm" | "md" | "lg";
}

export function LevelBadge({ level, size = "md" }: LevelBadgeProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-lg",
    lg: "w-16 h-16 text-2xl",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-banana to-peach flex items-center justify-center font-fredoka font-bold shadow-playful`}
    >
      {level}
    </div>
  );
}
