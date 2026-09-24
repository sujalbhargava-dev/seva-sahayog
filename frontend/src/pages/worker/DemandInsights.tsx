import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Zap, MapPin, TrendingUp } from 'lucide-react';
import apiClient from '../../api/client';
import './WorkerShared.css';

export default function DemandInsights() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get('/ai/insights');
        if (res.data?.data) setInsights(res.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const chartData   = insights?.forecast   || [];
  const bestAreas   = insights?.bestAreas  || [];
  const highDemand  = insights?.highDemand || {};

  const demandColor: Record<string,{bg:string,color:string}> = {
    high:   { bg:'#d1fae5', color:'#065f46' },
    medium: { bg:'#fef3c7', color:'#92400e' },
    low:    { bg:'#f3f4f6', color:'#374151' },
  };

  return (
    <div className="ws-page">
      <div className="ws-header">
        <div className="ws-header-row">
          <button className="ws-back-btn" onClick={() => navigate(-1 as any)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h1 className="ws-header-title">{t('demandInsights.title')}</h1>
        </div>
        <p className="ws-header-sub">{t('demandInsights.subtitle')}</p>
      </div>

      <div className="ws-body">
        {loading ? (
          <div className="ws-empty"><p>{t('demandInsights.loading')}</p></div>
        ) : (
          <>
            {/* High demand banner */}
            {highDemand.title && (
              <div style={{background:'linear-gradient(135deg,#064e35,#10b981)', borderRadius:'16px', padding:'16px 18px', marginBottom:'14px', display:'flex', alignItems:'center', gap:'14px'}}>
                <div style={{width:'40px', height:'40px', background:'rgba(255,255,255,0.2)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                  <Zap size={20} color="white" fill="white"/>
                </div>
                <div>
                  <p style={{color:'white', fontWeight:700, fontSize:'14px', margin:'0 0 3px'}}>{highDemand.title}</p>
                  <p style={{color:'rgba(255,255,255,0.8)', fontSize:'12px', margin:0, lineHeight:1.4}}>{highDemand.message}</p>
                </div>
              </div>
            )}

            {/* Forecast chart */}
            <div className="ws-card" style={{marginBottom:'14px'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px'}}>
                <p className="ws-label" style={{margin:0}}>{t('demandInsights.forecastTitle')}</p>
                <TrendingUp size={14} color="#10b981"/>
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

            {/* Best areas */}
            {bestAreas.length > 0 && (
              <>
                <p className="ws-label">{t('demandInsights.bestAreas')}</p>
                <div className="ws-card-sm">
                  {bestAreas.map((area: any, i: number) => {
                    const dc = demandColor[area.demand?.toLowerCase()] || demandColor.low;
                    return (
                      <div key={i} className="ws-row-item">
                        <div className="ws-row-icon" style={{background:'#f0fdf4'}}><MapPin size={18} color="#10b981"/></div>
                        <div className="ws-row-text">
                          <p className="ws-row-title">{area.name}</p>
                          <p className="ws-row-desc">{area.jobs}</p>
                        </div>
                        <span style={{padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:700, background:dc.bg, color:dc.color, textTransform:'capitalize'}}>
                          {area.demand}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <button className="ws-cta" onClick={() => {}}>
              <Zap size={16} style={{display:'inline', marginRight:'6px', verticalAlign:'middle'}}/>
              {t('demandInsights.goOnline')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
