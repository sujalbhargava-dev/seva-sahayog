import { useNavigate } from 'react-router-dom';
import { User, Briefcase, ChevronRight, Globe, ShieldCheck, MapPin, Users } from 'lucide-react';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-wrapper">
      {/* Background abstract waves */}
      <div className="bg-wave-top"></div>
      <div className="bg-wave-bottom"></div>

      <div className="landing-container">
        {/* Header */}
        <div className="landing-header">
          <button 
            onClick={() => navigate('/language')}
            className="lang-selector"
          >
            <Globe size={16} />
            English
            <ChevronRight size={16} style={{ transform: 'rotate(90deg)' }} />
          </button>
        </div>

        {/* Logo */}
        <div className="logo-area">
          <img src="/logo.jpg" alt="SewaShayog" className="logo-img" />
          <span className="logo-tagline">People • Skills • Stronger Communities</span>
        </div>

        {/* Hero */}
        <div className="hero-section">
          <h1 className="hero-title">
            Trusted help,<br />
            <span className="highlight">right when you need it</span>
          </h1>
          <p className="hero-subtitle">
            Connect with skilled workers in your area for a cleaner, safer and stronger community.
          </p>
          
          <div className="hero-image-container">
            <img src="/hero.jpg" alt="Service Workers" className="hero-image" />
          </div>
        </div>

        {/* Role Selection */}
        <div className="role-selection-wrapper">
          <h2 className="role-title">Are you a Customer or a Worker?</h2>
          <p className="role-subtitle">Select an option to continue</p>

          <button 
            className="role-card-new card-customer" 
            onClick={() => navigate('/register/customer')}
          >
            <div className="role-icon-new icon-customer">
              <User size={24} strokeWidth={2.5} />
            </div>
            <div className="role-details-new">
              <h4>Customer</h4>
              <p>Book trusted skilled workers nearby</p>
            </div>
            <div className="chevron-circle">
              <ChevronRight size={20} color="#6b7280" />
            </div>
          </button>

          <button 
            className="role-card-new card-worker" 
            onClick={() => navigate('/register/worker')}
          >
            <div className="role-icon-new icon-worker">
              <Briefcase size={24} strokeWidth={2.5} />
            </div>
            <div className="role-details-new">
              <h4>Worker</h4>
              <p>Find jobs and grow your business</p>
            </div>
            <div className="chevron-circle">
              <ChevronRight size={20} color="#6b7280" />
            </div>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="trust-badges">
          <div className="trust-item">
            <ShieldCheck size={24} color="#059669" strokeWidth={2.5} />
            <span>Verified<br/>Workers</span>
          </div>
          <div className="trust-item">
            <MapPin size={24} color="#059669" strokeWidth={2.5} />
            <span>Local<br/>Opportunities</span>
          </div>
          <div className="trust-item">
            <Users size={24} color="#059669" strokeWidth={2.5} />
            <span>Stronger<br/>Communities</span>
          </div>
        </div>

        {/* Footer */}
        <div className="landing-footer-new">
          <p className="legal-text">
            By continuing, you agree to our <span>Terms of Service</span> and <span>Privacy Policy</span>.
          </p>
          <p className="login-text">
            Already have an account?{' '}
            <span className="login-link" onClick={() => navigate('/login')}>
              Log In <ChevronRight size={16} strokeWidth={3} />
            </span>
          </p>

          <div className="footer-branding">
            <div className="divider"></div>
            <h5>SewaShayog</h5>
            <p>For a Better Tomorrow</p>
          </div>
        </div>
      </div>
    </div>
  );
}
