import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Zap } from 'lucide-react';

const services = [
  { id: 'electrician', initial: 'E', label: 'Electrician' },
  { id: 'plumber', initial: 'P', label: 'Plumber' },
  { id: 'locksmith', initial: 'L', label: 'Locksmith' },
  { id: 'gas_leak', initial: 'G', label: 'Gas Leak' }
];

export default function EmergencyBooking() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState('electrician');
  const [location, setLocation] = useState('A-204, Gardenia Apartments, Gwalior');

  return (
    <div className="app-container" style={{ paddingBottom: '32px' }}>
      <div className="app-header" style={{ border: 'none', justifyContent: 'center', position: 'relative' }}>
        <button className="back-btn" style={{ position: 'absolute', left: '20px' }} onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Emergency Service</h2>
      </div>

      <main style={{ padding: '0 20px' }}>
        {/* Alert Banner */}
        <div style={{
          backgroundColor: '#FEE2E2',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          marginTop: '16px',
          marginBottom: '32px'
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Zap size={18} color="#DC2626" fill="#DC2626" />
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#991B1B', margin: '0 0 4px' }}>Get help within 30 minutes</h4>
            <p style={{ fontSize: '12px', color: '#B91C1C', margin: 0, lineHeight: 1.4 }}>For urgent issues: electrical hazards, leaks, lockouts</p>
          </div>
        </div>

        {/* Service Grid */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-main)' }}>Select Urgent Service</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {services.map(service => {
              const isSelected = selectedService === service.id;
              return (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px 16px',
                    borderRadius: '12px',
                    backgroundColor: isSelected ? '#FEF2F2' : 'var(--bg-card)',
                    border: `2px solid ${isSelected ? '#DC2626' : 'var(--border)'}`,
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '8px',
                    backgroundColor: isSelected ? '#FEE2E2' : '#F3F4F6',
                    color: isSelected ? '#DC2626' : '#6B7280',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', fontWeight: 700, marginBottom: '12px'
                  }}>
                    {service.initial}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: isSelected ? '#DC2626' : 'var(--text-main)' }}>{service.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Location */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-main)' }}>Your Location</h3>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-card)',
              fontSize: '15px',
              color: 'var(--text-main)',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Action Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', justifyContent: 'center' }}>
          <Zap size={16} color="#D97706" fill="#D97706" />
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#D97706' }}>Emergency response surcharge: +₹100</span>
        </div>
        
        <button 
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: '#DC2626',
            color: 'white',
            border: 'none',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
          }}
          onClick={() => navigate('/customer/finding-worker')}
        >
          Request Emergency Help
        </button>
      </main>
    </div>
  );
}
