import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import AuthCallback from "./pages/AuthCallback";
import ChooseUsername from "./pages/ChooseUsername";
import App from "./pages/App";
import ProfileSettings from "./pages/settings/ProfileSettings";
import ThemeSettings from "./pages/settings/ThemeSettings";
import PrivacySettings from "./pages/settings/PrivacySettings";
import Notifications from "./pages/Notifications";
import ProfileCommentModeration from "./pages/moderation/ProfileCommentModeration";
import AdminModeration from "./pages/admin/AdminModeration";
import UserProfile from "./pages/UserProfile";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const AppRouter = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/choose-username" element={<ProtectedRoute><ChooseUsername /></ProtectedRoute>} />
            <Route path="/app" element={<ProtectedRoute><App /></ProtectedRoute>} />
            <Route path="/settings/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
            <Route path="/settings/theme" element={<ProtectedRoute><ThemeSettings /></ProtectedRoute>} />
            <Route path="/settings/privacy" element={<ProtectedRoute><PrivacySettings /></ProtectedRoute>} />
            <Route path="/app/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/app/moderation/profile-comments" element={<ProtectedRoute><ProfileCommentModeration /></ProtectedRoute>} />
            <Route path="/admin/moderation" element={<ProtectedRoute><AdminModeration /></ProtectedRoute>} />
            <Route path="/u/:username" element={<UserProfile />} />
            {/* TODO: Subdomain routing - {username}.top8.io should map to /u/[username] */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default AppRouter;
