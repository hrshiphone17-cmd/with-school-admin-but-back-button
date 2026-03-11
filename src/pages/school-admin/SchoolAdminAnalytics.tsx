import { useState, useEffect } from "react";
import { SchoolAdminLayout } from "@/components/school-admin/SchoolAdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const SchoolAdminAnalytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCompletions: 0,
    avgXP: 0,
  });
  const [topStudents, setTopStudents] = useState<any[]>([]);
  const [xpData, setXpData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!user?.school_id) return;

      // Get all users in school
      const { data: users } = await supabase
        .from("users")
        .select("*")
        .eq("school_id", user.school_id);

      const students = users?.filter(u => u.role === "student") || [];
      const teachers = users?.filter(u => u.role === "teacher") || [];

      // Get completions for all students in this school
      const studentIds = students.map(s => s.id);
      let completions: any[] = [];
      if (studentIds.length > 0) {
        const { data } = await supabase
          .from("completions")
          .select("*")
          .in("student_id", studentIds);
        completions = data || [];
      }

      const avgXP = students.length > 0
        ? Math.round(students.reduce((sum, s) => sum + (s.xp || 0), 0) / students.length)
        : 0;

      setStats({
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalCompletions: completions.length,
        avgXP,
      });

      // Top 5 students by XP
      const sorted = [...students].sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, 5);
      setTopStudents(sorted);

      // XP distribution chart data
      const brackets = [
        { range: "0-100", min: 0, max: 100 },
        { range: "101-300", min: 101, max: 300 },
        { range: "301-600", min: 301, max: 600 },
        { range: "601-1000", min: 601, max: 1000 },
        { range: "1000+", min: 1001, max: Infinity },
      ];
      setXpData(brackets.map(b => ({
        range: b.range,
        students: students.filter(s => (s.xp || 0) >= b.min && (s.xp || 0) <= b.max).length,
      })));

      setLoading(false);
    };
    fetch();
  }, [user]);

  const statCards = [
    { label: "Total Students", value: stats.totalStudents, icon: "🎒", color: "bg-pastel-blue/30" },
    { label: "Total Teachers", value: stats.totalTeachers, icon: "👩‍🏫", color: "bg-mint/30" },
    { label: "Exercises Completed", value: stats.totalCompletions, icon: "✅", color: "bg-banana/30" },
    { label: "Avg Student XP", value: stats.avgXP, icon: "⭐", color: "bg-peach/30" },
  ];

  return (
    <SchoolAdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="font-fredoka text-3xl font-bold">Analytics 📊</h1>
          <p className="text-muted-foreground">Overview of your school's performance</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-muted rounded-2xl h-28 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((card) => (
                <div key={card.label} className={`${card.color} rounded-2xl p-5`}>
                  <span className="text-3xl block mb-2">{card.icon}</span>
                  <p className="font-bold text-2xl">{card.value}</p>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* XP Distribution chart */}
              <div className="bg-card rounded-2xl p-6 shadow-playful">
                <h2 className="font-fredoka text-xl font-bold mb-4">XP Distribution</h2>
                {xpData.every(d => d.students === 0) ? (
                  <div className="text-center py-10 text-muted-foreground">No XP data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={xpData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="students" fill="#6366f1" radius={[6, 6, 0, 0]} name="Students" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Top students */}
              <div className="bg-card rounded-2xl p-6 shadow-playful">
                <h2 className="font-fredoka text-xl font-bold mb-4">Top Students 🏆</h2>
                {topStudents.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">No students yet</div>
                ) : (
                  <div className="space-y-3">
                    {topStudents.map((student, idx) => (
                      <div key={student.id} className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground w-6">
                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}.`}
                        </span>
                        <span className="text-xl">{student.avatar}</span>
                        <span className="flex-1 font-semibold">{student.name}</span>
                        <span className="text-sm font-bold text-yellow-600">⭐ {student.xp} XP</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </SchoolAdminLayout>
  );
};

export default SchoolAdminAnalytics;