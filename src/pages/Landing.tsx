import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Code, Gamepad2, Trophy, BookOpen, Star, Users } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-card shadow-playful sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-3xl animate-bounce-slow">🦊</span>
          <span className="font-fredoka text-2xl font-bold text-foreground">Codey Kids</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="rounded-xl font-semibold text-muted-foreground" onClick={() => navigate("/school-admin/login")}>
            🏫 School Login
          </Button>
          <Button variant="ghost" className="rounded-xl font-semibold" onClick={() => navigate("/role-select")}>
            Log In
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left animate-slide-up">
            <h1 className="font-fredoka text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
              Learn to Code with{" "}
              <span className="text-primary">Fun</span> &{" "}
              <span className="text-accent-foreground bg-banana rounded-xl px-2">Adventure!</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg">
              Help our fox friend solve puzzles, collect gems, and become a coding master! 
              Perfect for kids aged 6–14. 🍌
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button
                size="lg"
                className="rounded-2xl text-lg h-14 px-8 bg-primary font-bold shadow-playful-lg hover:scale-105 transition-transform"
                onClick={() => navigate("/role-select")}
              >
                🚀 Start Coding!
              </Button>
              
            </div>
          </div>

          {/* Fun illustration area */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-72 h-72 md:w-96 md:h-96">
              <div className="absolute inset-0 bg-pastel-blue rounded-[3rem] rotate-3 opacity-50" />
              <div className="absolute inset-2 bg-mint rounded-[3rem] -rotate-2 opacity-50" />
              <div className="absolute inset-4 bg-banana rounded-[3rem] rotate-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl md:text-9xl animate-float">🦊</div>
                  <div className="flex gap-2 justify-center mt-4">
                    <span className="text-3xl animate-wiggle" style={{ animationDelay: "0s" }}>🍌</span>
                    <span className="text-3xl animate-wiggle" style={{ animationDelay: "0.2s" }}>🍌</span>
                    <span className="text-3xl animate-wiggle" style={{ animationDelay: "0.4s" }}>🍌</span>
                  </div>
                  <div className="mt-2 flex gap-1 justify-center">
                    <span className="text-xl">💻</span>
                    <span className="text-xl">⭐</span>
                    <span className="text-xl">🏆</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 bg-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-fredoka text-3xl md:text-4xl font-bold text-center mb-12">
            Why Kids <span className="text-primary">Love</span> Codey 🦊
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Code className="h-8 w-8" />, title: "Real Coding", desc: "Write real code that brings characters to life!", bg: "bg-pastel-blue" },
              { icon: <Gamepad2 className="h-8 w-8" />, title: "Game-Based Learning", desc: "Solve puzzles and navigate through fun levels!", bg: "bg-mint" },
              { icon: <Trophy className="h-8 w-8" />, title: "Earn Rewards", desc: "Collect XP, badges, and climb the leaderboard!", bg: "bg-banana" },
              { icon: <BookOpen className="h-8 w-8" />, title: "Guided Courses", desc: "Step-by-step lessons from beginner to pro!", bg: "bg-peach" },
              { icon: <Star className="h-8 w-8" />, title: "Daily Challenges", desc: "Keep your streak alive with daily coding fun!", bg: "bg-pastel-purple/30" },
              { icon: <Users className="h-8 w-8" />, title: "Classroom Ready", desc: "Perfect for schools with teacher dashboards!", bg: "bg-secondary" },
            ].map((feature, i) => (
              <div
                key={i}
                className={`${feature.bg} rounded-2xl p-6 shadow-playful hover:shadow-playful-lg hover:scale-[1.02] transition-all cursor-default`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="bg-card rounded-xl w-14 h-14 flex items-center justify-center mb-4 shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="font-fredoka text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Parent / Teacher section */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-fredoka text-3xl md:text-4xl font-bold mb-6">
            For Parents & Teachers 👨‍🏫
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track your child's or students' progress with detailed analytics. Create classrooms,
            assign exercises, and watch coding skills grow! Safe, ad-free, and aligned with
            education standards.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {[
              { emoji: "📊", title: "Progress Tracking", desc: "See detailed stats" },
              { emoji: "🏫", title: "Classroom Tools", desc: "Manage students easily" },
              { emoji: "🛡️", title: "Safe & Secure", desc: "Kid-friendly environment" },
            ].map((item, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 shadow-playful">
                <span className="text-4xl mb-3 block">{item.emoji}</span>
                <h3 className="font-fredoka text-lg font-bold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-2xl">🦊</span>
          <span className="font-fredoka text-lg font-bold">Codey Kids</span>
        </div>
        <p className="text-sm text-muted-foreground">Making coding fun for every kid! © 2026</p>
      </footer>
    </div>
  );
};

export default Landing;