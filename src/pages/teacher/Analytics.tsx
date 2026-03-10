import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { mockUsers } from "@/data/mockUsers";
import { mockClassrooms, mockAssignments } from "@/data/mockClassrooms";
import { useAuth } from "@/contexts/AuthContext";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const COLORS = ["#B5EAD7", "#A8D8EA", "#FFF9B0", "#FFD5CD", "#C3AED6"];

const classWeeklyData: Record<string, { day: string; active: number; exercises: number }[]> = {
  c1: [
    { day: "Mon", active: 3, exercises: 10 },
    { day: "Tue", active: 2, exercises: 6 },
    { day: "Wed", active: 4, exercises: 14 },
    { day: "Thu", active: 3, exercises: 9 },
    { day: "Fri", active: 4, exercises: 16 },
    { day: "Sat", active: 1, exercises: 3 },
    { day: "Sun", active: 1, exercises: 2 },
  ],
  c2: [
    { day: "Mon", active: 2, exercises: 5 },
    { day: "Tue", active: 1, exercises: 3 },
    { day: "Wed", active: 2, exercises: 7 },
    { day: "Thu", active: 2, exercises: 6 },
    { day: "Fri", active: 2, exercises: 8 },
    { day: "Sat", active: 1, exercises: 2 },
    { day: "Sun", active: 0, exercises: 1 },
  ],
};

const classEngagement: Record<string, { completion: string; avgDays: string; avgSession: string; satisfaction: string }> = {
  c1: { completion: "85%", avgDays: "4.0", avgSession: "13min", satisfaction: "92%" },
  c2: { completion: "90%", avgDays: "4.5", avgSession: "11min", satisfaction: "96%" },
};

const Analytics = () => {
  const { user } = useAuth();
  const myClassrooms = mockClassrooms.filter((c) => c.teacherId === user?.id);
  const [selectedClassId, setSelectedClassId] = useState(myClassrooms[0]?.id || "");

  const selectedClass = myClassrooms.find((c) => c.id === selectedClassId);
  const classStudents = mockUsers.filter((u) => selectedClass?.studentIds.includes(u.id));
  const classAssignments = mockAssignments.filter((a) => a.classroomId === selectedClassId);

  const progressData = classStudents.map((u) => ({
    name: u.name.split(" ")[0],
    xp: u.xp,
    level: u.level,
  }));

  const totalCompletions = classAssignments.reduce((sum, a) => sum + a.completions.length, 0);
  const totalPossible = classAssignments.reduce((sum, a) => sum + (selectedClass?.studentIds.length || 0), 0);

  const assignmentData = classAssignments.map((a) => ({
    name: a.title.length > 15 ? a.title.slice(0, 15) + "…" : a.title,
    completed: a.completions.length,
    total: selectedClass?.studentIds.length || 0,
  }));

  const weeklyData = classWeeklyData[selectedClassId] || classWeeklyData.c1;
  const engagement = classEngagement[selectedClassId] || classEngagement.c1;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto animate-slide-up">
        <h1 className="font-fredoka text-3xl font-bold mb-2">Analytics 📊</h1>
        <p className="text-muted-foreground mb-6">Track student progress and engagement</p>

        {/* Class selector tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {myClassrooms.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedClassId(c.id)}
              className={`px-5 py-2.5 rounded-xl font-fredoka font-semibold text-sm transition-all ${
                selectedClassId === c.id
                  ? "bg-primary text-primary-foreground shadow-playful"
                  : "bg-card text-muted-foreground hover:bg-accent"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-pastel-blue rounded-2xl p-4 text-center shadow-playful">
            <p className="font-fredoka text-2xl font-bold">{classStudents.length}</p>
            <p className="text-xs text-muted-foreground">Students</p>
          </div>
          <div className="bg-mint rounded-2xl p-4 text-center shadow-playful">
            <p className="font-fredoka text-2xl font-bold">{classAssignments.length}</p>
            <p className="text-xs text-muted-foreground">Assignments</p>
          </div>
          <div className="bg-banana rounded-2xl p-4 text-center shadow-playful">
            <p className="font-fredoka text-2xl font-bold">{totalCompletions}</p>
            <p className="text-xs text-muted-foreground">Completions</p>
          </div>
          <div className="bg-peach rounded-2xl p-4 text-center shadow-playful">
            <p className="font-fredoka text-2xl font-bold">
              {totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Completion Rate</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student XP */}
          <div className="bg-card rounded-2xl p-5 shadow-playful">
            <h3 className="font-fredoka text-lg font-bold mb-4">Student XP Progress</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="xp" fill="hsl(270, 40%, 72%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Assignment completion */}
          <div className="bg-card rounded-2xl p-5 shadow-playful">
            <h3 className="font-fredoka text-lg font-bold mb-4">Assignment Completion</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={assignmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#B5EAD7" radius={[8, 8, 0, 0]} name="Completed" />
                <Bar dataKey="total" fill="#A8D8EA" radius={[8, 8, 0, 0]} name="Total Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Activity */}
          <div className="bg-card rounded-2xl p-5 shadow-playful">
            <h3 className="font-fredoka text-lg font-bold mb-4">Weekly Activity</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="active" stroke="hsl(200, 60%, 65%)" strokeWidth={3} name="Active Students" />
                <Line type="monotone" dataKey="exercises" stroke="hsl(150, 50%, 62%)" strokeWidth={3} name="Exercises Done" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Engagement stats */}
          <div className="bg-card rounded-2xl p-5 shadow-playful">
            <h3 className="font-fredoka text-lg font-bold mb-4">Engagement Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-pastel-blue rounded-xl p-4 text-center">
                <p className="font-fredoka text-2xl font-bold">{engagement.completion}</p>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
              </div>
              <div className="bg-mint rounded-xl p-4 text-center">
                <p className="font-fredoka text-2xl font-bold">{engagement.avgDays}</p>
                <p className="text-xs text-muted-foreground">Avg. Days/Week</p>
              </div>
              <div className="bg-banana rounded-xl p-4 text-center">
                <p className="font-fredoka text-2xl font-bold">{engagement.avgSession}</p>
                <p className="text-xs text-muted-foreground">Avg. Session</p>
              </div>
              <div className="bg-peach rounded-xl p-4 text-center">
                <p className="font-fredoka text-2xl font-bold">{engagement.satisfaction}</p>
                <p className="text-xs text-muted-foreground">Satisfaction</p>
              </div>
            </div>
          </div>

          {/* Student roster table */}
          <div className="bg-card rounded-2xl p-5 shadow-playful lg:col-span-2">
            <h3 className="font-fredoka text-lg font-bold mb-4">Student Overview</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 px-3">Student</th>
                    <th className="text-center py-2 px-3">Level</th>
                    <th className="text-center py-2 px-3">XP</th>
                    <th className="text-center py-2 px-3">Achievements</th>
                    <th className="text-center py-2 px-3">Assignments Done</th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map((student) => {
                    const doneCount = classAssignments.filter((a) =>
                      a.completions.some((comp) => comp.studentId === student.id)
                    ).length;
                    return (
                      <tr key={student.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                        <td className="py-3 px-3 flex items-center gap-2">
                          <span className="text-xl">{student.avatar}</span>
                          <span className="font-semibold">{student.name}</span>
                        </td>
                        <td className="text-center py-3 px-3">
                          <span className="bg-primary/15 text-primary font-bold px-2 py-0.5 rounded-full text-xs">
                            Lv.{student.level}
                          </span>
                        </td>
                        <td className="text-center py-3 px-3 font-semibold">{student.xp.toLocaleString()}</td>
                        <td className="text-center py-3 px-3">{student.achievements.length} 🏆</td>
                        <td className="text-center py-3 px-3">
                          {doneCount}/{classAssignments.length}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Analytics;
