import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const badges = [
  { id: "first-code", label: "First Code" },
  { id: "streak-5", label: "5-Day Streak" },
  { id: "streak-10", label: "10-Day Streak" },
  { id: "banana-collector", label: "Banana Collector" },
  { id: "speed-coder", label: "Speed Coder" },
  { id: "bug-squasher", label: "Bug Squasher" },
  { id: "level-10", label: "Level 10" },
  { id: "master-coder", label: "Master Coder" },
];

const AdminSettings = () => {
  const { toast } = useToast();
  const [leaderboard, setLeaderboard] = useState(true);
  const [streaks, setStreaks] = useState(true);
  const [xpMultiplier, setXpMultiplier] = useState([1]);
  const [enabledBadges, setEnabledBadges] = useState<Set<string>>(
    new Set(badges.map((b) => b.id))
  );

  const toggleBadge = (id: string) => {
    setEnabledBadges((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    toast({ title: "Settings saved", description: "All changes applied successfully." });
  };

  return (
    <AdminLayout>
      <h1 className="font-fredoka text-2xl font-bold mb-6 text-foreground">Settings</h1>
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader><CardTitle className="font-fredoka text-base">Feature Toggles</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Leaderboard</Label>
              <Switch checked={leaderboard} onCheckedChange={setLeaderboard} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Daily Streaks</Label>
              <Switch checked={streaks} onCheckedChange={setStreaks} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-fredoka text-base">XP Multiplier</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Slider
                value={xpMultiplier}
                onValueChange={setXpMultiplier}
                min={0.5}
                max={3}
                step={0.25}
                className="flex-1"
              />
              <span className="text-lg font-bold w-12 text-right">{xpMultiplier[0]}x</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-fredoka text-base">Achievement Badges</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {badges.map((b) => (
              <div key={b.id} className="flex items-center justify-between">
                <Label>{b.label}</Label>
                <Switch checked={enabledBadges.has(b.id)} onCheckedChange={() => toggleBadge(b.id)} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full">Save Settings</Button>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;