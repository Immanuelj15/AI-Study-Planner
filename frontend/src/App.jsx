import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoadingSkeleton from './components/LoadingSkeleton';
import CommandPalette from './components/CommandPalette';

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
import CollegeMaterials from './pages/CollegeMaterials';
import WeaknessAnalysis from './pages/WeaknessAnalysis';
import ExamPreparation from './pages/ExamPreparation';
import FacultyDashboard from './pages/FacultyDashboard';
import SmartRevision from './pages/SmartRevision';
import QuestionPaperAnalyzer from './pages/QuestionPaperAnalyzer';
import AssignmentEvaluator from './pages/AssignmentEvaluator';
import StudyGroups from './pages/StudyGroups';
import OfflineStudy from './pages/OfflineStudy';
import Achievements from './pages/Achievements';

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
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-[1536px] mx-auto w-full overflow-x-hidden">
          {children}
        </main>
      </div>
      <CommandPalette />
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
                path="/materials"
                element={
                  <ProtectedRoute>
                    <AppLayout><CollegeMaterials /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/weakness"
                element={
                  <ProtectedRoute>
                    <AppLayout><WeaknessAnalysis /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/exam-prep"
                element={
                  <ProtectedRoute>
                    <AppLayout><ExamPreparation /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty-analytics"
                element={
                  <ProtectedRoute>
                    <AppLayout><FacultyDashboard /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/revision"
                element={
                  <ProtectedRoute>
                    <AppLayout><SmartRevision /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/question-papers"
                element={
                  <ProtectedRoute>
                    <AppLayout><QuestionPaperAnalyzer /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assignments"
                element={
                  <ProtectedRoute>
                    <AppLayout><AssignmentEvaluator /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/study-groups"
                element={
                  <ProtectedRoute>
                    <AppLayout><StudyGroups /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/offline-study"
                element={
                  <ProtectedRoute>
                    <AppLayout><OfflineStudy /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/achievements"
                element={
                  <ProtectedRoute>
                    <AppLayout><Achievements /></AppLayout>
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
