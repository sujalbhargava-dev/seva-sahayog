import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, CreditCard, Wallet, Smartphone, ShieldCheck } from 'lucide-react';

export default function Payment() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [method, setMethod] = useState('UPI');

  const handlePay = () => {
    // Navigate to Review screen after payment
    navigate(`/customer/review/${id}`);
  };

  return (
    <div className="app-container" style={{ paddingBottom: '32px' }}>
      <div className="app-header" style={{ border: 'none' }}>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
      </div>

      <main style={{ padding: '0 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, margin: '16px 0 0' }}>Payment</h1>
        
        <div style={{ margin: '32px 0 48px' }}>
          <h2 style={{ fontSize: '48px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>₹550</h2>
          <p className="text-muted" style={{ fontSize: '14px', marginTop: '8px' }}>Service Amount</p>
        </div>

        <div style={{ textAlign: 'left' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Choose Payment Method</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* UPI Option */}
            <button 
              style={{
                display: 'flex', alignItems: 'center', padding: '16px', borderRadius: '12px',
                border: `1px solid ${method === 'UPI' ? 'var(--primary)' : 'var(--border)'}`,
                background: method === 'UPI' ? 'var(--primary-light)' : 'var(--bg-card)',
                cursor: 'pointer',
                textAlign: 'left'
              }}
              onClick={() => setMethod('UPI')}
            >
              <div style={{ width: '40px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6', borderRadius: '6px', marginRight: '16px', color: '#16A34A' }}>
                <span style={{ fontSize: '11px', fontWeight: 800 }}>UPI</span>
              </div>
              <span style={{ flexGrow: 1, fontSize: '15px', fontWeight: 500, color: 'var(--text-main)' }}>UPI (GPay, PhonePe, Paytm)</span>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${method === 'UPI' ? 'var(--primary)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {method === 'UPI' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></div>}
              </div>
            </button>

            {/* Card Option */}
            <button 
              style={{
                display: 'flex', alignItems: 'center', padding: '16px', borderRadius: '12px',
                border: `1px solid ${method === 'Card' ? 'var(--primary)' : 'var(--border)'}`,
                background: method === 'Card' ? 'var(--primary-light)' : 'var(--bg-card)',
                cursor: 'pointer',
                textAlign: 'left'
              }}
              onClick={() => setMethod('Card')}
            >
              <div style={{ width: '40px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#DBEAFE', borderRadius: '6px', marginRight: '16px', color: '#1D4ED8' }}>
                <CreditCard size={18} />
              </div>
              <span style={{ flexGrow: 1, fontSize: '15px', fontWeight: 500, color: 'var(--text-main)' }}>Credit / Debit Card</span>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${method === 'Card' ? 'var(--primary)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {method === 'Card' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></div>}
              </div>
            </button>

            {/* Wallet Option */}
            <button 
              style={{
                display: 'flex', alignItems: 'center', padding: '16px', borderRadius: '12px',
                border: `1px solid ${method === 'Wallet' ? 'var(--primary)' : 'var(--border)'}`,
                background: method === 'Wallet' ? 'var(--primary-light)' : 'var(--bg-card)',
                cursor: 'pointer',
                textAlign: 'left'
              }}
              onClick={() => setMethod('Wallet')}
            >
              <div style={{ width: '40px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FEF3C7', borderRadius: '6px', marginRight: '16px', color: '#D97706' }}>
                <Wallet size={18} />
              </div>
              <span style={{ flexGrow: 1, fontSize: '15px', fontWeight: 500, color: 'var(--text-main)' }}>Wallet</span>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${method === 'Wallet' ? 'var(--primary)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {method === 'Wallet' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></div>}
              </div>
            </button>
          </div>
        </div>

        <button className="btn-primary mt-8" onClick={handlePay}>
          Pay Securely
        </button>
        
        <p className="text-muted" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '16px', fontSize: '12px', fontWeight: 500 }}>
          <ShieldCheck size={16} color="var(--primary)" /> 100% Secure Payment
        </p>
      </main>
    </div>
  );
}
