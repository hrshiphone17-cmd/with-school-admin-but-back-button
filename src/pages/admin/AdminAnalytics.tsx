import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Loader2 } from "lucide-react";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899"];

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [completionData, setCompletionData] = useState<any[]>([]);
  const [levelDist, setLevelDist] = useState<any[]>([]);
  const [topStudents, setTopStudents] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalXP: 0, avgXP: 0, totalCompletions: 0 });

  useEffect(() => {
    const fetchAll = async () => {
      // Completions per course
      const { data: courses } = await supabase.from("courses").select("id, title");
      const { data: completions } = await supabase.from("completions").select("*, exercises(module_id, modules(course_id))");

      if (courses && completions) {
        const countByCourse = courses.map((c) => ({
          course: c.title.split(" ")[0], // short name for chart
          completions: completions.filter(
            (cp) => cp.exercises?.modules?.course_id === c.id
          ).length,
        }));
        setCompletionData(countByCourse);
      }

      // Level distribution
      const { data: students } = await supabase
        .from("users")
        .select("level, xp")
        .eq("role", "student");

      if (students) {
        const brackets = [
          { name: "Level 1", count: students.filter((s) => s.level === 1).length },
          { name: "Level 2", count: students.filter((s) => s.level === 2).length },
          { name: "Level 3+", count: students.filter((s) => s.level >= 3).length },
        ];
        setLevelDist(brackets.filter((b) => b.count > 0));

        const totalXP = students.reduce((sum, s) => sum + (s.xp || 0), 0);
        const avgXP = students.length > 0 ? Math.round(totalXP / students.length) : 0;
        setStats({ totalXP, avgXP, totalCompletions: completions?.length || 0 });
      }

      // Top 5 students by XP
      const { data: top } = await supabase
        .from("users")
        .select("name, xp, avatar")
        .eq("role", "student")
        .order("xp", { ascending: false })
        .limit(5);
      setTopStudents(top || []);

      setLoading(false);
    };
    fetchAll();
  }, []);

  return (
    <AdminLayout>
      <h1 className="font-fredoka text-2xl font-bold mb-6 text-foreground">Analytics</h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total XP Earned", value: stats.totalXP },
              { label: "Avg XP per Student", value: stats.avgXP },
              { label: "Total Completions", value: stats.totalCompletions },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-5">
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Completions per course */}
            <Card>
              <CardHeader>
                <CardTitle className="font-fredoka text-base">Completions by Course</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={completionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="course" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="completions" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Level distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="font-fredoka text-base">Student Level Distribution</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                {levelDist.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-10">No data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Tooltip />
                      <Pie data={levelDist} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                        {levelDist.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Top students */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="font-fredoka text-base">Top Students 🏆</CardTitle>
              </CardHeader>
              <CardContent>
                {topStudents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No students yet</p>
                ) : (
                  <div className="space-y-3">
                    {topStudents.map((s, i) => (
                      <div key={i} className="flex items-center gap-3 border-b border-border pb-2 last:border-0">
                        <span className="text-lg font-bold text-muted-foreground w-6">
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                        </span>
                        <span className="text-xl">{s.avatar}</span>
                        <span className="flex-1 font-semibold">{s.name}</span>
                        <span className="text-sm font-bold text-yellow-600">⭐ {s.xp} XP</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminAnalytics;