// src/pages/teacher/Assignments.tsx

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const typeIcon: Record<string, string> = {
  code: "💻",
  visual: "🎮",
  interactive: "👆",
};

const Assignments = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [groupedExercises, setGroupedExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [classroomId, setClassroomId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

  const fetchData = async () => {
    if (!user) return;

    // Fetch teacher's classrooms
    const { data: classroomsData } = await supabase
      .from("classrooms")
      .select("*")
      .eq("teacher_id", user.id);

    if (!classroomsData || classroomsData.length === 0) {
      setLoading(false);
      return;
    }

    setClassrooms(classroomsData);
    if (classroomsData.length > 0) setClassroomId(classroomsData[0].id);

    // Fetch assignments
    const { data: assignmentsData } = await supabase
      .from("assignments")
      .select("*, assignment_exercises(exercise_id)")
      .in("classroom_id", classroomsData.map((c) => c.id))
      .order("created_at", { ascending: false });

    if (!assignmentsData) { setLoading(false); return; }

    // Enrich each assignment with student progress
    const enriched = await Promise.all(
      assignmentsData.map(async (a) => {
        const exerciseIds = a.assignment_exercises.map((ae: any) => ae.exercise_id);

        const { data: studentLinks } = await supabase
          .from("classroom_students")
          .select("student_id")
          .eq("classroom_id", a.classroom_id);

        const studentIds = (studentLinks || []).map((s) => s.student_id);

        let studentDetails: any[] = [];
        if (studentIds.length > 0) {
          const { data: studentsData } = await supabase
            .from("users")
            .select("id, name, avatar")
            .in("id", studentIds);
          studentDetails = studentsData || [];
        }

        const studentProgress = await Promise.all(
          studentDetails.map(async (student) => {
            if (exerciseIds.length === 0) {
              return { ...student, completedCount: 0, totalCount: 0, allDone: false };
            }
            const { data: completions } = await supabase
              .from("completions")
              .select("exercise_id")
              .eq("student_id", student.id)
              .in("exercise_id", exerciseIds);

            const completedCount = (completions || []).length;
            return {
              ...student,
              completedCount,
              totalCount: exerciseIds.length,
              allDone: completedCount === exerciseIds.length,
            };
          })
        );

        let exerciseDetails: any[] = [];
        if (exerciseIds.length > 0) {
          const { data: exData } = await supabase
            .from("exercises")
            .select("id, title, xp_reward, difficulty, type")
            .in("id", exerciseIds);
          exerciseDetails = exData || [];
        }

        return {
          ...a,
          totalStudents: studentDetails.length,
          completedStudents: studentProgress.filter((s) => s.allDone).length,
          exerciseDetails,
          exerciseCount: exerciseIds.length,
          studentProgress,
        };
      })
    );

    setAssignments(enriched);

    // Fetch exercises grouped by course → module for the picker
    const { data: courses } = await supabase
      .from("courses")
      .select("id, title, icon")
      .order("created_at");

    const { data: modules } = await supabase
      .from("modules")
      .select("id, title, course_id, icon")
      .order("order_index");

    const { data: exercises } = await supabase
      .from("exercises")
      .select("id, title, type, difficulty, xp_reward, module_id")
      .order("order_index");

    // Build grouped structure: course → modules → exercises
    const grouped = (courses || []).map((course) => ({
      ...course,
      modules: (modules || [])
        .filter((m) => m.course_id === course.id)
        .map((module) => ({
          ...module,
          exercises: (exercises || []).filter((e) => e.module_id === module.id),
        }))
        .filter((m) => m.exercises.length > 0),
    })).filter((c) => c.modules.length > 0);

    setGroupedExercises(grouped);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const toggleExercise = (id: string) => {
    setSelectedExercises((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  // Select all exercises from a module at once
  const toggleModule = (moduleExerciseIds: string[]) => {
    const allSelected = moduleExerciseIds.every((id) => selectedExercises.includes(id));
    if (allSelected) {
      setSelectedExercises((prev) => prev.filter((id) => !moduleExerciseIds.includes(id)));
    } else {
      setSelectedExercises((prev) => [...new Set([...prev, ...moduleExerciseIds])]);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) return setError("Please enter a title");
    if (!classroomId) return setError("Please select a classroom");
    if (!dueDate) return setError("Please select a due date");
    if (selectedExercises.length === 0) return setError("Please select at least one exercise");

    setCreating(true);
    setError("");

    const { data: newAssignment, error: assignmentError } = await supabase
      .from("assignments")
      .insert({ title: title.trim(), classroom_id: classroomId, due_date: dueDate })
      .select()
      .single();

    if (assignmentError || !newAssignment) {
      setError("Failed to create assignment. Try again.");
      setCreating(false);
      return;
    }

    await supabase.from("assignment_exercises").insert(
      selectedExercises.map((eid) => ({
        assignment_id: newAssignment.id,
        exercise_id: eid,
      }))
    );

    setTitle("");
    setDueDate("");
    setSelectedExercises([]);
    setOpen(false);
    fetchData();
    setCreating(false);
  };

  const getClassroomName = (cId: string) =>
    classrooms.find((c) => c.id === cId)?.name || "Unknown";

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto animate-slide-up">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-fredoka text-3xl font-bold">Assignments 📋</h1>
            <p className="text-muted-foreground">Create and manage assignments</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl font-bold shadow-playful">
                <Plus className="h-5 w-5 mr-1" /> New Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-fredoka text-xl">Create Assignment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="font-semibold">Title</Label>
                  <Input
                    placeholder="e.g., Tap Pictures Practice"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="rounded-xl h-12 border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Classroom</Label>
                  <select
                    value={classroomId}
                    onChange={(e) => setClassroomId(e.target.value)}
                    className="w-full h-12 rounded-xl border-2 border-input bg-background px-3 text-base"
                  >
                    {classrooms.length === 0 ? (
                      <option>No classrooms yet</option>
                    ) : (
                      classrooms.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))
                    )}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Due Date</Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="rounded-xl h-12 border-2"
                  />
                </div>

                {/* Grouped exercise picker */}
                <div className="space-y-2">
                  <Label className="font-semibold">
                    Select Levels ({selectedExercises.length} selected)
                  </Label>
                  <div className="max-h-64 overflow-auto space-y-3 bg-muted rounded-xl p-3">
                    {groupedExercises.map((course) => (
                      <div key={course.id}>
                        {/* Course heading */}
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 px-1">
                          {course.icon} {course.title}
                        </p>
                        {course.modules.map((module: any) => {
                          const moduleExIds = module.exercises.map((e: any) => e.id);
                          const allSelected = moduleExIds.every((id: string) =>
                            selectedExercises.includes(id)
                          );
                          return (
                            <div key={module.id} className="mb-2">
                              {/* Module row — click to select all levels in module */}
                              <button
                                type="button"
                                onClick={() => toggleModule(moduleExIds)}
                                className={`w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-left transition-colors ${
                                  allSelected
                                    ? "bg-primary/20 text-primary"
                                    : "hover:bg-background"
                                }`}
                              >
                                <span>{module.icon}</span>
                                <span>{module.title}</span>
                                <span className="ml-auto text-xs text-muted-foreground">
                                  {allSelected ? "✅ All selected" : `Select all ${moduleExIds.length}`}
                                </span>
                              </button>
                              {/* Individual exercise rows */}
                              <div className="pl-4 mt-1 space-y-1">
                                {module.exercises.map((ex: any, idx: number) => (
                                  <label
                                    key={ex.id}
                                    className="flex items-center gap-2 text-sm cursor-pointer hover:bg-background rounded-lg p-1"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedExercises.includes(ex.id)}
                                      onChange={() => toggleExercise(ex.id)}
                                      className="rounded"
                                    />
                                    <span>{typeIcon[ex.type] || "📝"}</span>
                                    <span>Level {idx + 1}: {ex.title}</span>
                                    <span className="text-xs text-primary font-semibold ml-auto">
                                      +{ex.xp_reward} XP
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">
                    ❌ {error}
                  </div>
                )}
                <Button
                  className="w-full rounded-xl h-11 font-bold"
                  onClick={handleCreate}
                  disabled={creating}
                >
                  {creating ? "Creating..." : "✅ Create Assignment"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-muted rounded-2xl h-28 animate-pulse" />
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl block mb-4">📋</span>
            <h2 className="font-fredoka text-2xl font-bold mb-2">No assignments yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first assignment for your students
            </p>
            <Button className="rounded-2xl font-bold shadow-playful" onClick={() => setOpen(true)}>
              <Plus className="h-5 w-5 mr-1" /> New Assignment
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const progressPercent = assignment.totalStudents > 0
                ? Math.round((assignment.completedStudents / assignment.totalStudents) * 100)
                : 0;
              const isExpanded = expandedId === assignment.id;
              const completedStudents = assignment.studentProgress.filter((s: any) => s.allDone);
              const pendingStudents = assignment.studentProgress.filter((s: any) => !s.allDone);

              return (
                <div key={assignment.id} className="bg-card rounded-2xl shadow-playful overflow-hidden">
                  <button
                    className="w-full p-5 text-left hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : assignment.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-fredoka text-lg font-bold">{assignment.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {getClassroomName(assignment.classroom_id)} • Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`rounded-lg px-3 py-1 text-xs font-bold ${
                          progressPercent === 100
                            ? "bg-green-100 text-green-700"
                            : "bg-mint/50 text-foreground"
                        }`}>
                          {progressPercent}% done
                        </div>
                        {isExpanded
                          ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        }
                      </div>
                    </div>
                    <div className="bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          progressPercent === 100 ? "bg-green-500" : "bg-primary"
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {assignment.completedStudents}/{assignment.totalStudents} students completed all levels
                    </p>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border">
                      {/* Levels list */}
                      <div className="px-5 pt-4 pb-3">
                        <p className="text-sm font-semibold mb-3">
                          📚 Levels ({assignment.exerciseCount})
                        </p>
                        {assignment.exerciseDetails.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No levels linked.</p>
                        ) : (
                          <div className="space-y-2">
                            {assignment.exerciseDetails.map((ex: any, idx: number) => (
                              <div
                                key={ex.id}
                                className="flex items-center gap-3 bg-muted rounded-xl p-3 text-sm"
                              >
                                <span>{typeIcon[ex.type] || "📝"}</span>
                                <span className="flex-1 font-medium">
                                  Level {idx + 1}: {ex.title}
                                </span>
                                <span className="text-xs capitalize text-muted-foreground">
                                  {ex.difficulty}
                                </span>
                                <span className="text-xs text-primary font-semibold">
                                  +{ex.xp_reward} XP
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Student breakdown */}
                      {assignment.studentProgress.length === 0 ? (
                        <div className="px-5 pb-5">
                          <p className="text-sm text-muted-foreground">No students in this classroom yet.</p>
                        </div>
                      ) : (
                        <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                          <div className="bg-green-50 rounded-2xl p-4">
                            <p className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                              ✅ Completed
                              <span className="ml-auto bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs font-bold">
                                {completedStudents.length}
                              </span>
                            </p>
                            {completedStudents.length === 0 ? (
                              <p className="text-xs text-green-600 italic">No one yet</p>
                            ) : (
                              <div className="space-y-2">
                                {completedStudents.map((s: any) => (
                                  <div key={s.id} className="flex items-center gap-2">
                                    <span className="text-lg">{s.avatar}</span>
                                    <span className="text-sm font-medium">{s.name}</span>
                                    <span className="ml-auto text-xs text-green-600 font-semibold">
                                      {s.completedCount}/{s.totalCount} ✓
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="bg-orange-50 rounded-2xl p-4">
                            <p className="text-sm font-semibold text-orange-700 mb-3 flex items-center gap-2">
                              ⏳ Pending
                              <span className="ml-auto bg-orange-100 text-orange-700 rounded-full px-2 py-0.5 text-xs font-bold">
                                {pendingStudents.length}
                              </span>
                            </p>
                            {pendingStudents.length === 0 ? (
                              <p className="text-xs text-orange-600 italic">Everyone is done! 🎉</p>
                            ) : (
                              <div className="space-y-2">
                                {pendingStudents.map((s: any) => (
                                  <div key={s.id} className="flex items-center gap-2">
                                    <span className="text-lg">{s.avatar}</span>
                                    <span className="text-sm font-medium">{s.name}</span>
                                    <span className="ml-auto text-xs text-orange-600 font-semibold">
                                      {s.completedCount}/{s.totalCount} done
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Assignments;