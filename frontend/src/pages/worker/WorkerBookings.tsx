import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Calendar, IndianRupee, MoreHorizontal, MapPin } from 'lucide-react';
import apiClient from '../../api/client';
import './WorkerShared.css';

export default function WorkerBookings() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get('/workers/jobs');
        if (res.data?.data) setJobs(res.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleStatusUpdate = async (id: string, action: 'accept' | 'reject') => {
    try {
      await apiClient.patch(`/bookings/${id}/${action}`);
      const res = await apiClient.get('/workers/jobs');
      if (res.data?.data) setJobs(res.data.data);
    } catch (e) { console.error(e); }
  };

  const upcoming = jobs.filter(j => ['PENDING','ACCEPTED','CONFIRMED','IN_PROGRESS'].includes(j.status?.toUpperCase()));
  const past     = jobs.filter(j => ['COMPLETED','CANCELLED','REJECTED'].includes(j.status?.toUpperCase()));
  const display  = activeTab === 'upcoming' ? upcoming : past;
  const tabLabel = activeTab === 'upcoming' ? t('workerBookings.upcoming') : t('workerBookings.past');

  const statusStyle: Record<string,{bg:string,color:string}> = {
    COMPLETED:   { bg:'#d1fae5', color:'#065f46' },
    CANCELLED:   { bg:'#fee2e2', color:'#991b1b' },
    REJECTED:    { bg:'#fee2e2', color:'#991b1b' },
    PENDING:     { bg:'#fef3c7', color:'#92400e' },
    ACCEPTED:    { bg:'#dbeafe', color:'#1e40af' },
    CONFIRMED:   { bg:'#dbeafe', color:'#1e40af' },
    IN_PROGRESS: { bg:'#ede9fe', color:'#4c1d95' },
  };

  return (
    <div className="ws-page">
      <div className="ws-header">
        <div className="ws-header-row">
          <button className="ws-back-btn" onClick={() => navigate('/worker/home')}>
            <Home size={18} />
          </button>
          <h1 className="ws-header-title">{t('workerBookings.title')}</h1>
        </div>
        <p className="ws-header-sub">{upcoming.length} {t('newlyAdded.active')}{past.length} {t('newlyAdded.completed')}</p>
      </div>

      <div className="ws-body">
        {/* Tabs */}
        <div className="ws-tabs">
          <button className={`ws-tab ${activeTab==='upcoming'?'active':''}`} onClick={() => setActiveTab('upcoming')}>
            {t('workerBookings.upcoming')} {upcoming.length > 0 && `(${upcoming.length})`}
          </button>
          <button className={`ws-tab ${activeTab==='past'?'active':''}`} onClick={() => setActiveTab('past')}>
            {t('workerBookings.past')}
          </button>
        </div>

        {loading ? (
          <div className="ws-empty">
            <div className="ws-empty-icon" style={{background:'#f0fdf4'}}><Calendar size={32} color="#10b981"/></div>
            <p>{t('workerBookings.loadingBookings')}</p>
          </div>
        ) : display.length === 0 ? (
          <div className="ws-empty">
            <div className="ws-empty-icon" style={{background:'#f0fdf4'}}><Calendar size={32} color="#10b981"/></div>
            <h3>{t('workerBookings.noBookings', { tab: tabLabel })}</h3>
            <p>{t('workerBookings.noBookingsDesc', { tab: tabLabel })}</p>
          </div>
        ) : display.map(job => {
          const st = statusStyle[job.status?.toUpperCase()] || { bg:'#f3f4f6', color:'#374151' };
          return (
            <div key={job.id} className="ws-job-card"
              onClick={() => { if (['CONFIRMED','IN_PROGRESS'].includes(job.status?.toUpperCase())) navigate(`/worker/job/${job.id}/complete`); }}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px'}}>
                <div style={{flex:1, marginRight:'10px'}}>
                  <h3 style={{fontSize:'15px', fontWeight:700, color:'#111827', margin:'0 0 3px'}}>{job.service?.name || 'Service Job'}</h3>
                  <p style={{fontSize:'12px', color:'#6b7280', margin:0}}>{job.customer?.name || 'Customer'}</p>
                </div>
                <span className="ws-status-badge" style={{background:st.bg, color:st.color}}>{job.status?.toUpperCase()}</span>
              </div>
              <div style={{display:'flex', flexDirection:'column', gap:'5px', marginBottom:'12px'}}>
                <div className="ws-job-meta">
                  <Calendar size={13}/>
                  <span>{new Date(job.scheduled_date).toLocaleDateString('en-IN', {weekday:'short', month:'short', day:'numeric'})} {t('newlyAdded.at')}{new Date(job.scheduled_date).toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'})}</span>
                </div>
                {job.address && <div className="ws-job-meta"><MapPin size={13}/><span>{job.address}</span></div>}
              </div>
              <div className="ws-payout-row">
                <span className="ws-payout-label">{t('workerBookings.estimatedPayout')}</span>
                <span className="ws-payout-value">₹{job.amount || job.total_amount || 0}</span>
              </div>
              {job.status?.toUpperCase() === 'PENDING' && (
                <div className="ws-action-row">
                  <button className="ws-btn-accept" onClick={e => { e.stopPropagation(); handleStatusUpdate(job.id,'accept'); }}>{t('workerBookings.accept')}</button>
                  <button className="ws-btn-decline" onClick={e => { e.stopPropagation(); handleStatusUpdate(job.id,'reject'); }}>{t('workerBookings.decline')}</button>
                </div>
              )}
              {['CONFIRMED','IN_PROGRESS'].includes(job.status?.toUpperCase()) && (
                <button className="ws-cta" style={{marginTop:'12px'}} onClick={e => { e.stopPropagation(); navigate(`/worker/job/${job.id}/complete`); }}>
                  {t('newlyAdded.markComplete')}</button>
              )}
            </div>
          );
        })}
      </div>

      <nav className="wh-bottom-nav">
        <button className="wh-nav-item" onClick={() => navigate('/worker/home')}><Home size={22}/><span>{t('nav.home')}</span></button>
        <button className="wh-nav-item active" onClick={() => navigate('/worker/bookings')}><Calendar size={22}/><span>{t('nav.bookings')}</span><span className="wh-nav-active-dot"/></button>
        <button className="wh-nav-item" onClick={() => navigate('/worker/earnings')}><IndianRupee size={22}/><span>{t('nav.earnings')}</span></button>
        <button className="wh-nav-item" onClick={() => navigate('/worker/more')}><MoreHorizontal size={22}/><span>{t('nav.more')}</span></button>
      </nav>
    </div>
  );
}
