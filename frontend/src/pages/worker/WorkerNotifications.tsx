import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCheck, CheckCircle2, Loader2, Inbox } from 'lucide-react';
import apiClient from '../../api/client';
import './WorkerShared.css';

interface Notification {
  id: string; title: string; message: string;
  type: string; is_read: boolean; created_at: string;
}

export default function WorkerNotifications() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const res = await apiClient.get('/notifications');
      setNotifications(res.data?.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const markRead = async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id===id ? {...n, is_read:true} : n));
    } catch (e) { console.error(e); }
  };

  const markAllRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({...n, is_read:true})));
    } catch (e) { console.error(e); }
  };

  const unread = notifications.filter(n => !n.is_read).length;

  return (
    <div className="ws-page">
      <div className="ws-header">
        <div className="ws-header-row">
          <button className="ws-back-btn" onClick={() => navigate('/worker/home')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h1 className="ws-header-title">{t('workerNotifications.title')}</h1>
          {unread > 0 && (
            <button className="ws-header-action" onClick={markAllRead}>
              <CheckCheck size={13} style={{display:'inline', marginRight:'4px'}}/>{t('workerNotifications.markAllRead')}
            </button>
          )}
        </div>
        <p className="ws-header-sub">{unread > 0 ? t('workerNotifications.unreadCount', {count: unread}) : t('workerNotifications.allCaughtUp')}</p>
      </div>

      <div className="ws-body">
        {loading ? (
          <div className="ws-empty">
            <Loader2 size={32} color="#10b981" className="animate-spin"/>
          </div>
        ) : notifications.length === 0 ? (
          <div className="ws-empty">
            <div className="ws-empty-icon" style={{background:'#f0fdf4'}}><Inbox size={32} color="#10b981"/></div>
            <h3>{t('workerNotifications.noNotifications')}</h3>
            <p>{t('workerNotifications.noNotificationsDesc')}</p>
          </div>
        ) : (
          <>
            {/* Unread */}
            {notifications.filter(n => !n.is_read).length > 0 && (
              <>
                <p className="ws-label">{t('workerNotifications.new')}</p>
                {notifications.filter(n => !n.is_read).map(n => {
                  return (
                    <div key={n.id} className="ws-notif-item ws-notif-unread" onClick={() => markRead(n.id)}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'6px'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                          <span className="ws-notif-dot"/>
                          <h4 style={{fontSize:'14px', fontWeight:700, color:'#111827', margin:0}}>{n.title}</h4>
                        </div>
                        <span style={{fontSize:'11px', color:'#9ca3af', flexShrink:0}}>{new Date(n.created_at).toLocaleDateString('en-IN',{month:'short', day:'numeric'})}</span>
                      </div>
                      <p style={{fontSize:'13px', color:'#4b5563', margin:'0 0 8px', lineHeight:1.5}}>{n.message}</p>
                      <div style={{display:'flex', alignItems:'center', gap:'4px', color:'#10b981', fontSize:'11px', fontWeight:600}}>
                        <CheckCircle2 size={12}/> {t('workerNotifications.tapToMarkRead')}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            {/* Read */}
            {notifications.filter(n => n.is_read).length > 0 && (
              <>
                <p className="ws-label" style={{marginTop:'8px'}}>{t('workerNotifications.earlier')}</p>
                {notifications.filter(n => n.is_read).map(n => (
                  <div key={n.id} className="ws-notif-item ws-notif-read">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'5px'}}>
                      <h4 style={{fontSize:'14px', fontWeight:600, color:'#374151', margin:0}}>{n.title}</h4>
                      <span style={{fontSize:'11px', color:'#9ca3af', flexShrink:0}}>{new Date(n.created_at).toLocaleDateString('en-IN',{month:'short', day:'numeric'})}</span>
                    </div>
                    <p style={{fontSize:'13px', color:'#9ca3af', margin:0, lineHeight:1.5}}>{n.message}</p>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
