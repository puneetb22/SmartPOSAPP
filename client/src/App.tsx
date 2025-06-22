import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OfflineProvider, useOffline } from "@/contexts/OfflineContext";
import { BusinessModeProvider } from "@/contexts/BusinessModeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import NotFound from "@/pages/not-found";
import OfflineLogin from "@/pages/OfflineLogin";
import Dashboard from "@/pages/Dashboard";
import BusinessSetup from "@/pages/BusinessSetup";
import Sales from "@/pages/Sales";
import Inventory from "@/pages/Inventory";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import { useBusinessMode } from "@/contexts/BusinessModeContext";

function AppRoutes() {
  const { isAuthenticated, isLoading } = useOffline();
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
        <Route path="/" component={OfflineLogin} />
      ) : !isConfigured ? (
        <Route path="/" component={BusinessSetup} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
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
      <TooltipProvider>
        <LanguageProvider>
          <OfflineProvider>
            <BusinessModeProvider>
              <AppRoutes />
              <Toaster />
            </BusinessModeProvider>
          </OfflineProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
