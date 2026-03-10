import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const StudentLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) return setError("Please enter your email");
    if (!password.trim()) return setError("Please enter your password");

    setLoading(true);
    const { error } = await login(email, password);
    setLoading(false);

    if (error) {
      setError("Invalid email or password. Please try again.");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full animate-slide-up">
        <div className="text-center mb-8">
          <span className="text-6xl block mb-4 animate-float">🎒</span>
          <h1 className="font-fredoka text-3xl font-bold">Student Login</h1>
          <p className="text-muted-foreground mt-2">Ready to code some more?</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card rounded-3xl p-8 shadow-playful space-y-6">
          <div className="space-y-2">
            <Label className="font-semibold text-base">Email</Label>
            <Input
              type="email"
              placeholder="alex@kids.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl h-12 text-base border-2 focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-base">Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl h-12 text-base border-2 focus:border-primary"
            />
          </div>

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
            {loading ? "Logging in..." : "🚀 Let's Go!"}
          </Button>
        </form>

        <p className="text-center mt-6 text-muted-foreground">
          Don't have an account?{" "}
          <Button variant="link" className="text-primary font-semibold p-0" onClick={() => navigate("/signup")}>
            Sign up free
          </Button>
        </p>
        <p className="text-center mt-2">
          <Button variant="link" className="text-muted-foreground p-0" onClick={() => navigate("/role-select")}>
            ← Back
          </Button>
        </p>
      </div>
    </div>
  );
};

export default StudentLogin;