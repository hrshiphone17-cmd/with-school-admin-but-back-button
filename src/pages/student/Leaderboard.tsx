import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const Leaderboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("global");
  const [globalData, setGlobalData] = useState<any[]>([]);
  const [classroomData, setClassroomData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      // Global leaderboard — top 20 students by XP
      const { data: globalUsers } = await supabase
        .from("users")
        .select("id, name, avatar, xp, level, streak")
        .eq("role", "student")
        .order("xp", { ascending: false })
        .limit(20);
      setGlobalData(
        (globalUsers || []).map((u, i) => ({ ...u, rank: i + 1 }))
      );

      // Classroom leaderboard — students in same classroom
      const { data: memberData } = await supabase
        .from("classroom_students")
        .select("classroom_id")
        .eq("student_id", user.id)
        .single();

      if (memberData) {
        const { data: classmates } = await supabase
          .from("classroom_students")
          .select("student_id")
          .eq("classroom_id", memberData.classroom_id);

        if (classmates && classmates.length > 0) {
          const ids = classmates.map((c) => c.student_id);
          const { data: classmateUsers } = await supabase
            .from("users")
            .select("id, name, avatar, xp, level, streak")
            .in("id", ids)
            .order("xp", { ascending: false });
          setClassroomData(
            (classmateUsers || []).map((u, i) => ({ ...u, rank: i + 1 }))
          );
        }
      }

      setLoading(false);
    };
    fetchData();
  }, [user]);

  const tabs = [
    { id: "global", label: "🌍 Global", data: globalData },
    { id: "classroom", label: "🏫 Classroom", data: classroomData },
  ];

  const currentData = tabs.find((t) => t.id === activeTab)?.data || [];

  const renderEntry = (entry: any) => (
    <div
      key={entry.id}
      className={`flex items-center gap-3 px-4 py-3 ${
        entry.id === user?.id ? "bg-primary/5" : ""
      }`}
    >
      <span className="font-fredoka font-bold text-lg w-10 text-center">
        {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
      </span>
      <span className="text-2xl">{entry.avatar}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">
          {entry.name} {entry.id === user?.id && <span className="text-primary">(You)</span>}
        </p>
        <p className="text-xs text-muted-foreground">
          Level {entry.level} • 🔥 {entry.streak}
        </p>
      </div>
      <span className="font-fredoka font-bold text-primary">{entry.xp} XP</span>
    </div>
  );

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
                activeTab === tab.id
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-muted rounded-2xl h-16 animate-pulse" />
            ))}
          </div>
        ) : currentData.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl block mb-4">🏆</span>
            <h2 className="font-fredoka text-2xl font-bold mb-2">No data yet</h2>
            <p className="text-muted-foreground">
              {activeTab === "classroom"
                ? "Join a classroom to see your classmates here"
                : "Complete exercises to appear on the leaderboard"}
            </p>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {currentData.length >= 3 && (
              <div className="flex items-end justify-center gap-4 mb-8">
                {[currentData[1], currentData[0], currentData[2]].map((entry, i) => {
                  const heights = ["h-24", "h-32", "h-20"];
                  const medals = ["🥈", "🥇", "🥉"];
                  return (
                    <div key={entry.id} className="flex flex-col items-center">
                      <span className="text-3xl mb-2">{entry.avatar}</span>
                      <span className="text-lg">{medals[i]}</span>
                      <p className="font-fredoka text-sm font-bold text-center truncate max-w-[100px]">
                        {entry.name}
                      </p>
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
              {currentData.map(renderEntry)}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Leaderboard;