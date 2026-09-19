import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

type Transaction = {
  id: string;
  category: string;
  title: string;
  workerName: string;
  date: string;
  amount: number;
  status: string;
  iconBg: string;
  iconColor: string;
};

const mockTransactions: Transaction[] = [
  {
    id: '1',
    category: 'E',
    title: 'Electrical Repair',
    workerName: 'Ramesh Kumar',
    date: '19 Sep 2026',
    amount: 550,
    status: 'Paid',
    iconBg: '#FEF3C7',
    iconColor: '#D97706'
  },
  {
    id: '2',
    category: 'P',
    title: 'Pipe Leak Fix',
    workerName: 'Suresh Yadav',
    date: '12 Sep 2026',
    amount: 450,
    status: 'Paid',
    iconBg: '#DBEAFE',
    iconColor: '#1D4ED8'
  },
  {
    id: '3',
    category: 'C',
    title: 'Furniture Repair',
    workerName: 'Vikas Sharma',
    date: '30 Aug 2026',
    amount: 700,
    status: 'Paid',
    iconBg: '#FFEDD5',
    iconColor: '#C2410C'
  },
  {
    id: '4',
    category: 'E',
    title: 'Fan Installation',
    workerName: 'Amit Verma',
    date: '18 Aug 2026',
    amount: 350,
    status: 'Paid',
    iconBg: '#FEF3C7',
    iconColor: '#D97706'
  }
];

export default function PaymentHistory() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');

  return (
    <div className="app-container" style={{ paddingBottom: '32px' }}>
      <div className="app-header" style={{ border: 'none', justifyContent: 'center', position: 'relative' }}>
        <button className="back-btn" style={{ position: 'absolute', left: '20px' }} onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Payment History</h2>
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
          <p style={{ fontSize: '13px', color: '#166534', margin: '0 0 8px', fontWeight: 500 }}>Total Spent This Month</p>
          <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#14532D', margin: 0 }}>₹1,850</h2>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
          {['All', 'This Month', 'Last Month'].map((f) => (
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
          {mockTransactions.map((tx) => (
            <div key={tx.id} style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              
              {/* Icon */}
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                backgroundColor: tx.iconBg, 
                color: tx.iconColor,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 700,
                marginRight: '16px'
              }}>
                {tx.category}
              </div>

              {/* Details */}
              <div style={{ flexGrow: 1 }}>
                <h4 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 4px', color: 'var(--text-main)' }}>{tx.title}</h4>
                <p className="text-muted" style={{ fontSize: '13px', margin: 0 }}>{tx.workerName} • {tx.date}</p>
              </div>

              {/* Amount & Status */}
              <div style={{ textAlign: 'right' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-main)' }}>₹{tx.amount}</h4>
                <p style={{ fontSize: '12px', fontWeight: 600, margin: 0, color: 'var(--primary)' }}>{tx.status}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
