import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, getEvent, initializeMockData, logoutUser } from './services/storage';
import { User, EventConfig } from './types';
import AdminDashboard from './pages/AdminDashboard';
import KitchenDisplay from './pages/KitchenDisplay';
import GuestApp from './pages/GuestApp';
import Login from './pages/Login';
import ThemeLayout from './components/ThemeLayout';

const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: string }> = ({ children, role }) => {
  const user = getCurrentUser();
  const event = getEvent();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Session Expiration Logic for Guest
  if (user.role === 'guest' && event) {
    const now = Date.now();
    const endTime = event.startTime + (event.durationHours * 60 * 60 * 1000);
    if (now > endTime) {
      logoutUser();
      alert("Sessão expirada! O evento acabou.");
      return <Navigate to="/" replace />;
    }
  }

  if (role && user.role !== role) {
    // Redirect based on role
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'kitchen') return <Navigate to="/kitchen" replace />;
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const [event, setEvent] = useState<EventConfig | null>(getEvent());
  
  // Poll for event changes (simple sync mechanism)
  useEffect(() => {
    initializeMockData();
    const interval = setInterval(() => {
      const currentEvent = getEvent();
      if (JSON.stringify(currentEvent) !== JSON.stringify(event)) {
        setEvent(currentEvent);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [event]);

  return (
    <ThemeLayout theme={event?.theme || 'clean'}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/kitchen" 
          element={
            <ProtectedRoute role="kitchen">
              <KitchenDisplay />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/app/*" 
          element={
            <ProtectedRoute role="guest">
              <GuestApp />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </ThemeLayout>
  );
};

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
