'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import MemberMenu from './MemberMenu';
import { happeningsEvents } from '@/lib/data/happenings';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
  const t = useTranslations('navigation');
  const locale = useLocale() as 'sv' | 'en';
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'glass shadow-lg' : 'bg-white/90 backdrop-blur-sm'
    }`}>
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-16 lg:h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <Image
                src="/yoga-logo.png"
                alt="Yoga Stenungsund"
                width={50}
                height={50}
                className="transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          </div>
          
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link href="/" className="text-gray-700 hover:text-[var(--yoga-purple)] transition-colors font-medium text-[15px]">
              {t('home')}
            </Link>
            <div className="relative">
              <button 
                className="text-gray-700 hover:text-[var(--yoga-purple)] transition-colors flex items-center gap-1 font-medium text-[15px]"
                onClick={() => setOpenDropdown(openDropdown === 'about' ? null : 'about')}
                onMouseEnter={() => setOpenDropdown('about')}
              >
                {t('about')}
                <svg className={`w-4 h-4 transition-transform duration-300 ${openDropdown === 'about' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div 
                className={`absolute left-0 mt-2 w-56 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 transition-all duration-200 z-50 overflow-hidden ${
                  openDropdown === 'about' ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <div className="py-2">
                  <Link 
                    href="/om-oss" 
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[var(--yoga-cyan)]/10 hover:to-[var(--yoga-purple)]/10 hover:text-[var(--yoga-purple)] transition-all"
                  >
                    {t('aboutUs')}
                  </Link>
                  <Link 
                    href="/nyborjare" 
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[var(--yoga-cyan)]/10 hover:to-[var(--yoga-purple)]/10 hover:text-[var(--yoga-purple)] transition-all"
                  >
                    {t('beginners')}
                  </Link>
                  <Link 
                    href="/larare" 
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[var(--yoga-cyan)]/10 hover:to-[var(--yoga-purple)]/10 hover:text-[var(--yoga-purple)] transition-all"
                  >
                    {t('teachers')}
                  </Link>
                  <Link 
                    href="/faq" 
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[var(--yoga-cyan)]/10 hover:to-[var(--yoga-purple)]/10 hover:text-[var(--yoga-purple)] transition-all"
                  >
                    {t('faq')}
                  </Link>
                </div>
              </div>
            </div>
            <Link href="/klasser" className="text-gray-700 hover:text-[var(--yoga-purple)] transition-colors font-medium text-[15px]">
              {t('classes')}
            </Link>
            <Link href="/schema" className="text-gray-700 hover:text-[var(--yoga-purple)] transition-colors font-medium text-[15px]">
              {t('schedule')}
            </Link>
            <Link href="/medlemskap" className="text-gray-700 hover:text-[var(--yoga-purple)] transition-colors font-medium text-[15px]">
              {t('memberships')}
            </Link>
            <Link href="/kontakt" className="text-gray-700 hover:text-[var(--yoga-purple)] transition-colors font-medium text-[15px]">
              {t('contact')}
            </Link>
            <Link href="/community" className="text-gray-700 hover:text-[var(--yoga-purple)] transition-colors font-medium text-[15px]">
              {t('community')}
            </Link>
            <div className="relative">
              <button 
                className="text-gray-700 hover:text-[var(--yoga-purple)] transition-colors flex items-center gap-1 font-medium text-[15px]"
                onClick={() => setOpenDropdown(openDropdown === 'wellbeing' ? null : 'wellbeing')}
                onMouseEnter={() => setOpenDropdown('wellbeing')}
              >
                {t('wellbeing')}
                <svg className={`w-4 h-4 transition-transform duration-300 ${openDropdown === 'wellbeing' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div 
                className={`absolute left-0 mt-2 w-64 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 transition-all duration-200 z-50 overflow-hidden ${
                  openDropdown === 'wellbeing' ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <div className="py-2">
                  <Link 
                    href="/valbefinnande/optimum-metoden" 
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[var(--yoga-cyan)]/10 hover:to-[var(--yoga-purple)]/10 hover:text-[var(--yoga-purple)] transition-all"
                  >
                    Optimum Metoden
                  </Link>
                  <Link 
                    href="/valbefinnande/pt-yoga" 
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[var(--yoga-cyan)]/10 hover:to-[var(--yoga-purple)]/10 hover:text-[var(--yoga-purple)] transition-all"
                  >
                    PT-Yoga med Sara
                  </Link>
                  <Link 
                    href="/valbefinnande/elin-sternsjo" 
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[var(--yoga-cyan)]/10 hover:to-[var(--yoga-purple)]/10 hover:text-[var(--yoga-purple)] transition-all"
                  >
                    Elin Sternsjö
                  </Link>
                  <Link 
                    href="/valbefinnande/restorative" 
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[var(--yoga-cyan)]/10 hover:to-[var(--yoga-purple)]/10 hover:text-[var(--yoga-purple)] transition-all"
                  >
                    Restorative Terapi
                  </Link>
                  <Link 
                    href="/valbefinnande/ansiktsmassage" 
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[var(--yoga-cyan)]/10 hover:to-[var(--yoga-purple)]/10 hover:text-[var(--yoga-purple)] transition-all"
                  >
                    Tibetansk Ansiktsmassage
                  </Link>
                  <Link 
                    href="/valbefinnande/malins-friskvard" 
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[var(--yoga-cyan)]/10 hover:to-[var(--yoga-purple)]/10 hover:text-[var(--yoga-purple)] transition-all"
                  >
                    Malins Friskvård
                  </Link>
                  <Link 
                    href="/valbefinnande/rekommenderar" 
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[var(--yoga-cyan)]/10 hover:to-[var(--yoga-purple)]/10 hover:text-[var(--yoga-purple)] transition-all"
                  >
                    YST Rekommenderar
                  </Link>
                  <div className="border-t border-gray-100 my-2"></div>
                  <Link 
                    href="/valbefinnande" 
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[var(--yoga-cyan)]/10 hover:to-[var(--yoga-purple)]/10 hover:text-[var(--yoga-purple)] font-medium transition-all"
                  >
                    {t('viewAllWellbeing')}
                  </Link>
                </div>
              </div>
            </div>
            <div className="relative">
              <button 
                className="text-gray-700 hover:text-[var(--yoga-purple)] transition-colors flex items-center gap-1 font-medium text-[15px]"
                onClick={() => setOpenDropdown(openDropdown === 'happenings' ? null : 'happenings')}
                onMouseEnter={() => setOpenDropdown('happenings')}
              >
                {t('happenings')}
                <svg className={`w-4 h-4 transition-transform duration-300 ${openDropdown === 'happenings' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div 
                className={`absolute left-0 mt-2 w-64 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 transition-all duration-200 z-50 overflow-hidden ${
                  openDropdown === 'happenings' ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <div className="py-2">
                  {happeningsEvents.map((event) => (
                    <Link 
                      key={event.id}
                      href={{ pathname: '/happenings/[slug]', params: { slug: event.slug } }}
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[var(--yoga-cyan)]/10 hover:to-[var(--yoga-purple)]/10 hover:text-[var(--yoga-purple)] transition-all"
                    >
                      {event.title[locale]}
                    </Link>
                  ))}
                  <div className="border-t border-gray-100 my-2"></div>
                  <Link 
                    href="/happenings/oversikt" 
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[var(--yoga-cyan)]/10 hover:to-[var(--yoga-purple)]/10 hover:text-[var(--yoga-purple)] font-medium transition-all"
                  >
                    {t('viewAllHappenings')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-3">
              <div 
                onMouseEnter={() => setOpenDropdown('member')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <MemberMenu 
                  isOpen={openDropdown === 'member'}
                  onToggle={() => setOpenDropdown(openDropdown === 'member' ? null : 'member')}
                />
              </div>
              <LanguageSwitcher />
              <Link
                href="/schema"
                className="bg-[var(--yoga-cyan)] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[var(--yoga-cyan)]/90 transition-all duration-200"
              >
                {t('book_class')}
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
        isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-4 py-6 space-y-4 bg-white/95 backdrop-blur-md border-t border-gray-100">
          <Link
            href="/"
            className="block py-2 text-gray-700 hover:text-[var(--yoga-purple)] transition-colors font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t('home')}
          </Link>
          <Link
            href="/om-oss"
            className="block py-2 text-gray-700 hover:text-[var(--yoga-purple)] transition-colors font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t('about')}
          </Link>
          <Link
            href="/nyborjare"
            className="block py-2 text-gray-700 hover:text-[var(--yoga-purple)] transition-colors font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t('beginners')}
          </Link>
          <Link
            href="/klasser"
            className="block py-2 text-gray-700 hover:text-[var(--yoga-purple)] transition-colors font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t('classes')}
          </Link>
          <Link
            href="/schema"
            className="block py-2 text-gray-700 hover:text-[var(--yoga-purple)] transition-colors font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t('schedule')}
          </Link>
          <Link
            href="/medlemskap"
            className="block py-2 text-gray-700 hover:text-[var(--yoga-purple)] transition-colors font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t('memberships')}
          </Link>
          <Link
            href="/kontakt"
            className="block py-2 text-gray-700 hover:text-[var(--yoga-purple)] transition-colors font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t('contact')}
          </Link>
          <Link
            href="/community"
            className="block py-2 text-gray-700 hover:text-[var(--yoga-purple)] transition-colors font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t('community')}
          </Link>
          <Link
            href="/valbefinnande"
            className="block py-2 text-gray-700 hover:text-[var(--yoga-purple)] transition-colors font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t('wellbeing')}
          </Link>
          
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">{t('happenings')}</span>
            </div>
            {happeningsEvents.map((event) => (
              <Link
                key={event.id}
                href={{ pathname: '/happenings/[slug]', params: { slug: event.slug } }}
                className="block py-2 pl-4 text-sm text-gray-600 hover:text-[var(--yoga-purple)] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {event.title[locale]}
              </Link>
            ))}
          </div>
          
          <div className="pt-4 border-t border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <MemberMenu />
              <LanguageSwitcher />
            </div>
            <Link
              href="/schema"
              className="block w-full text-center bg-[var(--yoga-cyan)] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-[var(--yoga-cyan)]/90 transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('book_class')}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}