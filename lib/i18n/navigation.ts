import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';
import { locales, defaultLocale } from '@/i18n';

// Define pathnames with Swedish as base and English translations
export const pathnames = {
  '/': '/',
  '/klasser': {
    sv: '/klasser',
    en: '/classes'
  },
  '/schema': {
    sv: '/schema', 
    en: '/schedule'
  },
  '/priser': {
    sv: '/priser',
    en: '/prices'
  },
  '/om-oss': {
    sv: '/om-oss',
    en: '/about'
  },
  '/kontakt': {
    sv: '/kontakt',
    en: '/contact'
  },
  '/larare': {
    sv: '/larare',
    en: '/teachers'
  },
  '/nyborjare': {
    sv: '/nyborjare',
    en: '/beginners'
  },
  '/happenings/[slug]': {
    sv: '/happenings/[slug]',
    en: '/happenings/[slug]'
  },
  '/happenings/oversikt': {
    sv: '/happenings/oversikt',
    en: '/happenings/overview'
  },
  '/valbefinnande': {
    sv: '/valbefinnande',
    en: '/wellness'
  },
  '/retreater': {
    sv: '/retreater',
    en: '/retreats'
  }
} as const;

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale,
  localePrefix: 'as-needed',
  pathnames
});

// Re-export for convenience
export { locales, defaultLocale };

export const { Link, redirect, usePathname, useRouter, getPathname } = 
  createNavigation(routing);