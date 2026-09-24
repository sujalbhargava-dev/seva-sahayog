import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, CheckCircle2, Circle, ChevronRight, X } from 'lucide-react';
import './LanguagePicker.css';

const LANGUAGES = [
  { id: 'en', code: 'EN', name: 'English',  subtitle: 'Continue in English',       color: '#374151', bg: '#f3f4f6' },
  { id: 'hi', code: 'हि', name: 'हिंदी',    subtitle: 'हिंदी में जारी रखें',       color: '#ca8a04', bg: '#fefce8' },
  { id: 'bn', code: 'বা', name: 'বাংলা',    subtitle: 'বাংলায় চালিয়ে যান',        color: '#ef4444', bg: '#fef2f2' },
  { id: 'mr', code: 'म',  name: 'मराठी',    subtitle: 'मराठीत पुढे जा',           color: '#f97316', bg: '#fff7ed' },
  { id: 'ta', code: 'த',  name: 'தமிழ்',    subtitle: 'தமிழில் தொடரவும்',         color: '#0d9488', bg: '#f0fdfa' },
  { id: 'te', code: 'తె', name: 'తెలుగు',   subtitle: 'తెలుగులో కొనసాగించండి',    color: '#3b82f6', bg: '#eff6ff' },
] as const;

type LangId = typeof LANGUAGES[number]['id'];

interface Props {
  /** Optionally render only the trigger row (default: false = render inline trigger + sheet together) */
  showLabel?: boolean;
}

export default function LanguagePicker({ showLabel = true }: Props) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);

  const currentId = (i18n.language?.split('-')[0] ?? 'en') as LangId;
  const current = LANGUAGES.find(l => l.id === currentId) ?? LANGUAGES[0];

  const handleSelect = (id: LangId) => {
    i18n.changeLanguage(id);
    setOpen(false);
  };

  return (
    <>
      {/* ── Trigger row ── */}
      <button className="lang-setting-row" onClick={() => setOpen(true)}>
        <div className="lang-setting-left">
          <div className="lang-setting-icon" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
            <Globe size={20} />
          </div>
          {showLabel && (
            <div className="lang-setting-info">
              <h4>{t('langPicker.appLanguage')}</h4>
              <p>{current.name}</p>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 12, fontWeight: 600, color: '#16a34a',
            backgroundColor: '#f0fdf4', padding: '3px 10px', borderRadius: 20,
          }}>
            {current.name}
          </span>
          <ChevronRight size={18} color="#94a3b8" />
        </div>
      </button>

      {/* ── Bottom sheet ── */}
      {open && (
        <>
          <div className="lang-picker-backdrop" onClick={() => setOpen(false)} />
          <div className="lang-picker-sheet" role="dialog" aria-modal="true" aria-label="Choose language">
            <div className="lang-picker-handle" />

            <div className="lang-picker-header">
              <span className="lang-picker-title">{t('langPicker.title')}</span>
              <button className="lang-picker-close" onClick={() => setOpen(false)} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <div className="lang-picker-list">
              {LANGUAGES.map(lang => {
                const isActive = lang.id === currentId;
                return (
                  <button
                    key={lang.id}
                    className={`lang-picker-item${isActive ? ' active' : ''}`}
                    onClick={() => handleSelect(lang.id)}
                  >
                    <div
                      className="lang-picker-avatar"
                      style={{ backgroundColor: lang.bg, color: lang.color }}
                    >
                      {lang.code}
                    </div>
                    <div className="lang-picker-text">
                      <p className="lang-picker-name">{lang.name}</p>
                      <p className="lang-picker-subtitle">{lang.subtitle}</p>
                    </div>
                    <div className="lang-picker-check">
                      {isActive
                        ? <CheckCircle2 size={22} color="#16a34a" />
                        : <Circle size={22} color="#d1d5db" />
                      }
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
