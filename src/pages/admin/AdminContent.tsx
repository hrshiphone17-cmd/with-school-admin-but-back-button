import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { mockCourses } from "@/data/mockCourses";
import { auditLog } from "@/lib/auditLogger";
import { useAuth } from "@/contexts/AuthContext";
import { Plus } from "lucide-react";

const allExercises = mockCourses.flatMap((c) =>
  c.modules.flatMap((m) => m.exercises.map((e) => ({ ...e, courseName: c.title })))
);

const AdminContent = () => {
  const { user: admin } = useAuth();
  const [published, setPublished] = useState<Set<string>>(new Set(mockCourses.map((c) => c.id)));

  const togglePublish = (id: string) => {
    setPublished((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      auditLog(admin?.id || "", next.has(id) ? "publish" : "unpublish", id);
      return next;
    });
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-fredoka text-2xl font-bold text-foreground">Content</h1>
      </div>
      <Tabs defaultValue="courses">
        <TabsList>
          <TabsTrigger value="courses">Courses ({mockCourses.length})</TabsTrigger>
          <TabsTrigger value="exercises">Exercises ({allExercises.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="courses">
          <div className="flex justify-end mb-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Add Course</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Course</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Title</Label><Input placeholder="Course title" /></div>
                  <div><Label>Description</Label><Textarea placeholder="Description" /></div>
                  <Button className="w-full">Create (UI Only)</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Icon</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Exercises</TableHead>
                    <TableHead>Published</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCourses.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="text-xl">{c.icon}</TableCell>
                      <TableCell className="font-medium text-foreground">{c.title}</TableCell>
                      <TableCell><Badge variant="outline">{c.difficulty}</Badge></TableCell>
                      <TableCell>{c.totalExercises}</TableCell>
                      <TableCell><Switch checked={published.has(c.id)} onCheckedChange={() => togglePublish(c.id)} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="exercises">
          <div className="flex justify-end mb-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Add Exercise</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Exercise</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Title</Label><Input placeholder="Exercise title" /></div>
                  <div><Label>Instructions</Label><Textarea placeholder="Instructions" /></div>
                  <Button className="w-full">Create (UI Only)</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>XP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allExercises.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium text-foreground">{e.title}</TableCell>
                      <TableCell className="text-muted-foreground">{e.courseName}</TableCell>
                      <TableCell><Badge variant="outline">{e.difficulty}</Badge></TableCell>
                      <TableCell><Badge variant="secondary">{e.type}</Badge></TableCell>
                      <TableCell>{e.xpReward}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminContent;
