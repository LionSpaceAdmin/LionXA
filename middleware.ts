import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['he', 'en'],
  defaultLocale: 'he',
  // Hide the default locale prefix; keep prefix only for non-default
  localePrefix: 'as-needed'
});

export const config = {
  // Exclude Next internals and any path with an extension
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
