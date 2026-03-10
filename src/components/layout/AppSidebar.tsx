import {
  LayoutDashboard,
  BookOpen,
  Gamepad2,
  ClipboardList,
  GraduationCap,
  Users,
  BarChart3,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const studentItems = [
  { title: "Dashboard", url: "/student/dashboard", icon: LayoutDashboard },
  { title: "My Classroom", url: "/my-classroom", icon: Users },
  { title: "Assignments", url: "/assignments", icon: ClipboardList },
];

const teacherItems = [
  { title: "Dashboard", url: "/teacher/dashboard", icon: LayoutDashboard },
  { title: "Classrooms", url: "/teacher/classrooms", icon: Users },
  { title: "Assignments", url: "/teacher/assignments", icon: ClipboardList },
  { title: "Analytics", url: "/teacher/analytics", icon: BarChart3 },
  { title: "Courses", url: "/courses", icon: BookOpen },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user } = useAuth();

  const items = user?.role === "teacher" ? teacherItems : studentItems;
  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="bg-sidebar pt-4">
        <div className={`flex items-center gap-2 px-4 mb-4 ${collapsed ? "justify-center" : ""}`}>
          <span className="text-3xl animate-bounce-slow">🦊</span>
          {!collapsed && (
            <span className="font-fredoka text-xl font-bold text-foreground">
              Codey
            </span>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="font-fredoka text-muted-foreground">
            {collapsed ? "" : "Menu"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="h-11 rounded-xl text-base transition-all hover:bg-primary/10 data-[active=true]:bg-primary/20 data-[active=true]:text-primary data-[active=true]:font-semibold"
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/student/dashboard" || item.url === "/teacher/dashboard"}
                      activeClassName=""
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.role === "teacher" && (
          <SidebarGroup>
            <SidebarGroupLabel className="font-fredoka text-muted-foreground">
              {collapsed ? "" : "Teacher Tools"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/teacher/classrooms")}
                    className="h-11 rounded-xl text-base hover:bg-primary/10"
                  >
                    <NavLink to="/teacher/classrooms" activeClassName="">
                      <GraduationCap className="h-5 w-5" />
                      {!collapsed && <span>Manage Classes</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="bg-sidebar p-4">
        {user && (
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <span className="text-2xl">{user.avatar}</span>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            )}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}