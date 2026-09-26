import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import './Registration.css';
import { useTranslation } from "react-i18next";

export default function CustomerRegistration() {
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
        role: 'CUSTOMER'
      });
      
      if (res.data?.data) {
        const { user, accessToken, refreshToken } = res.data.data;
        login(user, accessToken, refreshToken);
        navigate('/customer/home');
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
        <h1 className="auth-title">{t('newlyAdded.createCustomerAccount')}</h1>
        <p className="auth-subtitle">{t('newlyAdded.tellUsABit')}</p>

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="input-group">
            <label>{t('newlyAdded.fullName')}</label>
            <input type="text" placeholder={t('newlyAdded.egSujalBhargava')} required 
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

          {error && (
            <div style={{ color: 'var(--error)', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary mt-4" disabled={loading}>
            {loading ? 'Registering...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}
