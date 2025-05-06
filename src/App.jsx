import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Alerts from './pages/Alerts';
import ReportIncident from './pages/ReportIncident';
import SOSEmergency from './pages/SOSEmergency';
import AdminDashboard from './pages/AdminDashboard';
import Education from './pages/Education';
import Profile from './pages/Profile';

// Create a client
const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = () => {
  const { currentUser, loading } = useAuth();
  
  // If still loading auth state, show nothing
  if (loading) return null;
  
  // If not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated, render the child routes
  return <Outlet />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Main Layout wrapper for all content pages */}
            <Route element={<MainLayout />}>
              {/* Public Routes with MainLayout */}
              <Route path="/education" element={<Education />} />
              
              {/* Protected Routes requiring auth */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/reports/new" element={<ReportIncident />} />
                <Route path="/sos" element={<SOSEmergency />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>
            
            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
