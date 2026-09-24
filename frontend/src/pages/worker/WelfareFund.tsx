import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, ShieldAlert, IndianRupee, HeartHandshake, ChevronRight, ShieldCheck } from 'lucide-react';
import apiClient from '../../api/client';
import './WorkerShared.css';

export default function WelfareFund() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const benefits = [
    { id:'health',   title: t('welfareFund.healthCoverage'),    desc: t('welfareFund.healthDesc'), icon:<Plus size={18} color="#dc2626"/>,        bg:'#fee2e2' },
    { id:'accident', title: t('welfareFund.accidentInsurance'), desc: t('welfareFund.accidentDesc'), icon:<ShieldAlert size={18} color="#2563eb"/>,   bg:'#dbeafe' },
    { id:'loan',     title: t('welfareFund.emergencyLoan'),     desc: t('welfareFund.loanDesc'), icon:<IndianRupee size={18} color="#d97706"/>,   bg:'#fef3c7' },
    { id:'family',   title: t('welfareFund.familySupport'),     desc: t('welfareFund.familyDesc'), icon:<HeartHandshake size={18} color="#10b981"/>, bg:'#d1fae5' },
  ];

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get('/workers/earnings');
        if (res.data?.data?.summary?.totalWelfare) setBalance(res.data.data.summary.totalWelfare);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="ws-page">
      <div className="ws-header">
        <div className="ws-header-row">
          <button className="ws-back-btn" onClick={() => navigate(-1 as any)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h1 className="ws-header-title">{t('welfareFund.title')}</h1>
        </div>
        <p className="ws-header-sub">{t('welfareFund.subtitle')}</p>
      </div>

      <div className="ws-body">
        {/* Balance Card */}
        <div className="ws-balance-card">
          <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px'}}>
            <ShieldCheck size={16} color="rgba(255,255,255,0.8)"/>
            <p className="ws-balance-label" style={{margin:0}}>{t('welfareFund.yourBalance')}</p>
          </div>
          <h2 className="ws-balance-amount">{loading ? '₹ —' : `₹${balance.toLocaleString('en-IN')}`}</h2>
          <p className="ws-balance-sub">{t('welfareFund.autoContributed')}</p>
          <button className="ws-balance-btn">{t('welfareFund.fileClaim')}</button>
        </div>

        {/* Benefits */}
        <p className="ws-label">{t('welfareFund.yourBenefits')}</p>
        <div className="ws-card-sm">
          {benefits.map((b) => (
            <button key={b.id} className="ws-row-item">
              <div className="ws-row-icon" style={{background:b.bg}}>{b.icon}</div>
              <div className="ws-row-text">
                <p className="ws-row-title">{b.title}</p>
                <p className="ws-row-desc">{b.desc}</p>
              </div>
              <ChevronRight size={16} color="#d1d5db"/>
            </button>
          ))}
        </div>

        {/* CTA */}
        <button className="ws-cta">{t('welfareFund.applyLoan')}</button>
      </div>
    </div>
  );
}
