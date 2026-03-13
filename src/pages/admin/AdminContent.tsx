import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const AdminContent = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [{ data: coursesData }, { data: exercisesData }] = await Promise.all([
        supabase.from("courses").select("*").order("created_at"),
        supabase.from("exercises").select("*, modules(title, courses(title))").order("order_index"),
      ]);
      setCourses(coursesData || []);
      setExercises(exercisesData || []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  return (
    <AdminLayout>
      <h1 className="font-fredoka text-2xl font-bold mb-6 text-foreground">Content</h1>
      <Tabs defaultValue="courses">
        <TabsList>
          <TabsTrigger value="courses">Courses ({courses.length})</TabsTrigger>
          <TabsTrigger value="exercises">Exercises ({exercises.length})</TabsTrigger>
        </TabsList>

        {/* Courses */}
        <TabsContent value="courses">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : courses.length === 0 ? (
                <p className="text-muted-foreground text-sm p-6">No courses found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Icon</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="text-xl">{c.icon}</TableCell>
                        <TableCell className="font-medium">{c.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{c.difficulty}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{c.color}</TableCell>
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
        </TabsContent>

        {/* Exercises */}
        <TabsContent value="exercises">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : exercises.length === 0 ? (
                <p className="text-muted-foreground text-sm p-6">No exercises found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>XP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exercises.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{e.title}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {e.modules?.courses?.title || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {e.modules?.title || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{e.difficulty}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{e.type}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-yellow-600">
                          ⭐ {e.xp_reward}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminContent;