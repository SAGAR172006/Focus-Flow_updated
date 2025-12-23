import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Check } from "lucide-react";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "General",
    priority: "medium",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks", {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      setTasks(data || []);
    } catch (error) {
      alert(`Failed to fetch tasks: ${error.message}`);
    }
  };

  const addTask = async () => {
    if (!newTask.title.trim()) {
      alert("Title required: Please enter a task title");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(newTask),
      });
      if (!response.ok) {
        throw new Error("Failed to add task");
      }

      alert("Task added! Your task has been created.");
      setNewTask({
        title: "",
        description: "",
        category: "General",
        priority: "medium",
      });
      fetchTasks(); // Refresh list
    } catch (error) {
      alert(`Failed to add task: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const completeTask = async (taskId) => {
    try {
      // --- THIS IS THE FIX ---
      // The ID must be part of the URL
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          status: "completed",
          completed_at: new Date().toISOString(),
        }),
      });
      // --- END OF FIX ---
      if (!response.ok) {
        throw new Error("Failed to complete task");
      }

      alert("Task completed!");
      fetchTasks(); // Refresh list
    } catch (error) {
      alert(`Failed to complete task: ${error.message}`);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      // --- THIS IS THE FIX ---
      // The ID must be part of the URL
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        credentials: 'include',
      });
      // --- END OF FIX ---
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      alert("Task deleted");
      fetchTasks(); // Refresh list
    } catch (error) {
      alert(`Failed to delete task: ${error.message}`);
    }
  };

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Task Manager</h1>
        <p className="text-muted-foreground">Organize and track your tasks</p>
      </div>

      {/* Add Task Card */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Create New Task</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <Textarea
            placeholder="Description (optional)"
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              value={newTask.category}
              onValueChange={(value) =>
                setNewTask({ ...newTask, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Work">Work</SelectItem>
                <SelectItem value="Study">Study</SelectItem>
                <SelectItem value="Fitness">Fitness</SelectItem>
                <SelectItem value="Personal">Personal</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={newTask.priority}
              onValueChange={(value) =>
                setNewTask({ ...newTask, priority: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={addTask} disabled={isLoading} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Pending Tasks ({pendingTasks.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No pending tasks. Great job!
              </p>
            ) : (
              pendingTasks.map((task) => (
                <div
                  key={task._id}
                  className="p-4 bg-background/50 rounded-lg border border-border/50 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                          {task.category}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            task.priority === "high"
                              ? "bg-destructive/10 text-destructive"
                              : task.priority === "medium"
                              ? "bg-accent/10 text-accent"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => completeTask(task._id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteTask(task._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Completed Tasks ({completedTasks.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No completed tasks yet
              </p>
            ) : (
              completedTasks.map((task) => (
                <div
                  key={task._id}
                  className="p-4 bg-background/50 rounded-lg border border-border/50 opacity-75"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium line-through">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-through">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteTask(task._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Tasks;