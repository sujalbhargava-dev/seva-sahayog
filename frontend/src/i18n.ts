import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en/translation.json';
import hi from './locales/hi/translation.json';
import bn from './locales/bn/translation.json';
import mr from './locales/mr/translation.json';
import ta from './locales/ta/translation.json';
import te from './locales/te/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      bn: { translation: bn },
      mr: { translation: mr },
      ta: { translation: ta },
      te: { translation: te },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi', 'bn', 'mr', 'ta', 'te'],
    detection: {
      // Try localStorage first (we store selected lang there), then browser
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nLang',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React already escapes
    },
  });

export default i18n;
