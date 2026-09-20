import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar, IndianRupee, MoreHorizontal, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';
import apiClient from '../../api/client';
import './WorkerHome.css';

export default function WorkerBookings() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await apiClient.get('/workers/jobs');
        if (res.data?.data) {
          setJobs(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch jobs', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const upcomingJobs = jobs.filter(j => ['pending', 'accepted', 'in_progress'].includes(j.status));
  const pastJobs = jobs.filter(j => ['completed', 'cancelled'].includes(j.status));
  
  const displayJobs = activeTab === 'upcoming' ? upcomingJobs : pastJobs;

  return (
    <div className="app-container with-bottom-nav">
      {/* Header */}
      <div className="app-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>My Bookings</h1>
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        <div className="tabs-container" style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button 
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'upcoming' ? 'var(--primary)' : 'var(--bg-card)', color: activeTab === 'upcoming' ? 'white' : 'var(--text-main)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button 
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'past' ? 'var(--primary)' : 'var(--bg-card)', color: activeTab === 'past' ? 'white' : 'var(--text-main)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => setActiveTab('past')}
          >
            Past
          </button>
        </div>
      </div>

      <main style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading bookings...</div>
        ) : displayJobs.length === 0 ? (
          <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <Calendar size={48} className="text-primary mb-4" />
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No {activeTab} bookings</h2>
            <p className="text-muted text-center" style={{ fontSize: '14px' }}>You have no {activeTab} bookings at the moment.</p>
          </div>
        ) : (
          displayJobs.map(job => (
            <div 
              key={job.id} 
              style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '16px', border: '1px solid var(--border)', cursor: 'pointer' }}
              onClick={() => navigate(`/worker/job/${job.id}/complete`)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 4px' }}>{job.service?.name || 'Service Job'}</h3>
                  <p className="text-muted" style={{ fontSize: '13px', margin: 0 }}>{job.customer?.name || 'Customer'}</p>
                </div>
                <div style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, backgroundColor: job.status === 'completed' ? '#DCFCE7' : job.status === 'cancelled' ? '#FEE2E2' : '#FEF3C7', color: job.status === 'completed' ? '#16A34A' : job.status === 'cancelled' ? '#DC2626' : '#D97706' }}>
                  {job.status.toUpperCase()}
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
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Estimated Payout</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>₹{job.total_amount}</span>
              </div>
            </div>
          ))
        )}
      </main>

      <nav className="bottom-nav">
        <button className="nav-item" onClick={() => navigate('/worker/home')}>
          <Home size={24} />
          <span>Home</span>
        </button>
        <button className="nav-item active" onClick={() => navigate('/worker/bookings')}>
          <Calendar size={24} />
          <span>Bookings</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/worker/earnings')}>
          <IndianRupee size={24} />
          <span>Earnings</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/worker/more')}>
          <MoreHorizontal size={24} />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}
