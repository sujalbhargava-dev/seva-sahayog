import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './LanguageSelection.css';

const languages = [
  { id: 'en', code: 'EN', name: 'English',  subtitle: 'Continue in English',           color: '#374151', bg: '#f3f4f6' },
  { id: 'hi', code: 'हि', name: 'हिंदी',    subtitle: 'हिंदी में जारी रखें',           color: '#ca8a04', bg: '#fefce8' },
  { id: 'bn', code: 'বা', name: 'বাংলা',    subtitle: 'বাংলায় চালিয়ে যান',            color: '#ef4444', bg: '#fef2f2' },
  { id: 'mr', code: 'म',  name: 'मराठी',    subtitle: 'मराठीत पुढे जा',               color: '#f97316', bg: '#fff7ed' },
  { id: 'ta', code: 'த',  name: 'தமிழ்',    subtitle: 'தமிழில் தொடரவும்',             color: '#0d9488', bg: '#f0fdfa' },
  { id: 'te', code: 'తె', name: 'తెలుగు',   subtitle: 'తెలుగులో కొనసాగించండి',        color: '#3b82f6', bg: '#eff6ff' },
];

export default function LanguageSelection() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language?.split('-')[0] || 'en');

  const handleContinue = () => {
    // Switch language via i18next (persists to localStorage automatically)
    i18n.changeLanguage(selectedLanguage);
    navigate('/landing');
  };

  return (
    <div className="language-page">
      {/* Header */}
      <div className="language-header">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#1f2937" />
        </button>
        <h1>{t('language.chooseTitle')}</h1>
        <p>{t('language.subtitle')}</p>
      </div>

      {/* Language List */}
      <div className="language-list-container">
        <div className="language-list">
          {languages.map((lang) => {
            const isSelected = selectedLanguage === lang.id;
            return (
              <div
                key={lang.id}
                onClick={() => setSelectedLanguage(lang.id)}
                className={`language-item ${isSelected ? 'selected' : ''}`}
              >
                <div className="language-info-wrapper">
                  <div
                    className="language-avatar"
                    style={{ backgroundColor: lang.bg, color: lang.color }}
                  >
                    {lang.code}
                  </div>
                  <div>
                    <h3 className="language-name">{lang.name}</h3>
                    <p className="language-subtitle">{lang.subtitle}</p>
                  </div>
                </div>
                <div>
                  {isSelected ? (
                    <CheckCircle2 size={24} color="#008751" />
                  ) : (
                    <Circle size={24} color="#d1d5db" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Action */}
      <div className="language-bottom-action">
        <button onClick={handleContinue} className="btn-continue">
          {t('language.continue')}
        </button>
      </div>
    </div>
  );
}
