import i18next from 'i18next';
import i18nextMiddleware from 'i18next-http-middleware';

import en from '../locales/en.json';
import hi from '../locales/hi.json';

i18next.use(i18nextMiddleware.LanguageDetector).init({
  fallbackLng: 'en',
  supportedLngs: ['en', 'hi'],
  preload: ['en', 'hi'],
  resources: {
    en: { translation: en },
    hi: { translation: hi },
  },
  detection: {
    order: ['header', 'querystring'],
    lookupHeader: 'accept-language',
    lookupQuerystring: 'lang',
  },
});

export { i18next, i18nextMiddleware };
