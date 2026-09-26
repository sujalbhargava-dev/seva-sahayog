import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Calendar, IndianRupee, MoreHorizontal, ArrowUpRight, ShieldCheck, TrendingDown } from 'lucide-react';
import apiClient from '../../api/client';
import './WorkerShared.css';

export default function WorkerEarnings() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [earningsData, setEarningsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get('/workers/earnings');
        if (res.data?.data) setEarningsData(res.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const summary = earningsData?.summary || { totalEarnings: 0, totalFees: 0, totalWelfare: 0 };
  const transactions = earningsData?.earnings || [];

  return (
    <div className="ws-page">
      <div className="ws-header">
        <div className="ws-header-row">
          <button className="ws-back-btn" onClick={() => navigate('/worker/home')}>
            <Home size={18} />
          </button>
          <h1 className="ws-header-title">{t('workerEarnings.title')}</h1>
        </div>
        <p className="ws-header-sub">{t('newlyAdded.yourFinancialOverview')}</p>
      </div>

      <div className="ws-body">
        {/* Balance Hero Card */}
        <div className="ws-balance-card">
          <p className="ws-balance-label">{t('workerEarnings.availableBalance')}</p>
          <h2 className="ws-balance-amount">
            {loading ? '₹ —' : `₹${summary.totalEarnings.toLocaleString('en-IN')}`}
          </h2>
          <p className="ws-balance-sub">{t('newlyAdded.lifetimeEarningsOnSeva')}</p>
          <button className="ws-balance-btn" onClick={() => {}}>
            {t('workerEarnings.withdrawFunds')} →
          </button>
        </div>

        {/* Deductions */}
        <div className="ws-stats-row">
          <div className="ws-stat-pill">
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', marginBottom:'6px'}}>
              <TrendingDown size={14} color="#ef4444"/>
              <span style={{fontSize:'11px', fontWeight:600, color:'#ef4444'}}>{t('workerEarnings.platformFees')}</span>
            </div>
            <h4>{loading ? '—' : `₹${summary.totalFees.toLocaleString('en-IN')}`}</h4>
          </div>
          <div className="ws-stat-pill">
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', marginBottom:'6px'}}>
              <ShieldCheck size={14} color="#10b981"/>
              <span style={{fontSize:'11px', fontWeight:600, color:'#10b981'}}>{t('workerEarnings.welfareFund')}</span>
            </div>
            <h4>{loading ? '—' : `₹${summary.totalWelfare.toLocaleString('en-IN')}`}</h4>
          </div>
        </div>

        {/* Transactions */}
        <p className="ws-label">{t('workerEarnings.recentTransactions')}</p>
        {loading ? (
          <div className="ws-empty">
            <p>{t('workerEarnings.loading')}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="ws-empty">
            <div className="ws-empty-icon" style={{background:'#f0fdf4'}}><IndianRupee size={32} color="#10b981"/></div>
            <h3>{t('newlyAdded.noTransactionsYet')}</h3>
            <p>{t('workerEarnings.noTransactions')}</p>
          </div>
        ) : (
          <div className="ws-card-sm">
            {transactions.map((tx: any, i: number) => (
              <div key={tx.id} className="ws-row-item" style={i===0?{borderTop:'none'}:{}}>
                <div className="ws-row-icon" style={{background:'#d1fae5'}}>
                  <ArrowUpRight size={18} color="#10b981"/>
                </div>
                <div className="ws-row-text">
                  <p className="ws-row-title">{t('workerEarnings.jobPayout')}</p>
                  <p className="ws-row-desc">{new Date(tx.created_at).toLocaleDateString('en-IN', {month:'short', day:'numeric', year:'numeric'})}</p>
                </div>
                <span style={{fontSize:'16px', fontWeight:800, color:'#10b981'}}>+ ₹{tx.net_amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <nav className="wh-bottom-nav">
        <button className="wh-nav-item" onClick={() => navigate('/worker/home')}><Home size={22}/><span>{t('nav.home')}</span></button>
        <button className="wh-nav-item" onClick={() => navigate('/worker/bookings')}><Calendar size={22}/><span>{t('nav.bookings')}</span></button>
        <button className="wh-nav-item active" onClick={() => navigate('/worker/earnings')}><IndianRupee size={22}/><span>{t('nav.earnings')}</span><span className="wh-nav-active-dot"/></button>
        <button className="wh-nav-item" onClick={() => navigate('/worker/more')}><MoreHorizontal size={22}/><span>{t('nav.more')}</span></button>
      </nav>
    </div>
  );
}
