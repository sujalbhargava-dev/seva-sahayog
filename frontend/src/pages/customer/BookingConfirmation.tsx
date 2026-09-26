import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, MapPin, FileText } from 'lucide-react';
import apiClient from '../../api/client';
import { useTranslation } from "react-i18next";

export default function BookingConfirmation() {
    const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams(); // worker id
  const [searchParams] = useSearchParams();
  const service = searchParams.get('service') || 'General Service';

  const [worker, setWorker] = useState<any>(null);
  const [address, setAddress] = useState('A-204, Gardenia Apartments, Gwalior, MP');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('15:00');
  const [description, setDescription] = useState('Fan not working, need repair and check wiring.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const res = await apiClient.get(`/workers/${id}`);
        if (res.data?.data) {
          setWorker(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch worker details', error);
      }
    };
    const fetchServices = async () => {
      try {
        const res = await apiClient.get('/services');
        if (res.data?.data) {
          setServices(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch services', error);
      }
    };
    if (id) fetchWorker();
    fetchServices();
  }, [id]);

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      
      const matchedService = services.find(s => s.name.toLowerCase() === service.toLowerCase());
      const serviceId = matchedService ? matchedService.id : service;
      
      const payload = {
        workerId: id,
        serviceId: serviceId, // Send UUID if found, else fallback (which may fail validation)
        location: {
          latitude: 26.2183, // Mock coords for Gwalior
          longitude: 78.1828,
          address: address
        },
        scheduledDate: date,
        scheduledTime: time,
        amount: 550, // mock amount
      };

      await apiClient.post('/bookings', payload);
      alert('Booking Confirmed successfully!');
      navigate('/customer/bookings');
    } catch (error: any) {
      console.error('Booking failed', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert(`Failed to confirm booking: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container" style={{ paddingBottom: '90px' }}>
      {/* Header */}
      <div className="app-header">
        <button className="back-btn" onClick={() => navigate(`/customer/worker/${id}`)}>
          <ChevronLeft size={24} />
        </button>
        <h1 style={{ flexGrow: 1, margin: 0 }}>{t('newlyAdded.bookingDetails')}</h1>
      </div>

      <main style={{ padding: '20px' }}>
        {/* Worker Info */}
        <div className="worker-card mb-6" style={{ background: 'var(--primary-light)', border: 'none' }}>
          <div className="w-avatar" style={{ backgroundColor: '#FEF08A', color: '#854D0E', width: '48px', height: '48px' }}>
            {worker?.name ? worker.name.charAt(0).toUpperCase() : 'W'}
          </div>
          <div className="w-info">
            <h4 style={{ fontSize: '16px' }}>{service}</h4>
            <p className="text-muted mt-2" style={{ fontSize: '13px' }}>{worker?.name || 'Loading...'}</p>
            <p className="w-rating" style={{ fontSize: '13px' }}>★ {worker?.rating || 'New'} ({worker?.total_jobs || 0} {t('newlyAdded.jobs')}</p>
          </div>
        </div>

        <div className="section-title" style={{ fontSize: '14px', color: 'var(--text-main)', textTransform: 'none' }}>{t('newlyAdded.dateTime')}</div>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--bg-app)', borderRadius: '8px' }}>
            <Calendar size={18} className="text-muted" />
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: '14px', fontWeight: 500, width: '100%', outline: 'none' }}
            />
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--bg-app)', borderRadius: '8px' }}>
            <Clock size={18} className="text-muted" />
            <input 
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: '14px', fontWeight: 500, width: '100%', outline: 'none' }}
            />
          </div>
        </div>

        <div className="section-title" style={{ fontSize: '14px', color: 'var(--text-main)', textTransform: 'none' }}>{t('newlyAdded.serviceAddress')}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--bg-app)', borderRadius: '8px', marginBottom: '24px' }}>
          <MapPin size={18} className="text-muted" />
          <input 
            type="text" 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ border: 'none', background: 'transparent', fontSize: '14px', fontWeight: 500, width: '100%', outline: 'none' }}
          />
        </div>

        <div className="section-title" style={{ fontSize: '14px', color: 'var(--text-main)', textTransform: 'none' }}>{t('newlyAdded.problemDescription')}</div>
        <div style={{ display: 'flex', gap: '8px', padding: '12px', background: 'var(--bg-app)', borderRadius: '8px', marginBottom: '24px', alignItems: 'flex-start' }}>
          <FileText size={18} className="text-muted" style={{ marginTop: '2px' }} />
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            style={{ border: 'none', background: 'transparent', fontSize: '14px', fontWeight: 500, width: '100%', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
          />
        </div>

      </main>

      {/* Action Bar */}
      <div className="action-bar" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p className="text-muted" style={{ fontSize: '12px' }}>{t('newlyAdded.estimatedCost')}</p>
          <p style={{ fontSize: '18px', fontWeight: 700 }}>₹400 - ₹600</p>
        </div>
        <button 
          className="btn-primary" 
          style={{ width: 'auto', padding: '12px 32px', opacity: isSubmitting || !worker ? 0.7 : 1 }} 
          onClick={handleConfirm}
          disabled={isSubmitting || !worker}
        >
          {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
}
