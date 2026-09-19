import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Share2, MapPin, Briefcase, CheckCircle, MessageSquare } from 'lucide-react';
import './WorkerProfile.css';

export default function WorkerProfile() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="app-container" style={{ paddingBottom: '90px' }}>
      {/* Header */}
      <div className="app-header" style={{ border: 'none', position: 'absolute', width: '100%', background: 'transparent' }}>
        <button className="back-btn" onClick={() => navigate('/customer/workers')}>
          <ChevronLeft size={24} />
        </button>
        <div style={{ flexGrow: 1 }}></div>
        <button className="back-btn">
          <Share2 size={20} />
        </button>
      </div>

      <main>
        {/* Profile Header */}
        <div className="profile-header text-center pt-10">
          <div className="profile-avatar">
            R
            <div className="status-indicator"></div>
          </div>
          
          <div className="mt-4">
            <span className="status-badge" style={{ marginBottom: '8px' }}>
              <span className="status-dot"></span> Available
            </span>
            <h1 className="profile-name">Ramesh Kumar <CheckCircle size={16} color="#10B981" /></h1>
            <p className="profile-subtitle">Electrician • 6 yrs experience</p>
            <p className="w-rating mt-2">★ 4.8 <span className="text-muted" style={{fontWeight: 400}}>(128 reviews)</span></p>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-container mt-6">
          <div className="stat-box">
            <MapPin size={20} className="text-primary mb-2" />
            <span className="stat-val">2.1 km</span>
            <span className="stat-lbl">away</span>
          </div>
          <div className="stat-box">
            <Briefcase size={20} className="text-primary mb-2" />
            <span className="stat-val">6+ years</span>
            <span className="stat-lbl">experience</span>
          </div>
          <div className="stat-box">
            <CheckCircle size={20} className="text-primary mb-2" />
            <span className="stat-val">500+</span>
            <span className="stat-lbl">jobs done</span>
          </div>
        </div>

        {/* Skills */}
        <div className="p-6">
          <div className="skills-container">
            <span className="skill-pill">Wiring</span>
            <span className="skill-pill">Fitting</span>
            <span className="skill-pill">Repair</span>
            <span className="skill-pill">Installation</span>
          </div>
        </div>

        {/* Feedback Quote */}
        <div className="feedback-quote">
          <p className="text-muted" style={{ fontStyle: 'italic', fontSize: '14px' }}>
            "Very professional and on time. Fixed the wiring issue quickly and explained everything clearly."
          </p>
        </div>

        {/* Pricing */}
        <div className="pricing-card mt-6 mx-6">
          <div className="price-row">
            <span className="text-muted">Service Charge</span>
            <span>₹500</span>
          </div>
          <div className="price-row">
            <span className="text-muted">Visiting / Fuel Charge</span>
            <span>₹50</span>
          </div>
          <div className="price-divider"></div>
          <div className="price-row total">
            <span>Total</span>
            <span className="text-primary">₹550</span>
          </div>
        </div>
      </main>

      {/* Action Bar */}
      <div className="action-bar">
        <button className="btn-outline" style={{ flex: 1, gap: '8px' }}>
          <MessageSquare size={20} /> Chat
        </button>
        <button className="btn-primary" style={{ flex: 1 }} onClick={() => navigate(`/customer/book/${id}`)}>
          Book Now
        </button>
      </div>
    </div>
  );
}
