import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import useAuth from './hooks/useAuth';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ECGAnalysis from './pages/ECGAnalysis';
import XrayAnalysis from './pages/XrayAnalysis';
import MRIAnalysis from './pages/MRIAnalysis';
import HeartRisk from './pages/HeartRisk';
import DiabetesRisk from './pages/DiabetesRisk';
import Chatbot from './pages/Chatbot';
import ChatHistory from './pages/ChatHistory';
import UploadedReports from './pages/UploadedReports';
import MedicalBrief from './pages/MedicalBrief';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

const AppLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const publicPages = ['/', '/login', '/register'];
  const isPublicPage = publicPages.includes(location.pathname);

  if (isPublicPage) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <ProtectedRoute>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/ecg" element={<ECGAnalysis />} />
              <Route path="/xray" element={<XrayAnalysis />} />
              <Route path="/mri" element={<MRIAnalysis />} />
              <Route path="/heart" element={<HeartRisk />} />
              <Route path="/diabetes" element={<DiabetesRisk />} />
              <Route path="/chatbot" element={<Chatbot />} />
              <Route path="/history" element={<ChatHistory />} />
              <Route path="/reports" element={<UploadedReports />} />
              <Route path="/brief" element={<MedicalBrief />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </ProtectedRoute>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FFFFFF',
              color: '#1E293B',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
