import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import apiClient from '../../api/client';
import './SmartMatching.css';

export default function SmartMatching() {
  const navigate = useNavigate();
  const [recommendedWorkers, setRecommendedWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await apiClient.get('/ai/match');
        if (res.data?.data) {
          setRecommendedWorkers(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch smart matches', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  if (loading) {
    return <div className="matching-page" style={{ justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
  }

  return (
    <div className="matching-page">
      {/* Header */}
      <div className="matching-header">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#1f2937" />
        </button>
        <div className="title-row">
          <h1>Recommended for You</h1>
          <Sparkles size={24} color="#008751" fill="rgba(0, 135, 81, 0.2)" />
        </div>
        <p>AI-matched to your needs, budget and history</p>
      </div>

      <div className="matching-content">
        {recommendedWorkers.map((worker) => (
          <div key={worker.id} className="worker-match-card">
            <div className="match-card-top">
              <div className="match-worker-info">
                <div 
                  className="match-avatar"
                  style={{ backgroundColor: worker.initialBg, color: worker.initialColor }}
                >
                  {worker.initial}
                </div>
                <div className="match-details">
                  <h3>{worker.name}</h3>
                  <p>
                    {worker.profession} <span className="dot">·</span> from {worker.price}
                  </p>
                </div>
              </div>
              <div className="match-badge">
                {worker.match} Match
              </div>
            </div>
            
            <div className="match-tags">
              {worker.tags.map((tag: string, index: number) => (
                <span key={index} className="match-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
