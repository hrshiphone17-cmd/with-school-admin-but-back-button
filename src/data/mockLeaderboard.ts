export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  rank: number;
}

export const globalLeaderboard: LeaderboardEntry[] = [
  { userId: "s4", name: "Luna Code", avatar: "🦄", xp: 4200, level: 13, streak: 21, rank: 1 },
  { userId: "s2", name: "Maya Star", avatar: "⭐", xp: 3100, level: 10, streak: 12, rank: 2 },
  { userId: "s1", name: "Alex the Coder", avatar: "🦊", xp: 2450, level: 8, streak: 7, rank: 3 },
  { userId: "s3", name: "Sam Pixel", avatar: "🐸", xp: 1800, level: 6, streak: 3, rank: 4 },
  { userId: "s5", name: "Rio Debug", avatar: "🐼", xp: 950, level: 3, streak: 1, rank: 5 },
];

export const weeklyLeaderboard: LeaderboardEntry[] = [
  { userId: "s2", name: "Maya Star", avatar: "⭐", xp: 450, level: 10, streak: 12, rank: 1 },
  { userId: "s4", name: "Luna Code", avatar: "🦄", xp: 380, level: 13, streak: 21, rank: 2 },
  { userId: "s1", name: "Alex the Coder", avatar: "🦊", xp: 300, level: 8, streak: 7, rank: 3 },
  { userId: "s3", name: "Sam Pixel", avatar: "🐸", xp: 150, level: 6, streak: 3, rank: 4 },
  { userId: "s5", name: "Rio Debug", avatar: "🐼", xp: 75, level: 3, streak: 1, rank: 5 },
];

export const classroomLeaderboard: LeaderboardEntry[] = [
  { userId: "s2", name: "Maya Star", avatar: "⭐", xp: 3100, level: 10, streak: 12, rank: 1 },
  { userId: "s1", name: "Alex the Coder", avatar: "🦊", xp: 2450, level: 8, streak: 7, rank: 2 },
  { userId: "s3", name: "Sam Pixel", avatar: "🐸", xp: 1800, level: 6, streak: 3, rank: 3 },
  { userId: "s5", name: "Rio Debug", avatar: "🐼", xp: 950, level: 3, streak: 1, rank: 4 },
];
