import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import './Splash.css';

const SPLASH_DURATION = 2800; // ms total splash screen duration
const PROGRESS_TICK = 30;     // ms per tick for progress bar

export default function Splash() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(0);
  const exitCalled = useRef(false);

  // Progress bar animation
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / SPLASH_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(interval);
    }, PROGRESS_TICK);
    return () => clearInterval(interval);
  }, []);

  // Navigate away after splash duration (once auth is resolved)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading && !exitCalled.current) {
        doExit();
      }
    }, SPLASH_DURATION);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, user]);

  // If auth resolves before splash ends, we still wait the full duration
  // so the splash always shows for SPLASH_DURATION ms.

  function doExit() {
    if (exitCalled.current) return;
    exitCalled.current = true;
    setExiting(true);

    setTimeout(() => {
      if (user) {
        // Route authenticated users to their respective home
        if (user.role === 'CUSTOMER') {
          navigate('/customer/home', { replace: true });
        } else if (user.role === 'WORKER') {
          navigate('/worker/home', { replace: true });
        } else if (user.role === 'ADMIN') {
          navigate('/admin/home', { replace: true });
        } else {
          navigate('/landing', { replace: true });
        }
      } else {
        navigate('/landing', { replace: true });
      }
    }, 600); // matches the CSS exit animation duration
  }

  return (
    <div className={`splash-wrapper${exiting ? ' splash-exit' : ''}`}>
      {/* Animated background blobs */}
      <div className="splash-blob splash-blob-1" />
      <div className="splash-blob splash-blob-2" />
      <div className="splash-blob splash-blob-3" />

      {/* Decorative pulsing rings */}
      <div className="splash-ring splash-ring-1" />
      <div className="splash-ring splash-ring-2" />
      <div className="splash-ring splash-ring-3" />

      {/* Main content */}
      <div className="splash-content">
        {/* Logo */}
        <div className="splash-logo-container">
          <div className="splash-logo-glow" />
          <div className="splash-logo-bg" />
          <img
            src="/logo.jpg"
            alt={t('newlyAdded.sevaSahayogLogo')}
            className="splash-logo-img"
          />
        </div>

        {/* App name */}
        <h1 className="splash-name">{t('newlyAdded.sevaSahayog')}</h1>
        <p className="splash-name-hindi">{t('splash.nameHindi')}</p>
        <p className="splash-tagline">{t('splash.tagline')}</p>

        {/* Dot loader */}
        <div className="splash-loader" role="status" aria-label="Loading">
          <span className="splash-dot" />
          <span className="splash-dot" />
          <span className="splash-dot" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="splash-progress-track">
        <div
          className="splash-progress-fill"
          style={{
            width: `${progress}%`,
            transitionDuration: `${PROGRESS_TICK}ms`,
          }}
        />
      </div>

      {/* Bottom branding */}
      <div className="splash-bottom">
        <span className="splash-bottom-tag">{t('splash.bottomTag')}</span>
        <span className="splash-version">{t('newlyAdded.v20')}</span>
      </div>
    </div>
  );
}
