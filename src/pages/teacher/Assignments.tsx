import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockAssignments } from "@/data/mockClassrooms";
import { mockClassrooms } from "@/data/mockClassrooms";
import { mockCourses } from "@/data/mockCourses";
import { Plus, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Assignments = () => {
  const [open, setOpen] = useState(false);

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
                  <Input placeholder="e.g., Loops Practice" className="rounded-xl h-12 border-2" />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Classroom</Label>
                  <select className="w-full h-12 rounded-xl border-2 border-input bg-background px-3 text-base">
                    {mockClassrooms.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Due Date</Label>
                  <Input type="date" className="rounded-xl h-12 border-2" />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Select Exercises</Label>
                  <div className="max-h-40 overflow-auto space-y-2 bg-muted rounded-xl p-3">
                    {mockCourses.flatMap((c) =>
                      c.modules.flatMap((m) =>
                        m.exercises.slice(0, 3).map((e) => (
                          <label key={e.id} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" className="rounded" />
                            <span>{e.title}</span>
                            <span className="text-xs text-muted-foreground ml-auto capitalize">{e.difficulty}</span>
                          </label>
                        ))
                      )
                    )}
                  </div>
                </div>
                <Button className="w-full rounded-xl h-11 font-bold" onClick={() => setOpen(false)}>
                  ✅ Create Assignment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {mockAssignments.map((assignment) => {
            const classroom = mockClassrooms.find((c) => c.id === assignment.classroomId);
            const totalStudents = classroom?.studentIds.length || 0;
            const completionRate = totalStudents ? Math.round((assignment.completions.length / totalStudents) * 100) : 0;

            return (
              <div key={assignment.id} className="bg-card rounded-2xl p-5 shadow-playful">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-fredoka text-lg font-bold">{assignment.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {classroom?.name} • Due: {assignment.dueDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-mint/50 rounded-lg px-3 py-1">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-semibold">{completionRate}%</span>
                  </div>
                </div>
                <div className="bg-muted rounded-full h-3 overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${completionRate}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {assignment.completions.length}/{totalStudents} students completed • {assignment.exerciseIds.length} exercises
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Assignments;
