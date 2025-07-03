import { locales, defaultLocale } from '@/i18n';

export const pathnames = {
  '/': '/',
  '/klasser': {
    sv: '/klasser',
    en: '/classes',
  },
  '/schema': {
    sv: '/schema',
    en: '/schedule',
  },
  '/priser': {
    sv: '/priser',
    en: '/prices',
  },
  '/om-oss': {
    sv: '/om-oss',
    en: '/about',
  },
  '/kontakt': {
    sv: '/kontakt',
    en: '/contact',
  },
  '/larare': {
    sv: '/larare',
    en: '/teachers',
  },
  '/nyborjare': {
    sv: '/nyborjare',
    en: '/beginners',
  },
  '/online-klasser': {
    sv: '/online-klasser',
    en: '/online-classes',
  },
  '/privatlektioner': {
    sv: '/privatlektioner',
    en: '/private-lessons',
  },
  '/foretagsyoga': {
    sv: '/foretagsyoga',
    en: '/corporate-yoga',
  },
  '/workshops': {
    sv: '/workshops',
    en: '/workshops',
  },
  '/retreater': {
    sv: '/retreater',
    en: '/retreats',
  },
} as const;

export type Pathnames = keyof typeof pathnames;

export function getPathname({
  locale,
  href,
}: {
  locale: string;
  href: string;
}): string {
  const pathname = pathnames[href as Pathnames];
  
  if (!pathname) return href;
  
  if (typeof pathname === 'string') {
    return pathname;
  }
  
  return pathname[locale as keyof typeof pathname] || pathname[defaultLocale as keyof typeof pathname];
}