import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PomodoroTimer = () => {
  const { toast } = useToast();
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleSessionComplete = async () => {
    setIsRunning(false);
    
    if (isWorkSession && sessionStartTime) {
      // Log completed work session
      const duration = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from("time_logs").insert({
          user_id: user.id,
          session_type: "pomodoro",
          duration: duration,
        });
      }

      toast({
        title: "Work session complete!",
        description: "Time for a break.",
      });
    } else {
      toast({
        title: "Break complete!",
        description: "Ready for another session?",
      });
    }

    setIsWorkSession(!isWorkSession);
    setTimeLeft(isWorkSession ? breakMinutes * 60 : workMinutes * 60);
  };

  const toggleTimer = () => {
    if (!isRunning) {
      setSessionStartTime(new Date());
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSessionStartTime(null);
    setTimeLeft(isWorkSession ? workMinutes * 60 : breakMinutes * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="text-center space-y-4">
        <div className="text-8xl font-bold font-mono tracking-tighter">
          {formatTime(timeLeft)}
        </div>
        <p className="text-xl text-muted-foreground">
          {isWorkSession ? "Focus Time" : "Break Time"}
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          size="lg"
          onClick={toggleTimer}
          className="w-32"
        >
          {isRunning ? (
            <>
              <Pause className="mr-2 h-5 w-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="mr-2 h-5 w-5" />
              Start
            </>
          )}
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={resetTimer}
          className="w-32"
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6 w-full max-w-md pt-8 border-t border-border">
        <div className="space-y-2">
          <Label htmlFor="work-duration">Work Duration (min)</Label>
          <Input
            id="work-duration"
            type="number"
            min="1"
            max="60"
            value={workMinutes}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setWorkMinutes(val);
              if (isWorkSession && !isRunning) {
                setTimeLeft(val * 60);
              }
            }}
            disabled={isRunning}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="break-duration">Break Duration (min)</Label>
          <Input
            id="break-duration"
            type="number"
            min="1"
            max="30"
            value={breakMinutes}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setBreakMinutes(val);
              if (!isWorkSession && !isRunning) {
                setTimeLeft(val * 60);
              }
            }}
            disabled={isRunning}
          />
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;