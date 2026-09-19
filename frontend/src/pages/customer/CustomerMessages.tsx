import { useNavigate } from 'react-router-dom';
import { Home, Calendar, MessageSquare, User } from 'lucide-react';
import './CustomerHome.css';

export default function CustomerMessages() {
  const navigate = useNavigate();

  return (
    <div className="app-container with-bottom-nav">
      <main style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <MessageSquare size={48} className="text-primary mb-4" />
        <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Messages</h2>
        <p className="text-muted text-center mt-2">Your conversations will appear here.</p>
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
        <button className="nav-item active" onClick={() => navigate('/customer/messages')}>
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
