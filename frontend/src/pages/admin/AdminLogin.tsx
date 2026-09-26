import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';
import { useTranslation } from "react-i18next";

export default function AdminLogin() {
    const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
        role: 'ADMIN',
      });

      const { user, accessToken, refreshToken } = response.data.data;
      login(user, accessToken, refreshToken);
      navigate('/admin/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-layout">
      {/* Decorative background elements */}
      <div className="admin-login-glow top-glow"></div>
      <div className="admin-login-glow bottom-glow"></div>

      <div className="admin-login-container">
        <div className="admin-login-brand">
          <div className="admin-login-logo">
            <Shield size={28} color="white" strokeWidth={2.5} />
          </div>
          <h1>{t('newlyAdded.workLinkWorkspace')}</h1>
          <p>{t('newlyAdded.secureAdministrationPortal')}</p>
        </div>

        <form onSubmit={handleLogin} className="admin-login-form">
          {error && <div className="admin-login-error">{error}</div>}
          
          <div className="admin-input-group">
            <label>{t('newlyAdded.administratorEmail')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('newlyAdded.nameworklinkcom')}
              required
            />
          </div>

          <div className="admin-input-group">
            <label>{t('newlyAdded.securePassword')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
        
        <button onClick={() => navigate('/landing')} className="admin-back-link">
          {t('newlyAdded.returnToPublicSite')}</button>
      </div>
    </div>
  );
}
