import { useNavigate } from 'react-router-dom';
import { Home, Calendar, MessageSquare, User } from 'lucide-react';
import './CustomerHome.css';

export default function CustomerProfile() {
  const navigate = useNavigate();

  return (
    <div className="app-container with-bottom-nav">
      <main style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '32px', marginBottom: '16px' }}>S</div>
        <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Sujal Bhargava</h2>
        <p className="text-muted text-center mt-2">sujal@example.com</p>
        
        <button className="btn-outline mt-8" onClick={() => navigate('/landing')}>
          Log Out
        </button>
      </main>

      <nav className="bottom-nav">
        <button className="nav-item" onClick={() => navigate('/customer/home')}>
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
        <button className="nav-item active" onClick={() => navigate('/customer/profile')}>
          <User size={24} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}
