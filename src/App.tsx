import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import { CreateSet } from './components/CreateSet';
import { StudyMode } from './components/StudyMode';
import { PracticeTest } from './components/PracticeTest';
import { LandingPage } from './components/LandingPage';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';

function App() {
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    // Set initial user state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />}
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <AuthForm mode="login" />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/dashboard" replace /> : <AuthForm mode="signup" />}
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/create"
          element={user ? <CreateSet /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/edit/:setId"
          element={user ? <CreateSet /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/study/:setId"
          element={user ? <StudyMode /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/practice/:setId"
          element={user ? <PracticeTest /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;