import { useNavigate } from 'react-router-dom';
import { Home, Calendar, MessageSquare, User } from 'lucide-react';
import './CustomerHome.css';
import { useTranslation } from "react-i18next";

export default function CustomerMessages() {
    const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="app-container with-bottom-nav">
      <main style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <MessageSquare size={48} className="text-primary mb-4" />
        <h2 style={{ fontSize: '20px', fontWeight: 600 }}>{t('newlyAdded.messages')}</h2>
        <p className="text-muted text-center mt-2">{t('newlyAdded.yourConversationsWillAppear')}</p>
      </main>

      <nav className="bottom-nav">
        <button className="nav-item" onClick={() => navigate('/customer/home')}>
          <Home size={24} />
          <span>{t('newlyAdded.home')}</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/customer/bookings')}>
          <Calendar size={24} />
          <span>{t('newlyAdded.bookings')}</span>
        </button>
        <button className="nav-item active" onClick={() => navigate('/customer/messages')}>
          <MessageSquare size={24} />
          <span>{t('newlyAdded.messages')}</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/customer/profile')}>
          <User size={24} />
          <span>{t('newlyAdded.profile')}</span>
        </button>
      </nav>
    </div>
  );
}
