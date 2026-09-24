import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Calendar, IndianRupee, MoreHorizontal, MapPin } from 'lucide-react';
import apiClient from '../../api/client';
import './WorkerHome.css';

export default function WorkerBookings() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await apiClient.get('/workers/jobs');
        if (res.data?.data) setJobs(res.data.data);
      } catch (error) { console.error('Failed to fetch jobs', error); }
      finally { setLoading(false); }
    };
    fetchJobs();
  }, []);

  const handleStatusUpdate = async (id: string, action: 'accept' | 'reject') => {
    try {
      await apiClient.patch(`/bookings/${id}/${action}`);
      const res = await apiClient.get('/workers/jobs');
      if (res.data?.data) setJobs(res.data.data);
    } catch (error) { console.error(`Failed to ${action} job`, error); }
  };

  const upcomingJobs = jobs.filter(j => ['PENDING','ACCEPTED','CONFIRMED','IN_PROGRESS'].includes(j.status?.toUpperCase()));
  const pastJobs = jobs.filter(j => ['COMPLETED','CANCELLED','REJECTED'].includes(j.status?.toUpperCase()));
  const displayJobs = activeTab === 'upcoming' ? upcomingJobs : pastJobs;
  const tabLabel = activeTab === 'upcoming' ? t('workerBookings.upcoming') : t('workerBookings.past');

  return (
    <div className="app-container with-bottom-nav">
      <div className="app-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>{t('workerBookings.title')}</h1>
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        <div className="tabs-container" style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'upcoming' ? 'var(--primary)' : 'var(--bg-card)', color: activeTab === 'upcoming' ? 'white' : 'var(--text-main)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setActiveTab('upcoming')}>
            {t('workerBookings.upcoming')}
          </button>
          <button style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'past' ? 'var(--primary)' : 'var(--bg-card)', color: activeTab === 'past' ? 'white' : 'var(--text-main)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setActiveTab('past')}>
            {t('workerBookings.past')}
          </button>
        </div>
      </div>

      <main style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>{t('workerBookings.loadingBookings')}</div>
        ) : displayJobs.length === 0 ? (
          <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <Calendar size={48} className="text-primary mb-4" />
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{t('workerBookings.noBookings', { tab: tabLabel })}</h2>
            <p className="text-muted text-center" style={{ fontSize: '14px' }}>{t('workerBookings.noBookingsDesc', { tab: tabLabel })}</p>
          </div>
        ) : (
          displayJobs.map(job => (
            <div key={job.id} style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '16px', border: '1px solid var(--border)', cursor: 'pointer' }}
              onClick={() => { if (['CONFIRMED','IN_PROGRESS'].includes(job.status?.toUpperCase())) navigate(`/worker/job/${job.id}/complete`); }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 4px' }}>{job.service?.name || 'Service Job'}</h3>
                  <p className="text-muted" style={{ fontSize: '13px', margin: 0 }}>{job.customer?.name || 'Customer'}</p>
                </div>
                <div style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, backgroundColor: job.status?.toUpperCase() === 'COMPLETED' ? '#DCFCE7' : job.status?.toUpperCase() === 'CANCELLED' ? '#FEE2E2' : '#FEF3C7', color: job.status?.toUpperCase() === 'COMPLETED' ? '#16A34A' : job.status?.toUpperCase() === 'CANCELLED' ? '#DC2626' : '#D97706' }}>
                  {job.status?.toUpperCase()}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontSize: '13px' }}>
                  <Calendar size={16} className="text-muted" />
                  <span>{new Date(job.scheduled_date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(job.scheduled_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-main)', fontSize: '13px' }}>
                  <MapPin size={16} className="text-muted" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ lineHeight: 1.4 }}>{job.address}</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{t('workerBookings.estimatedPayout')}</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>₹{job.amount || job.total_amount || 0}</span>
              </div>
              {job.status?.toUpperCase() === 'PENDING' && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate(job.id, 'accept'); }} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>{t('workerBookings.accept')}</button>
                  <button onClick={(e) => { e.stopPropagation(); handleStatusUpdate(job.id, 'reject'); }} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', color: 'var(--text-main)', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>{t('workerBookings.decline')}</button>
                </div>
              )}
            </div>
          ))
        )}
      </main>

      <nav className="bottom-nav">
        <button className="nav-item" onClick={() => navigate('/worker/home')}><Home size={24} /><span>{t('nav.home')}</span></button>
        <button className="nav-item active" onClick={() => navigate('/worker/bookings')}><Calendar size={24} /><span>{t('nav.bookings')}</span></button>
        <button className="nav-item" onClick={() => navigate('/worker/earnings')}><IndianRupee size={24} /><span>{t('nav.earnings')}</span></button>
        <button className="nav-item" onClick={() => navigate('/worker/more')}><MoreHorizontal size={24} /><span>{t('nav.more')}</span></button>
      </nav>
    </div>
  );
}
