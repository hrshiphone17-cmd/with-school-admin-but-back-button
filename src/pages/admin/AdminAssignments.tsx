import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const AdminAssignments = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchAll = async () => {
      const [{ data: assignmentsData }, { data: classroomsData }] = await Promise.all([
        supabase
          .from("assignments")
          .select("*, classrooms(name), assignment_exercises(exercise_id)")
          .order("created_at", { ascending: false }),
        supabase.from("classrooms").select("id, name").order("name"),
      ]);
      setAssignments(assignmentsData || []);
      setClassrooms(classroomsData || []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const filtered = filter === "all"
    ? assignments
    : assignments.filter((a) => a.classroom_id === filter);

  return (
    <AdminLayout>
      <h1 className="font-fredoka text-2xl font-bold mb-6 text-foreground">
        Assignments ({assignments.length})
      </h1>

      <div className="mb-4 max-w-xs">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="rounded-lg">
            <SelectValue placeholder="Filter by classroom" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classrooms</SelectItem>
            {classrooms.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm p-6">No assignments found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Classroom</TableHead>
                  <TableHead>Exercises</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{a.classrooms?.name || "—"}</Badge>
                    </TableCell>
                    <TableCell>{a.assignment_exercises?.length || 0}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {a.due_date ? new Date(a.due_date).toLocaleDateString() : "—"}
                    </TableCell>
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
    </AdminLayout>
  );
};

export default AdminAssignments;