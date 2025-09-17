import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
 
// A list of all locales that are supported
const locales = ['he', 'en'];
 
export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();
 
  return {
    messages: (await import(`./src/messages/${locale}.json`)).default
  };
});