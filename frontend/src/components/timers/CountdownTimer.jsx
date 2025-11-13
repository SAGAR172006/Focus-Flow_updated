import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw } from "lucide-react";
// import { useToast } from "@/hooks/use-toast"; // Removed
// import { supabase } from "@/integrations/supabase/client"; // Removed

const CountdownTimer = () => {
  // const { toast } = useToast(); // Removed
  const [minutes, setMinutes] = useState(10);
  const [timeLeft, setTimeLeft] = useState(minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null); // Removed TypeScript

  useEffect(() => {
    let interval; // Removed TypeScript

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
      const duration = Math.floor(
        (new Date().getTime() - sessionStartTime.getTime()) / 1000
      );
      
      // --- Replaced Supabase with fetch to your API ---
      try {
        const response = await fetch("/api/log-time", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_type: "timer",
            duration: duration,
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to log time session");
        }
        console.log("Timer session logged.");
      } catch (error) {
        console.error("Error logging time:", error);
        alert("Error: Could not save your session."); // Replaced toast
      }
      // --- End of replacement ---
    }

    alert("Timer complete! Time's up! Great work."); // Replaced toast
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

  const formatTime = (seconds) => { // Removed TypeScript
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
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
        <Button size="lg" onClick={toggleTimer} className="w-32">
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