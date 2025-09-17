import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!['en', 'he'].includes(locale as any)) {
      // Instead of throwing an error, you can define a default locale.
      // For this example, let's stick to throwing an error.
      throw new Error(`Invalid locale: ${locale}`);
  }
 
  return {
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
