// src/app/[locale]/page.tsx
'use client';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('Dashboard');

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>{t('title')}</h1>
      <p>If you can see this page in Hebrew, the i18n routing is working correctly.</p>
    </div>
  );
}
