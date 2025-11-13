import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Timer, CheckSquare, Activity, FileText, Youtube, LayoutDashboard, ArrowRight, Sparkles, Target, Brain, TrendingUp, Zap, Clock } from "lucide-react";
import { useEffect, useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tools = [
    {
      icon: LayoutDashboard,
      title: "Dashboard",
      subtitle: "Your Command Center",
      description: "Get a bird's eye view of your productivity metrics and daily progress",
      useCases: [
        "Track daily accomplishments at a glance",
        "Visualize productivity patterns over time",
        "Monitor goals and milestone progress",
        "Identify peak performance hours"
      ],
      benefit: "Make data-driven decisions to optimize your workflow"
    },
    {
      icon: Timer,
      title: "Focus Tools",
      subtitle: "Master Your Time",
      description: "Pomodoro timers, stopwatch, and countdown tools to maximize your concentration",
      useCases: [
        "Break work into focused 25-minute sessions",
        "Track time spent on specific tasks",
        "Set deadlines with countdown timers",
        "Build consistent work rhythms"
      ],
      benefit: "Eliminate distractions and enter deep work states effortlessly"
    },
    {
      icon: CheckSquare,
      title: "Tasks",
      subtitle: "Organize Everything",
      description: "Organize and track your tasks efficiently with our smart task manager",
      useCases: [
        "Capture ideas instantly before they slip away",
        "Prioritize tasks by urgency and importance",
        "Break large projects into manageable steps",
        "Track completion and celebrate wins"
      ],
      benefit: "Clear your mental clutter and focus on what truly matters"
    },
    {
      icon: Activity,
      title: "Wellness",
      subtitle: "Stay Balanced",
      description: "Track your calories and maintain a healthy lifestyle while staying productive",
      useCases: [
        "Monitor daily caloric intake effortlessly",
        "Balance nutrition with busy schedules",
        "Track eating patterns and habits",
        "Maintain energy levels throughout the day"
      ],
      benefit: "Fuel your body right to sustain peak mental performance"
    },
    {
      icon: FileText,
      title: "AI Documents",
      subtitle: "Work Smarter",
      description: "Analyze and summarize documents with the power of AI",
      useCases: [
        "Extract key insights from lengthy reports",
        "Summarize research papers in seconds",
        "Quickly review contracts and documents",
        "Get instant answers from your documents"
      ],
      benefit: "Save hours of reading and focus on taking action"
    },
    {
      icon: Youtube,
      title: "Video Search",
      subtitle: "Learn Faster",
      description: "Find and summarize educational videos with AI-powered search",
      useCases: [
        "Discover relevant tutorials instantly",
        "Get video summaries before watching",
        "Find specific topics within long videos",
        "Curate learning resources efficiently"
      ],
      benefit: "Accelerate your learning without endless video browsing"
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div 
          className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '8s' }}
        />
        <div 
          className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-secondary/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '12s', animationDelay: '2s' }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-accent/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '15s', animationDelay: '4s' }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4">
        {/* Login Button - Top Right */}
        <Button
          onClick={() => navigate("/auth")}
          variant="outline"
          className="absolute top-8 right-8 font-medium backdrop-blur-sm hover:scale-105 transition-transform"
        >
          Login
        </Button>

        {/* Hero Content */}
        <div 
          className="text-center space-y-8 max-w-4xl mx-auto"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
            opacity: Math.max(0, 1 - scrollY / 500)
          }}
        >
          <div className="relative inline-block">
            <Sparkles className="absolute -top-6 -left-6 md:-top-8 md:-left-8 h-6 w-6 md:h-8 md:w-8 text-primary animate-pulse" />
            <Sparkles className="absolute -bottom-6 -right-6 md:-bottom-8 md:-right-8 h-6 w-6 md:h-8 md:w-8 text-secondary animate-pulse" style={{ animationDelay: '1s' }} />
            <h1 className="text-7xl md:text-9xl font-bold tracking-tight shine-text">
              Focus Flow
            </h1>
          </div>
          <p className="text-xl md:text-3xl text-foreground/80 max-w-2xl mx-auto font-light">
            Your all-in-one productivity suite to stay focused, organized, and achieve more every day
          </p>
          
          <div className="flex gap-4 justify-center items-center pt-8">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6 gap-2 group hover:scale-105 transition-all"
            >
              Get Started
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Scroll indicator */}
          <div className="pt-12 animate-bounce">
            <p className="text-sm text-muted-foreground flex items-center gap-2 justify-center">
              <span>Scroll to explore tools</span>
            </p>
          </div>
        </div>
      </section>

      {/* Tools Showcase Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto space-y-32">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-5xl md:text-6xl font-bold">
              Transform How You Work
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Six powerful tools designed to boost your productivity and maintain balance
            </p>
          </div>

          {tools.map((tool, index) => (
            <div
              key={tool.title}
              className={`flex flex-col ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              } gap-12 items-center animate-fade-in`}
            >
              {/* Icon & Title Side */}
              <div className="flex-1 space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                  <div className="relative bg-gradient-to-br from-primary/20 to-secondary/20 p-8 rounded-3xl border border-primary/20 backdrop-blur-sm">
                    <tool.icon className="h-24 w-24 text-primary mx-auto" />
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-sm font-semibold text-primary mb-2">{tool.subtitle}</p>
                  <h3 className="text-4xl font-bold mb-4">{tool.title}</h3>
                  <p className="text-lg text-muted-foreground">{tool.description}</p>
                </div>
              </div>

              {/* Use Cases Side */}
              <div className="flex-1 space-y-6">
                <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 hover:border-primary/50 transition-all hover:shadow-xl">
                  <h4 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Use Cases
                  </h4>
                  <ul className="space-y-4">
                    {tool.useCases.map((useCase, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Zap className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                        <span className="text-foreground/80">{useCase}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 pt-6 border-t border-border/50">
                    <p className="flex items-start gap-3 text-primary font-medium">
                      <TrendingUp className="h-5 w-5 shrink-0 mt-0.5" />
                      {tool.benefit}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
        <div className="max-w-3xl mx-auto text-center space-y-8 relative">
          <div className="inline-block">
            <Brain className="h-16 w-16 text-primary mx-auto mb-6 animate-pulse" />
          </div>
          <h2 className="text-5xl md:text-6xl font-bold">
            Ready to Transform Your Productivity?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of users who have supercharged their workflow with Focus Flow
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="text-lg px-10 py-7 gap-2 group hover:scale-105 transition-all"
          >
            Get Started Now
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50 backdrop-blur-sm">
        <p className="text-center text-muted-foreground">
          © 2025 Focus Flow. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Index;
