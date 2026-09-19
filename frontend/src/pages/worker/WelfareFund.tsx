import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, ShieldAlert, IndianRupee, HeartHandshake, ChevronRight } from 'lucide-react';

const benefits = [
  {
    id: 'health',
    title: 'Health Coverage',
    description: 'Up to ₹50,000 for hospitalization and treatment',
    icon: <Plus size={20} color="#DC2626" />,
    iconBg: '#FEE2E2'
  },
  {
    id: 'accident',
    title: 'Accident Insurance',
    description: 'Covers on-the-job injuries and disability',
    icon: <ShieldAlert size={20} color="#2563EB" />,
    iconBg: '#DBEAFE'
  },
  {
    id: 'loan',
    title: 'Emergency Loan',
    description: 'Interest-free advance up to ₹5,000',
    icon: <IndianRupee size={20} color="#D97706" />,
    iconBg: '#FEF3C7'
  },
  {
    id: 'family',
    title: 'Family Support',
    description: 'Education and support grants for dependents',
    icon: <HeartHandshake size={20} color="#16A34A" />,
    iconBg: '#DCFCE7'
  }
];

export default function WelfareFund() {
  const navigate = useNavigate();

  return (
    <div className="app-container" style={{ paddingBottom: '32px' }}>
      <div className="app-header" style={{ border: 'none', justifyContent: 'center', position: 'relative' }}>
        <button className="back-btn" style={{ position: 'absolute', left: '20px' }} onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Welfare Fund</h2>
      </div>

      <main style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 80px)' }}>
        {/* Balance Card */}
        <div style={{ 
          backgroundColor: '#16A34A', 
          borderRadius: '16px', 
          padding: '24px', 
          marginTop: '16px',
          marginBottom: '32px',
          color: 'white',
          boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
        }}>
          <p style={{ fontSize: '14px', margin: '0 0 8px', opacity: 0.9 }}>Your Welfare Balance</p>
          <h2 style={{ fontSize: '36px', fontWeight: 700, margin: '0 0 12px' }}>₹2,340</h2>
          <p style={{ fontSize: '12px', margin: 0, opacity: 0.8 }}>5% contributed automatically per gig</p>
        </div>

        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-main)' }}>Your Benefits</h3>

        {/* Benefits List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1 }}>
          {benefits.map(benefit => (
            <div key={benefit.id} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '16px', 
              backgroundColor: 'var(--bg-card)', 
              borderRadius: '16px',
              border: '1px solid var(--border)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
              cursor: 'pointer'
            }}>
              {/* Icon */}
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                backgroundColor: benefit.iconBg, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0,
                marginRight: '16px'
              }}>
                {benefit.icon}
              </div>

              {/* Text */}
              <div style={{ flexGrow: 1, paddingRight: '12px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 4px', color: 'var(--text-main)' }}>{benefit.title}</h4>
                <p className="text-muted" style={{ fontSize: '13px', margin: 0, lineHeight: 1.4 }}>{benefit.description}</p>
              </div>

              {/* Arrow */}
              <ChevronRight size={20} color="#9CA3AF" />
            </div>
          ))}
        </div>

        {/* Action Button */}
        <button 
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: '#16A34A',
            color: 'white',
            border: 'none',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
            marginTop: '32px'
          }}
        >
          File a Claim
        </button>
      </main>
    </div>
  );
}
