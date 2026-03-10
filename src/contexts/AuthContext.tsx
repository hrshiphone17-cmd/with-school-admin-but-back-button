import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  avatar: string;
  xp: number;
  level: number;
  streak: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, name: string, role: "student" | "teacher") => Promise<{ error: any }>;
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signup: async () => ({ error: null }),
  login: async () => ({ error: null }),
  logout: async () => {},
  isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (id: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();
    if (error) console.error("fetchProfile error:", error);
    if (!error && data) setUser(data);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) fetchProfile(session.user.id);
      else setUser(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signup = async (
    email: string,
    password: string,
    name: string,
    role: "student" | "teacher"
  ) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error };

    if (data.user) {
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        name,
        email,
        role,
        avatar: "🦊",
        xp: 0,
        level: 1,
        streak: 0,
      });
      if (profileError) console.error("Profile insert error:", profileError);
    }

    return { error: null };
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signup,
      login,
      logout,
      isAuthenticated: !!user,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);