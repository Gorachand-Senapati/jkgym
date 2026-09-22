// Removed unused React import
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GymProvider } from './context/GymContext';
import { AlertProvider } from './context/AlertContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Members } from './pages/Members';
import { Employees } from './pages/Employees';
import { Billing } from './pages/Billing';
import { Inventory } from './pages/Inventory';
import { Therapy } from './pages/Therapy';
import { Reports } from './pages/Reports';

const AppContent = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Login />;
  }

  return (
    <GymProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="members" element={<Members />} />
            <Route path="employees" element={currentUser.role === 'owner' ? <Employees /> : <Navigate to="/" replace />} />
            <Route path="billing" element={<Billing />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="therapy" element={<Therapy />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </GymProvider>
  );
};

function App() {
  return (
    <AlertProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </AlertProvider>
  );
}

export default App;
