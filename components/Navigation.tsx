'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import { happeningsEvents } from '@/lib/data/happenings';

export default function Navigation() {
  const t = useTranslations('navigation');
  const locale = useLocale() as 'sv' | 'en';

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-purple-600">
              Yoga Stenungsund
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-purple-600 transition-colors">
              {t('home')}
            </Link>
            <Link href="/om-oss" className="text-gray-700 hover:text-purple-600 transition-colors">
              {t('about')}
            </Link>
            <Link href="/klasser" className="text-gray-700 hover:text-purple-600 transition-colors">
              {t('classes')}
            </Link>
            <Link href="/schema" className="text-gray-700 hover:text-purple-600 transition-colors">
              {t('schedule')}
            </Link>
            <Link href="/priser" className="text-gray-700 hover:text-purple-600 transition-colors">
              {t('prices')}
            </Link>
            <Link href="/kontakt" className="text-gray-700 hover:text-purple-600 transition-colors">
              {t('contact')}
            </Link>
            <div className="relative group">
              <button className="text-gray-700 hover:text-purple-600 transition-colors flex items-center gap-1">
                {t('happenings')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  {happeningsEvents.map((event) => (
                    <Link 
                      key={event.id}
                      href={{ pathname: '/happenings/[slug]', params: { slug: event.slug } }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                    >
                      {event.title[locale]}
                    </Link>
                  ))}
                  <div className="border-t border-gray-100 my-1"></div>
                  <Link 
                    href="/happenings/oversikt" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 font-medium"
                  >
                    {t('viewAllHappenings')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <Link
              href="/schema"
              className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              {t('book_class')}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}