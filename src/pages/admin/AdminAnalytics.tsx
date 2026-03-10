import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid } from "recharts";

const dauData = [
  { date: "Mar 1", users: 28 }, { date: "Mar 2", users: 35 }, { date: "Mar 3", users: 32 },
  { date: "Mar 4", users: 40 }, { date: "Mar 5", users: 38 }, { date: "Mar 6", users: 15 },
  { date: "Mar 7", users: 12 }, { date: "Mar 8", users: 42 }, { date: "Mar 9", users: 45 },
];

const completionData = [
  { course: "Fox's Steps", rate: 62 },
  { course: "Variables", rate: 33 },
  { course: "Conditions", rate: 0 },
  { course: "Functions", rate: 0 },
];

const levelDist = [
  { name: "1-3", value: 1 }, { name: "4-6", value: 1 },
  { name: "7-9", value: 1 }, { name: "10-13", value: 2 },
];
const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "hsl(var(--destructive))"];

const dauConfig = { users: { label: "Daily Active Users", color: "hsl(var(--primary))" } };
const compConfig = { rate: { label: "Completion %", color: "hsl(var(--accent))" } };
const pieConfig = { value: { label: "Students" } };

const AdminAnalytics = () => (
  <AdminLayout>
    <h1 className="font-fredoka text-2xl font-bold mb-6 text-foreground">Analytics</h1>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle className="font-fredoka text-base">Daily Active Users</CardTitle></CardHeader>
        <CardContent>
          <ChartContainer config={dauConfig} className="h-[250px] w-full">
            <LineChart data={dauData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="users" stroke="var(--color-users)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="font-fredoka text-base">Course Completion Rate</CardTitle></CardHeader>
        <CardContent>
          <ChartContainer config={compConfig} className="h-[250px] w-full">
            <BarChart data={completionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="course" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} unit="%" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="rate" fill="var(--color-rate)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader><CardTitle className="font-fredoka text-base">Student Level Distribution</CardTitle></CardHeader>
        <CardContent className="flex justify-center">
          <ChartContainer config={pieConfig} className="h-[280px] w-full max-w-md">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie data={levelDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {levelDist.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  </AdminLayout>
);

export default AdminAnalytics;
