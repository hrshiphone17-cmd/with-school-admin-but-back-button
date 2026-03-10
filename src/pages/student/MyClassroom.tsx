import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const MyClassroom = () => {
  const { user } = useAuth();
  const [classroom, setClassroom] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState("");

  const fetchClassroom = async () => {
    if (!user) return;

    // Check if student is in a classroom
    const { data: memberData } = await supabase
      .from("classroom_students")
      .select("classroom_id")
      .eq("student_id", user.id)
      .single();

    if (!memberData) { setLoading(false); return; }

    // Fetch classroom details
    const { data: classroomData } = await supabase
      .from("classrooms")
      .select("*")
      .eq("id", memberData.classroom_id)
      .single();

    if (classroomData) {
      setClassroom(classroomData);

      // Fetch all students in classroom
      const { data: studentLinks } = await supabase
        .from("classroom_students")
        .select("student_id")
        .eq("classroom_id", classroomData.id);

      if (studentLinks) {
        const studentIds = studentLinks.map((s) => s.student_id);
        const { data: studentsData } = await supabase
          .from("users")
          .select("*")
          .in("id", studentIds);
        setStudents(studentsData || []);
      }

      // Fetch assignments
      const { data: assignmentsData } = await supabase
        .from("assignments")
        .select("*")
        .eq("classroom_id", classroomData.id);
      setAssignments(assignmentsData || []);

      // Fetch completions
      const { data: completionsData } = await supabase
        .from("completions")
        .select("exercise_id")
        .eq("student_id", user.id);
      setCompletedIds(new Set((completionsData || []).map((c) => c.exercise_id)));
    }

    setLoading(false);
  };

  useEffect(() => { fetchClassroom(); }, [user]);

  const handleJoin = async () => {
    if (!joinCode.trim()) return setJoinError("Please enter a join code");
    if (!user) return;

    setJoining(true);
    setJoinError("");
    setJoinSuccess("");

    // Find classroom by code
    const { data: classroomData } = await supabase
      .from("classrooms")
      .select("*")
      .eq("code", joinCode.trim().toUpperCase())
      .single();

    if (!classroomData) {
      setJoinError("Invalid code. Please check and try again.");
      setJoining(false);
      return;
    }

    // Check if already joined
    const { data: existing } = await supabase
      .from("classroom_students")
      .select("*")
      .eq("classroom_id", classroomData.id)
      .eq("student_id", user.id)
      .single();

    if (existing) {
      setJoinError("You are already in this classroom!");
      setJoining(false);
      return;
    }

    // Join classroom
    const { error } = await supabase.from("classroom_students").insert({
      classroom_id: classroomData.id,
      student_id: user.id,
    });

    if (error) {
      setJoinError("Failed to join. Try again.");
    } else {
      setJoinSuccess(`🎉 Joined ${classroomData.name} successfully!`);
      setJoinCode("");
      fetchClassroom();
    }
    setJoining(false);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="bg-muted rounded-2xl h-24 animate-pulse" />
          <div className="bg-muted rounded-2xl h-48 animate-pulse" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
        <div>
          <h1 className="font-fredoka text-3xl font-bold">My Classroom 🏫</h1>
          <p className="text-muted-foreground">See your classmates and assignments</p>
        </div>

        {/* Not in a classroom yet */}
        {!classroom ? (
          <div className="bg-card rounded-3xl p-8 shadow-playful text-center">
            <span className="text-6xl block mb-4">🏫</span>
            <h2 className="font-fredoka text-2xl font-bold mb-2">
              You're not in a classroom yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Ask your teacher for the join code
            </p>
            <div className="max-w-sm mx-auto space-y-3">
              <Input
                placeholder="Enter join code e.g. ABC123"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="rounded-xl h-12 border-2 text-center font-mono text-lg tracking-widest"
                maxLength={6}
              />
              {joinError && (
                <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">
                  ❌ {joinError}
                </div>
              )}
              {joinSuccess && (
                <div className="bg-green-50 text-green-600 rounded-xl px-4 py-3 text-sm">
                  {joinSuccess}
                </div>
              )}
              <Button
                className="w-full rounded-xl h-11 font-bold shadow-playful"
                onClick={handleJoin}
                disabled={joining}
              >
                {joining ? "Joining..." : "🚀 Join Classroom"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Classroom info */}
            <div className="bg-card rounded-2xl p-5 shadow-playful">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="font-fredoka text-xl font-bold">{classroom.name}</h2>
                <span className="bg-primary/10 text-primary text-xs font-bold rounded-lg px-3 py-1">
                  Code: {classroom.code}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {students.length} students
              </p>
            </div>

            {/* Classmates */}
            <div>
              <h3 className="font-fredoka text-lg font-bold mb-3">Classmates</h3>
              <div className="bg-card rounded-2xl shadow-playful overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>XP</TableHead>
                      <TableHead>Streak</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-semibold">
                          <span className="mr-2">{s.avatar}</span>
                          {s.name}
                          {s.id === user?.id && (
                            <span className="ml-2 text-xs text-primary font-bold">(You)</span>
                          )}
                        </TableCell>
                        <TableCell>Lv. {s.level}</TableCell>
                        <TableCell>{s.xp} XP</TableCell>
                        <TableCell>🔥 {s.streak}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Assignments */}
            <div>
              <h3 className="font-fredoka text-lg font-bold mb-3">Assignments</h3>
              <div className="space-y-3">
                {assignments.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No assignments yet.</p>
                ) : (
                  assignments.map((a) => {
                    const completed = completedIds.size > 0;
                    return (
                      <div
                        key={a.id}
                        className="bg-card rounded-2xl p-4 shadow-playful flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-fredoka font-bold">
                            {completed ? "✅" : "⬜"} {a.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Due: {a.due_date}
                          </p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-lg ${
                          completed
                            ? "bg-green-100 text-green-700"
                            : "bg-banana/50 text-foreground"
                        }`}>
                          {completed ? "Completed" : "Pending"}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default MyClassroom;