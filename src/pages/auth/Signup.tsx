import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

const Signup = () => {
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!name.trim()) return setError("Please enter your name");
    if (!email.trim()) return setError("Please enter your email");
    if (password.length < 6) return setError("Password must be at least 6 characters");

    setLoading(true);
    const { error } = await signup(email, password, name, role);
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full animate-slide-up">
        <div className="text-center mb-8">
          <span className="text-6xl block mb-4 animate-bounce-slow">🦊</span>
          <h1 className="font-fredoka text-3xl font-bold">Join Codey!</h1>
          <p className="text-muted-foreground mt-2">Create your free account</p>
        </div>

        <form onSubmit={handleSignup} className="bg-card rounded-3xl p-8 shadow-playful space-y-6">
          {/* Role toggle */}
          <div className="flex rounded-2xl bg-muted p-1 gap-1">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`flex-1 rounded-xl py-3 text-center font-semibold transition-all ${
                role === "student" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              🎒 Student
            </button>
            <button
              type="button"
              onClick={() => setRole("teacher")}
              className={`flex-1 rounded-xl py-3 text-center font-semibold transition-all ${
                role === "teacher" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              👩‍🏫 Teacher
            </button>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold text-base">Full Name</Label>
            <Input
              placeholder={role === "student" ? "Alex the Coder" : "Ms. Johnson"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl h-12 text-base border-2"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold text-base">Email</Label>
            <Input
              type="email"
              placeholder={role === "student" ? "alex@kids.com" : "teacher@school.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl h-12 text-base border-2"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold text-base">Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl h-12 text-base border-2"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm font-medium">
              ❌ {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl h-12 text-lg font-bold shadow-playful hover:scale-[1.02] transition-transform"
          >
            {loading ? "Creating account..." : "🎉 Create Account"}
          </Button>
        </form>

        <p className="text-center mt-6 text-muted-foreground">
          Already have an account?{" "}
          <Button
            variant="link"
            className="text-primary font-semibold p-0"
            onClick={() => navigate("/role-select")}
          >
            Log in
          </Button>
        </p>
      </div>
    </div>
  );
};

export default Signup;