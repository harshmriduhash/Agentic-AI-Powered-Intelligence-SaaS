import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { ToastProvider } from './components/ui/toast';

// Pages
import { HomePage } from './pages/homePage';
import { LoginPage } from './pages/loginPage';
import { SignupPage } from './pages/signupPage';
import { OnboardingPage } from './pages/onboardingPage';
import { DashboardPage } from './pages/dashboardPage';
import { SettingsPage } from './pages/settingsPage';
import { AuthCallbackPage } from './pages/authcallbackPage';
import { ForgotPasswordPage } from './pages/forgotPasswordPage';
import { ResetPasswordPage } from './pages/resetPasswordPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user && !user.isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return children;
}

// Onboarding Route - only for authenticated but not onboarded users
function OnboardingRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  const token = localStorage.getItem('token');
  
  // If there's a token but no user yet, show loading
  if (token && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }
  
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }
  
  if (user && user.isOnboarded) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

// Public Route Component (redirect if authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  
  if (isAuthenticated && user?.isOnboarded) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/reset-password/:token" 
            element={
              <PublicRoute>
                <ResetPasswordPage />
              </PublicRoute>
            } 
          />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          
          {/* Onboarding Route */}
          <Route 
            path="/onboarding" 
            element={
              <OnboardingRoute>
                <OnboardingPage />
              </OnboardingRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
