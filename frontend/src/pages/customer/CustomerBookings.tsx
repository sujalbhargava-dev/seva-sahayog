import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar, MessageSquare, User, Loader2 } from 'lucide-react';
import apiClient from '../../api/client';
import './CustomerHome.css';

interface Booking {
  id: string;
  status: string;
  amount: number;
  scheduled_date: string;
  service?: { name: string };
  worker?: { name: string };
}

export default function CustomerBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await apiClient.get('/bookings');
        setBookings(res.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch bookings', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="app-container with-bottom-nav">
      <main style={{ padding: '20px', minHeight: '80vh' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>My Bookings</h2>
        
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px' }}>
            <Calendar size={48} className="text-primary mb-4" />
            <p className="text-muted text-center mt-2">You have no active bookings at the moment.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bookings.map(booking => (
              <div key={booking.id} style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{booking.service?.name || 'Service Booking'}</h3>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary)' }}>₹{booking.amount}</span>
                </div>
                <p className="text-muted" style={{ fontSize: '14px', margin: '4px 0' }}>Worker: {booking.worker?.name || 'Assigned soon'}</p>
                <p className="text-muted" style={{ fontSize: '14px', margin: '4px 0' }}>Date: {new Date(booking.scheduled_date).toLocaleDateString()}</p>
                <div style={{ marginTop: '12px', display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, background: 'var(--bg-app)' }}>
                  Status: {booking.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <nav className="bottom-nav">
        <button className="nav-item" onClick={() => navigate('/customer/home')}>
          <Home size={24} />
          <span>Home</span>
        </button>
        <button className="nav-item active" onClick={() => navigate('/customer/bookings')}>
          <Calendar size={24} />
          <span>Bookings</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/customer/messages')}>
          <MessageSquare size={24} />
          <span>Messages</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/customer/profile')}>
          <User size={24} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}
