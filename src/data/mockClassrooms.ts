export interface Classroom {
  id: string;
  name: string;
  teacherId: string;
  studentIds: string[];
  courseIds: string[];
  createdAt: string;
  code: string;
}

export interface Assignment {
  id: string;
  classroomId: string;
  title: string;
  exerciseIds: string[];
  dueDate: string;
  createdAt: string;
  completions: { studentId: string; completedAt: string; }[];
}

export const mockClassrooms: Classroom[] = [
  {
    id: "c1",
    name: "Jungle Coders 🌴",
    teacherId: "t1",
    studentIds: ["s1", "s2", "s3", "s5"],
    courseIds: ["course-1", "course-2"],
    createdAt: "2025-09-01",
    code: "JUNGLE24",
  },
  {
    id: "c2",
    name: "Code Explorers 🚀",
    teacherId: "t1",
    studentIds: ["s3", "s4"],
    courseIds: ["course-1", "course-2", "course-3"],
    createdAt: "2025-10-15",
    code: "EXPLORE24",
  },
];

export const mockAssignments: Assignment[] = [
  {
    id: "a1",
    classroomId: "c1",
    title: "Hello World Basics",
    exerciseIds: ["e1-1", "e1-2"],
    dueDate: "2026-03-15",
    createdAt: "2026-03-01",
    completions: [
      { studentId: "s1", completedAt: "2026-03-05" },
      { studentId: "s2", completedAt: "2026-03-04" },
    ],
  },
  {
    id: "a2",
    classroomId: "c1",
    title: "Moving the Fox",
    exerciseIds: ["e1-3", "e1-4"],
    dueDate: "2026-03-20",
    createdAt: "2026-03-08",
    completions: [
      { studentId: "s2", completedAt: "2026-03-10" },
    ],
  },
  {
    id: "a3",
    classroomId: "c2",
    title: "Variables Challenge",
    exerciseIds: ["e2-1", "e2-2", "e2-3"],
    dueDate: "2026-03-25",
    createdAt: "2026-03-10",
    completions: [],
  },
];
