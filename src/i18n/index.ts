import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

import vi from './vi';
import en from './en';

const i18n = new I18n({ vi, en });

// Lấy ngôn ngữ thiết bị
const getDeviceLocale = () => {
  const locales = Localization.getLocales();
  return locales[0]?.languageCode || 'en';
};

i18n.locale = getDeviceLocale();
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export default i18n;