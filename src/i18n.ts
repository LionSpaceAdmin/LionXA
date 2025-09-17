import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({locale}) => ({
  // The path is now correct, relative to the `src` directory
  messages: (await import(`./messages/${locale}.json`)).default
}));
