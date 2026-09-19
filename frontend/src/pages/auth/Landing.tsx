import { useNavigate } from 'react-router-dom';
import { UserCircle, Wrench, ChevronRight } from 'lucide-react';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-header text-center">
        <h1 className="logo-text text-primary">WorkLink</h1>
        <p className="subtitle text-muted">Skilled trades, on demand</p>
      </div>

      <div className="hero-banner">
        <h2>Find trusted skilled workers near you</h2>
      </div>

      <div className="role-selection">
        <h3 className="text-center mb-4">Are you a Customer or a Worker?</h3>
        <p className="text-center text-muted mb-6">Select an option to continue</p>

        <button 
          className="role-card" 
          onClick={() => navigate('/register/customer')}
        >
          <div className="role-icon customer-icon">
            <UserCircle size={24} color="#008055" />
          </div>
          <div className="role-details">
            <h4>Customer</h4>
            <p>Book trusted skilled workers nearby</p>
          </div>
          <ChevronRight size={20} className="text-muted" />
        </button>

        <button 
          className="role-card" 
          onClick={() => navigate('/register/worker')}
        >
          <div className="role-icon worker-icon">
            <Wrench size={24} color="#008055" />
          </div>
          <div className="role-details">
            <h4>Worker</h4>
            <p>Find jobs and grow your business</p>
          </div>
          <ChevronRight size={20} className="text-muted" />
        </button>
      </div>

      <div className="landing-footer text-center">
        <p className="text-muted" style={{ fontSize: '12px' }}>
          By continuing, you agree to our Terms and Privacy Policy
        </p>
        <div className="mt-4">
          <p className="text-muted">Already have an account? <span style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/login')}>Log In</span></p>
        </div>
      </div>
    </div>
  );
}
