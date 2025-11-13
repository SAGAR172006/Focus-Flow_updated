import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CountdownTimer = () => {
  const { toast } = useToast();
  const [minutes, setMinutes] = useState(10);
  const [timeLeft, setTimeLeft] = useState(minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = async () => {
    setIsRunning(false);
    
    if (sessionStartTime) {
      const duration = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from("time_logs").insert({
          user_id: user.id,
          session_type: "timer",
          duration: duration,
        });
      }
    }

    toast({
      title: "Timer complete!",
      description: "Time's up! Great work.",
    });
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
    setTimeLeft(minutes * 60);
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
        <p className="text-xl text-muted-foreground">Countdown Timer</p>
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

      <div className="w-full max-w-xs pt-8 border-t border-border">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            min="1"
            max="180"
            value={minutes}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              setMinutes(val);
              if (!isRunning) {
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

export default CountdownTimer;