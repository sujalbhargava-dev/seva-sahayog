import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, Camera, Image as ImageIcon } from 'lucide-react';
import apiClient from '../../api/client';
import './WorkerShared.css';

export default function CompleteJob() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const [paymentReceived, setPaymentReceived] = useState(t('completeJob.yes'));
  const [workDone, setWorkDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workDone) return;
    setIsSubmitting(true);
    try {
      await apiClient.patch(`/bookings/${id}/complete`);
      navigate('/worker/home');
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ws-page">
      <div className="ws-header">
        <div className="ws-header-row">
          <button className="ws-back-btn" onClick={() => navigate(-1 as any)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h1 className="ws-header-title">{t('completeJob.title')}</h1>
        </div>
        <p className="ws-header-sub">{t('completeJob.subtitle')}</p>
      </div>

      <div className="ws-body">
        {/* Customer snippet */}
        <div className="ws-card-sm" style={{padding:'16px', marginBottom:'24px', background:'#f8fafc', border:'1px solid #e2e8f0', boxShadow:'none'}}>
          <p style={{fontSize:'14px', fontWeight:700, color:'#111827', margin:'0 0 4px'}}>{t('newlyAdded.priyaNair')}</p>
          <p style={{fontSize:'12px', color:'#64748b', margin:'0 0 2px'}}>{t('newlyAdded.electricianWiringRepair')}</p>
          <p style={{fontSize:'12px', color:'#64748b', margin:0}}>{t('newlyAdded.12LashkarRoadGwalior')}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Upload */}
          <p className="ws-label">{t('completeJob.proofOfWork')}</p>
          <div style={{
            border:'2px dashed #cbd5e1', borderRadius:'16px', padding:'32px 16px',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            background:'white', cursor:'pointer', marginBottom:'16px', transition:'all 0.2s'
          }} onClick={() => setWorkDone(true)}>
            <div style={{display:'flex', gap:'12px', marginBottom:'12px'}}>
              <div style={{width:'40px', height:'40px', borderRadius:'10px', background:'#f0fdf4', color:'#10b981', display:'flex', alignItems:'center', justifyContent:'center'}}><Camera size={20}/></div>
              <div style={{width:'40px', height:'40px', borderRadius:'10px', background:'#eff6ff', color:'#2563eb', display:'flex', alignItems:'center', justifyContent:'center'}}><ImageIcon size={20}/></div>
            </div>
            <p style={{fontSize:'14px', fontWeight:600, color:'#374151', margin:'0 0 4px'}}>{t('completeJob.uploadPhotos')}</p>
            <p style={{fontSize:'12px', color:'#9ca3af', margin:0}}>{t('completeJob.tapToSelect')}</p>
          </div>

          {/* Toggle done */}
          <button type="button" 
            onClick={() => setWorkDone(p => !p)}
            style={{
              width:'100%', padding:'14px', borderRadius:'12px',
              border: workDone ? '2px solid #10b981' : '2px solid #e5e7eb',
              background: workDone ? '#ecfdf5' : 'white',
              color: workDone ? '#065f46' : '#6b7280',
              fontSize:'14px', fontWeight:700, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
              transition:'all 0.15s'
            }}>
            <div style={{width:'20px', height:'20px', borderRadius:'10px', border: workDone?'none':'2px solid #cbd5e1', background: workDone?'#10b981':'transparent', display:'flex', alignItems:'center', justifyContent:'center'}}>
              {workDone && <Check size={14} color="white" strokeWidth={3}/>}
            </div>
            {t('completeJob.markCompleted')}
          </button>

          {/* Payment */}
          <p className="ws-label" style={{marginTop:'32px'}}>{t('completeJob.paymentReceived')}</p>
          <div style={{display:'flex', gap:'12px'}}>
            {[t('completeJob.yes'), t('completeJob.no')].map(opt => (
              <button key={opt} type="button"
                onClick={() => setPaymentReceived(opt)}
                style={{
                  flex:1, padding:'14px', borderRadius:'12px',
                  border: paymentReceived===opt ? '2px solid #10b981' : '2px solid #e5e7eb',
                  background: paymentReceived===opt ? '#ecfdf5' : 'white',
                  color: paymentReceived===opt ? '#065f46' : '#6b7280',
                  fontSize:'14px', fontWeight:700, cursor:'pointer'
                }}>
                {opt}
              </button>
            ))}
          </div>

          <button type="submit" className="ws-cta" style={{marginTop:'32px'}} disabled={isSubmitting || !workDone}>
            {isSubmitting ? t('completeJob.submitting') : t('completeJob.completeFinish')}
          </button>
        </form>
      </div>
    </div>
  );
}
