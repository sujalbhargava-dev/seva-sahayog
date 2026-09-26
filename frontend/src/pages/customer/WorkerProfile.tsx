import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Share2, MapPin, Briefcase, CheckCircle, MessageSquare } from 'lucide-react';
import apiClient from '../../api/client';
import './WorkerProfile.css';
import { useTranslation } from "react-i18next";

export default function WorkerProfile() {
    const { t } = useTranslation();
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
    return <div style={{ textAlign: 'center', padding: '40px' }}>{t('newlyAdded.loadingProfile')}</div>;
  }

  if (!worker) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>{t('newlyAdded.workerNotFound')}</div>;
  }

  const name = worker.name || 'Worker';
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
          <div className="profile-avatar" style={{ backgroundColor: worker.profilePicture ? 'transparent' : 'var(--primary-light)' }}>
            {worker.profilePicture ? (
              <img src={worker.profilePicture} alt={t('newlyAdded.dP')} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              name.charAt(0).toUpperCase()
            )}
            {isAvailable && <div className="status-indicator"></div>}
          </div>
          
          <div className="mt-4">
            {isAvailable && (
              <span className="status-badge" style={{ marginBottom: '8px' }}>
                <span className="status-dot"></span> {t('newlyAdded.available')}</span>
            )}
            <h1 className="profile-name">{name} {worker.verification_status === 'APPROVED' && <CheckCircle size={16} color="#10B981" />}</h1>
            <p className="profile-subtitle">{skills[0]} • {experience} {t('newlyAdded.yrsExperience')}</p>
            <p className="w-rating mt-2">★ {rating} <span className="text-muted" style={{fontWeight: 400}}>({totalJobs} {t('newlyAdded.jobs')}</span></p>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-container mt-6">
          <div className="stat-box">
            <MapPin size={20} className="text-primary mb-2" />
            <span className="stat-val">{t('newlyAdded.nearby')}</span>
            <span className="stat-lbl">{t('newlyAdded.location')}</span>
          </div>
          <div className="stat-box">
            <Briefcase size={20} className="text-primary mb-2" />
            <span className="stat-val">{experience} {t('newlyAdded.years')}</span>
            <span className="stat-lbl">{t('newlyAdded.experience')}</span>
          </div>
          <div className="stat-box">
            <CheckCircle size={20} className="text-primary mb-2" />
            <span className="stat-val">{totalJobs}</span>
            <span className="stat-lbl">{t('newlyAdded.jobsDone')}</span>
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
            {t('newlyAdded.veryProfessionalAndOn')}</p>
        </div>

        {/* Pricing */}
        <div className="pricing-card mt-6 mx-6">
          <div className="price-row">
            <span className="text-muted">{t('newlyAdded.serviceCharge')}</span>
            <span>₹500</span>
          </div>
          <div className="price-row">
            <span className="text-muted">{t('newlyAdded.visitingFuelCharge')}</span>
            <span>₹50</span>
          </div>
          <div className="price-divider"></div>
          <div className="price-row total">
            <span>{t('newlyAdded.total')}</span>
            <span className="text-primary">₹550</span>
          </div>
        </div>
      </main>

      {/* Action Bar */}
      <div className="action-bar">
        <button className="btn-outline" style={{ flex: 1, gap: '8px' }}>
          <MessageSquare size={20} /> {t('newlyAdded.chat')}</button>
        <button className="btn-primary" style={{ flex: 1 }} onClick={() => navigate(`/customer/book/${id}?service=${encodeURIComponent(skills[0])}`)}>
          {t('newlyAdded.bookNow')}</button>
      </div>
    </div>
  );
}
