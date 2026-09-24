import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home, Calendar, IndianRupee, MoreHorizontal,
  ChevronRight, Briefcase, Vote, ShieldCheck, User,
  Zap, BarChart2, Bell, Menu, TrendingUp, Star, CheckCircle,
  ArrowUpRight,
} from 'lucide-react';
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

  const firstName = user?.name?.split(' ')[0] || 'Worker';
  const earnings  = analytics?.earnings ?? 0;
  const jobs      = analytics?.stats?.jobs ?? 0;
  const rating    = analytics?.stats?.rating?.toFixed(1) ?? '0.0';

  return (
    <div className="app-container with-bottom-nav" style={{ background: '#f3f4f6' }}>

      {/* ── Hero Header ── */}
      <div className="wh-hero">
        <div className="wh-hero-topbar">
          <button className="wh-icon-btn" aria-label="Menu"><Menu size={20} /></button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="wh-icon-btn" onClick={() => navigate('/worker/notifications')} aria-label="Notifications">
              <Bell size={20} />
              <span className="wh-notif-dot" />
            </button>
            <div
              className="wh-avatar"
              onClick={() => navigate('/worker/profile')}
              title="Profile"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'W'}
            </div>
          </div>
        </div>

        <div className="wh-greeting">
          <h1>{t('workerHome.greeting', { name: firstName })}</h1>
          <p>{t('workerHome.subtitle')}</p>
        </div>
      </div>

      {/* ── Scrollable Body ── */}
      <div className="wh-body">

        {/* Floating Earnings Card */}
        <div className="wh-earnings-card">
          <div className="wh-earnings-header">
            <div>
              <p className="wh-earnings-label">{t('workerHome.totalEarnings')}</p>
              <h2 className="wh-earnings-amount">
                {loading ? '₹ —' : `₹${earnings.toLocaleString('en-IN')}`}
              </h2>
            </div>
            <div className="wh-earnings-badge">
              <ArrowUpRight size={12} strokeWidth={3} /> 12%
            </div>
          </div>

          <div className="wh-earnings-footer">
            <span className="wh-earnings-period">{t('workerHome.thisMonth')}</span>
          </div>

          <button
            className="wh-withdraw-btn"
            onClick={() => navigate('/worker/earnings')}
          >
            {t('workerEarnings.withdrawFunds')} →
          </button>
        </div>

        {/* Stats Row */}
        <div className="wh-stats">
          <div className="wh-stat-card">
            <div className="wh-stat-icon" style={{ background: '#dbeafe' }}>
              <Briefcase size={16} color="#2563eb" />
            </div>
            <p className="wh-stat-value">{loading ? '—' : jobs}</p>
            <p className="wh-stat-label">{t('workerHome.jobsCompleted')}</p>
          </div>
          <div className="wh-stat-card">
            <div className="wh-stat-icon" style={{ background: '#fef9c3' }}>
              <Star size={16} color="#ca8a04" />
            </div>
            <p className="wh-stat-value">{loading ? '—' : rating}</p>
            <p className="wh-stat-label">{t('workerHome.rating')}</p>
          </div>
          <div className="wh-stat-card">
            <div className="wh-stat-icon" style={{ background: '#d1fae5' }}>
              <CheckCircle size={16} color="#10b981" />
            </div>
            <p className="wh-stat-value">100%</p>
            <p className="wh-stat-label">{t('workerHome.completionRate')}</p>
          </div>
        </div>

        {/* Quick Actions 2×2 Grid */}
        <p className="wh-section-label">{t('customerHome.quickActions')}</p>
        <div className="wh-quick-grid">
          <button className="wh-quick-card" onClick={() => navigate('/worker/bookings')}>
            <div className="wh-quick-icon" style={{ background: '#eff6ff' }}>
              <Briefcase size={18} color="#2563eb" />
            </div>
            <div>
              <p className="wh-quick-title">{t('workerHome.myBookings')}</p>
              <p className="wh-quick-sub">View all jobs</p>
            </div>
          </button>
          <button className="wh-quick-card" onClick={() => navigate('/worker/demand-insights')}>
            <div className="wh-quick-icon" style={{ background: '#f0fdf4' }}>
              <Zap size={18} color="#10b981" />
            </div>
            <div>
              <p className="wh-quick-title">{t('workerHome.demandInsights')}</p>
              <p className="wh-quick-sub">Hot services nearby</p>
            </div>
          </button>
          <button className="wh-quick-card" onClick={() => navigate('/worker/analytics')}>
            <div className="wh-quick-icon" style={{ background: '#faf5ff' }}>
              <BarChart2 size={18} color="#7c3aed" />
            </div>
            <div>
              <p className="wh-quick-title">{t('workerHome.analytics')}</p>
              <p className="wh-quick-sub">Performance data</p>
            </div>
          </button>
          <button className="wh-quick-card" onClick={() => navigate('/worker/welfare')}>
            <div className="wh-quick-icon" style={{ background: '#fff7ed' }}>
              <ShieldCheck size={18} color="#ea580c" />
            </div>
            <div>
              <p className="wh-quick-title">{t('workerHome.welfareFund')}</p>
              <p className="wh-quick-sub">{t('workerHome.welfarePerGig')}</p>
            </div>
          </button>
        </div>

        {/* More Menu */}
        <p className="wh-section-label">More</p>
        <div className="wh-menu-card">
          <button className="wh-menu-item" onClick={() => navigate('/worker/earnings')}>
            <div className="wh-menu-icon-wrap" style={{ background: '#d1fae5' }}>
              <IndianRupee size={18} color="#10b981" />
            </div>
            <div className="wh-menu-text">
              <p className="wh-menu-title">{t('workerHome.earningsPayouts')}</p>
              <p className="wh-menu-desc">Withdraw & track payouts</p>
            </div>
            <ChevronRight size={18} color="#d1d5db" />
          </button>
          <button className="wh-menu-item" onClick={() => navigate('/worker/governance')}>
            <div className="wh-menu-icon-wrap" style={{ background: '#e0e7ff' }}>
              <Vote size={18} color="#4f46e5" />
            </div>
            <div className="wh-menu-text">
              <p className="wh-menu-title">{t('workerHome.cooperativeVotes')}</p>
              <p className="wh-menu-desc">Community decisions</p>
            </div>
            <ChevronRight size={18} color="#d1d5db" />
          </button>
          <button className="wh-menu-item" onClick={() => navigate('/worker/profile')}>
            <div className="wh-menu-icon-wrap" style={{ background: '#f1f5f9' }}>
              <User size={18} color="#475569" />
            </div>
            <div className="wh-menu-text">
              <p className="wh-menu-title">{t('workerHome.profileDocs')}</p>
              <p className="wh-menu-desc">KYC & verification status</p>
            </div>
            <ChevronRight size={18} color="#d1d5db" />
          </button>
        </div>

      </div>

      {/* ── Bottom Nav ── */}
      <nav className="wh-bottom-nav">
        <button className="wh-nav-item active" onClick={() => navigate('/worker/home')}>
          <Home size={22} />
          <span>{t('nav.home')}</span>
          <span className="wh-nav-active-dot" />
        </button>
        <button className="wh-nav-item" onClick={() => navigate('/worker/bookings')}>
          <Calendar size={22} />
          <span>{t('nav.bookings')}</span>
        </button>
        <button className="wh-nav-item" onClick={() => navigate('/worker/earnings')}>
          <IndianRupee size={22} />
          <span>{t('nav.earnings')}</span>
        </button>
        <button className="wh-nav-item" onClick={() => navigate('/worker/more')}>
          <MoreHorizontal size={22} />
          <span>{t('nav.more')}</span>
        </button>
      </nav>
    </div>
  );
}
