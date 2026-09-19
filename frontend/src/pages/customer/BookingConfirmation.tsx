import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, MapPin, FileText } from 'lucide-react';

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleConfirm = () => {
    // In a real app, this would call the /api/bookings endpoint
    alert('Booking Confirmed successfully!');
    navigate('/customer/home');
  };

  return (
    <div className="app-container" style={{ paddingBottom: '90px' }}>
      {/* Header */}
      <div className="app-header">
        <button className="back-btn" onClick={() => navigate(`/customer/worker/${id}`)}>
          <ChevronLeft size={24} />
        </button>
        <h1 style={{ flexGrow: 1, margin: 0 }}>Booking Details</h1>
      </div>

      <main style={{ padding: '20px' }}>
        {/* Worker Info */}
        <div className="worker-card mb-6" style={{ background: 'var(--primary-light)', border: 'none' }}>
          <div className="w-avatar" style={{ backgroundColor: '#FEF08A', color: '#854D0E', width: '48px', height: '48px' }}>
            R
          </div>
          <div className="w-info">
            <h4 style={{ fontSize: '16px' }}>Electrical Repair</h4>
            <p className="text-muted mt-2" style={{ fontSize: '13px' }}>Ramesh Kumar</p>
            <p className="w-rating" style={{ fontSize: '13px' }}>★ 4.8 (120 reviews)</p>
          </div>
        </div>

        <div className="section-title" style={{ fontSize: '14px', color: 'var(--text-main)', textTransform: 'none' }}>Date & Time</div>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--bg-app)', borderRadius: '8px' }}>
            <Calendar size={18} className="text-muted" />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Today, 19 Sep 2026</span>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--bg-app)', borderRadius: '8px' }}>
            <Clock size={18} className="text-muted" />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>3:00 PM</span>
          </div>
        </div>

        <div className="section-title" style={{ fontSize: '14px', color: 'var(--text-main)', textTransform: 'none' }}>Service Address</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--bg-app)', borderRadius: '8px', marginBottom: '24px' }}>
          <MapPin size={18} className="text-muted" />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>A-204, Gardenia Apartments, Gwalior, MP</span>
        </div>

        <div className="section-title" style={{ fontSize: '14px', color: 'var(--text-main)', textTransform: 'none' }}>Problem Description</div>
        <div style={{ display: 'flex', gap: '8px', padding: '12px', background: 'var(--bg-app)', borderRadius: '8px', marginBottom: '24px', alignItems: 'flex-start' }}>
          <FileText size={18} className="text-muted" style={{ marginTop: '2px' }} />
          <span style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.4 }}>Fan not working, need repair and check wiring.</span>
        </div>

      </main>

      {/* Action Bar */}
      <div className="action-bar" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p className="text-muted" style={{ fontSize: '12px' }}>Estimated Cost</p>
          <p style={{ fontSize: '18px', fontWeight: 700 }}>₹400 - ₹600</p>
        </div>
        <button className="btn-primary" style={{ width: 'auto', padding: '12px 32px' }} onClick={handleConfirm}>
          Confirm Booking
        </button>
      </div>
    </div>
  );
}
