import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Briefcase, ChevronRight, Globe, ShieldCheck, MapPin, Users } from 'lucide-react';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Show the current language name on the button
  const langNames: Record<string, string> = {
    en: 'English', hi: 'हिंदी', bn: 'বাংলা', mr: 'मराठी', ta: 'தமிழ்', te: 'తెలుగు',
  };
  const currentLang = i18n.language?.split('-')[0] || 'en';
  const langLabel = langNames[currentLang] ?? 'English';

  return (
    <div className="landing-wrapper">
      {/* Background abstract waves */}
      <div className="bg-wave-top"></div>
      <div className="bg-wave-bottom"></div>

      <div className="landing-container">
        {/* Header */}
        <div className="landing-header">
          <button
            onClick={() => navigate('/language')}
            className="lang-selector"
          >
            <Globe size={16} />
            {langLabel}
            <ChevronRight size={16} style={{ transform: 'rotate(90deg)' }} />
          </button>
        </div>

        {/* Hero */}
        <div className="hero-section">
          <h1 className="hero-title">
            {t('landing.heroTitle')}<br />
            <span className="highlight">{t('landing.heroHighlight')}</span>
          </h1>
          <p className="hero-subtitle">
            {t('landing.heroSubtitle')}
          </p>

          <div className="hero-image-container">
            <img src="/hero.jpg" alt={t('newlyAdded.serviceWorkers')} className="hero-image" />
          </div>
        </div>

        {/* Role Selection */}
        <div className="role-selection-wrapper">
          <h2 className="role-title">{t('landing.roleTitle')}</h2>
          <p className="role-subtitle">{t('landing.roleSubtitle')}</p>

          <button
            className="role-card-new card-customer"
            onClick={() => navigate('/register/customer')}
          >
            <div className="role-icon-new icon-customer">
              <User size={24} strokeWidth={2.5} />
            </div>
            <div className="role-details-new">
              <h4>{t('landing.customerTitle')}</h4>
              <p>{t('landing.customerDesc')}</p>
            </div>
            <div className="chevron-circle">
              <ChevronRight size={20} color="#6b7280" />
            </div>
          </button>

          <button
            className="role-card-new card-worker"
            onClick={() => navigate('/register/worker')}
          >
            <div className="role-icon-new icon-worker">
              <Briefcase size={24} strokeWidth={2.5} />
            </div>
            <div className="role-details-new">
              <h4>{t('landing.workerTitle')}</h4>
              <p>{t('landing.workerDesc')}</p>
            </div>
            <div className="chevron-circle">
              <ChevronRight size={20} color="#6b7280" />
            </div>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="trust-badges">
          <div className="trust-item">
            <ShieldCheck size={24} color="#059669" strokeWidth={2.5} />
            <span>{t('landing.trustVerified')}</span>
          </div>
          <div className="trust-item">
            <MapPin size={24} color="#059669" strokeWidth={2.5} />
            <span>{t('landing.trustLocal')}</span>
          </div>
          <div className="trust-item">
            <Users size={24} color="#059669" strokeWidth={2.5} />
            <span>{t('landing.trustCommunity')}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="landing-footer-new">
          <p className="legal-text">
            {t('landing.legal')} <span>{t('landing.termsOfService')}</span> {t('landing.and')} <span>{t('landing.privacyPolicy')}</span>.
          </p>
          <p className="login-text">
            {t('landing.alreadyAccount')}{' '}
            <span className="login-link" onClick={() => navigate('/login')}>
              {t('landing.logIn')} <ChevronRight size={16} strokeWidth={3} />
            </span>
          </p>

          <div className="footer-branding">
            <div className="divider"></div>
            <h5>{t('newlyAdded.sewaShayog')}</h5>
            <p>{t('landing.tagline')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
