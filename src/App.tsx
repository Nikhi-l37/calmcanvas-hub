import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TimerProvider } from "@/contexts/TimerContext";
import { ConfigError } from "./components/ConfigError";
import { MainLayout } from "./pages/MainLayout";
import { Dashboard } from "./pages/Dashboard";
import { MyApps } from "./pages/MyApps";
import { Goals } from "./pages/Goals";
import { Streaks } from "./pages/Streaks";
import { Statistics } from "./pages/Statistics";
import { Profile } from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Log environment variables for debugging (safely, without exposing full values)
console.log("🔌 App attempting to connect to Supabase Project:", import.meta.env.VITE_SUPABASE_PROJECT_ID);
console.log("📡 Supabase URL configured:", !!import.meta.env.VITE_SUPABASE_URL);
console.log("🔑 Supabase Key configured:", !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

// Validate critical environment variables
const hasValidConfig = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

if (!hasValidConfig) {
  console.error("❌ CRITICAL: Missing Supabase environment variables!");
  console.error("📝 Please ensure your .env file contains:");
  console.error("   VITE_SUPABASE_URL=your_supabase_project_url");
  console.error("   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key");
}

const App = () => {
  // Show configuration error screen if environment variables are missing
  if (!hasValidConfig) {
    return <ConfigError />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TimerProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="apps" element={<MyApps />} />
                <Route path="streaks" element={<Streaks />} />
                <Route path="goals" element={<Goals />} />
                <Route path="statistics" element={<Statistics />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TimerProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
