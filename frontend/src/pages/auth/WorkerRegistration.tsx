import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import './Registration.css';
import { useTranslation } from "react-i18next";

export default function WorkerRegistration() {
    const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });
  
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [workVideo, setWorkVideo] = useState<File | null>(null);
  const [certificate, setCertificate] = useState<File | null>(null);
  const [idProof, setIdProof] = useState<File | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await apiClient.post('/auth/register', {
        ...formData,
        address,
        pincode,
        gender,
        role: 'WORKER'
      });
      
      if (res.data?.data) {
        const { user, accessToken, refreshToken } = res.data.data;
        login(user, accessToken, refreshToken);
        
        const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'multipart/form-data' };
        
        if (profilePic) {
          const fd = new FormData();
          fd.append('image', profilePic);
          apiClient.post('/users/profile-picture', fd, { headers }).catch(console.error);
        }
        
        if (workVideo || idProof || certificate) {
          const fd = new FormData();
          if (workVideo) fd.append('video', workVideo);
          if (idProof) fd.append('idProof', idProof);
          if (certificate) fd.append('certificate', certificate);
          fd.append('skills', JSON.stringify([]));
          apiClient.post('/workers/verification/documents', fd, { headers }).catch(console.error);
        }

        navigate('/worker/home');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ paddingBottom: '32px' }}>
      <div className="app-header" style={{ padding: '16px 0', border: 'none' }}>
        <button className="back-btn" onClick={() => navigate('/landing')}>
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="auth-content">
        <h1 className="auth-title">{t('newlyAdded.workerRegistration')}</h1>
        <p className="auth-subtitle">{t('newlyAdded.showcaseYourSkillsAnd')}</p>

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="section-title">{t('newlyAdded.pERSONALDETAILS')}</div>
          
          <label className="upload-box mb-4" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <input type="file" accept="image/jpeg, image/png" style={{ display: 'none' }} onChange={(e) => setProfilePic(e.target.files?.[0] || null)} />
            <span className="text-primary font-semibold">{profilePic ? profilePic.name : '+ Tap to upload'}</span>
            <span className="text-muted text-xs">{t('newlyAdded.jPGOrPNGMax')}</span>
          </label>

          <div className="input-group">
            <label>{t('newlyAdded.fullName')}</label>
            <input type="text" placeholder={t('newlyAdded.egRameshKumar')} required 
                   value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>

          <div className="input-group">
            <label>{t('newlyAdded.emailAddress')}</label>
            <input type="email" placeholder={t('newlyAdded.youexamplecom')} required 
                   value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          
          <div className="input-group">
            <label>{t('newlyAdded.password')}</label>
            <input type="password" placeholder={t('newlyAdded.createAPassword')} required 
                   value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>

          <div className="input-group">
            <label>{t('newlyAdded.mobileNumber')}</label>
            <input type="tel" placeholder="9876543210" required pattern="^[6-9]\d{9}$"
                   value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>

          <div className="input-group">
            <label>{t('newlyAdded.address')}</label>
            <input type="text" placeholder={t('newlyAdded.houseNoStreetArea')} required 
                   value={address} onChange={e => setAddress(e.target.value)} />
          </div>

          <div className="input-group">
            <label>{t('newlyAdded.gender')}</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Male', 'Female', 'Other'].map(g => (
                <button 
                  key={g}
                  type="button"
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    border: `1px solid ${gender === g ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: '8px',
                    background: gender === g ? 'var(--primary-light)' : 'transparent',
                    color: gender === g ? 'var(--primary)' : 'var(--text-main)',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                  onClick={() => setGender(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label>{t('newlyAdded.pincode')}</label>
            <input type="text" placeholder="474011" required 
                   value={pincode} onChange={e => setPincode(e.target.value)} />
          </div>

          {/* PROFESSIONAL DETAILS */}
          <div className="section-title mt-6">{t('newlyAdded.pROFESSIONALDETAILS')}</div>

          <div className="input-group">
            <label>{t('newlyAdded.craftTrade')}</label>
            <input type="text" placeholder={t('newlyAdded.egElectricianPlumberCarpenter')} required />
          </div>

          <div className="input-group">
            <label>{t('newlyAdded.experience')}</label>
            <input type="text" placeholder={t('newlyAdded.yearsOfExperience')} required />
          </div>

          <div className="input-group">
            <label>{t('newlyAdded.skills')}</label>
            <input type="text" placeholder={t('newlyAdded.egWiringFittingRepair')} required />
          </div>

          <div className="input-group">
            <label>{t('newlyAdded.category')}</label>
            <select required>
              <option value="" disabled selected>{t('newlyAdded.selectAServiceCategory')}</option>
              <option value="electrician">{t('newlyAdded.electrician')}</option>
              <option value="plumber">{t('newlyAdded.plumber')}</option>
              <option value="carpenter">{t('newlyAdded.carpenter')}</option>
            </select>
          </div>

          <div className="input-group">
            <label>{t('newlyAdded.workSampleVideo')}</label>
            <label className="upload-box" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <input type="file" accept="video/mp4, video/webm" style={{ display: 'none' }} onChange={(e) => setWorkVideo(e.target.files?.[0] || null)} />
              <span className="text-primary font-semibold">{workVideo ? workVideo.name : '+ Tap to upload'}</span>
              <span className="text-muted text-xs">{t('newlyAdded.showYourBestWork')}</span>
            </label>
          </div>

          <div className="input-group">
            <label>{t('newlyAdded.certificateOptional')}</label>
            <label className="upload-box" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <input type="file" accept="image/jpeg, image/png" style={{ display: 'none' }} onChange={(e) => setCertificate(e.target.files?.[0] || null)} />
              <span className="text-primary font-semibold">{certificate ? certificate.name : '+ Tap to upload'}</span>
              <span className="text-muted text-xs">{t('newlyAdded.tradeCertificateOrLicense')}</span>
            </label>
          </div>

          {/* VERIFICATION */}
          <div className="section-title mt-6">{t('newlyAdded.vERIFICATION')}</div>

          <div className="input-group">
            <label>{t('newlyAdded.aadhaarCardDocument')}</label>
            <label className="upload-box" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <input type="file" accept="image/jpeg, image/png" style={{ display: 'none' }} onChange={(e) => setIdProof(e.target.files?.[0] || null)} />
              <span className="text-primary font-semibold">{idProof ? idProof.name : '+ Tap to upload'}</span>
              <span className="text-muted text-xs">{t('newlyAdded.clearPhotoOrPDF')}</span>
            </label>
          </div>

          {error && (
            <div style={{ color: 'var(--error)', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary mt-6" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}
