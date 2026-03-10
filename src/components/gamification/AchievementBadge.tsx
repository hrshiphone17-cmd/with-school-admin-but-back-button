interface AchievementBadgeProps {
  id: string;
  unlocked?: boolean;
}

const achievementData: Record<string, { emoji: string; title: string; desc: string }> = {
  "first-code": { emoji: "💻", title: "First Code", desc: "Wrote your first line!" },
  "streak-5": { emoji: "🔥", title: "On Fire", desc: "5-day streak!" },
  "streak-10": { emoji: "🌟", title: "Blazing", desc: "10-day streak!" },
  "streak-20": { emoji: "💎", title: "Unstoppable", desc: "20-day streak!" },
  "banana-collector": { emoji: "🍌", title: "Banana Fan", desc: "Collected 50 bananas!" },
  "speed-coder": { emoji: "⚡", title: "Speed Coder", desc: "Finished in under 1 min!" },
  "level-10": { emoji: "🏆", title: "Level 10", desc: "Reached level 10!" },
  "master-coder": { emoji: "👑", title: "Master Coder", desc: "Completed all courses!" },
  "bug-squasher": { emoji: "🐛", title: "Bug Squasher", desc: "Fixed 10 bugs!" },
};

export function AchievementBadge({ id, unlocked = true }: AchievementBadgeProps) {
  const data = achievementData[id] || { emoji: "❓", title: "Unknown", desc: "" };

  return (
    <div
      className={`rounded-2xl p-3 text-center transition-all ${
        unlocked
          ? "bg-card shadow-playful hover:scale-105 cursor-default"
          : "bg-muted opacity-50 grayscale"
      }`}
    >
      <span className={`text-3xl block mb-1 ${unlocked ? "" : "grayscale"}`}>{data.emoji}</span>
      <p className="font-fredoka text-xs font-bold truncate">{data.title}</p>
    </div>
  );
}

export { achievementData };
