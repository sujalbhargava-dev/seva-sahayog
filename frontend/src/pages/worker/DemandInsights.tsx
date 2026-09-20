import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, MapPin } from 'lucide-react';
import apiClient from '../../api/client';
import './DemandInsights.css';

export default function DemandInsights() {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await apiClient.get('/ai/insights');
        if (res.data?.data) {
          setInsights(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch demand insights', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) {
    return <div className="demand-page" style={{ justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
  }

  const chartData = insights?.forecast || [];
  const bestAreas = insights?.bestAreas || [];
  const highDemand = insights?.highDemand || { title: '', message: '' };

  return (
    <div className="demand-page">
      {/* Header */}
      <div className="demand-header">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#1f2937" />
        </button>
        <h1>Demand Insights</h1>
        <p>AI-powered predictions to help you earn more</p>
      </div>

      <div className="demand-content">
        {/* Banner */}
        {highDemand.title && (
          <div className="demand-banner">
            <div className="demand-banner-icon">
              <Zap size={20} color="#008751" fill="#008751" />
            </div>
            <div className="demand-banner-text">
              <h3>{highDemand.title}</h3>
              <p>{highDemand.message}</p>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="chart-section">
          <h3>Predicted Demand — Next 7 Days</h3>
          <div className="demand-chart-container">
            {chartData.map((data: any, index: number) => (
              <div key={index} className="demand-chart-col">
                <div 
                  className={`demand-chart-bar ${data.active ? 'active' : 'inactive'}`}
                  style={{ height: `${data.value}%` }}
                ></div>
                <span className={`demand-chart-label ${data.active ? 'active' : 'inactive'}`}>
                  {data.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Areas */}
        <div className="areas-section">
          <h3>Best Areas Today</h3>
          <div className="areas-list">
            {bestAreas.map((area: any, index: number) => (
              <div key={index} className="area-card">
                <div className="area-info">
                  <div className="area-icon">
                    <MapPin size={20} color="#4b5563" />
                  </div>
                  <div className="area-text">
                    <h4>{area.name}</h4>
                    <p>{area.jobs}</p>
                  </div>
                </div>
                <div className={`area-badge ${area.demand}`}>
                  {area.demand}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="demand-bottom-action">
        <button className="btn-online">
          Go Online Now
        </button>
      </div>
    </div>
  );
}
