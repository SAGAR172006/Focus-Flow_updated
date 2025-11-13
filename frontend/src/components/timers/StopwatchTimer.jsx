import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Save } from "lucide-react";
// import { useToast } from "@/hooks/use-toast"; // Removed
// import { supabase } from "@/integrations/supabase/client"; // Removed

const StopwatchTimer = () => {
  // const { toast } = useToast(); // Removed
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval; // Removed TypeScript

    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => prev + 10);
      }, 10);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(0);
  };

  const saveSession = async () => {
    if (time === 0) {
      alert("No session to save. Start the stopwatch first."); // Replaced toast
      return;
    }
    
    // --- Replaced Supabase with fetch to your API ---
    try {
      const duration = Math.floor(time / 1000);
      const response = await fetch("/api/log-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_type: "stopwatch",
          duration: duration,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save session");
      }

      alert(`Session saved! Recorded ${formatTime(time)}`); // Replaced toast
      resetTimer();

    } catch (error) {
      console.error("Error saving session:", error);
      alert(`Failed to save session: ${error.message}`); // Replaced toast
    }
    // --- End of replacement ---
  };

  const formatTime = (ms) => { // Removed TypeScript
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="text-center space-y-4">
        <div className="text-7xl font-bold font-mono tracking-tighter">
          {formatTime(time)}
        </div>
        <p className="text-xl text-muted-foreground">Stopwatch</p>
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
        <Button
          size="lg"
          variant="secondary"
          onClick={saveSession}
          className="w-32"
          disabled={time === 0}
        >
          <Save className="mr-2 h-5 w-5" />
          Save
        </Button>
      </div>
    </div>
  );
};

export default StopwatchTimer;