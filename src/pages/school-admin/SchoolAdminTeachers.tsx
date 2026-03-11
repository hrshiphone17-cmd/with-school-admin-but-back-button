import { useState, useEffect } from "react";
import { SchoolAdminLayout } from "@/components/school-admin/SchoolAdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const SchoolAdminTeachers = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fetchTeachers = async () => {
    if (!user?.school_id) return;
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("school_id", user.school_id)
      .eq("role", "teacher")
      .order("created_at", { ascending: false });
    setTeachers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTeachers(); }, [user]);

  const handleCreate = async () => {
    if (!name.trim()) return setError("Please enter a name");
    if (!email.trim()) return setError("Please enter an email");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    if (!user?.school_id) return;

    setCreating(true);
    setError("");

    // Create auth user via Supabase
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (signUpError || !data.user) {
      setError(signUpError?.message || "Failed to create teacher.");
      setCreating(false);
      return;
    }

    // Insert into users table
    const { error: insertError } = await supabase.from("users").insert({
      id: data.user.id,
      name: name.trim(),
      email: email.trim(),
      role: "teacher",
      avatar: "👩‍🏫",
      xp: 0,
      level: 1,
      streak: 0,
      school_id: user.school_id,
    });

    if (insertError) {
      setError("Failed to save teacher profile.");
      setCreating(false);
      return;
    }

    // Reset form
    setName("");
    setEmail("");
    setPassword("");
    setOpen(false);
    fetchTeachers();
    setCreating(false);
  };

  return (
    <SchoolAdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-fredoka text-3xl font-bold">Teachers 👩‍🏫</h1>
            <p className="text-muted-foreground">Manage your school's teachers</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl font-bold shadow-playful">
                <Plus className="h-5 w-5 mr-1" /> Add Teacher
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-fredoka text-xl">Add Teacher</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="font-semibold">Full Name</Label>
                  <Input
                    placeholder="e.g., Sarah Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl h-12 border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Email</Label>
                  <Input
                    type="email"
                    placeholder="sarah@school.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl h-12 border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Password</Label>
                  <Input
                    type="password"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  {creating ? "Creating..." : "✅ Add Teacher"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-muted rounded-2xl h-20 animate-pulse" />
            ))}
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl block mb-4">👩‍🏫</span>
            <h2 className="font-fredoka text-2xl font-bold mb-2">No teachers yet</h2>
            <p className="text-muted-foreground mb-6">Add your first teacher to get started</p>
            <Button className="rounded-2xl font-bold" onClick={() => setOpen(true)}>
              <Plus className="h-5 w-5 mr-1" /> Add Teacher
            </Button>
          </div>
        ) : (
          <div className="bg-card rounded-2xl shadow-playful overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="px-6 py-4">Teacher</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Joined</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{teacher.avatar}</span>
                        <span className="font-semibold">{teacher.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {teacher.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(teacher.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SchoolAdminLayout>
  );
};

export default SchoolAdminTeachers;