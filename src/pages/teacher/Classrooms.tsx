import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const Classrooms = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchClassrooms = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("classrooms")
      .select("*")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setClassrooms(data);
      // Fetch student counts
      const counts: Record<string, number> = {};
      for (const c of data) {
        const { count } = await supabase
          .from("classroom_students")
          .select("*", { count: "exact", head: true })
          .eq("classroom_id", c.id);
        counts[c.id] = count || 0;
      }
      setStudentCounts(counts);
    }
    setLoading(false);
  };

  useEffect(() => { fetchClassrooms(); }, [user]);

  const handleCreate = async () => {
    if (!newName.trim()) return setError("Please enter a classroom name");
    if (!user) return;

    setCreating(true);
    setError("");

    const { error } = await supabase.from("classrooms").insert({
      name: newName.trim(),
      code: generateCode(),
      teacher_id: user.id,
    });

    if (error) {
      setError("Failed to create classroom. Try again.");
    } else {
      setNewName("");
      setOpen(false);
      fetchClassrooms();
    }
    setCreating(false);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto animate-slide-up">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-fredoka text-3xl font-bold">Classrooms 🏫</h1>
            <p className="text-muted-foreground">Manage your coding classes</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl font-bold shadow-playful">
                <Plus className="h-5 w-5 mr-1" /> New Classroom
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-fredoka text-xl">Create Classroom</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="font-semibold">Classroom Name</Label>
                  <Input
                    placeholder="e.g., Jungle Coders 🌴"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="rounded-xl h-12 border-2"
                  />
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
                  {creating ? "Creating..." : "🎉 Create Classroom"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-muted rounded-3xl h-36 animate-pulse" />
            ))}
          </div>
        ) : classrooms.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl block mb-4">🏫</span>
            <h2 className="font-fredoka text-2xl font-bold mb-2">No classrooms yet</h2>
            <p className="text-muted-foreground mb-6">Create your first classroom to get started</p>
            <Button
              className="rounded-2xl font-bold shadow-playful"
              onClick={() => setOpen(true)}
            >
              <Plus className="h-5 w-5 mr-1" /> New Classroom
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {classrooms.map((classroom) => (
              <button
                key={classroom.id}
                onClick={() => navigate(`/teacher/classrooms/${classroom.id}`)}
                className="bg-card rounded-3xl p-6 text-left shadow-playful hover:shadow-playful-lg hover:scale-[1.02] transition-all"
              >
                <h3 className="font-fredoka text-xl font-bold mb-2">{classroom.name}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>👨‍🎓 {studentCounts[classroom.id] || 0} students</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="bg-muted rounded-lg px-3 py-1 text-xs font-mono font-bold">
                    {classroom.code}
                  </span>
                  <span className="text-xs text-muted-foreground">Join code</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Classrooms;
