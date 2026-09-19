import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

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
import CompleteJob from './pages/worker/CompleteJob';

import Payment from './pages/shared/Payment';
import Review from './pages/shared/Review';

// Protected Route Component
function ProtectedRoute({ children, role }: { children: React.ReactNode, role?: 'CUSTOMER' | 'WORKER' }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'CUSTOMER' ? '/customer/home' : '/worker/home'} replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/landing" replace />} />
          
          {/* Auth Flow */}
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
          
          {/* Worker Flow (Protected) */}
          <Route path="/worker/home" element={<ProtectedRoute role="WORKER"><WorkerHome /></ProtectedRoute>} />
          <Route path="/worker/bookings" element={<ProtectedRoute role="WORKER"><WorkerBookings /></ProtectedRoute>} />
          <Route path="/worker/earnings" element={<ProtectedRoute role="WORKER"><WorkerEarnings /></ProtectedRoute>} />
          <Route path="/worker/more" element={<ProtectedRoute role="WORKER"><WorkerMore /></ProtectedRoute>} />
          <Route path="/worker/job/:id/complete" element={<ProtectedRoute role="WORKER"><CompleteJob /></ProtectedRoute>} />
          
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
