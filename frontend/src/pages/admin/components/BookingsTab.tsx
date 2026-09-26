import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiClient from '../../../api/client';
import { useTranslation } from "react-i18next";

export default function BookingsTab() {
    const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('All');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      let status = activeTab === 'All' ? '' : activeTab.toUpperCase().replace(' ', '_');
      
      const queryParams = new URLSearchParams();
      if (status) queryParams.append('status', status);

      const res = await apiClient.get(`/admin/bookings?${queryParams.toString()}`);
      if (res.data?.data) {
        setBookings(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch bookings', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h1>{t('newlyAdded.bookings')}</h1>
          <p>{t('newlyAdded.monitorPlatformBookings')}</p>
        </div>
        <div className="admin-search-bar">
          <Search size={16} color="#9CA3AF" />
          <input type="text" placeholder={t('newlyAdded.searchBookingID')} />
        </div>
      </div>

      <div className="admin-tabs">
        {['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'].map(t => (
          <button 
            key={t}
            className={`admin-tab ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('newlyAdded.bookingID')}</th>
              <th>{t('newlyAdded.customer')}</th>
              <th>{t('newlyAdded.worker')}</th>
              <th>{t('newlyAdded.service')}</th>
              <th>{t('newlyAdded.date')}</th>
              <th>{t('newlyAdded.amount')}</th>
              <th>{t('newlyAdded.status')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>{t('newlyAdded.loading')}</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>{t('newlyAdded.noBookingsFound')}</td></tr>
            ) : bookings.map(b => (
              <tr key={b.id}>
                <td style={{ fontWeight: 600, fontSize: '11px' }}>{b.id.substring(0, 8)}</td>
                <td>{b.customer?.name || '—'}</td>
                <td>{b.worker?.name || 'Unassigned'}</td>
                <td>{b.service?.name || 'General'}</td>
                <td>{new Date(b.scheduled_date || b.created_at).toLocaleDateString()}</td>
                <td style={{ fontWeight: 600 }}>₹{b.amount || 0}</td>
                <td>
                  <span className={`status-pill status-${b.status.toLowerCase().replace('_', '')}`}>
                    {b.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
