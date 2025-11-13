import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timer, CheckSquare, Activity, Clock, Target } from "lucide-react";
// import { supabase } from "@/integrations/supabase/client"; // Removed
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const Dashboard = () => {
  const [timeLogs, setTimeLogs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [calorieRecords, setCalorieRecords] = useState([]);
  const [viewMode, setViewMode] = useState("weekly");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      // --- Replaced Supabase with a single fetch call ---
      const response = await fetch("/api/dashboard/analytics");
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      const { logsResult, tasksResult, caloriesResult } = await response.json();
      // --- End of replacement ---

      setTimeLogs(logsResult || []);
      setTasks(tasksResult || []);
      setCalorieRecords(caloriesResult || []);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats
  const getWeekStart = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek;
    return new Date(now.setDate(diff));
  };

  const weekStart = getWeekStart();

  const weekLogs = timeLogs.filter(
    (log) => new Date(log.created_at) >= weekStart
  );
  const totalWeekTime = weekLogs.reduce((sum, log) => sum + log.duration, 0);
  const weekHours = Math.floor(totalWeekTime / 3600);
  const weekMinutes = Math.floor((totalWeekTime % 3600) / 60);

  const pomodoroSessions = weekLogs.filter(
    (log) => log.session_type === "pomodoro"
  ).length;

  const completedTasks = tasks.filter(
    (task) =>
      task.status === "completed" &&
      task.completed_at &&
      new Date(task.completed_at) >= weekStart
  ).length;

  const totalTasks = tasks.filter(
    (task) => new Date(task.created_at) >= weekStart
  ).length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const todayCalories = calorieRecords.filter(
    (record) =>
      new Date(record.recorded_at).toDateString() === new Date().toDateString()
  );
  const caloriesGained = todayCalories
    .filter((r) => r.type === "gained")
    .reduce((sum, r) => sum + r.calories, 0);
  const caloriesSpent = todayCalories
    .filter((r) => r.type === "spent")
    .reduce((sum, r) => sum + r.calories, 0);
  const netCalories = caloriesGained - caloriesSpent;

  // Prepare chart data
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const last7Days = getLast7Days();

  const productivityData = last7Days.map((date) => {
    const dateStr = date.toDateString();
    const dayLogs = timeLogs.filter(
      (log) => new Date(log.created_at).toDateString() === dateStr
    );
    const totalMinutes = dayLogs.reduce(
      (sum, log) => sum + log.duration / 60,
      0
    );
    const dayTasks = tasks.filter(
      (task) =>
        task.status === "completed" &&
        task.completed_at &&
        new Date(task.completed_at).toDateString() === dateStr
    ).length;

    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      focusTime: Math.round(totalMinutes),
      tasks: dayTasks,
    };
  });

  const calorieData = last7Days.map((date) => {
    const dateStr = date.toDateString();
    const dayRecords = calorieRecords.filter(
      (record) => new Date(record.recorded_at).toDateString() === dateStr
    );
    const gained = dayRecords
      .filter((r) => r.type === "gained")
      .reduce((sum, r) => sum + r.calories, 0);
    const spent = dayRecords
      .filter((r) => r.type === "spent")
      .reduce((sum, r) => sum + r.calories, 0);

    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      gained,
      spent,
      net: gained - spent,
    };
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your productivity and wellness metrics
          </p>
        </div>
        <Tabs
          value={viewMode}
          onValueChange={(v) => setViewMode(v)}
        >
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Focus Time
            </CardTitle>
            <Timer className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {weekHours}h {weekMinutes}m
            </div>
            <p className="text-xs text-muted-foreground mt-1">This week</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tasks Completed
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completionRate}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pomodoro Sessions
            </CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pomodoroSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">This week</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Calorie Balance
            </CardTitle>
            <Activity className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${
                netCalories > 0 ? "text-accent" : "text-primary"
              }`}
            >
              {netCalories > 0 ? "+" : ""}
              {netCalories}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Productivity Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={productivityData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="focusTime"
                  name="Focus Time (min)"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
                <Line
                  type="monotone"
                  dataKey="tasks"
                  name="Tasks Completed"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--accent))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              Calorie Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={calorieData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="gained"
                  name="Gained"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--accent))" }}
                />
                <Line
                  type="monotone"
                  dataKey="spent"
                  name="Spent"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;