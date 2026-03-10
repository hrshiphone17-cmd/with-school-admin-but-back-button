import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { mockClassrooms } from "@/data/mockClassrooms";
import { mockUsers } from "@/data/mockUsers";
import { auditLog } from "@/lib/auditLogger";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Archive } from "lucide-react";

const AdminClassrooms = () => {
  const { user: admin } = useAuth();
  const { toast } = useToast();

  const getTeacherName = (id: string) => mockUsers.find((u) => u.id === id)?.name || "Unknown";

  const handleArchive = (id: string, name: string) => {
    auditLog(admin?.id || "", "archive_classroom", id);
    toast({ title: "Classroom archived", description: `${name} archived (mock).` });
  };

  return (
    <AdminLayout>
      <h1 className="font-fredoka text-2xl font-bold mb-6 text-foreground">Classrooms</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockClassrooms.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{c.code}</TableCell>
                  <TableCell>{getTeacherName(c.teacherId)}</TableCell>
                  <TableCell>{c.studentIds.length}</TableCell>
                  <TableCell className="text-muted-foreground">{c.createdAt}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={() => handleArchive(c.id, c.name)}>
                      <Archive className="h-3.5 w-3.5" /> Archive
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminClassrooms;
