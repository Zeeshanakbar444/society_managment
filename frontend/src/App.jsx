import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Infrastructure from './pages/Infrastructure';
import Residents from './pages/Residents';
import Billing from './pages/Billing';
import Complaints from './pages/Complaints';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import PersonalLedger from './pages/PersonalLedger';
import { useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';
import Users from "./pages/Users"
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-primary-600">Loading Society OS...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-primary-600">Loading Society OS...</div>;
  if (!user) return <Navigate to="/login" />;
  if (profile?.role !== 'ADMIN') return <Navigate to="/" />;
  return children;
};

// Placeholder Pages
const Placeholder = ({ title }) => (
  <div>
    <h2 className="text-3xl font-bold mb-6">{title}</h2>
    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
      <p className="text-slate-500">Module {title} is under development.</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="billing" element={<Billing />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="profile" element={<Profile />} />
            <Route path="reports" element={<AdminRoute><Reports /></AdminRoute>} />
            <Route path="ledger" element={<PersonalLedger />} />
            <Route path="infrastructure" element={<AdminRoute><Infrastructure /></AdminRoute>} />
            <Route path="users" element={<AdminRoute><Users /></AdminRoute>} />
            <Route path="residents" element={<AdminRoute><Residents /></AdminRoute>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
