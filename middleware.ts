import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales: ['he', 'en'],
 
  // Used when no locale matches
  defaultLocale: 'he',

  // This is the fix: explicitly provide an empty pathnames object
  // to ensure the config is picked up correctly by server components.
  pathnames: {},
});
 
export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(he|en)/:path*']
};
