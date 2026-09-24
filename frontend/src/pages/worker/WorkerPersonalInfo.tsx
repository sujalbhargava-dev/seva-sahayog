import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, User, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './WorkerShared.css';

export default function WorkerPersonalInfo() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="ws-page">
      <div className="ws-header">
        <div className="ws-header-row">
          <button className="ws-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </button>
          <h1 className="ws-header-title">{t('workerProfile.personalInfo', 'Personal Information')}</h1>
        </div>
      </div>
      <div className="ws-body">
        <div className="ws-card">
          <div style={{display:'flex', alignItems:'center', gap:'16px', paddingBottom:'16px', borderBottom:'1px solid #f3f4f6', marginBottom:'16px'}}>
            <div style={{width:'48px', height:'48px', borderRadius:'12px', background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center'}}>
              <User size={22} color="#2563eb"/>
            </div>
            <div>
              <p style={{fontSize:'12px', color:'#6b7280', margin:'0 0 2px'}}>Full Name</p>
              <p style={{fontSize:'16px', fontWeight:600, color:'#111827', margin:0}}>{user?.name || 'N/A'}</p>
            </div>
          </div>
          
          <div style={{display:'flex', alignItems:'center', gap:'16px', paddingBottom:'16px', borderBottom:'1px solid #f3f4f6', marginBottom:'16px'}}>
            <div style={{width:'48px', height:'48px', borderRadius:'12px', background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center'}}>
              <Phone size={22} color="#10b981"/>
            </div>
            <div>
              <p style={{fontSize:'12px', color:'#6b7280', margin:'0 0 2px'}}>Phone Number</p>
              <p style={{fontSize:'16px', fontWeight:600, color:'#111827', margin:0}}>{user?.phone || 'N/A'}</p>
            </div>
          </div>

          <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
            <div style={{width:'48px', height:'48px', borderRadius:'12px', background:'#fef3c7', display:'flex', alignItems:'center', justifyContent:'center'}}>
              <MapPin size={22} color="#d97706"/>
            </div>
            <div>
              <p style={{fontSize:'12px', color:'#6b7280', margin:'0 0 2px'}}>Address</p>
              <p style={{fontSize:'16px', fontWeight:600, color:'#111827', margin:0}}>{user?.address || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
