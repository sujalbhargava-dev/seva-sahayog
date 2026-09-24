import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Calendar, IndianRupee, MoreHorizontal } from 'lucide-react';
import './WorkerHome.css';

export default function WorkerMore() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="app-container with-bottom-nav">
      <main style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <MoreHorizontal size={48} className="text-primary mb-4" />
        <h2 style={{ fontSize: '20px', fontWeight: 600 }}>{t('workerMore.title')}</h2>
        <p className="text-muted text-center mt-2">{t('workerMore.subtitle')}</p>
        <button className="btn-outline mt-8" onClick={() => navigate('/landing')}>{t('workerMore.logOut')}</button>
      </main>

      <nav className="bottom-nav">
        <button className="nav-item" onClick={() => navigate('/worker/home')}><Home size={24} /><span>{t('nav.home')}</span></button>
        <button className="nav-item" onClick={() => navigate('/worker/bookings')}><Calendar size={24} /><span>{t('nav.bookings')}</span></button>
        <button className="nav-item" onClick={() => navigate('/worker/earnings')}><IndianRupee size={24} /><span>{t('nav.earnings')}</span></button>
        <button className="nav-item active" onClick={() => navigate('/worker/more')}><MoreHorizontal size={24} /><span>{t('nav.more')}</span></button>
      </nav>
    </div>
  );
}
