import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, Home, Calendar, IndianRupee, MoreHorizontal, ChevronRight, Briefcase, Vote, ShieldCheck, User, Zap, BarChart2, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import './WorkerHome.css';

export default function WorkerHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiClient.get('/workers/analytics');
        if (res.data?.data) setAnalytics(res.data.data);
      } catch (error) { console.error('Failed to fetch analytics', error); }
      finally { setLoading(false); }
    };
    if (user) fetchAnalytics();
  }, [user]);

  return (
    <div className="app-container with-bottom-nav">
      <div className="app-header" style={{ border: 'none', justifyContent: 'space-between' }}>
        <button className="back-btn" style={{ padding: '8px' }}><Menu size={24} /></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="back-btn" style={{ padding: '8px', position: 'relative' }} onClick={() => navigate('/worker/notifications')}>
            <Bell size={24} />
            <div style={{ position: 'absolute', top: '8px', right: '8px', width: '10px', height: '10px', backgroundColor: '#ef4444', borderRadius: '50%', border: '2px solid var(--bg-app)' }}></div>
          </button>
          <div className="w-avatar" style={{ backgroundColor: '#1F2937', color: 'white', width: '36px', height: '36px', margin: 0, fontSize: '14px' }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'W'}
          </div>
        </div>
      </div>

      <main style={{ padding: '0 20px 20px' }}>
        <div className="greeting mt-4 mb-6">
          <h1 style={{ fontSize: '26px', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            {t('workerHome.greeting', { name: user?.name?.split(' ')[0] || 'Worker' })}
          </h1>
          <p className="text-muted" style={{ fontSize: '15px' }}>{t('workerHome.subtitle')}</p>
        </div>

        <div className="earnings-card">
          <div className="earnings-top">
            <div>
              <p className="earnings-label">{t('workerHome.totalEarnings')}</p>
              <h2 className="earnings-amount">{loading ? '₹...' : `₹${analytics?.earnings?.toLocaleString('en-IN') || 0}`}</h2>
            </div>
            <div className="currency-icon">₹</div>
          </div>
          <div className="earnings-bottom">
            <p className="earnings-period">{t('workerHome.thisMonth')}</p>
            <div className="earnings-badge"><span>↑ 12%</span></div>
          </div>
        </div>

        <div className="stats-row mt-6 mb-8">
          <div className="w-stat"><h4>{loading ? '-' : (analytics?.stats?.jobs || 0)}</h4><p>{t('workerHome.jobsCompleted')}</p></div>
          <div className="w-stat"><h4>{loading ? '-' : (analytics?.stats?.rating?.toFixed(1) || '0.0')}</h4><p>{t('workerHome.rating')}</p></div>
          <div className="w-stat"><h4>100%</h4><p>{t('workerHome.completionRate')}</p></div>
        </div>

        <div className="worker-menu">
          <button className="menu-item" onClick={() => navigate('/worker/bookings')}><Briefcase size={20} className="menu-icon" /><span className="flex-grow">{t('workerHome.myBookings')}</span><ChevronRight size={20} className="text-muted" /></button>
          <button className="menu-item" onClick={() => navigate('/worker/earnings')}><IndianRupee size={20} className="menu-icon" /><span className="flex-grow">{t('workerHome.earningsPayouts')}</span><ChevronRight size={20} className="text-muted" /></button>
          <button className="menu-item" onClick={() => navigate('/worker/demand-insights')}><Zap size={20} className="menu-icon" style={{ backgroundColor: '#10B981', color: 'white', borderRadius: '4px', padding: '2px' }} /><span className="flex-grow">{t('workerHome.demandInsights')}</span><ChevronRight size={20} className="text-muted" /></button>
          <button className="menu-item" onClick={() => navigate('/worker/analytics')}><BarChart2 size={20} className="menu-icon" style={{ backgroundColor: '#10B981', color: 'white', borderRadius: '4px', padding: '2px' }} /><span className="flex-grow">{t('workerHome.analytics')}</span><ChevronRight size={20} className="text-muted" /></button>
          <button className="menu-item" onClick={() => navigate('/worker/governance')}><Vote size={20} className="menu-icon" style={{ backgroundColor: '#1F2937', color: 'white', borderRadius: '4px', padding: '2px' }} /><span className="flex-grow">{t('workerHome.cooperativeVotes')}</span><ChevronRight size={20} className="text-muted" /></button>
          <button className="menu-item" onClick={() => navigate('/worker/welfare')}><ShieldCheck size={20} className="menu-icon" style={{ backgroundColor: '#1F2937', color: 'white', borderRadius: '4px', padding: '2px' }} /><span className="flex-grow">{t('workerHome.welfareFund')} <span className="text-muted" style={{ fontSize: '12px', fontWeight: 400 }}>{t('workerHome.welfarePerGig')}</span></span><ChevronRight size={20} className="text-muted" /></button>
          <button className="menu-item" onClick={() => navigate('/worker/profile')} style={{ borderBottom: 'none' }}><User size={20} className="menu-icon" /><span className="flex-grow">{t('workerHome.profileDocs')}</span><ChevronRight size={20} className="text-muted" /></button>
        </div>
      </main>

      <nav className="bottom-nav">
        <button className="nav-item active" onClick={() => navigate('/worker/home')}><Home size={24} /><span>{t('nav.home')}</span></button>
        <button className="nav-item" onClick={() => navigate('/worker/bookings')}><Calendar size={24} /><span>{t('nav.bookings')}</span></button>
        <button className="nav-item" onClick={() => navigate('/worker/earnings')}><IndianRupee size={24} /><span>{t('nav.earnings')}</span></button>
        <button className="nav-item" onClick={() => navigate('/worker/more')}><MoreHorizontal size={24} /><span>{t('nav.more')}</span></button>
      </nav>
    </div>
  );
}
