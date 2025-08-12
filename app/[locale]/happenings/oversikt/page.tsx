import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import NextLink from 'next/link';
import { happeningsEvents } from '@/lib/data/happenings';
import { locales } from '@/i18n';
import { Calendar, Clock, MapPin, Users, Star, Heart, Sparkles } from 'lucide-react';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'happenings' });
  
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const getEventIcon = (type: string) => {
  switch(type) {
    case 'retreat': return Heart;
    case 'workshop': return Star;
    case 'regular': return Sparkles;
    default: return Calendar;
  }
};

const getEventColor = (type: string) => {
  switch(type) {
    case 'retreat': return 'from-purple-500 to-pink-500';
    case 'workshop': return 'from-blue-500 to-cyan-500';
    case 'regular': return 'from-green-500 to-emerald-500';
    default: return 'from-gray-500 to-gray-600';
  }
};

export default async function HappeningsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('happenings');
  const typedLocale = locale as 'sv' | 'en';

  const featuredEvent = happeningsEvents.find(e => e.featured);
  const otherEvents = happeningsEvents.filter(e => !e.featured);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--yoga-purple)]/10 via-[var(--yoga-cyan)]/5 to-white"></div>
        </div>
        
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              {t('title')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-4">
              {t('subtitle')}
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('description')}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Event */}
      {featuredEvent && (
        <section className="py-8 lg:py-12">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="mb-8 text-center">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-[var(--yoga-purple)] to-[var(--yoga-cyan)] text-white rounded-full text-sm font-semibold">
                {t('featured')}
              </span>
            </div>
            
            <NextLink
              href={`/happenings/${featuredEvent.slug}`}
              className="block group"
            >
              <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="p-8 lg:p-12">
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div>
                      <div className="inline-flex items-center gap-2 text-sm text-[var(--yoga-purple)] font-medium mb-4">
                        <span className="w-2 h-2 bg-[var(--yoga-purple)] rounded-full"></span>
                        {t(`types.${featuredEvent.type}`)}
                      </div>
                      
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 group-hover:text-[var(--yoga-purple)] transition-colors">
                        {featuredEvent.title[typedLocale]}
                      </h2>
                      
                      <p className="text-lg text-gray-600 mb-6">
                        {featuredEvent.shortDescription[typedLocale]}
                      </p>
                      
                      <div className="space-y-3">
                        {featuredEvent.dates && (
                          <div className="flex items-center gap-3 text-gray-700">
                            <Calendar className="w-5 h-5 text-[var(--yoga-purple)]" />
                            <span>{featuredEvent.dates}</span>
                          </div>
                        )}
                        {featuredEvent.location && (
                          <div className="flex items-center gap-3 text-gray-700">
                            <MapPin className="w-5 h-5 text-[var(--yoga-purple)]" />
                            <span>{featuredEvent.location}</span>
                          </div>
                        )}
                        {featuredEvent.instructor && (
                          <div className="flex items-center gap-3 text-gray-700">
                            <Users className="w-5 h-5 text-[var(--yoga-purple)]" />
                            <span>{featuredEvent.instructor}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <div className="w-full h-64 lg:h-80 bg-gradient-to-br from-[var(--yoga-purple)]/20 to-[var(--yoga-cyan)]/20 rounded-2xl flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-[var(--yoga-purple)] to-[var(--yoga-cyan)] rounded-full flex items-center justify-center">
                            <Calendar className="w-12 h-12 text-white" />
                          </div>
                          <p className="text-[var(--yoga-purple)] font-medium">
                            {t('readMore')} →
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </NextLink>
          </div>
        </section>
      )}

      {/* Events Grid */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('sections.allEvents')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('sections.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherEvents.map((event) => {
              const Icon = getEventIcon(event.type);
              const color = getEventColor(event.type);
              
              return (
                <NextLink
                  key={event.id}
                  href={`/happenings/${event.slug}`}
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  <div className="p-8">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="inline-flex items-center gap-2 text-xs text-gray-500 font-medium mb-3">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                      {t(`types.${event.type}`)}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[var(--yoga-purple)] transition-colors">
                      {event.title[typedLocale]}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                      {event.shortDescription[typedLocale]}
                    </p>
                    
                    <div className="space-y-2 text-sm text-gray-500">
                      {event.dates && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{event.dates}</span>
                        </div>
                      )}
                      {event.time && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{event.time}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 flex items-center text-[var(--yoga-purple)] font-medium">
                      <span>{t('readMore')}</span>
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </NextLink>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-[var(--yoga-purple)]/5 via-white to-[var(--yoga-cyan)]/5">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                {t('cta.title')}
              </h2>
              <p className="text-gray-600 mb-8 text-center text-lg">
                {t('cta.description')}
              </p>
              
              <div className="flex justify-center">
                <a
                  href="mailto:Yogastenungsund@gmail.com"
                  className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-[var(--yoga-purple)] to-[var(--yoga-cyan)] text-white rounded-full hover:shadow-lg transition-all duration-300 font-semibold"
                >
                  {t('cta.button')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}