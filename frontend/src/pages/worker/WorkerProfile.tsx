import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, FileText, Settings, Loader2, ChevronDown, ChevronUp, LogOut, CheckCircle, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import LanguagePicker from '../../components/LanguagePicker';
import './WorkerShared.css';

export default function WorkerProfile() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const { t } = useTranslation();
  const [workerDetails, setWorkerDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1. Show immediate local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUser({ profilePicture: reader.result as string });
      };
      reader.readAsDataURL(file);

      // 2. Upload to backend (Supabase Storage)
      try {
        const formData = new FormData();
        formData.append('image', file);
        const res = await apiClient.post('/users/profile-picture', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data?.data?.profilePicture) {
          updateUser({ profilePicture: res.data.data.profilePicture });
        }
      } catch (error) {
        console.error('Failed to upload display picture', error);
      }
    }
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await apiClient.get(`/workers/${user.id}`);
        setWorkerDetails(res.data?.data);
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    })();
  }, [user]);

  const isVerified = workerDetails?.verification_status === 'APPROVED';

  return (
    <div className="ws-page">
      {/* Hero Header with Profile */}
      <div className="ws-header" style={{paddingBottom:'64px'}}>
        <div className="ws-header-row" style={{marginBottom:'20px'}}>
          <button className="ws-back-btn" onClick={() => navigate(-1 as any)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h1 className="ws-header-title">{t('workerProfile.title')}</h1>
        </div>
        {/* Avatar inline in hero */}
        <div style={{display:'flex', alignItems:'center', gap:'16px', position:'relative', zIndex:1}}>
          <div style={{ position: 'relative' }}>
            <div style={{width:'64px', height:'64px', borderRadius:'18px', background: user?.profilePicture ? 'transparent' : 'rgba(255,255,255,0.2)', border: user?.profilePicture ? 'none' : '2px solid rgba(255,255,255,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'26px', fontWeight:800, color:'white', flexShrink:0, overflow:'hidden'}}>
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={t('newlyAdded.dP')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.name ? user.name.charAt(0).toUpperCase() : 'W'
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: '#10b981', border: '2px solid #ffffff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
            >
              <Camera size={12} color="white" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
          </div>
          <div>
            <h2 style={{color:'white', fontSize:'18px', fontWeight:700, margin:'0 0 4px'}}>{user?.name || 'Worker'}</h2>
            <p style={{color:'rgba(255,255,255,0.75)', fontSize:'13px', margin:'0 0 6px'}}>{user?.phone || user?.email || ''}</p>
            {isLoading ? (
              <Loader2 size={14} color="rgba(255,255,255,0.7)" className="animate-spin"/>
            ) : isVerified ? (
              <span style={{display:'inline-flex', alignItems:'center', gap:'4px', background:'rgba(255,255,255,0.2)', color:'white', fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'20px'}}>
                <CheckCircle size={11}/> {t('workerProfile.verifiedBg')}
              </span>
            ) : (
              <span style={{display:'inline-flex', alignItems:'center', gap:'4px', background:'rgba(250,204,21,0.2)', color:'#fde68a', fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'20px'}}>
                {t('workerProfile.pendingVerification')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="ws-body">
        <div className="ws-card-sm">
          <button className="ws-row-item" onClick={() => navigate('/worker/profile/personal-info')}>
            <div className="ws-row-icon" style={{background:'#eff6ff'}}><User size={18} color="#2563eb"/></div>
            <div className="ws-row-text">
              <p className="ws-row-title">{t('workerProfile.personalInfo')}</p>
              <p className="ws-row-desc">{t('newlyAdded.namePhoneAddress')}</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <button className="ws-row-item" onClick={() => navigate('/worker/profile/docs')}>
            <div className="ws-row-icon" style={{background:'#fef3c7'}}><FileText size={18} color="#d97706"/></div>
            <div className="ws-row-text">
              <p className="ws-row-title">{t('workerProfile.docsKyc')}</p>
              <p className="ws-row-desc">{t('newlyAdded.aadhaarPANVerification')}</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>

          {/* Settings toggle */}
          <button className="ws-row-item" onClick={() => setSettingsOpen(p => !p)} style={{borderBottom: settingsOpen ? '1px solid #f3f4f6' : 'none'}}>
            <div className="ws-row-icon" style={{background:'#f0fdf4'}}><Settings size={18} color="#10b981"/></div>
            <div className="ws-row-text">
              <p className="ws-row-title">{t('workerProfile.appSettings')}</p>
              <p className="ws-row-desc">{t('newlyAdded.languageNotifications')}</p>
            </div>
            {settingsOpen ? <ChevronUp size={16} color="#d1d5db"/> : <ChevronDown size={16} color="#d1d5db"/>}
          </button>
          {settingsOpen && (
            <div style={{padding:'4px 20px 12px', borderBottom:'1px solid #f3f4f6'}}>
              <p style={{fontSize:'11px', fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.7px', margin:'8px 0 4px'}}>{t('workerProfile.language')}</p>
              <LanguagePicker />
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={() => { logout(); navigate('/login'); }}
          style={{width:'100%', padding:'15px', background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:'14px', fontSize:'15px', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginTop:'4px'}}>
          <LogOut size={18}/> {t('workerProfile.logOut')}
        </button>
      </div>
    </div>
  );
}
