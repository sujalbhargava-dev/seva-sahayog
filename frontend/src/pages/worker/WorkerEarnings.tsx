import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Calendar, IndianRupee, MoreHorizontal, ArrowDownCircle, ArrowUpRight, ShieldCheck } from 'lucide-react';
import apiClient from '../../api/client';
import './WorkerHome.css';

export default function WorkerEarnings() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [earningsData, setEarningsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await apiClient.get('/workers/earnings');
        if (res.data?.data) setEarningsData(res.data.data);
      } catch (error) { console.error('Failed to fetch earnings', error); }
      finally { setLoading(false); }
    };
    fetchEarnings();
  }, []);

  const summary = earningsData?.summary || { totalEarnings: 0, totalFees: 0, totalWelfare: 0 };
  const transactions = earningsData?.earnings || [];

  return (
    <div className="app-container with-bottom-nav">
      <div className="app-header" style={{ padding: '16px 20px', backgroundColor: 'var(--primary)', color: 'white' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>{t('workerEarnings.title')}</h1>
      </div>

      <main style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Balance Card */}
        <div style={{ backgroundColor: 'var(--primary)', color: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)', marginTop: '-10px' }}>
          <p style={{ fontSize: '14px', opacity: 0.9, margin: '0 0 8px 0' }}>{t('workerEarnings.availableBalance')}</p>
          <h2 style={{ fontSize: '36px', fontWeight: 700, margin: '0 0 16px 0', letterSpacing: '-1px' }}>
            {loading ? '₹...' : `₹${summary.totalEarnings.toLocaleString('en-IN')}`}
          </h2>
          <button style={{ width: '100%', padding: '14px', backgroundColor: 'white', color: 'var(--primary)', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            {t('workerEarnings.withdrawFunds')}
          </button>
        </div>

        {/* Deductions Row */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1, backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
              <ArrowDownCircle size={16} />
              <span style={{ fontSize: '12px', fontWeight: 500 }}>{t('workerEarnings.platformFees')}</span>
            </div>
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>
              {loading ? '-' : `₹${summary.totalFees.toLocaleString('en-IN')}`}
            </span>
          </div>
          <div style={{ flex: 1, backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
              <ShieldCheck size={16} />
              <span style={{ fontSize: '12px', fontWeight: 500 }}>{t('workerEarnings.welfareFund')}</span>
            </div>
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>
              {loading ? '-' : `₹${summary.totalWelfare.toLocaleString('en-IN')}`}
            </span>
          </div>
        </div>

        {/* Transactions */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0', color: 'var(--text-main)' }}>{t('workerEarnings.recentTransactions')}</h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>{t('workerEarnings.loading')}</div>
          ) : transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <p className="text-muted" style={{ margin: 0, fontSize: '14px' }}>{t('workerEarnings.noTransactions')}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {transactions.map((tx: any) => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowUpRight size={20} /></div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600 }}>{t('workerEarnings.jobPayout')}</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(tx.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: '#16A34A' }}>+ ₹{tx.net_amount}</h4>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <nav className="bottom-nav">
        <button className="nav-item" onClick={() => navigate('/worker/home')}><Home size={24} /><span>{t('nav.home')}</span></button>
        <button className="nav-item" onClick={() => navigate('/worker/bookings')}><Calendar size={24} /><span>{t('nav.bookings')}</span></button>
        <button className="nav-item active" onClick={() => navigate('/worker/earnings')}><IndianRupee size={24} /><span>{t('nav.earnings')}</span></button>
        <button className="nav-item" onClick={() => navigate('/worker/more')}><MoreHorizontal size={24} /><span>{t('nav.more')}</span></button>
      </nav>
    </div>
  );
}
