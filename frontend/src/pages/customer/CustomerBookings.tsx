import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Calendar, MessageSquare, User, Loader2, MapPin } from 'lucide-react';
import apiClient from '../../api/client';
import './CustomerHome.css';

interface Booking {
  id: string; status: string; amount: number; scheduled_date: string;
  address?: string; service?: { name: string }; worker?: { name: string };
}

export default function CustomerBookings() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await apiClient.get('/bookings');
        setBookings(res.data?.data || []);
      } catch (error) { console.error('Failed to fetch bookings', error); }
      finally { setIsLoading(false); }
    };
    fetchBookings();
  }, []);

  const handleCancel = async (id: string) => {
    try {
      await apiClient.patch(`/bookings/${id}/cancel`);
      const res = await apiClient.get('/bookings');
      setBookings(res.data?.data || []);
    } catch (error) { console.error('Failed to cancel booking', error); }
  };

  const upcomingBookings = bookings.filter(b => ['PENDING','ACCEPTED','CONFIRMED','IN_PROGRESS'].includes(b.status?.toUpperCase()));
  const pastBookings = bookings.filter(b => ['COMPLETED','CANCELLED','REJECTED'].includes(b.status?.toUpperCase()));
  const displayBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;
  const tabLabel = activeTab === 'upcoming' ? t('customerBookings.upcoming') : t('customerBookings.past');

  return (
    <div className="app-container with-bottom-nav">
      <div className="app-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>{t('customerBookings.title')}</h1>
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        <div className="tabs-container" style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'upcoming' ? 'var(--primary)' : 'var(--bg-card)', color: activeTab === 'upcoming' ? 'white' : 'var(--text-main)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setActiveTab('upcoming')}>
            {t('customerBookings.upcoming')}
          </button>
          <button style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'past' ? 'var(--primary)' : 'var(--bg-card)', color: activeTab === 'past' ? 'white' : 'var(--text-main)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setActiveTab('past')}>
            {t('customerBookings.past')}
          </button>
        </div>
      </div>

      <main style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '60vh' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <Loader2 className="animate-spin text-primary" size={32} style={{ margin: '0 auto' }} />
          </div>
        ) : displayBookings.length === 0 ? (
          <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <Calendar size={48} className="text-primary mb-4" />
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{t('customerBookings.noBookings', { tab: tabLabel })}</h2>
            <p className="text-muted text-center" style={{ fontSize: '14px' }}>{t('customerBookings.noBookingsDesc', { tab: tabLabel })}</p>
          </div>
        ) : (
          displayBookings.map(booking => (
            <div key={booking.id} style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '16px', border: '1px solid var(--border)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 4px' }}>{booking.service?.name || 'Service Booking'}</h3>
                  <p className="text-muted" style={{ fontSize: '13px', margin: 0 }}>{t('customerBookings.worker', { name: booking.worker?.name || t('customerBookings.assignedSoon') })}</p>
                </div>
                <div style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, backgroundColor: booking.status?.toUpperCase() === 'COMPLETED' ? '#DCFCE7' : booking.status?.toUpperCase() === 'CANCELLED' ? '#FEE2E2' : '#FEF3C7', color: booking.status?.toUpperCase() === 'COMPLETED' ? '#16A34A' : booking.status?.toUpperCase() === 'CANCELLED' ? '#DC2626' : '#D97706' }}>
                  {booking.status?.toUpperCase()}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontSize: '13px' }}>
                  <Calendar size={16} className="text-muted" />
                  <span>{new Date(booking.scheduled_date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(booking.scheduled_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {booking.address && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-main)', fontSize: '13px' }}>
                    <MapPin size={16} className="text-muted" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ lineHeight: 1.4 }}>{booking.address}</span>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{t('customerBookings.estimatedCost')}</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>₹{booking.amount}</span>
              </div>
              {['PENDING','CONFIRMED'].includes(booking.status?.toUpperCase()) && (
                <div style={{ display: 'flex', marginTop: '16px' }}>
                  <button onClick={(e) => { e.stopPropagation(); handleCancel(booking.id); }} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #DC2626', background: '#FEF2F2', color: '#DC2626', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                    {t('customerBookings.cancelBooking')}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </main>

      <nav className="bottom-nav">
        <button className="nav-item" onClick={() => navigate('/customer/home')}><Home size={24} /><span>{t('nav.home')}</span></button>
        <button className="nav-item active" onClick={() => navigate('/customer/bookings')}><Calendar size={24} /><span>{t('nav.bookings')}</span></button>
        <button className="nav-item" onClick={() => navigate('/customer/messages')}><MessageSquare size={24} /><span>{t('nav.messages')}</span></button>
        <button className="nav-item" onClick={() => navigate('/customer/profile')}><User size={24} /><span>{t('nav.profile')}</span></button>
      </nav>
    </div>
  );
}
