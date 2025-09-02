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
  '/faq': {
    sv: '/faq',
    en: '/faq'
  },
  '/nyborjare': {
    sv: '/nyborjare',
    en: '/beginners'
  },
  '/klasser/[classSlug]': {
    sv: '/klasser/[classSlug]',
    en: '/classes/[classSlug]'
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
    en: '/wellbeing'
  },
  '/valbefinnande/optimum-metoden': {
    sv: '/valbefinnande/optimum-metoden',
    en: '/wellbeing/optimum-method'
  },
  '/valbefinnande/pt-yoga': {
    sv: '/valbefinnande/pt-yoga',
    en: '/wellbeing/pt-yoga'
  },
  '/valbefinnande/elin-sternsjo': {
    sv: '/valbefinnande/elin-sternsjo',
    en: '/wellbeing/elin-sternsjo'
  },
  '/valbefinnande/restorative': {
    sv: '/valbefinnande/restorative',
    en: '/wellbeing/restorative'
  },
  '/valbefinnande/ansiktsmassage': {
    sv: '/valbefinnande/ansiktsmassage',
    en: '/wellbeing/facial-massage'
  },
  '/valbefinnande/malins-friskvard': {
    sv: '/valbefinnande/malins-friskvard',
    en: '/wellbeing/malins-wellness'
  },
  '/valbefinnande/rekommenderar': {
    sv: '/valbefinnande/rekommenderar',
    en: '/wellbeing/recommendations'
  },
  '/retreater': {
    sv: '/retreater',
    en: '/retreats'
  },
  '/mina-bokningar': {
    sv: '/mina-bokningar',
    en: '/my-bookings'
  },
  '/medlemskap': {
    sv: '/medlemskap',
    en: '/memberships'
  },
  '/medlemskap/tack': {
    sv: '/medlemskap/tack',
    en: '/memberships/thank-you'
  },
  '/min-profil': {
    sv: '/min-profil',
    en: '/my-profile'
  },
  '/min-kvitton': {
    sv: '/min-kvitton',
    en: '/my-receipts'
  },
  '/community': {
    sv: '/community',
    en: '/community'
  },
  '/booking-success': {
    sv: '/booking-success',
    en: '/booking-success'
  },
  '/booking-lookup': {
    sv: '/booking-lookup',
    en: '/booking-lookup'
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