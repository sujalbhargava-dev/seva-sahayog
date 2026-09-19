import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, SlidersHorizontal } from 'lucide-react';
import apiClient from '../../api/client';
import './WorkerList.css';

export default function WorkerList() {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await apiClient.get('/workers');
        if (res.data?.data) {
          setWorkers(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch workers', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  return (
    <div className="app-container">
      {/* Header */}
      <div className="app-header">
        <button className="back-btn" onClick={() => navigate('/customer/home')}>
          <ChevronLeft size={24} />
        </button>
        <div style={{ flexGrow: 1, marginLeft: '12px' }}>
          <h1 style={{ margin: 0 }}>Workers Near You</h1>
          <p className="text-muted" style={{ fontSize: '12px', marginTop: '2px' }}>
            {loading ? 'Searching...' : `${workers.length} workers found`}
          </p>
        </div>
        <button className="back-btn">
          <SlidersHorizontal size={20} />
        </button>
      </div>

      <main style={{ padding: '16px 20px' }}>
        {/* Filters */}
        <div className="chips-container mb-4">
          <button className="chip active">Available Nearby</button>
          <button className="chip">Top Rated</button>
        </div>

        {/* List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading workers...</div>
        ) : (
          <div className="worker-list">
            {workers.map(w => (
              <div key={w.id} className="worker-card" onClick={() => navigate(`/customer/worker/${w.id}`)}>
                <div className="w-avatar" style={{ backgroundColor: '#FEF08A', color: 'rgba(0,0,0,0.6)' }}>
                  {w.user?.name ? w.user.name.charAt(0).toUpperCase() : 'W'}
                </div>
                <div className="w-info">
                  <h4>{w.user?.name || 'Worker'}</h4>
                  <p>
                    <span className="w-rating">★ {w.rating || 'New'}</span> 
                    <span className="text-muted"> ({w.experience || 0} yrs exp)</span>
                  </p>
                  {w.availability && (
                    <div className="status-badge mt-2">
                      <span className="status-dot"></span> Available
                    </div>
                  )}
                </div>
                <ChevronLeft size={20} className="text-muted" style={{ transform: 'rotate(180deg)' }} />
              </div>
            ))}
            {workers.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                No workers found in your area yet.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
