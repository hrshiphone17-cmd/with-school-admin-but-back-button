import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const RoleSelect = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full animate-slide-up">
        <div className="text-center mb-10">
          <span className="text-6xl block mb-4 animate-bounce-slow">🦊</span>
          <h1 className="font-fredoka text-3xl md:text-4xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-lg text-muted-foreground">Who are you?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button
            onClick={() => navigate("/login/student")}
            className="bg-card rounded-3xl p-8 shadow-playful hover:shadow-playful-lg hover:scale-105 transition-all text-center group border-2 border-transparent hover:border-pastel-blue"
          >
            <span className="text-7xl block mb-4 group-hover:animate-wiggle">🎒</span>
            <h2 className="font-fredoka text-2xl font-bold mb-2">I'm a Student</h2>
            <p className="text-muted-foreground">Learn to code, play games, and earn rewards!</p>
          </button>

          <button
            onClick={() => navigate("/login/teacher")}
            className="bg-card rounded-3xl p-8 shadow-playful hover:shadow-playful-lg hover:scale-105 transition-all text-center group border-2 border-transparent hover:border-mint"
          >
            <span className="text-7xl block mb-4 group-hover:animate-wiggle">👩‍🏫</span>
            <h2 className="font-fredoka text-2xl font-bold mb-2">I'm a Teacher</h2>
            <p className="text-muted-foreground">Manage classrooms and track student progress!</p>
          </button>
        </div>

        <p className="text-center mt-8">
          <Button variant="link" className="text-muted-foreground p-0" onClick={() => navigate("/")}>
            ← Back to home
          </Button>
        </p>
      </div>
    </div>
  );
};

export default RoleSelect;