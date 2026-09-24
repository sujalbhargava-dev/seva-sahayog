import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await apiClient.post('/auth/login', {
        email: identifier,
        password: password
      });

      if (res.data?.data) {
        const { user, accessToken, refreshToken } = res.data.data;
        login(user, accessToken, refreshToken);

        // Redirect based on role
        if (user.role === 'WORKER') {
          navigate('/worker/home');
        } else {
          navigate('/customer/home');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('login.errorFallback'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="app-header" style={{ padding: '16px 0', border: 'none' }}>
        <button className="back-btn" onClick={() => navigate('/landing')}>
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="auth-content">
        <h1 className="auth-title">{t('login.title')}</h1>
        <p className="auth-subtitle">{t('login.subtitle')}</p>

        <div className="auth-tabs">
          <button className="auth-tab active">{t('login.tabLogin')}</button>
          <button className="auth-tab" onClick={() => navigate('/landing')}>{t('login.tabRegister')}</button>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <label>{t('login.emailLabel')}</label>
            <input
              type="text"
              placeholder={t('login.emailPlaceholder')}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>{t('login.passwordLabel')}</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="forgot-password">
            <a href="#forgot" className="text-primary">{t('login.forgotPassword')}</a>
          </div>

          {error && (
            <div style={{ color: 'var(--error)', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary mt-4" disabled={loading}>
            {loading ? t('login.loggingIn') : t('login.loginBtn')}
          </button>
        </form>
      </div>

      <div className="auth-footer text-center">
        <p className="text-muted">
          {t('login.noAccount')}{' '}
          <span
            style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => navigate('/landing')}
          >
            {t('login.register')}
          </span>
        </p>
      </div>
    </div>
  );
}
