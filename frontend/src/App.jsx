import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoadingSkeleton from './components/LoadingSkeleton';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import StudyPlanner from './pages/StudyPlanner';
import SummaryViewer from './pages/SummaryViewer';
import MindMapViewer from './pages/MindMapViewer';
import QuizPage from './pages/QuizPage';
import QuizResult from './pages/QuizResult';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <LoadingSkeleton text="Authenticating user session..." />;
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-grid-pattern text-[#1E293B] flex flex-col font-inter">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout><Dashboard /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subjects"
                element={
                  <ProtectedRoute>
                    <AppLayout><Subjects /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/study-planner"
                element={
                  <ProtectedRoute>
                    <AppLayout><StudyPlanner /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/summary"
                element={
                  <ProtectedRoute>
                    <AppLayout><SummaryViewer /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mindmap"
                element={
                  <ProtectedRoute>
                    <AppLayout><MindMapViewer /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz"
                element={
                  <ProtectedRoute>
                    <AppLayout><QuizPage /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz-result"
                element={
                  <ProtectedRoute>
                    <AppLayout><QuizResult /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <AppLayout><Analytics /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <AppLayout><Settings /></AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
