import { useNavigate } from 'react-router-dom';
import { Menu, Home, Calendar, IndianRupee, MoreHorizontal, ChevronRight, Briefcase, Vote, ShieldCheck, User, Zap, BarChart2 } from 'lucide-react';
import './WorkerHome.css';

export default function WorkerHome() {
  const navigate = useNavigate();

  return (
    <div className="app-container with-bottom-nav">
      {/* Header */}
      <div className="app-header" style={{ border: 'none', justifyContent: 'space-between' }}>
        <button className="back-btn" style={{ padding: '8px' }}>
          <Menu size={24} />
        </button>
        <div className="w-avatar" style={{ backgroundColor: '#1F2937', color: 'white', width: '36px', height: '36px', margin: 0, fontSize: '14px' }}>
          R
        </div>
      </div>

      <main style={{ padding: '0 20px 20px' }}>
        {/* Greeting */}
        <div className="greeting mt-4 mb-6">
          <h1 style={{ fontSize: '26px', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Hello, Rohit</h1>
          <p className="text-muted" style={{ fontSize: '15px' }}>Skilled Hands, Stronger Tomorrow</p>
        </div>

        {/* Earnings Card */}
        <div className="earnings-card">
          <div className="earnings-top">
            <div>
              <p className="earnings-label">Total Earnings</p>
              <h2 className="earnings-amount">₹12,450</h2>
            </div>
            <div className="currency-icon">₹</div>
          </div>
          <div className="earnings-bottom">
            <p className="earnings-period">This Month</p>
            <div className="earnings-badge">
              <span>↑ 12%</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="stats-row mt-6 mb-8">
          <div className="w-stat">
            <h4>32</h4>
            <p>Jobs Completed</p>
          </div>
          <div className="w-stat">
            <h4>4.8</h4>
            <p>Rating</p>
          </div>
          <div className="w-stat">
            <h4>100%</h4>
            <p>Completion Rate</p>
          </div>
        </div>

        {/* Menu List */}
        <div className="worker-menu">
          <button className="menu-item" onClick={() => navigate('/worker/job/1/complete')}>
            <Briefcase size={20} className="menu-icon" />
            <span className="flex-grow">My Bookings</span>
            <ChevronRight size={20} className="text-muted" />
          </button>
          <button className="menu-item">
            <IndianRupee size={20} className="menu-icon" />
            <span className="flex-grow">Earnings & Payouts</span>
            <ChevronRight size={20} className="text-muted" />
          </button>
          <button className="menu-item" onClick={() => navigate('/worker/demand-insights')}>
            <Zap size={20} className="menu-icon" style={{ backgroundColor: '#10B981', color: 'white', borderRadius: '4px', padding: '2px' }} />
            <span className="flex-grow">Demand Insights</span>
            <ChevronRight size={20} className="text-muted" />
          </button>
          <button className="menu-item" onClick={() => navigate('/worker/analytics')}>
            <BarChart2 size={20} className="menu-icon" style={{ backgroundColor: '#10B981', color: 'white', borderRadius: '4px', padding: '2px' }} />
            <span className="flex-grow">Analytics</span>
            <ChevronRight size={20} className="text-muted" />
          </button>
          <button className="menu-item" onClick={() => navigate('/worker/governance')}>
            <Vote size={20} className="menu-icon" style={{ backgroundColor: '#1F2937', color: 'white', borderRadius: '4px', padding: '2px' }} />
            <span className="flex-grow">Cooperative Votes</span>
            <ChevronRight size={20} className="text-muted" />
          </button>
          <button className="menu-item" onClick={() => navigate('/worker/welfare')}>
            <ShieldCheck size={20} className="menu-icon" style={{ backgroundColor: '#1F2937', color: 'white', borderRadius: '4px', padding: '2px' }} />
            <span className="flex-grow">Welfare Fund <span className="text-muted" style={{ fontSize: '12px', fontWeight: 400 }}>(5% per gig)</span></span>
            <ChevronRight size={20} className="text-muted" />
          </button>
          <button className="menu-item" style={{ borderBottom: 'none' }}>
            <User size={20} className="menu-icon" />
            <span className="flex-grow">Profile & Documents</span>
            <ChevronRight size={20} className="text-muted" />
          </button>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        <button className="nav-item active" onClick={() => navigate('/worker/home')}>
          <Home size={24} />
          <span>Home</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/worker/bookings')}>
          <Calendar size={24} />
          <span>Bookings</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/worker/earnings')}>
          <IndianRupee size={24} />
          <span>Earnings</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/worker/more')}>
          <MoreHorizontal size={24} />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}
