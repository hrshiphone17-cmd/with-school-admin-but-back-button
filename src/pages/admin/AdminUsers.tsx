import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { mockUsers } from "@/data/mockUsers";
import { auditLog } from "@/lib/auditLogger";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const AdminUsers = () => {
  const { user: admin } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [deactivated, setDeactivated] = useState<Set<string>>(new Set());

  const students = mockUsers.filter((u) => u.role === "student" && u.name.toLowerCase().includes(search.toLowerCase()));
  const teachers = mockUsers.filter((u) => u.role === "teacher" && u.name.toLowerCase().includes(search.toLowerCase()));

  const toggleActive = (userId: string) => {
    setDeactivated((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) { next.delete(userId); } else { next.add(userId); }
      auditLog(admin?.id || "", next.has(userId) ? "deactivate_user" : "activate_user", userId);
      return next;
    });
  };

  const handleDelete = (userId: string) => {
    auditLog(admin?.id || "", "delete_user", userId);
    toast({ title: "User deleted", description: `User ${userId} removed (mock).` });
  };

  const UserTable = ({ users }: { users: typeof mockUsers }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Avatar</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Level</TableHead>
          <TableHead>XP</TableHead>
          <TableHead>Active</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((u) => (
          <TableRow key={u.id}>
            <TableCell className="text-xl">{u.avatar}</TableCell>
            <TableCell className="font-medium text-foreground">{u.name}</TableCell>
            <TableCell className="text-muted-foreground">{u.email}</TableCell>
            <TableCell>{u.level}</TableCell>
            <TableCell>{u.xp}</TableCell>
            <TableCell>
              <Switch checked={!deactivated.has(u.id)} onCheckedChange={() => toggleActive(u.id)} />
            </TableCell>
            <TableCell>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {u.name}?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(u.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <AdminLayout>
      <h1 className="font-fredoka text-2xl font-bold mb-6 text-foreground">Users</h1>
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-lg" />
      </div>
      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
          <TabsTrigger value="teachers">Teachers ({teachers.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="students">
          <Card><CardContent className="p-0"><UserTable users={students} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="teachers">
          <Card><CardContent className="p-0"><UserTable users={teachers} /></CardContent></Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminUsers;
