import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { mockAssignments, mockClassrooms } from "@/data/mockClassrooms";

const AdminAssignments = () => {
  const [filterClassroom, setFilterClassroom] = useState("all");

  const assignments = filterClassroom === "all"
    ? mockAssignments
    : mockAssignments.filter((a) => a.classroomId === filterClassroom);

  const getClassroomName = (id: string) => mockClassrooms.find((c) => c.id === id)?.name || id;

  return (
    <AdminLayout>
      <h1 className="font-fredoka text-2xl font-bold mb-6 text-foreground">Assignments</h1>
      <div className="mb-4 max-w-xs">
        <Select value={filterClassroom} onValueChange={setFilterClassroom}>
          <SelectTrigger className="rounded-lg">
            <SelectValue placeholder="Filter by classroom" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classrooms</SelectItem>
            {mockClassrooms.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Classroom</TableHead>
                <TableHead>Exercises</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Completions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium text-foreground">{a.title}</TableCell>
                  <TableCell><Badge variant="outline">{getClassroomName(a.classroomId)}</Badge></TableCell>
                  <TableCell>{a.exerciseIds.length}</TableCell>
                  <TableCell className="text-muted-foreground">{a.dueDate}</TableCell>
                  <TableCell>{a.completions.length}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminAssignments;
