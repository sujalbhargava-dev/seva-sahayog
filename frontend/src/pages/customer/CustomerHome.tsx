import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, Home, Calendar, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import './CustomerHome.css';

export default function CustomerHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topWorkers, setTopWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopWorkers = async () => {
      try {
        const res = await apiClient.get('/workers?limit=3');
        if (res.data?.data) {
          setTopWorkers(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch top workers', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopWorkers();
  }, []);

  const categories = [
    { id: 'electrician', name: 'Electrician', icon: 'E', color: '#FEF08A' },
    { id: 'plumber', name: 'Plumber', icon: 'P', color: '#BFDBFE' },
    { id: 'carpenter', name: 'Carpenter', icon: 'C', color: '#FED7AA' },
    { id: 'painter', name: 'Painter', icon: 'P', color: '#FECDD3' },
    { id: 'mechanic', name: 'Mechanic', icon: 'M', color: '#E5E7EB' },
    { id: 'cleaner', name: 'Cleaner', icon: 'C', color: '#A7F3D0' },
  ];

  return (
    <div className="app-container with-bottom-nav">
      {/* Header */}
      <header className="home-header">
        <div className="header-profile">
          <div className="avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
          </div>
          <div className="user-info">
            <h2>Hi, {user?.name ? user.name.split(' ')[0] : 'Customer'}</h2>
            <p className="location"><MapPin size={12} /> Gwalior, MP</p>
          </div>
        </div>
        <div className="notification-dot"></div>
      </header>

      <main className="home-content">
        {/* Search */}
        <div className="search-bar">
          <input type="text" placeholder="What service do you need?" />
          <Search className="search-icon" size={20} />
        </div>

        {/* Categories */}
        <section className="section">
          <h3 className="section-title">Browse by Category</h3>
          <div className="categories-grid">
            {categories.map(cat => (
              <div 
                key={cat.id} 
                className="category-card"
                onClick={() => navigate(`/customer/workers?category=${cat.id}`)}
              >
                <div className="cat-icon" style={{ backgroundColor: cat.color }}>
                  {cat.icon}
                </div>
                <span>{cat.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Banner */}
        <div className="promo-banner">
          <div className="promo-text">
            <h4>Local Workers</h4>
            <h4>Real People</h4>
            <h4>Fair Prices</h4>
            <p>Verified & background-checked</p>
          </div>
          <div className="promo-badge">R</div>
        </div>

        {/* Top Rated */}
        <section className="section mt-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="section-title" style={{ margin: 0 }}>Top Rated Near You</h3>
            <button className="text-primary" style={{ background: 'none', border: 'none', fontSize: '13px', fontWeight: 600 }} onClick={() => navigate('/customer/workers')}>
              View All
            </button>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
          ) : (
            <div className="worker-list">
              {topWorkers.map((w: any) => (
                <div key={w.id} className="worker-card" onClick={() => navigate(`/customer/worker/${w.id}`)}>
                  <div className="w-avatar" style={{ backgroundColor: '#FEF08A', color: 'rgba(0,0,0,0.6)' }}>
                    {w.user?.name ? w.user.name.charAt(0).toUpperCase() : 'W'}
                  </div>
                  <div className="w-info">
                    <h4>{w.user?.name || 'Worker'}</h4>
                    <p>Experience: {w.experience || 0} years</p>
                  </div>
                  <div className="w-rating">
                    ★ {w.rating || 'New'}
                  </div>
                </div>
              ))}
              {topWorkers.length === 0 && (
                <p className="text-muted" style={{ fontSize: '13px' }}>No workers found in your area yet.</p>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        <button className="nav-item active" onClick={() => navigate('/customer/home')}>
          <Home size={24} />
          <span>Home</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/customer/bookings')}>
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
