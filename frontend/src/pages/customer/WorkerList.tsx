import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, SlidersHorizontal } from 'lucide-react';
import apiClient from '../../api/client';
import './WorkerList.css';
import { useTranslation } from "react-i18next";

export default function WorkerList() {
    const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const service = searchParams.get('service');
  
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        setLoading(true);
        const endpoint = service ? `/search/workers?service=${encodeURIComponent(service)}&limit=15` : '/workers?limit=15';
        const res = await apiClient.get(endpoint);
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
  }, [service]);

  return (
    <div className="app-container">
      {/* Header */}
      <div className="app-header">
        <button className="back-btn" onClick={() => navigate('/customer/home')}>
          <ChevronLeft size={24} />
        </button>
        <div style={{ flexGrow: 1, marginLeft: '12px' }}>
          <h1 style={{ margin: 0 }}>{service ? `${service}s Near You` : 'Workers Near You'}</h1>
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
          <button className="chip active">{t('newlyAdded.availableNearby')}</button>
          <button className="chip">{t('newlyAdded.topRated')}</button>
        </div>

        {/* List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>{t('newlyAdded.loadingWorkers')}</div>
        ) : (
          <div className="worker-list">
            {workers.map(w => {
              // Handle both search results (workerId, workerName) and direct worker list (id, name)
              const id = w.workerId || w.id;
              const name = w.workerName || w.name || 'Worker';
              const rating = w.rating || 'New';
              const experience = w.experience || w.totalJobs || 0;
              const isAvailable = w.availability !== false;
              const score = w.matchScore;

              return (
                <div key={id} className="worker-card" onClick={() => navigate(`/customer/worker/${id}`)}>
                  <div className="w-avatar" style={{ backgroundColor: w.profilePicture ? 'transparent' : '#FEF08A', color: 'rgba(0,0,0,0.6)', padding: 0, overflow: 'hidden' }}>
                    {w.profilePicture ? (
                      <img src={w.profilePicture} alt={t('newlyAdded.dP')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="w-info">
                    <h4>{name}</h4>
                    <p>
                      <span className="w-rating">★ {rating}</span> 
                      <span className="text-muted"> ({experience} {w.totalJobs ? 'jobs done' : 'yrs exp'})</span>
                    </p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      {isAvailable && (
                        <div className="status-badge mt-2" style={{ marginTop: 0 }}>
                          <span className="status-dot"></span> {t('newlyAdded.available')}</div>
                      )}
                      {score && (
                        <div className="status-badge mt-2" style={{ marginTop: 0, backgroundColor: '#E0F2FE', color: '#0369A1' }}>
                          {t('newlyAdded.matchScore')}{Math.round(score * 100)}%
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronLeft size={20} className="text-muted" style={{ transform: 'rotate(180deg)' }} />
                </div>
              );
            })}
            {workers.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                {t('newlyAdded.noWorkersFoundIn')}</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
