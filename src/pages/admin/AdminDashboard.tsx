import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockUsers } from "@/data/mockUsers";
import { mockClassrooms } from "@/data/mockClassrooms";
import { mockCourses } from "@/data/mockCourses";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Users, School, BookOpen, GraduationCap } from "lucide-react";

const students = mockUsers.filter((u) => u.role === "student");
const teachers = mockUsers.filter((u) => u.role === "teacher");

const weeklyData = [
  { day: "Mon", students: 12 },
  { day: "Tue", students: 18 },
  { day: "Wed", students: 15 },
  { day: "Thu", students: 22 },
  { day: "Fri", students: 20 },
  { day: "Sat", students: 8 },
  { day: "Sun", students: 5 },
];

const recentActivity = [
  { id: 1, text: "Maya Star completed 'Variables Challenge'", time: "2 min ago" },
  { id: 2, text: "Ms. Johnson created assignment 'Loop Practice'", time: "15 min ago" },
  { id: 3, text: "Sam Pixel reached Level 7", time: "1 hr ago" },
  { id: 4, text: "Luna Code earned 'Master Coder' badge", time: "3 hr ago" },
  { id: 5, text: "New student Rio Debug joined Jungle Coders", time: "5 hr ago" },
];

const kpis = [
  { label: "Total Students", value: students.length, icon: Users, color: "text-blue-500" },
  { label: "Teachers", value: teachers.length, icon: GraduationCap, color: "text-green-500" },
  { label: "Classrooms", value: mockClassrooms.length, icon: School, color: "text-purple-500" },
  { label: "Active Courses", value: mockCourses.length, icon: BookOpen, color: "text-orange-500" },
];

const chartConfig = {
  students: { label: "Active Students", color: "hsl(var(--primary))" },
};

const AdminDashboard = () => (
  <AdminLayout>
    <h1 className="font-fredoka text-2xl font-bold mb-6 text-foreground">Dashboard</h1>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi) => (
        <Card key={kpi.label}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`p-2 rounded-lg bg-muted ${kpi.color}`}>
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
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle className="font-fredoka text-base">Weekly Active Students</CardTitle></CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="students" fill="var(--color-students)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="font-fredoka text-base">Recent Activity</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {recentActivity.map((a) => (
            <div key={a.id} className="text-sm border-b border-border pb-2 last:border-0">
              <p className="text-foreground">{a.text}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </AdminLayout>
);

export default AdminDashboard;
