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

import { SplashScreen } from "@/components/SplashScreen";

const App = () => {
  const isDev = import.meta.env.DEV;

  const [hasName, setHasName] = useState(() => !!LocalStorage.getSettings().name);
  const [showSplash, setShowSplash] = useState(true);
  const [userName, setUserName] = useState(() => LocalStorage.getSettings().name || '');

  useEffect(() => {
    const handleLogin = () => {
      setHasName(true);
      setUserName(LocalStorage.getSettings().name || '');
    };
    window.addEventListener('user-login', handleLogin);
    return () => window.removeEventListener('user-login', handleLogin);
  }, []);

  // Handle Splash Screen Timer
  useEffect(() => {
    if (hasName) {
      // Show splash for 2.5 seconds if user is logged in
      const timer = setTimeout(() => setShowSplash(false), 2500);
      return () => clearTimeout(timer);
    } else {
      // If no name (first time), skip splash and go to Welcome
      setShowSplash(false);
    }
  }, [hasName]);

  // Show Splash only if we have a name and the timer is still running
  if (showSplash && hasName) {
    return <SplashScreen name={userName} />;
  }

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
