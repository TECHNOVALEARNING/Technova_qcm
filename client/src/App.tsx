/** Learning Circuit — Plateforme de Jeu (Dark Mode) */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "@/pages/Home";
import Play from "@/pages/Play";
import Auth from "@/pages/Auth";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, loading: isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/auth");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) return <div className="loading-screen">Chargement...</div>;

  if (!isAuthenticated) {
    return null;
  }

  return <Component {...rest} />;
}

function AdminProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, user, loading: isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        setLocation("/auth");
      } else if (user?.role !== "admin") {
        setLocation("/");
      }
    }
  }, [isLoading, isAuthenticated, user, setLocation]);

  if (isLoading) return <div className="loading-screen">Chargement...</div>;

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return <Component {...rest} />;
}

import { Privacy } from "./pages/Privacy";
import { Terms } from "./pages/Terms";
import Admin from "./pages/Admin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/play">
        {() => <ProtectedRoute component={Play} />}
      </Route>
      <Route path="/admin">
        {() => <AdminProtectedRoute component={Admin} />}
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
