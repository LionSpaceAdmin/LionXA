'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Share2,
  ListChecks,
  Settings,
  Bot,
} from 'lucide-react';
import Link from 'next/link';

export function SidebarNav() {
  const pathname = usePathname();
  const t = useTranslations('Navigation');

  const links = [
    { href: '/', label: t('dashboard'), icon: LayoutDashboard },
    { href: '#visual-editor', label: t('visualEditor'), icon: Share2 },
    { href: '#automation', label: t('automation'), icon: ListChecks },
    { href: '#ai-optimization', label: t('aiOptimization'), icon: Bot },
    { href: '#settings', label: t('settings'), icon: Settings },
  ];

  return (
    <SidebarMenu>
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === link.href}
            tooltip={link.label}
            >
            <Link href={link.href}>
              <link.icon />
              <span>{link.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
