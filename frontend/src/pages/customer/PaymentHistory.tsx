import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import apiClient from '../../api/client';
import { useTranslation } from "react-i18next";

export default function PaymentHistory() {
    const { t } = useTranslation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await apiClient.get('/bookings');
        setTransactions(res.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch transactions', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const totalSpent = transactions
    .filter(t => t.payment_status === 'COMPLETED' || t.status === 'COMPLETED')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  return (
    <div className="app-container" style={{ paddingBottom: '32px' }}>
      <div className="app-header" style={{ border: 'none', justifyContent: 'center', position: 'relative' }}>
        <button className="back-btn" style={{ position: 'absolute', left: '20px' }} onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{t('newlyAdded.paymentHistory')}</h2>
      </div>

      <main style={{ padding: '0 20px' }}>
        {/* Total Spent Card */}
        <div style={{ 
          backgroundColor: '#DCFCE7', 
          borderRadius: '16px', 
          padding: '24px', 
          marginTop: '16px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <p style={{ fontSize: '13px', color: '#166534', margin: '0 0 8px', fontWeight: 500 }}>{t('newlyAdded.totalSpent')}</p>
          <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#14532D', margin: 0 }}>₹{totalSpent}</h2>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
          {['All', 'Completed', 'Pending'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                backgroundColor: filter === f ? 'var(--primary)' : 'var(--bg-card)',
                color: filter === f ? 'white' : 'var(--text-main)',
                boxShadow: filter === f ? '0 2px 8px rgba(22, 163, 74, 0.2)' : '0 1px 4px rgba(0,0,0,0.05)'
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isLoading ? (
            <p className="text-center text-muted">{t('newlyAdded.loading')}</p>
          ) : transactions.length === 0 ? (
            <p className="text-center text-muted">{t('newlyAdded.noTransactionsFound')}</p>
          ) : (
            transactions
              .filter(tx => {
                if (filter === 'Completed') return tx.payment_status === 'COMPLETED' || tx.status === 'COMPLETED';
                if (filter === 'Pending') return tx.payment_status !== 'COMPLETED' && tx.status !== 'COMPLETED';
                return true;
              })
              .map((tx) => (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                
                {/* Icon */}
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  backgroundColor: '#FEF3C7', 
                  color: '#D97706',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 700,
                  marginRight: '16px'
                }}>
                  {tx.service?.name?.charAt(0) || 'S'}
                </div>

                {/* Details */}
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 4px', color: 'var(--text-main)' }}>{tx.service?.name || 'Service Booking'}</h4>
                  <p className="text-muted" style={{ fontSize: '13px', margin: 0 }}>{tx.worker?.name || 'Worker'} • {new Date(tx.scheduled_date).toLocaleDateString()}</p>
                </div>

                {/* Amount & Status */}
                <div style={{ textAlign: 'right' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-main)' }}>₹{tx.amount}</h4>
                  <p style={{ fontSize: '12px', fontWeight: 600, margin: 0, color: 'var(--primary)' }}>{tx.payment_status || tx.status}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
