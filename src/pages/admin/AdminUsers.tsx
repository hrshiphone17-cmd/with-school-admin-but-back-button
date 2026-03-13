import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, School, UserCog, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface School {
  id: string;
  name: string;
  city: string;
  created_at: string;
}

interface SchoolAdmin {
  id: string;
  name: string;
  email: string;
  school_id: string;
  created_at: string;
  schools?: { name: string };
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  xp: number;
  level: number;
  created_at: string;
}

const AdminUsers = () => {
  const { toast } = useToast();

  // --- Schools state ---
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [createSchoolOpen, setCreateSchoolOpen] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newSchoolCity, setNewSchoolCity] = useState("");
  const [schoolSubmitting, setSchoolSubmitting] = useState(false);

  // --- School Admins state ---
  const [schoolAdmins, setSchoolAdmins] = useState<SchoolAdmin[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminSchoolId, setAdminSchoolId] = useState("");
  const [adminSubmitting, setAdminSubmitting] = useState(false);

  // --- Students/Teachers state ---
  const [students, setStudents] = useState<UserRow[]>([]);
  const [teachers, setTeachers] = useState<UserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [search, setSearch] = useState("");

  // --- Fetch schools ---
  const fetchSchools = async () => {
    setSchoolsLoading(true);
    const { data, error } = await supabase
      .from("schools")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: "Could not load schools.", variant: "destructive" });
    else setSchools(data || []);
    setSchoolsLoading(false);
  };

  // --- Fetch school admins ---
  const fetchSchoolAdmins = async () => {
    setAdminsLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, school_id, created_at, schools(name)")
      .eq("role", "school_admin")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: "Could not load school admins.", variant: "destructive" });
    else setSchoolAdmins((data as any) || []);
    setAdminsLoading(false);
  };

  // --- Fetch students and teachers ---
  const fetchUsers = async () => {
    setUsersLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, role, avatar, xp, level, created_at")
      .in("role", ["student", "teacher"])
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: "Could not load users.", variant: "destructive" });
    else {
      setStudents((data || []).filter((u) => u.role === "student"));
      setTeachers((data || []).filter((u) => u.role === "teacher"));
    }
    setUsersLoading(false);
  };

  useEffect(() => {
    fetchSchools();
    fetchSchoolAdmins();
    fetchUsers();
  }, []);

  // --- Create school ---
  const handleCreateSchool = async () => {
    if (!newSchoolName.trim() || !newSchoolCity.trim()) {
      toast({ title: "Missing fields", description: "Please fill in school name and city.", variant: "destructive" });
      return;
    }
    setSchoolSubmitting(true);
    const { error } = await supabase.from("schools").insert({
      name: newSchoolName.trim(),
      city: newSchoolCity.trim(),
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ School created!", description: `${newSchoolName} has been added.` });
      setNewSchoolName("");
      setNewSchoolCity("");
      setCreateSchoolOpen(false);
      fetchSchools();
    }
    setSchoolSubmitting(false);
  };

  // --- Create school admin ---
  const handleCreateAdmin = async () => {
    if (!adminName.trim() || !adminEmail.trim() || !adminPassword.trim() || !adminSchoolId) {
      toast({ title: "Missing fields", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    setAdminSubmitting(true);

    // Step 1: Create auth user via Supabase Admin API
    // We use signUp here — the admin is already logged in so this creates a NEW user session temporarily.
    // Better approach: use a Supabase Edge Function. For now we use signUp and re-login admin after.
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: adminEmail.trim(),
      password: adminPassword.trim(),
    });

    if (signUpError || !signUpData.user) {
      toast({ title: "Error creating auth account", description: signUpError?.message || "Unknown error", variant: "destructive" });
      setAdminSubmitting(false);
      return;
    }

    // Step 2: Insert into users table
    const { error: insertError } = await supabase.from("users").insert({
      id: signUpData.user.id,
      name: adminName.trim(),
      email: adminEmail.trim(),
      role: "school_admin",
      avatar: "🏫",
      xp: 0,
      level: 1,
      streak: 0,
      school_id: adminSchoolId,
    });

    if (insertError) {
      toast({ title: "Auth account created but profile failed", description: insertError.message, variant: "destructive" });
    } else {
      toast({ title: "✅ School Admin created!", description: `${adminName} can now log in at /school-admin/login` });
      setAdminName("");
      setAdminEmail("");
      setAdminPassword("");
      setAdminSchoolId("");
      setCreateAdminOpen(false);
      fetchSchoolAdmins();
    }
    setAdminSubmitting(false);
  };

  // --- Filtered users ---
  const filteredStudents = students.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );
  const filteredTeachers = teachers.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const UserTable = ({ users }: { users: UserRow[] }) => (
    users.length === 0 ? (
      <p className="text-muted-foreground text-sm p-4">No users found.</p>
    ) : (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Avatar</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>XP</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="text-xl">{u.avatar}</TableCell>
              <TableCell className="font-medium">{u.name}</TableCell>
              <TableCell className="text-muted-foreground">{u.email}</TableCell>
              <TableCell>{u.level}</TableCell>
              <TableCell>{u.xp}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(u.created_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  );

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-fredoka text-2xl font-bold text-foreground">Users</h1>
      </div>

      <Tabs defaultValue="schools">
        <TabsList className="mb-4">
          <TabsTrigger value="schools">🏫 Schools ({schools.length})</TabsTrigger>
          <TabsTrigger value="school-admins">👤 School Admins ({schoolAdmins.length})</TabsTrigger>
          <TabsTrigger value="teachers">Teachers ({teachers.length})</TabsTrigger>
          <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
        </TabsList>

        {/* ── SCHOOLS TAB ── */}
        <TabsContent value="schools">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" /> All Schools
              </CardTitle>
              <Dialog open={createSchoolOpen} onOpenChange={setCreateSchoolOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> Create School
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New School</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div className="space-y-1">
                      <Label>School Name</Label>
                      <Input
                        placeholder="e.g. Delhi Public School"
                        value={newSchoolName}
                        onChange={(e) => setNewSchoolName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>City</Label>
                      <Input
                        placeholder="e.g. Mumbai"
                        value={newSchoolCity}
                        onChange={(e) => setNewSchoolCity(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleCreateSchool} disabled={schoolSubmitting} className="w-full">
                      {schoolSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</> : "Create School"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              {schoolsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : schools.length === 0 ? (
                <p className="text-muted-foreground text-sm p-4">No schools yet. Create one above.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>School Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schools.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">🏫 {s.name}</TableCell>
                        <TableCell className="text-muted-foreground">{s.city}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(s.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs font-mono">{s.id}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SCHOOL ADMINS TAB ── */}
        <TabsContent value="school-admins">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" /> School Admins
              </CardTitle>
              <Dialog open={createAdminOpen} onOpenChange={setCreateAdminOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> Create School Admin
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create School Admin Account</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div className="space-y-1">
                      <Label>Full Name</Label>
                      <Input
                        placeholder="e.g. Priya Sharma"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        placeholder="e.g. priya@school.com"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Password</Label>
                      <Input
                        type="password"
                        placeholder="Min 6 characters"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Assign to School</Label>
                      <Select value={adminSchoolId} onValueChange={setAdminSchoolId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a school" />
                        </SelectTrigger>
                        <SelectContent>
                          {schools.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              🏫 {s.name} — {s.city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ⚠️ After creating, you may be logged out briefly. Log back in at /x/admin-login
                    </p>
                    <Button onClick={handleCreateAdmin} disabled={adminSubmitting} className="w-full">
                      {adminSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</> : "Create School Admin"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              {adminsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : schoolAdmins.length === 0 ? (
                <p className="text-muted-foreground text-sm p-4">No school admins yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schoolAdmins.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">🏫 {a.name}</TableCell>
                        <TableCell className="text-muted-foreground">{a.email}</TableCell>
                        <TableCell>{(a as any).schools?.name || "—"}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(a.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TEACHERS TAB ── */}
        <TabsContent value="teachers">
          <div className="relative mb-4 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search teachers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-lg" />
          </div>
          <Card>
            <CardContent className="p-0">
              {usersLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <UserTable users={filteredTeachers} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── STUDENTS TAB ── */}
        <TabsContent value="students">
          <div className="relative mb-4 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-lg" />
          </div>
          <Card>
            <CardContent className="p-0">
              {usersLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <UserTable users={filteredStudents} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminUsers;