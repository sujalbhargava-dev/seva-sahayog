import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import apiClient from '../../api/client';
import './Analytics.css';

export default function Analytics() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Week');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiClient.get('/workers/analytics');
        if (res.data?.data) {
          setAnalyticsData(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="analytics-page" style={{ justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
  }

  const chartData = analyticsData?.chartData || [];
  const stats = analyticsData?.stats || {};
  const categories = analyticsData?.categories || [];

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="analytics-header">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#1f2937" />
        </button>
        <h1>Analytics</h1>
        <div style={{ width: '40px' }}></div> {/* Spacer for centering */}
      </div>

      <div className="analytics-content">
        {/* Tabs */}
        <div className="tabs-container">
          {['Week', 'Month', 'Year'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Earnings Chart */}
        <div className="card">
          <div className="card-title-row">
            <h3>Earnings This {activeTab}</h3>
            <span className="earnings-value">₹{analyticsData?.earnings?.toLocaleString('en-IN') || '0'}</span>
          </div>
          
          <div className="chart-container">
            {chartData.map((data: any, index: number) => (
              <div key={index} className="chart-bar-col">
                <div 
                  className={`chart-bar ${data.active ? 'active' : 'inactive'}`}
                  style={{ height: `${data.value}%` }}
                ></div>
                <span className="chart-label">
                  {data.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.jobs || 0}</div>
            <div className="stat-label">Jobs This {activeTab}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.rating || 0}</div>
            <div className="stat-label">Avg Rating</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.repeatCustomers || '0%'}</div>
            <div className="stat-label">Repeat Customers</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.avgResponse || '0 min'}</div>
            <div className="stat-label">Avg Response</div>
          </div>
        </div>

        {/* Jobs by Category */}
        <div className="card">
          <h3 style={{ margin: '0 0 24px 0', color: '#111827', fontWeight: 700 }}>Jobs by Category</h3>
          
          <div className="category-list">
            {categories.map((cat: any, index: number) => (
              <div key={index}>
                <div className="category-item-header">
                  <span>{cat.name}</span>
                  <span>{cat.percentage}%</span>
                </div>
                <div className="progress-bg">
                  <div className="progress-fill" style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
