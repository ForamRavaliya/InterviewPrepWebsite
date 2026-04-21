import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DSAPracticePage from './pages/DSAPracticePage';
import ProblemPage from './pages/ProblemPage';
import MockInterviewPage from './pages/MockInterviewPage';
import InterviewSessionPage from './pages/InterviewSessionPage';
import CompanyPrepPage from './pages/CompanyPrepPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import ProfilePage from './pages/ProfilePage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-center" style={{ minHeight: '100vh' }}>
      <div className="spinner" />
      <span>Initializing...</span>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  const { user } = useAuth();

  return (
    <div className="app-container">
      {user && <Navbar />}
      <main className={user ? 'main-content' : ''} style={!user ? { width: '100%' } : {}}>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Private */}
          <Route path="/dashboard"          element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/dsa"                element={<PrivateRoute><DSAPracticePage /></PrivateRoute>} />
          <Route path="/dsa/:slug"          element={<PrivateRoute><ProblemPage /></PrivateRoute>} />
          <Route path="/mock-interview"     element={<PrivateRoute><MockInterviewPage /></PrivateRoute>} />
          <Route path="/mock-interview/:id" element={<PrivateRoute><InterviewSessionPage /></PrivateRoute>} />
          <Route path="/companies"          element={<PrivateRoute><CompanyPrepPage /></PrivateRoute>} />
          <Route path="/resume"             element={<PrivateRoute><ResumeBuilderPage /></PrivateRoute>} />
          <Route path="/profile"            element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

          {/* Redirect root */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}
