import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Share2, MapPin, Briefcase, CheckCircle, MessageSquare } from 'lucide-react';
import apiClient from '../../api/client';
import './WorkerProfile.css';

export default function WorkerProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/workers/${id}`);
        if (res.data?.data) {
          setWorker(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch worker profile', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchWorker();
  }, [id]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading profile...</div>;
  }

  if (!worker) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Worker not found</div>;
  }

  const name = worker.user?.name || 'Worker';
  const rating = worker.rating || 'New';
  const experience = worker.experience || 0;
  const isAvailable = worker.availability !== false;
  const totalJobs = worker.total_jobs || 0;
  // Fallback skills if not defined
  const skills = worker.skills && worker.skills.length > 0 ? worker.skills : ['General Service'];

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
            {name.charAt(0).toUpperCase()}
            {isAvailable && <div className="status-indicator"></div>}
          </div>
          
          <div className="mt-4">
            {isAvailable && (
              <span className="status-badge" style={{ marginBottom: '8px' }}>
                <span className="status-dot"></span> Available
              </span>
            )}
            <h1 className="profile-name">{name} {worker.verification_status === 'APPROVED' && <CheckCircle size={16} color="#10B981" />}</h1>
            <p className="profile-subtitle">{skills[0]} • {experience} yrs experience</p>
            <p className="w-rating mt-2">★ {rating} <span className="text-muted" style={{fontWeight: 400}}>({totalJobs} jobs)</span></p>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-container mt-6">
          <div className="stat-box">
            <MapPin size={20} className="text-primary mb-2" />
            <span className="stat-val">Nearby</span>
            <span className="stat-lbl">location</span>
          </div>
          <div className="stat-box">
            <Briefcase size={20} className="text-primary mb-2" />
            <span className="stat-val">{experience} years</span>
            <span className="stat-lbl">experience</span>
          </div>
          <div className="stat-box">
            <CheckCircle size={20} className="text-primary mb-2" />
            <span className="stat-val">{totalJobs}</span>
            <span className="stat-lbl">jobs done</span>
          </div>
        </div>

        {/* Skills */}
        <div className="p-6">
          <div className="skills-container">
            {skills.map((skill: string, index: number) => (
              <span key={index} className="skill-pill">{skill}</span>
            ))}
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
        <button className="btn-primary" style={{ flex: 1 }} onClick={() => navigate(`/customer/book/${id}?service=${encodeURIComponent(skills[0])}`)}>
          Book Now
        </button>
      </div>
    </div>
  );
}
