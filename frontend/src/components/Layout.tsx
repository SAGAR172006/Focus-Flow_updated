import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Timer, CheckSquare, Activity, FileText, Youtube, LogOut, FileEdit } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [{
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard"
  }, {
    id: "timers",
    label: "Focus Tools",
    icon: Timer,
    path: "/timers"
  }, {
    id: "tasks",
    label: "Tasks",
    icon: CheckSquare,
    path: "/tasks"
  }, {
    id: "calories",
    label: "Wellness",
    icon: Activity,
    path: "/calories"
  }, {
    id: "documents",
    label: "AI Documents",
    icon: FileText,
    path: "/documents"
  }, {
    id: "youtube",
    label: "Video Search",
    icon: Youtube,
    path: "/youtube"
  }, {
    id: "pdf-editor",
    label: "PDF Editor",
    icon: FileEdit,
    path: "/pdf-editor"
  }];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Navigation with scroll */}
          <div className="flex-1 max-w-4xl mx-auto">
            <div 
              className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth justify-center"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {navItems.map(item => (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "secondary" : "ghost"}
                  className={cn(
                    "shrink-0 gap-2",
                    currentPage === item.id && "bg-secondary/50"
                  )}
                  onClick={() => {
                    setCurrentPage(item.id);
                    navigate(item.path);
                  }}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          {/* User section */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user?.email?.[0].toUpperCase()}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-20 p-8">{children}</main>
    </div>;
};
export default Layout;