import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, School, BookOpen, GraduationCap, Loader2 } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classrooms: 0,
    courses: 0,
    schools: 0,
    completions: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [xpData, setXpData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      // Fetch counts in parallel
      const [
        { count: students },
        { count: teachers },
        { count: classrooms },
        { count: courses },
        { count: schools },
        { count: completions },
      ] = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "student"),
        supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "teacher"),
        supabase.from("classrooms").select("*", { count: "exact", head: true }),
        supabase.from("courses").select("*", { count: "exact", head: true }),
        supabase.from("schools").select("*", { count: "exact", head: true }),
        supabase.from("completions").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        students: students || 0,
        teachers: teachers || 0,
        classrooms: classrooms || 0,
        courses: courses || 0,
        schools: schools || 0,
        completions: completions || 0,
      });

      // Recent 5 users joined
      const { data: recent } = await supabase
        .from("users")
        .select("id, name, email, role, avatar, created_at")
        .in("role", ["student", "teacher"])
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentUsers(recent || []);

      // Top 7 students by XP for chart
      const { data: topStudents } = await supabase
        .from("users")
        .select("name, xp")
        .eq("role", "student")
        .order("xp", { ascending: false })
        .limit(7);
      setXpData(
        (topStudents || []).map((s) => ({
          name: s.name.split(" ")[0], // first name only for chart
          xp: s.xp,
        }))
      );

      setLoading(false);
    };

    fetchAll();
  }, []);

  const kpis = [
    { label: "Total Students", value: stats.students, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Teachers", value: stats.teachers, icon: GraduationCap, color: "text-green-500", bg: "bg-green-50" },
    { label: "Schools", value: stats.schools, icon: School, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Active Courses", value: stats.courses, icon: BookOpen, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Classrooms", value: stats.classrooms, icon: School, color: "text-pink-500", bg: "bg-pink-50" },
    { label: "Exercises Completed", value: stats.completions, icon: BookOpen, color: "text-yellow-600", bg: "bg-yellow-50" },
  ];

  return (
    <AdminLayout>
      <h1 className="font-fredoka text-2xl font-bold mb-6 text-foreground">Dashboard</h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {kpis.map((kpi) => (
              <Card key={kpi.label}>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${kpi.bg} ${kpi.color}`}>
                    <kpi.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Students XP Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="font-fredoka text-base">Top Students by XP</CardTitle>
              </CardHeader>
              <CardContent>
                {xpData.length === 0 ? (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                    No student data yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={xpData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Bar dataKey="xp" fill="#6366f1" radius={[4, 4, 0, 0]} name="XP" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Recently Joined */}
            <Card>
              <CardHeader>
                <CardTitle className="font-fredoka text-base">Recently Joined</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No users yet</p>
                ) : (
                  recentUsers.map((u) => (
                    <div key={u.id} className="flex items-center gap-3 border-b border-border pb-2 last:border-0">
                      <span className="text-xl">{u.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{u.role}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;