import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Calendar, IndianRupee, MoreHorizontal, Settings, FileText, HeartHandshake, LogOut } from 'lucide-react';
import './WorkerShared.css';

export default function WorkerMore() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="ws-page">
      <div className="ws-header">
        <div className="ws-header-row">
          <h1 className="ws-header-title">{t('workerMore.title')}</h1>
        </div>
        <p className="ws-header-sub">{t('workerMore.subtitle')}</p>
      </div>

      <div className="ws-body">
        <div className="ws-card-sm" style={{marginTop:'16px'}}>
          <button className="ws-row-item" onClick={() => navigate('/worker/profile')}>
            <div className="ws-row-icon" style={{background:'#eff6ff'}}><Settings size={18} color="#2563eb"/></div>
            <div className="ws-row-text">
              <p className="ws-row-title">{t('workerMore.accountSettings')}</p>
              <p className="ws-row-desc">{t('workerMore.accountSettingsDesc')}</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          
          <button className="ws-row-item" onClick={() => navigate('/worker/welfare')}>
            <div className="ws-row-icon" style={{background:'#d1fae5'}}><HeartHandshake size={18} color="#10b981"/></div>
            <div className="ws-row-text">
              <p className="ws-row-title">{t('workerMore.welfareFund')}</p>
              <p className="ws-row-desc">{t('workerMore.welfareFundDesc')}</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          
          <button className="ws-row-item">
            <div className="ws-row-icon" style={{background:'#fef3c7'}}><FileText size={18} color="#d97706"/></div>
            <div className="ws-row-text">
              <p className="ws-row-title">{t('workerMore.termsPolicies')}</p>
              <p className="ws-row-desc">{t('workerMore.termsPoliciesDesc')}</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        <button 
          className="ws-row-item" 
          style={{background:'white', borderRadius:'16px', marginTop:'8px', border:'none', boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}
          onClick={() => navigate('/landing')}>
          <div className="ws-row-icon" style={{background:'#fee2e2'}}><LogOut size={18} color="#dc2626"/></div>
          <div className="ws-row-text">
            <p className="ws-row-title" style={{color:'#dc2626'}}>{t('workerMore.logOut')}</p>
          </div>
        </button>
      </div>

      <nav className="wh-bottom-nav">
        <button className="wh-nav-item" onClick={() => navigate('/worker/home')}><Home size={22}/><span>{t('nav.home')}</span></button>
        <button className="wh-nav-item" onClick={() => navigate('/worker/bookings')}><Calendar size={22}/><span>{t('nav.bookings')}</span></button>
        <button className="wh-nav-item" onClick={() => navigate('/worker/earnings')}><IndianRupee size={22}/><span>{t('nav.earnings')}</span></button>
        <button className="wh-nav-item active" onClick={() => navigate('/worker/more')}><MoreHorizontal size={22}/><span>{t('nav.more')}</span><span className="wh-nav-active-dot"/></button>
      </nav>
    </div>
  );
}
