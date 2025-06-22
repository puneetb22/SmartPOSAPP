import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { BusinessModeProvider } from "@/contexts/BusinessModeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import BusinessSetup from "@/pages/BusinessSetup";
import Sales from "@/pages/Sales";
import Inventory from "@/pages/Inventory";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import { useBusinessMode } from "@/contexts/BusinessModeContext";

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isConfigured, isLoading: businessLoading } = useBusinessMode();

  if (isLoading || businessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : !isConfigured ? (
        <Route path="/" component={BusinessSetup} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/sales" component={Sales} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/reports" component={Reports} />
          <Route path="/settings" component={Settings} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <BusinessModeProvider>
          <TooltipProvider>
            <Toaster />
            <AppRoutes />
          </TooltipProvider>
        </BusinessModeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
