import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

// Supported locales
const locales = ['he', 'en'] as const;

export default getRequestConfig(async ({locale}) => {
  const current = String(locale);
  if (!locales.includes(current as any)) notFound();

  return {
    locale: current,
    messages: (await import(`./src/messages/${current}.json`)).default
  };
});
