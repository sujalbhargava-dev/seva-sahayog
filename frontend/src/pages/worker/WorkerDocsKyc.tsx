import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, FileText, CheckCircle } from 'lucide-react';
import './WorkerShared.css';

export default function WorkerDocsKyc() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="ws-page">
      <div className="ws-header">
        <div className="ws-header-row">
          <button className="ws-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </button>
          <h1 className="ws-header-title">{t('workerProfile.docsKyc', 'Documents & KYC')}</h1>
        </div>
      </div>
      <div className="ws-body">
        <div className="ws-card">
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', paddingBottom:'16px', borderBottom:'1px solid #f3f4f6', marginBottom:'16px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'14px'}}>
              <div style={{width:'44px', height:'44px', borderRadius:'12px', background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center'}}>
                <FileText size={20} color="#2563eb"/>
              </div>
              <div>
                <p style={{fontSize:'15px', fontWeight:600, color:'#111827', margin:'0 0 2px'}}>{t('newlyAdded.aadhaarCard')}</p>
                <p style={{fontSize:'12px', color:'#10b981', margin:0, fontWeight:600}}>{t('newlyAdded.verified')}</p>
              </div>
            </div>
            <CheckCircle size={22} color="#10b981"/>
          </div>

          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div style={{display:'flex', alignItems:'center', gap:'14px'}}>
              <div style={{width:'44px', height:'44px', borderRadius:'12px', background:'#fef3c7', display:'flex', alignItems:'center', justifyContent:'center'}}>
                <FileText size={20} color="#d97706"/>
              </div>
              <div>
                <p style={{fontSize:'15px', fontWeight:600, color:'#111827', margin:'0 0 2px'}}>{t('newlyAdded.pANCard')}</p>
                <p style={{fontSize:'12px', color:'#10b981', margin:0, fontWeight:600}}>{t('newlyAdded.verified')}</p>
              </div>
            </div>
            <CheckCircle size={22} color="#10b981"/>
          </div>
        </div>
      </div>
    </div>
  );
}
