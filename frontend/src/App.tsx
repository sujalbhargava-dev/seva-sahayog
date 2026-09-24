import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Splash from './pages/auth/Splash';
import Landing from './pages/auth/Landing';
import Login from './pages/auth/Login';
import CustomerRegistration from './pages/auth/CustomerRegistration';
import WorkerRegistration from './pages/auth/WorkerRegistration';

import CustomerHome from './pages/customer/CustomerHome';
import WorkerList from './pages/customer/WorkerList';
import WorkerProfile from './pages/customer/WorkerProfile';
import BookingConfirmation from './pages/customer/BookingConfirmation';
import CustomerBookings from './pages/customer/CustomerBookings';
import CustomerMessages from './pages/customer/CustomerMessages';
import CustomerProfile from './pages/customer/CustomerProfile';

import WorkerHome from './pages/worker/WorkerHome';
import WorkerBookings from './pages/worker/WorkerBookings';
import WorkerEarnings from './pages/worker/WorkerEarnings';
import WorkerMore from './pages/worker/WorkerMore';
import WorkerSelfProfile from './pages/worker/WorkerProfile';
import WorkerPersonalInfo from './pages/worker/WorkerPersonalInfo';
import WorkerDocsKyc from './pages/worker/WorkerDocsKyc';
import CompleteJob from './pages/worker/CompleteJob';
import WorkerNotifications from './pages/worker/WorkerNotifications';

import AdminLogin from './pages/admin/AdminLogin';
import AdminHome from './pages/admin/AdminHome';

import Payment from './pages/shared/Payment';
import Review from './pages/shared/Review';

// Phase 2 components
import FindingWorker from './pages/customer/FindingWorker';
import PaymentHistory from './pages/customer/PaymentHistory';
import EmergencyBooking from './pages/customer/EmergencyBooking';
import Governance from './pages/worker/Governance';
import WelfareFund from './pages/worker/WelfareFund';

// Phase 3 components
import DemandInsights from './pages/worker/DemandInsights';
import Analytics from './pages/worker/Analytics';
import SmartMatching from './pages/customer/SmartMatching';
import LanguageSelection from './pages/shared/LanguageSelection';

// Protected Route Component
function ProtectedRoute({ children, role }: { children: React.ReactNode, role?: 'CUSTOMER' | 'WORKER' | 'ADMIN' }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/home" replace />;
    return <Navigate to={user.role === 'CUSTOMER' ? '/customer/home' : '/worker/home'} replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Splash />} />
          
          {/* Auth Flow */}
          <Route path="/language" element={<LanguageSelection />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/customer" element={<CustomerRegistration />} />
          <Route path="/register/worker" element={<WorkerRegistration />} />
          
          {/* Customer Flow (Protected) */}
          <Route path="/customer/home" element={<ProtectedRoute role="CUSTOMER"><CustomerHome /></ProtectedRoute>} />
          <Route path="/customer/bookings" element={<ProtectedRoute role="CUSTOMER"><CustomerBookings /></ProtectedRoute>} />
          <Route path="/customer/messages" element={<ProtectedRoute role="CUSTOMER"><CustomerMessages /></ProtectedRoute>} />
          <Route path="/customer/profile" element={<ProtectedRoute role="CUSTOMER"><CustomerProfile /></ProtectedRoute>} />
          <Route path="/customer/workers" element={<ProtectedRoute role="CUSTOMER"><WorkerList /></ProtectedRoute>} />
          <Route path="/customer/worker/:id" element={<ProtectedRoute role="CUSTOMER"><WorkerProfile /></ProtectedRoute>} />
          <Route path="/customer/book/:id" element={<ProtectedRoute role="CUSTOMER"><BookingConfirmation /></ProtectedRoute>} />
          <Route path="/customer/finding-worker" element={<ProtectedRoute role="CUSTOMER"><FindingWorker /></ProtectedRoute>} />
          <Route path="/customer/smart-matching" element={<ProtectedRoute role="CUSTOMER"><SmartMatching /></ProtectedRoute>} />
          <Route path="/customer/payment-history" element={<ProtectedRoute role="CUSTOMER"><PaymentHistory /></ProtectedRoute>} />
          <Route path="/customer/emergency" element={<ProtectedRoute role="CUSTOMER"><EmergencyBooking /></ProtectedRoute>} />
          
          {/* Worker Flow (Protected) */}
          <Route path="/worker/home" element={<ProtectedRoute role="WORKER"><WorkerHome /></ProtectedRoute>} />
          <Route path="/worker/bookings" element={<ProtectedRoute role="WORKER"><WorkerBookings /></ProtectedRoute>} />
          <Route path="/worker/earnings" element={<ProtectedRoute role="WORKER"><WorkerEarnings /></ProtectedRoute>} />
          <Route path="/worker/more" element={<ProtectedRoute role="WORKER"><WorkerMore /></ProtectedRoute>} />
          <Route path="/worker/profile" element={<ProtectedRoute role="WORKER"><WorkerSelfProfile /></ProtectedRoute>} />
          <Route path="/worker/profile/personal-info" element={<ProtectedRoute role="WORKER"><WorkerPersonalInfo /></ProtectedRoute>} />
          <Route path="/worker/profile/docs" element={<ProtectedRoute role="WORKER"><WorkerDocsKyc /></ProtectedRoute>} />
          <Route path="/worker/job/:id/complete" element={<ProtectedRoute role="WORKER"><CompleteJob /></ProtectedRoute>} />
          <Route path="/worker/demand-insights" element={<ProtectedRoute role="WORKER"><DemandInsights /></ProtectedRoute>} />
          <Route path="/worker/analytics" element={<ProtectedRoute role="WORKER"><Analytics /></ProtectedRoute>} />
          <Route path="/worker/governance" element={<ProtectedRoute role="WORKER"><Governance /></ProtectedRoute>} />
          <Route path="/worker/welfare" element={<ProtectedRoute role="WORKER"><WelfareFund /></ProtectedRoute>} />
          <Route path="/worker/notifications" element={<ProtectedRoute role="WORKER"><WorkerNotifications /></ProtectedRoute>} />
          
          {/* Admin Flow */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/home" element={<ProtectedRoute role="ADMIN"><AdminHome /></ProtectedRoute>} />

          {/* Shared Flow (Protected) */}
          <Route path="/customer/payment/:id" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/customer/review/:id" element={<ProtectedRoute><Review /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/landing" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;


