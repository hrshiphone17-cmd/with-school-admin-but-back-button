import { useEffect, useState } from "react";
import { SchoolAdminLayout } from "@/components/school-admin/SchoolAdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Users, GraduationCap, School } from "lucide-react";

const SchoolAdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ teachers: 0, students: 0, classrooms: 0 });
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.school_id) return;

    const fetchStats = async () => {
      // Fetch school name
      const { data: schoolData } = await supabase
        .from("schools")
        .select("name")
        .eq("id", user.school_id)
        .single();
      if (schoolData) setSchoolName(schoolData.name);

      // Count teachers
      const { count: teacherCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("school_id", user.school_id)
        .eq("role", "teacher");

      // Count students
      const { count: studentCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("school_id", user.school_id)
        .eq("role", "student");

      // Count classrooms
      const { data: teachers } = await supabase
        .from("users")
        .select("id")
        .eq("school_id", user.school_id)
        .eq("role", "teacher");

      let classroomCount = 0;
      if (teachers && teachers.length > 0) {
        const { count } = await supabase
          .from("classrooms")
          .select("*", { count: "exact", head: true })
          .in("teacher_id", teachers.map((t) => t.id));
        classroomCount = count || 0;
      }

      setStats({
        teachers: teacherCount || 0,
        students: studentCount || 0,
        classrooms: classroomCount,
      });
      setLoading(false);
    };

    fetchStats();
  }, [user]);

  return (
    <SchoolAdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="font-fredoka text-3xl font-bold">
            Welcome, {user?.name}! 🏫
          </h1>
          <p className="text-muted-foreground mt-1">
            {schoolName || "Your School"} — Overview
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-muted rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-pastel-blue rounded-2xl p-6 shadow-playful">
              <GraduationCap className="h-8 w-8 mb-3 text-foreground" />
              <p className="font-fredoka text-3xl font-bold">{stats.teachers}</p>
              <p className="text-sm text-muted-foreground mt-1">Teachers</p>
            </div>
            <div className="bg-mint rounded-2xl p-6 shadow-playful">
              <Users className="h-8 w-8 mb-3 text-foreground" />
              <p className="font-fredoka text-3xl font-bold">{stats.students}</p>
              <p className="text-sm text-muted-foreground mt-1">Students</p>
            </div>
            <div className="bg-banana rounded-2xl p-6 shadow-playful">
              <School className="h-8 w-8 mb-3 text-foreground" />
              <p className="font-fredoka text-3xl font-bold">{stats.classrooms}</p>
              <p className="text-sm text-muted-foreground mt-1">Classrooms</p>
            </div>
          </div>
        )}
      </div>
    </SchoolAdminLayout>
  );
};

export default SchoolAdminDashboard;