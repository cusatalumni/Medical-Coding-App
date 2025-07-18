
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Test from './components/Test';
import Results from './components/Results';
import Certificate from './components/Certificate';
import Header from './components/Header';
import Footer from './components/Footer';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const AppContent: React.FC = () => {
    const { user } = useAuth();
    return (
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <Routes>
                    <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/test/free" element={<ProtectedRoute><Test testType="free" /></ProtectedRoute>} />
                    <Route path="/test/paid" element={<ProtectedRoute><Test testType="paid" /></ProtectedRoute>} />
                    <Route path="/results/:testId" element={<ProtectedRoute><Results /></ProtectedRoute>} />
                    <Route path="/certificate/:testId" element={<ProtectedRoute><Certificate /></ProtectedRoute>} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
        <HashRouter>
            <AppContent />
            <Toaster position="top-right" reverseOrder={false} />
        </HashRouter>
    </AuthProvider>
  );
};

export default App;
