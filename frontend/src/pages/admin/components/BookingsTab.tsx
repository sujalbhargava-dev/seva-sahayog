import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiClient from '../../../api/client';

export default function BookingsTab() {
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
      if (res.data?.data?.data) {
        setBookings(res.data.data.data);
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
          <h1>Bookings</h1>
          <p>Monitor platform bookings</p>
        </div>
        <div className="admin-search-bar">
          <Search size={16} color="#9CA3AF" />
          <input type="text" placeholder="Search booking ID..." />
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
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Worker</th>
              <th>Service</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>Loading...</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>No bookings found</td></tr>
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
