import SchoolAdminStudents from "./pages/school-admin/SchoolAdminStudents";
import SchoolAdminAnalytics from "./pages/school-admin/SchoolAdminAnalytics";
import SchoolAdminTeachers from "./pages/school-admin/SchoolAdminTeachers";
import Leaderboard from "./pages/student/Leaderboard";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import Landing from "./pages/Landing";
import RoleSelect from "./pages/auth/RoleSelect";
import StudentLogin from "./pages/auth/StudentLogin";
import TeacherLogin from "./pages/auth/TeacherLogin";
import StudentDashboard from "./pages/student/StudentDashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import Courses from "./pages/student/Courses";
import CourseDetail from "./pages/student/CourseDetail";
import Exercise from "./pages/student/Exercise";
import VisualGame from "./pages/student/VisualGame";
import StudentAssignments from "./pages/student/StudentAssignments";
import MyClassroom from "./pages/student/MyClassroom";
import Classrooms from "./pages/teacher/Classrooms";
import ClassroomDetail from "./pages/teacher/ClassroomDetail";
import Assignments from "./pages/teacher/Assignments";
import Analytics from "./pages/teacher/Analytics";
import NotFound from "./pages/NotFound";

// Admin imports
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminClassrooms from "./pages/admin/AdminClassrooms";
import AdminContent from "./pages/admin/AdminContent";
import AdminAssignments from "./pages/admin/AdminAssignments";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import { ProtectedAdminRoute } from "./components/admin/ProtectedAdminRoute";

// School Admin imports
import SchoolAdminLogin from "./pages/school-admin/SchoolAdminLogin";
import SchoolAdminDashboard from "./pages/school-admin/SchoolAdminDashboard";
import { ProtectedSchoolAdminRoute } from "./components/school-admin/ProtectedSchoolAdminRoute";

const queryClient = new QueryClient();

function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/role-select" />;
  if (user.role === "admin") return <Navigate to="/admin/dashboard" />;
  if (user.role === "school_admin") return <Navigate to="/school-admin/dashboard" />;
  if (user.role === "teacher") return <Navigate to="/teacher/dashboard" />;
  return <Navigate to="/student/dashboard" />;
}

function RequireAuth({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "student" | "teacher";
}) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/role-select" />;
  if (user.role === "admin") return <Navigate to="/admin/dashboard" />;
  if (user.role === "school_admin") return <Navigate to="/school-admin/dashboard" />;
  if (role && user.role !== role) {
    if (user.role === "teacher") return <Navigate to="/teacher/dashboard" />;
    return <Navigate to="/student/dashboard" />;
  }
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<Landing />} />
    <Route path="/role-select" element={<RoleSelect />} />
    <Route path="/login/student" element={<StudentLogin />} />
    <Route path="/login/teacher" element={<TeacherLogin />} />

    {/* Dashboard redirect */}
    <Route path="/dashboard" element={<DashboardRedirect />} />

    {/* Student routes */}
    <Route path="/student/dashboard" element={<RequireAuth role="student"><StudentDashboard /></RequireAuth>} />
    <Route path="/assignments" element={<RequireAuth role="student"><StudentAssignments /></RequireAuth>} />
    <Route path="/my-classroom" element={<RequireAuth role="student"><MyClassroom /></RequireAuth>} />

    {/* Shared routes */}
    <Route path="/courses" element={<RequireAuth><Courses /></RequireAuth>} />
    <Route path="/courses/:courseId" element={<RequireAuth><CourseDetail /></RequireAuth>} />
    <Route path="/exercise/:exerciseId" element={<RequireAuth><Exercise /></RequireAuth>} />
    <Route path="/playground" element={<RequireAuth><VisualGame /></RequireAuth>} />

    {/* Teacher routes */}
    <Route path="/teacher/dashboard" element={<RequireAuth role="teacher"><TeacherDashboard /></RequireAuth>} />
    <Route path="/teacher/classrooms" element={<RequireAuth role="teacher"><Classrooms /></RequireAuth>} />
    <Route path="/teacher/classrooms/:classroomId" element={<RequireAuth role="teacher"><ClassroomDetail /></RequireAuth>} />
    <Route path="/teacher/assignments" element={<RequireAuth role="teacher"><Assignments /></RequireAuth>} />
    <Route path="/teacher/analytics" element={<RequireAuth role="teacher"><Analytics /></RequireAuth>} />
    <Route path="/teacher/leaderboard" element={<RequireAuth role="teacher"><Leaderboard /></RequireAuth>} />

    {/* Hidden platform admin routes */}
    <Route path="/x/admin-login" element={<AdminLogin />} />
    <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
    <Route path="/admin/users" element={<ProtectedAdminRoute><AdminUsers /></ProtectedAdminRoute>} />
    <Route path="/admin/classrooms" element={<ProtectedAdminRoute><AdminClassrooms /></ProtectedAdminRoute>} />
    <Route path="/admin/content" element={<ProtectedAdminRoute><AdminContent /></ProtectedAdminRoute>} />
    <Route path="/admin/assignments" element={<ProtectedAdminRoute><AdminAssignments /></ProtectedAdminRoute>} />
    <Route path="/admin/analytics" element={<ProtectedAdminRoute><AdminAnalytics /></ProtectedAdminRoute>} />
    <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>} />

    {/* School Admin routes */}
    <Route path="/school-admin/login" element={<SchoolAdminLogin />} />
    <Route path="/school-admin/dashboard" element={<ProtectedSchoolAdminRoute><SchoolAdminDashboard /></ProtectedSchoolAdminRoute>} />
    <Route path="/school-admin/teachers" element={<ProtectedSchoolAdminRoute><SchoolAdminTeachers /></ProtectedSchoolAdminRoute>} />
    <Route path="/school-admin/students" element={<ProtectedSchoolAdminRoute><SchoolAdminStudents /></ProtectedSchoolAdminRoute>} />
<Route path="/school-admin/analytics" element={<ProtectedSchoolAdminRoute><SchoolAdminAnalytics /></ProtectedSchoolAdminRoute>} />

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;