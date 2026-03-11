import { useState, useEffect, useRef } from "react";
import { SchoolAdminLayout } from "@/components/school-admin/SchoolAdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const SchoolAdminStudents = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Single student form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // CSV state
  const [csvResults, setCsvResults] = useState<{ success: number; failed: string[] }>({ success: 0, failed: [] });
  const [csvLoading, setCsvLoading] = useState(false);

  const fetchStudents = async () => {
    if (!user?.school_id) return;
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("school_id", user.school_id)
      .eq("role", "student")
      .order("created_at", { ascending: false });
    setStudents(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchStudents(); }, [user]);

  const handleCreate = async () => {
    if (!name.trim()) return setError("Please enter a name");
    if (!email.trim()) return setError("Please enter an email");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    if (!user?.school_id) return;

    setCreating(true);
    setError("");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (signUpError || !data.user) {
      setError(signUpError?.message || "Failed to create student.");
      setCreating(false);
      return;
    }

    const { error: insertError } = await supabase.from("users").insert({
      id: data.user.id,
      name: name.trim(),
      email: email.trim(),
      role: "student",
      avatar: "🦊",
      xp: 0,
      level: 1,
      streak: 0,
      school_id: user.school_id,
    });

    if (insertError) {
      setError("Failed to save student profile.");
      setCreating(false);
      return;
    }

    setName("");
    setEmail("");
    setPassword("");
    setOpen(false);
    fetchStudents();
    setCreating(false);
  };

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.school_id) return;

    setCsvLoading(true);
    setCsvResults({ success: 0, failed: [] });

    const text = await file.text();
    const lines = text.split("\n").filter(Boolean);
    // Skip header row
    const rows = lines.slice(1).map(line => line.split(",").map(s => s.trim()));

    let success = 0;
    const failed: string[] = [];

    for (const row of rows) {
      const [rowName, rowEmail, rowPassword] = row;
      if (!rowName || !rowEmail || !rowPassword) {
        failed.push(rowEmail || "unknown");
        continue;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: rowEmail,
        password: rowPassword,
      });

      if (signUpError || !data.user) {
        failed.push(rowEmail);
        continue;
      }

      const { error: insertError } = await supabase.from("users").insert({
        id: data.user.id,
        name: rowName,
        email: rowEmail,
        role: "student",
        avatar: "🦊",
        xp: 0,
        level: 1,
        streak: 0,
        school_id: user.school_id,
      });

      if (insertError) {
        failed.push(rowEmail);
      } else {
        success++;
      }
    }

    setCsvResults({ success, failed });
    setCsvLoading(false);
    fetchStudents();
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <SchoolAdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-fredoka text-3xl font-bold">Students 🎒</h1>
            <p className="text-muted-foreground">Manage your school's students</p>
          </div>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); setError(""); setCsvResults({ success: 0, failed: [] }); }}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl font-bold shadow-playful">
                <Plus className="h-5 w-5 mr-1" /> Add Students
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-fredoka text-xl">Add Students</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="single" className="mt-4">
                <TabsList className="w-full rounded-xl mb-4">
                  <TabsTrigger value="single" className="flex-1 rounded-lg">Single Student</TabsTrigger>
                  <TabsTrigger value="bulk" className="flex-1 rounded-lg">Bulk CSV Upload</TabsTrigger>
                </TabsList>

                {/* Single student */}
                <TabsContent value="single" className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-semibold">Full Name</Label>
                    <Input
                      placeholder="e.g., Arjun Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-xl h-12 border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Email</Label>
                    <Input
                      type="email"
                      placeholder="arjun@school.com"
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
                    <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">❌ {error}</div>
                  )}
                  <Button className="w-full rounded-xl h-11 font-bold" onClick={handleCreate} disabled={creating}>
                    {creating ? "Creating..." : "✅ Add Student"}
                  </Button>
                </TabsContent>

                {/* Bulk CSV */}
                <TabsContent value="bulk" className="space-y-4">
                  <div className="bg-muted rounded-2xl p-4 text-sm space-y-2">
                    <p className="font-semibold">CSV Format (with header row):</p>
                    <code className="block bg-background rounded-lg px-3 py-2 text-xs">
                      name,email,password<br />
                      Arjun Sharma,arjun@school.com,pass123<br />
                      Priya Patel,priya@school.com,pass456
                    </code>
                  </div>
                  <div
                    className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-semibold">Click to upload CSV</p>
                    <p className="text-sm text-muted-foreground">or drag and drop</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleCSV}
                    />
                  </div>
                  {csvLoading && (
                    <div className="text-center text-sm text-muted-foreground animate-pulse">
                      Uploading students...
                    </div>
                  )}
                  {(csvResults.success > 0 || csvResults.failed.length > 0) && (
                    <div className="space-y-2">
                      {csvResults.success > 0 && (
                        <div className="bg-green-50 text-green-700 rounded-xl px-4 py-3 text-sm">
                          ✅ {csvResults.success} student{csvResults.success > 1 ? "s" : ""} added successfully
                        </div>
                      )}
                      {csvResults.failed.length > 0 && (
                        <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">
                          ❌ Failed: {csvResults.failed.join(", ")}
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats bar */}
        <div className="bg-card rounded-2xl p-4 shadow-playful mb-6 flex items-center gap-3">
          <span className="text-3xl">🎒</span>
          <div>
            <p className="font-bold text-2xl">{students.length}</p>
            <p className="text-sm text-muted-foreground">Total Students</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-muted rounded-2xl h-20 animate-pulse" />
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl block mb-4">🎒</span>
            <h2 className="font-fredoka text-2xl font-bold mb-2">No students yet</h2>
            <p className="text-muted-foreground mb-6">Add students one by one or upload a CSV</p>
            <Button className="rounded-2xl font-bold" onClick={() => setOpen(true)}>
              <Plus className="h-5 w-5 mr-1" /> Add Students
            </Button>
          </div>
        ) : (
          <div className="bg-card rounded-2xl shadow-playful overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">XP</th>
                  <th className="px-6 py-4">Joined</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{student.avatar}</span>
                        <span className="font-semibold">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{student.email}</td>
                    <td className="px-6 py-4">
                      <span className="bg-banana/30 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full">
                        ⭐ {student.xp} XP
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(student.created_at).toLocaleDateString()}
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

export default SchoolAdminStudents;