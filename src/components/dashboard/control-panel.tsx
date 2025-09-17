"use client";

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Power, ShieldAlert } from 'lucide-react';

export function ControlPanel() {
  const t = useTranslations('ControlPanel');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Button variant="secondary" className="w-full">
          <Power className="mr-2 h-4 w-4" /> {t('pauseAgent')}
        </Button>
        <Button variant="destructive" className="w-full">
          <ShieldAlert className="mr-2 h-4 w-4" /> {t('emergencyStop')}
        </Button>
      </CardContent>
    </Card>
  );
}
