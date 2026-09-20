import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Check } from 'lucide-react';
import apiClient from '../../api/client';

export default function CompleteJob() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [paymentReceived, setPaymentReceived] = useState('Yes');
  const [workDone, setWorkDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workDone) return;
    
    setIsSubmitting(true);
    try {
      await apiClient.patch(`/bookings/${id}/complete`);
      // Optionally navigate to worker home or earnings
      navigate(`/worker/home`); 
    } catch (error) {
      console.error('Failed to complete job', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container" style={{ paddingBottom: '32px' }}>
      {/* Header */}
      <div className="app-header" style={{ border: 'none' }}>
        <button className="back-btn" onClick={() => navigate('/worker/home')}>
          <ChevronLeft size={24} />
        </button>
      </div>

      <main style={{ padding: '0 20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>Complete Job</h1>
        <p className="text-muted" style={{ fontSize: '15px', marginBottom: '24px' }}>Upload proof and mark the job as done</p>

        {/* Customer Details */}
        <div style={{ background: 'var(--bg-app)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Customer: Priya Nair</p>
          <p className="text-muted" style={{ fontSize: '13px', marginBottom: '2px' }}>Service: Electrician — Wiring Repair</p>
          <p className="text-muted" style={{ fontSize: '13px' }}>Address: 12 Lashkar Road, Gwalior</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Proof Upload */}
          <div className="input-group">
            <label>Image Proof of Work</label>
            <div className="upload-box mt-2" style={{ padding: '32px 16px' }}>
              <span className="text-primary font-semibold">+ Tap to upload photo</span>
              <span className="text-muted text-xs">Add a clear photo of the completed work</span>
            </div>
          </div>

          <button 
            type="button" 
            className="btn-outline mt-4" 
            style={{ 
              borderColor: 'var(--primary)', 
              color: 'var(--primary)',
              backgroundColor: workDone ? 'var(--primary-light)' : 'transparent',
              gap: '8px'
            }}
            onClick={() => setWorkDone(true)}
          >
            {workDone && <Check size={20} />} Mark as Work Done
          </button>

          {/* Payment Status */}
          <div className="input-group mt-6">
            <label>Payment received from customer?</label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              {['Yes', 'No'].map(opt => (
                <button 
                  key={opt}
                  type="button"
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    border: `1px solid ${paymentReceived === opt ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: '8px',
                    background: paymentReceived === opt ? 'var(--primary-light)' : 'transparent',
                    color: paymentReceived === opt ? 'var(--primary)' : 'var(--text-main)',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                  onClick={() => setPaymentReceived(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary mt-8" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </main>
    </div>
  );
}
