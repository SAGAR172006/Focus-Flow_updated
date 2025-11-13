import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PomodoroTimer from "@/components/timers/PomodoroTimer";
import StopwatchTimer from "@/components/timers/StopwatchTimer";
import CountdownTimer from "@/components/timers/CountdownTimer";

const Timers = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Focus Tools</h1>
        <p className="text-muted-foreground">Choose your productivity technique</p>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Timer Suite</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pomodoro" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
              <TabsTrigger value="timer">Timer</TabsTrigger>
              <TabsTrigger value="stopwatch">Stopwatch</TabsTrigger>
            </TabsList>

            <TabsContent value="pomodoro" className="mt-6">
              <PomodoroTimer />
            </TabsContent>

            <TabsContent value="timer" className="mt-6">
              <CountdownTimer />
            </TabsContent>

            <TabsContent value="stopwatch" className="mt-6">
              <StopwatchTimer />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Timers;