import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AdminLogin = () => {
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
      setError("Invalid credentials.");
    } else {
      navigate("/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-sm w-full">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🛡️</div>
          <h1 className="font-fredoka text-2xl font-bold text-foreground">Admin Access</h1>
          <p className="text-sm text-muted-foreground mt-1">Restricted area</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card rounded-xl p-6 shadow-sm border border-border space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Email</Label>
            <Input
              type="email"
              placeholder="admin@codeykids.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 rounded-lg px-4 py-3 text-sm font-medium">
              ❌ {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;