import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart2, Star, Users, Clock } from 'lucide-react';
import apiClient from '../../api/client';
import './WorkerShared.css';

export default function Analytics() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('Week');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get('/workers/analytics');
        if (res.data?.data) setData(res.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const chartData  = data?.chartData  || [];
  const stats      = data?.stats      || {};
  const categories = data?.categories || [];

  return (
    <div className="ws-page">
      <div className="ws-header">
        <div className="ws-header-row">
          <button className="ws-back-btn" onClick={() => navigate(-1 as any)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h1 className="ws-header-title">{t('analytics.title')}</h1>
        </div>
        <p className="ws-header-sub">{t('analytics.subtitle')}</p>
      </div>

      <div className="ws-body">
        {loading ? (
          <div className="ws-empty"><p>{t('analytics.loading')}</p></div>
        ) : (
          <>
            {/* Tabs */}
            <div className="ws-tabs">
              {['Week','Month','Year'].map(tab => (
                <button key={tab} className={`ws-tab ${activeTab===tab?'active':''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
              ))}
            </div>

            {/* Earnings chart card */}
            <div className="ws-card">
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px'}}>
                <p className="ws-label" style={{margin:0}}>{t('analytics.earningsThis', {period: activeTab})}</p>
                <span style={{fontSize:'18px', fontWeight:800, color:'#111827'}}>₹{data?.earnings?.toLocaleString('en-IN') || '0'}</span>
              </div>
              <div className="ws-chart">
                {chartData.map((d: any, i: number) => (
                  <div key={i} className="ws-bar-col">
                    <div className={`ws-bar ${d.active?'active':''}`} style={{height:`${Math.max(d.value,8)}%`}}/>
                    <span className={`ws-bar-label ${d.active?'active':''}`}>{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats 2×2 */}
            <div className="ws-stats-row">
              <div className="ws-stat-pill">
                <div style={{display:'flex', justifyContent:'center', marginBottom:'6px'}}><BarChart2 size={16} color="#10b981"/></div>
                <h4>{stats.jobs || 0}</h4>
                <p>{t('analytics.jobsThis', {period: activeTab})}</p>
              </div>
              <div className="ws-stat-pill">
                <div style={{display:'flex', justifyContent:'center', marginBottom:'6px'}}><Star size={16} color="#f59e0b"/></div>
                <h4>{stats.rating || '—'}</h4>
                <p>{t('analytics.avgRating')}</p>
              </div>
              <div className="ws-stat-pill">
                <div style={{display:'flex', justifyContent:'center', marginBottom:'6px'}}><Users size={16} color="#6366f1"/></div>
                <h4>{stats.repeatCustomers || '0%'}</h4>
                <p>{t('analytics.repeatCustomers')}</p>
              </div>
              <div className="ws-stat-pill">
                <div style={{display:'flex', justifyContent:'center', marginBottom:'6px'}}><Clock size={16} color="#64748b"/></div>
                <h4>{stats.avgResponse || '—'}</h4>
                <p>{t('analytics.avgResponse')}</p>
              </div>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <>
                <p className="ws-label">{t('analytics.jobsByCategory')}</p>
                <div className="ws-card">
                  {categories.map((cat: any, i: number) => (
                    <div key={i} style={{marginBottom: i < categories.length-1 ? '16px' : 0}}>
                      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'6px'}}>
                        <span style={{fontSize:'13px', fontWeight:600, color:'#374151'}}>{cat.name}</span>
                        <span style={{fontSize:'13px', fontWeight:700, color:'#10b981'}}>{cat.percentage}%</span>
                      </div>
                      <div className="ws-progress-bg">
                        <div className="ws-progress-fill" style={{width:`${cat.percentage}%`, background: cat.color || 'linear-gradient(90deg, #10b981, #064e35)'}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
