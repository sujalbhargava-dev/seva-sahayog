import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Search, Home, Calendar, MessageSquare, User, Zap, Droplet, Hammer, Paintbrush, Wrench, Sparkles, IndianRupee } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import './CustomerHome.css';

export default function CustomerHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [topWorkers, setTopWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchTopWorkers = async () => {
      try {
        const res = await apiClient.get('/workers?limit=3');
        if (res.data?.data) setTopWorkers(res.data.data);
      } catch (error) {
        console.error('Failed to fetch top workers', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopWorkers();
  }, []);

  const categories = [
    { id: 'electrician', nameKey: 'customerHome.cat_electrician', icon: <Zap size={28} color="#374151" strokeWidth={1.5} />, color: '#FEF08A' },
    { id: 'plumber',     nameKey: 'customerHome.cat_plumber',     icon: <Droplet size={28} color="#374151" strokeWidth={1.5} />, color: '#BFDBFE' },
    { id: 'carpenter',  nameKey: 'customerHome.cat_carpenter',   icon: <Hammer size={28} color="#374151" strokeWidth={1.5} />, color: '#FED7AA' },
    { id: 'painter',    nameKey: 'customerHome.cat_painter',     icon: <Paintbrush size={28} color="#374151" strokeWidth={1.5} />, color: '#FECDD3' },
    { id: 'mechanic',   nameKey: 'customerHome.cat_mechanic',    icon: <Wrench size={28} color="#374151" strokeWidth={1.5} />, color: '#E5E7EB' },
    { id: 'cleaner',    nameKey: 'customerHome.cat_cleaner',     icon: <Sparkles size={28} color="#374151" strokeWidth={1.5} />, color: '#A7F3D0' },
  ];

  const filteredCategories = categories.filter(c =>
    t(c.nameKey).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container with-bottom-nav">
      {/* Header */}
      <header className="home-header">
        <div className="header-profile">
          <div className="avatar" style={{ backgroundColor: user?.profilePicture ? 'transparent' : undefined, padding: 0, overflow: 'hidden' }}>
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={t('newlyAdded.dP')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user?.name ? user.name.charAt(0).toUpperCase() : 'C'
            )}
          </div>
          <div className="user-info">
            <h2>{t('customerHome.greeting', { name: user?.name?.split(' ')[0] || 'Customer' })}</h2>
            <p className="location"><MapPin size={12} /> {t('customerHome.location')}</p>
          </div>
        </div>
        <div className="notification-dot"></div>
      </header>

      <main className="home-content">
        {/* Search */}
        <div className="search-container" style={{ position: 'relative' }}>
          <div className="search-bar">
            <input
              type="text"
              placeholder={t('customerHome.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
            <Search className="search-icon" size={20} />
          </div>
          {showDropdown && searchQuery && filteredCategories.length > 0 && (
            <div className="search-dropdown">
              {filteredCategories.map(cat => (
                <div
                  key={cat.id}
                  className="search-dropdown-item"
                  onMouseDown={(e) => { e.preventDefault(); navigate(`/customer/workers?service=${cat.id}`); }}
                >
                  <div className="search-dropdown-icon" style={{ backgroundColor: cat.color }}>{cat.icon}</div>
                  <span>{t(cat.nameKey)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categories */}
        <section className="section">
          <h3 className="section-title">{t('customerHome.browseCategory')}</h3>
          <div className="categories-grid">
            {categories.map(cat => (
              <div key={cat.id} className="category-card" onClick={() => navigate(`/customer/workers?service=${cat.id}`)}>
                <div className="cat-icon" style={{ backgroundColor: cat.color }}>{cat.icon}</div>
                <span>{t(cat.nameKey)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Banner */}
        <div className="promo-banner">
          <div className="promo-text">
            <h4>{t('customerHome.bannerLine1')}</h4>
            <h4>{t('customerHome.bannerLine2')}</h4>
            <h4>{t('customerHome.bannerLine3')}</h4>
            <p>{t('customerHome.bannerSub')}</p>
          </div>
          <div className="promo-badge">{t('newlyAdded.r')}</div>
        </div>

        {/* Quick Actions */}
        <section className="section mt-6">
          <h3 className="section-title">{t('customerHome.quickActions')}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <button onClick={() => navigate('/customer/emergency')} style={{ flex: 1, padding: '16px', borderRadius: '12px', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <Zap size={24} color="#DC2626" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#991B1B' }}>{t('customerHome.emergency')}</span>
            </button>
            <button onClick={() => navigate('/customer/smart-matching')} style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <Sparkles size={24} color="#2563EB" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E3A8A', textAlign: 'center' }}>{t('customerHome.smartMatch')}</span>
            </button>
            <button onClick={() => navigate('/customer/payment-history')} style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#DCFCE7', border: '1px solid #86EFAC', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <IndianRupee size={24} color="#16A34A" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#14532D' }}>{t('customerHome.payments')}</span>
            </button>
          </div>
        </section>

        {/* Top Rated */}
        <section className="section mt-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="section-title" style={{ margin: 0 }}>{t('customerHome.topRated')}</h3>
            <button className="text-primary" style={{ background: 'none', border: 'none', fontSize: '13px', fontWeight: 600 }} onClick={() => navigate('/customer/workers')}>
              {t('customerHome.viewAll')}
            </button>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>{t('customerHome.loading')}</div>
          ) : (
            <div className="worker-list">
              {topWorkers.map((w: any) => (
                <div key={w.id} className="worker-card" onClick={() => navigate(`/customer/worker/${w.id}`)}>
                  <div className="w-avatar" style={{ backgroundColor: w.profilePicture ? 'transparent' : '#FEF08A', color: 'rgba(0,0,0,0.6)', padding: 0, overflow: 'hidden' }}>
                    {w.profilePicture ? (
                      <img src={w.profilePicture} alt={t('newlyAdded.dP')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      w.name ? w.name.charAt(0).toUpperCase() : 'W'
                    )}
                  </div>
                  <div className="w-info">
                    <h4>{w.name || 'Worker'}</h4>
                    <p>{t('customerHome.experience', { years: w.experience || 0 })}</p>
                  </div>
                  <div className="w-rating">★ {w.rating || 'New'}</div>
                </div>
              ))}
              {topWorkers.length === 0 && <p className="text-muted" style={{ fontSize: '13px' }}>{t('customerHome.noWorkers')}</p>}
            </div>
          )}
        </section>
      </main>

      <nav className="bottom-nav">
        <button className="nav-item active" onClick={() => navigate('/customer/home')}><Home size={24} /><span>{t('nav.home')}</span></button>
        <button className="nav-item" onClick={() => navigate('/customer/bookings')}><Calendar size={24} /><span>{t('nav.bookings')}</span></button>
        <button className="nav-item" onClick={() => navigate('/customer/messages')}><MessageSquare size={24} /><span>{t('nav.messages')}</span></button>
        <button className="nav-item" onClick={() => navigate('/customer/profile')}><User size={24} /><span>{t('nav.profile')}</span></button>
      </nav>
    </div>
  );
}
