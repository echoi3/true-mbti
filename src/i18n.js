import { createIntl, createIntlCache } from 'react-intl';
import enMessages from './locales/en.json';
import koMessages from './locales/ko.json';

const messages = {
  en: enMessages,
  ko: koMessages,
};

const cache = createIntlCache();

export const getIntl = (locale) => {
  return createIntl(
    {
      locale: locale,
      messages: messages[locale],
    },
    cache
  );
};