import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { globalLeaderboard, weeklyLeaderboard, classroomLeaderboard } from "@/data/mockLeaderboard";
import { useAuth } from "@/contexts/AuthContext";

const tabs = [
  { id: "global", label: "🌍 Global", data: globalLeaderboard },
  { id: "weekly", label: "📅 Weekly", data: weeklyLeaderboard },
  { id: "classroom", label: "🏫 Classroom", data: classroomLeaderboard },
];

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState("global");
  const { user } = useAuth();
  const currentTab = tabs.find((t) => t.id === activeTab)!;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto animate-slide-up">
        <h1 className="font-fredoka text-3xl font-bold mb-2">Leaderboard 🏆</h1>
        <p className="text-muted-foreground mb-6">See who's the top coder!</p>

        {/* Tabs */}
        <div className="flex rounded-2xl bg-muted p-1 gap-1 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-xl py-3 text-center font-semibold transition-all text-sm ${
                activeTab === tab.id ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Top 3 podium */}
        {currentTab.data.length >= 3 && (
          <div className="flex items-end justify-center gap-4 mb-8">
            {[currentTab.data[1], currentTab.data[0], currentTab.data[2]].map((entry, i) => {
              const heights = ["h-24", "h-32", "h-20"];
              const medals = ["🥈", "🥇", "🥉"];
              return (
                <div key={entry.userId} className="flex flex-col items-center">
                  <span className="text-3xl mb-2">{entry.avatar}</span>
                  <span className="text-lg">{medals[i]}</span>
                  <p className="font-fredoka text-sm font-bold text-center truncate max-w-[100px]">{entry.name}</p>
                  <p className="text-xs text-primary font-bold">{entry.xp} XP</p>
                  <div className={`${heights[i]} w-20 bg-primary/20 rounded-t-xl mt-2 flex items-center justify-center`}>
                    <span className="font-fredoka font-bold text-primary">{entry.rank}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full list */}
        <div className="bg-card rounded-2xl shadow-playful divide-y divide-border">
          {currentTab.data.map((entry) => (
            <div
              key={entry.userId}
              className={`flex items-center gap-3 px-4 py-3 ${
                entry.userId === user?.id ? "bg-primary/5" : ""
              }`}
            >
              <span className="font-fredoka font-bold text-lg w-10 text-center">
                {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
              </span>
              <span className="text-2xl">{entry.avatar}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {entry.name} {entry.userId === user?.id && "(You)"}
                </p>
                <p className="text-xs text-muted-foreground">Level {entry.level} • 🔥 {entry.streak}</p>
              </div>
              <span className="font-fredoka font-bold text-primary">{entry.xp} XP</span>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Leaderboard;
