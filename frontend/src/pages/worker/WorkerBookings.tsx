import { useNavigate } from 'react-router-dom';
import { Home, Calendar, IndianRupee, MoreHorizontal } from 'lucide-react';
import './WorkerHome.css';

export default function WorkerBookings() {
  const navigate = useNavigate();

  return (
    <div className="app-container with-bottom-nav">
      <main style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <Calendar size={48} className="text-primary mb-4" />
        <h2 style={{ fontSize: '20px', fontWeight: 600 }}>My Bookings</h2>
        <p className="text-muted text-center mt-2">You have no new bookings today.</p>
      </main>

      <nav className="bottom-nav">
        <button className="nav-item" onClick={() => navigate('/worker/home')}>
          <Home size={24} />
          <span>Home</span>
        </button>
        <button className="nav-item active" onClick={() => navigate('/worker/bookings')}>
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
