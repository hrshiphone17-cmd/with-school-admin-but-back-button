import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface Classroom {
  id: string;
  name: string;
  code: string;
  teacher_id: string;
  created_at: string;
  teacher_name?: string;
  student_count?: number;
}

const AdminClassrooms = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassrooms = async () => {
      // Fetch classrooms with teacher name
      const { data: classroomData } = await supabase
        .from("classrooms")
        .select("id, name, code, teacher_id, created_at, users(name)")
        .order("created_at", { ascending: false });

      if (!classroomData) { setLoading(false); return; }

      // Fetch student counts for each classroom
      const withCounts = await Promise.all(
        classroomData.map(async (c: any) => {
          const { count } = await supabase
            .from("classroom_students")
            .select("*", { count: "exact", head: true })
            .eq("classroom_id", c.id);
          return {
            ...c,
            teacher_name: c.users?.name || "Unknown",
            student_count: count || 0,
          };
        })
      );

      setClassrooms(withCounts);
      setLoading(false);
    };

    fetchClassrooms();
  }, []);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-fredoka text-2xl font-bold text-foreground">
          Classrooms ({classrooms.length})
        </h1>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : classrooms.length === 0 ? (
            <p className="text-muted-foreground text-sm p-6">No classrooms yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Join Code</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classrooms.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">🏫 {c.name}</TableCell>
                    <TableCell>
                      <span className="font-mono bg-muted px-2 py-1 rounded text-sm">
                        {c.code}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.teacher_name}</TableCell>
                    <TableCell>{c.student_count}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(c.created_at).toLocaleDateString()}
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

export default AdminClassrooms;