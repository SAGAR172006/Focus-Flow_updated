import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingDown, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CalorieRecord {
  id: string;
  type: string;
  description: string;
  calories: number;
  recorded_at: string;
}

const Calories = () => {
  const { toast } = useToast();
  const [records, setRecords] = useState<CalorieRecord[]>([]);
  const [newRecord, setNewRecord] = useState({
    description: "",
    calories: "",
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("calorie_records")
      .select("*")
      .eq("user_id", user.id)
      .order("recorded_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Failed to fetch records",
        description: error.message,
      });
    } else {
      setRecords(data || []);
    }
  };

  const addRecord = async (type: "gained" | "spent") => {
    if (!newRecord.description.trim() || !newRecord.calories) {
      toast({
        variant: "destructive",
        title: "All fields required",
        description: "Please fill in all fields",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("calorie_records").insert({
      user_id: user.id,
      type: type,
      description: newRecord.description,
      calories: parseInt(newRecord.calories),
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Failed to add record",
        description: error.message,
      });
    } else {
      toast({
        title: "Record added!",
      });
      setNewRecord({ description: "", calories: "" });
      fetchRecords();
    }
  };

  const todayRecords = records.filter(
    (r) =>
      new Date(r.recorded_at).toDateString() === new Date().toDateString()
  );

  const caloriesGained = todayRecords
    .filter((r) => r.type === "gained")
    .reduce((sum, r) => sum + r.calories, 0);

  const caloriesSpent = todayRecords
    .filter((r) => r.type === "spent")
    .reduce((sum, r) => sum + r.calories, 0);

  const netCalories = caloriesGained - caloriesSpent;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Wellness Tracker</h1>
        <p className="text-muted-foreground">Monitor your calorie balance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Calories Gained
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{caloriesGained}</div>
            <p className="text-xs text-muted-foreground mt-1">Today</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Calories Spent
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{caloriesSpent}</div>
            <p className="text-xs text-muted-foreground mt-1">Today</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Balance
            </CardTitle>
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

      {/* Add Records */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Log Calories</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="gained" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="gained">Calories Gained</TabsTrigger>
              <TabsTrigger value="spent">Calories Spent</TabsTrigger>
            </TabsList>

            <TabsContent value="gained" className="space-y-4">
              <div className="space-y-2">
                <Label>Food/Supplement</Label>
                <Input
                  placeholder="e.g., Chicken breast, Protein shake"
                  value={newRecord.description}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Calories</Label>
                <Input
                  type="number"
                  placeholder="e.g., 350"
                  value={newRecord.calories}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, calories: e.target.value })
                  }
                />
              </div>
              <Button onClick={() => addRecord("gained")} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Calories Gained
              </Button>
            </TabsContent>

            <TabsContent value="spent" className="space-y-4">
              <div className="space-y-2">
                <Label>Activity</Label>
                <Input
                  placeholder="e.g., Running, Gym workout"
                  value={newRecord.description}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Calories</Label>
                <Input
                  type="number"
                  placeholder="e.g., 450"
                  value={newRecord.calories}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, calories: e.target.value })
                  }
                />
              </div>
              <Button onClick={() => addRecord("spent")} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Calories Spent
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Recent Records */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Today's Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {todayRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No activity recorded today
            </p>
          ) : (
            todayRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      record.type === "gained"
                        ? "bg-accent/10"
                        : "bg-primary/10"
                    }`}
                  >
                    {record.type === "gained" ? (
                      <TrendingUp className="h-4 w-4 text-accent" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{record.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(record.recorded_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div
                  className={`font-bold ${
                    record.type === "gained" ? "text-accent" : "text-primary"
                  }`}
                >
                  {record.type === "gained" ? "+" : "-"}
                  {record.calories}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Calories;