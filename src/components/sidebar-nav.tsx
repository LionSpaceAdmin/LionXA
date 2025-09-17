'use client';

import { usePathname } from 'next/navigation';
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

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '#', label: 'Visual Editor', icon: Share2 },
  { href: '#', label: 'Automation', icon: ListChecks },
  { href: '#', label: 'AI Optimization', icon: Bot },
  { href: '#', label: 'Settings', icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
          <Link href={link.href} passHref legacyBehavior>
            <SidebarMenuButton
              asChild
              isActive={pathname === link.href}
              tooltip={link.label}
            >
              <a>
                <link.icon />
                <span>{link.label}</span>
              </a>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
