export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  achievements: string[];
  classroomIds: string[];
}

export const mockUsers: User[] = [
  {
    id: "s1",
    name: "Alex the Coder",
    email: "alex@kids.com",
    role: "student",
    avatar: "🦊",
    xp: 2450,
    level: 8,
    streak: 7,
    achievements: ["first-code", "streak-5", "banana-collector", "bug-squasher"],
    classroomIds: ["c1"],
  },
  {
    id: "s2",
    name: "Maya Star",
    email: "maya@kids.com",
    role: "student",
    avatar: "⭐",
    xp: 3100,
    level: 10,
    streak: 12,
    achievements: ["first-code", "streak-10", "banana-collector", "speed-coder", "level-10"],
    classroomIds: ["c1"],
  },
  {
    id: "s3",
    name: "Sam Pixel",
    email: "sam@kids.com",
    role: "student",
    avatar: "🐸",
    xp: 1800,
    level: 6,
    streak: 3,
    achievements: ["first-code", "banana-collector"],
    classroomIds: ["c1", "c2"],
  },
  {
    id: "s4",
    name: "Luna Code",
    email: "luna@kids.com",
    role: "student",
    avatar: "🦄",
    xp: 4200,
    level: 13,
    streak: 21,
    achievements: ["first-code", "streak-5", "streak-10", "streak-20", "banana-collector", "speed-coder", "level-10", "master-coder"],
    classroomIds: ["c2"],
  },
  {
    id: "s5",
    name: "Rio Debug",
    email: "rio@kids.com",
    role: "student",
    avatar: "🐼",
    xp: 950,
    level: 3,
    streak: 1,
    achievements: ["first-code"],
    classroomIds: ["c1"],
  },
  {
    id: "t1",
    name: "Ms. Johnson",
    email: "johnson@school.com",
    role: "teacher",
    avatar: "👩‍🏫",
    xp: 0,
    level: 0,
    streak: 0,
    achievements: [],
    classroomIds: ["c1", "c2"],
  },
];

export const mockAdminUser: User = {
  id: "admin-1",
  name: "Admin",
  email: "admin@codeykids.com",
  role: "admin",
  avatar: "🛡️",
  xp: 0,
  level: 0,
  streak: 0,
  achievements: [],
  classroomIds: [],
};

export const mockStudentUser = mockUsers[0];
export const mockTeacherUser = mockUsers[5];
