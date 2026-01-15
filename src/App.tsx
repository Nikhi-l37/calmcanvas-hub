import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { TimerProvider } from "@/contexts/TimerContext";
import { MainLayout } from "./pages/MainLayout";
import { Dashboard } from "./pages/Dashboard";
import { MyApps } from "./pages/MyApps";
import { Streaks } from "./pages/Streaks";
import { Statistics } from "./pages/Statistics";
import { Profile } from "./pages/Profile";
import { Welcome } from "./pages/Welcome";
import NotFound from "./pages/NotFound";
import { LocalStorage } from "@/services/storage";

const App = () => {
  const [hasName, setHasName] = useState(() => {
    const settings = LocalStorage.getSettings();
    console.log('Screen Coach: Initial settings', settings);
    return !!settings.name;
  });

  useEffect(() => {
    console.log('Screen Coach: App mounted, hasName:', hasName);
    
    const handleLogin = () => {
      console.log('Screen Coach: User login event received');
      setHasName(true);
    };

    window.addEventListener('user-login', handleLogin);
    return () => window.removeEventListener('user-login', handleLogin);
  }, []);

  console.log('Screen Coach: Rendering app with hasName:', hasName);

  return (
    <TooltipProvider>
      <TimerProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            <Route path="/welcome" element={hasName ? <Navigate to="/" replace /> : <Welcome />} />

            <Route path="/" element={hasName ? <MainLayout /> : <Navigate to="/welcome" replace />}>
              <Route index element={<Dashboard />} />
              <Route path="apps" element={<MyApps />} />
              <Route path="streaks" element={<Streaks />} />

              <Route path="statistics" element={<Statistics />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TimerProvider>
    </TooltipProvider>
  );
};

export default App;
