import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const Assignments = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

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

    if (classroomsData) {
      setClassrooms(classroomsData);
      if (classroomsData.length > 0) setClassroomId(classroomsData[0].id);

      // Fetch assignments for those classrooms
      if (classroomsData.length > 0) {
        const { data: assignmentsData } = await supabase
          .from("assignments")
          .select("*")
          .in("classroom_id", classroomsData.map((c) => c.id))
          .order("created_at", { ascending: false });
        setAssignments(assignmentsData || []);
      }
    }

    // Fetch all exercises for selection
    const { data: exercisesData } = await supabase
      .from("exercises")
      .select("*, modules(title)")
      .order("order_index");
    setExercises(exercisesData || []);

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const toggleExercise = (id: string) => {
    setSelectedExercises((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!title.trim()) return setError("Please enter a title");
    if (!classroomId) return setError("Please select a classroom");
    if (!dueDate) return setError("Please select a due date");
    if (selectedExercises.length === 0) return setError("Please select at least one exercise");

    setCreating(true);
    setError("");

    // Create assignment
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

    // Link exercises to assignment
    await supabase.from("assignment_exercises").insert(
      selectedExercises.map((eid) => ({
        assignment_id: newAssignment.id,
        exercise_id: eid,
      }))
    );

    // Reset form
    setTitle("");
    setDueDate("");
    setSelectedExercises([]);
    setOpen(false);
    fetchData();
    setCreating(false);
  };

  const getClassroomName = (classroomId: string) => {
    return classrooms.find((c) => c.id === classroomId)?.name || "Unknown";
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto animate-slide-up">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-fredoka text-3xl font-bold">Assignments 📋</h1>
            <p className="text-muted-foreground">Create and manage coding assignments</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl font-bold shadow-playful">
                <Plus className="h-5 w-5 mr-1" /> New Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-fredoka text-xl">Create Assignment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="font-semibold">Title</Label>
                  <Input
                    placeholder="e.g., Loops Practice"
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
                <div className="space-y-2">
                  <Label className="font-semibold">
                    Select Exercises ({selectedExercises.length} selected)
                  </Label>
                  <div className="max-h-40 overflow-auto space-y-2 bg-muted rounded-xl p-3">
                    {exercises.map((e) => (
                      <label
                        key={e.id}
                        className="flex items-center gap-2 text-sm cursor-pointer hover:bg-background rounded-lg p-1"
                      >
                        <input
                          type="checkbox"
                          checked={selectedExercises.includes(e.id)}
                          onChange={() => toggleExercise(e.id)}
                          className="rounded"
                        />
                        <span>{e.title}</span>
                        <span className="text-xs text-muted-foreground ml-auto capitalize">
                          {e.difficulty}
                        </span>
                      </label>
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
            <Button
              className="rounded-2xl font-bold shadow-playful"
              onClick={() => setOpen(true)}
            >
              <Plus className="h-5 w-5 mr-1" /> New Assignment
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="bg-card rounded-2xl p-5 shadow-playful">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-fredoka text-lg font-bold">{assignment.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getClassroomName(assignment.classroom_id)} • Due: {assignment.due_date}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-mint/50 rounded-lg px-3 py-1">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-semibold">0%</span>
                  </div>
                </div>
                <div className="bg-muted rounded-full h-3 overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "0%" }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  0 students completed
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Assignments;