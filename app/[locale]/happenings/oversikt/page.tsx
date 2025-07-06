import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { happeningsEvents } from '@/lib/data/happenings';

export default function HappeningsPage() {
  const t = useTranslations('happenings');
  const locale = useLocale() as 'sv' | 'en';

  const featuredEvent = happeningsEvents.find(e => e.featured);
  const retreats = happeningsEvents.filter(e => e.type === 'retreat' && !e.featured);
  const workshops = happeningsEvents.filter(e => e.type === 'workshop');
  const regularEvents = happeningsEvents.filter(e => e.type === 'regular');

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-4">{t('title')}</h1>
        <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          {t('description')}
        </p>

        {/* Featured Event */}
        {featuredEvent && (
          <div className="mb-16">
            <Link href={{ pathname: '/happenings/[slug]', params: { slug: featuredEvent.slug } }}>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="inline-block bg-purple-600 text-white px-3 py-1 rounded-full text-sm mb-3">
                      {t('featured')}
                    </div>
                    <h2 className="text-2xl font-bold mb-3">{featuredEvent.title[locale]}</h2>
                    <p className="text-gray-700 mb-4">{featuredEvent.shortDescription[locale]}</p>
                    
                    {featuredEvent.dates && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-purple-600">📅</span>
                        <span className="font-medium">{featuredEvent.dates}</span>
                      </div>
                    )}
                    {featuredEvent.location && (
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-purple-600">📍</span>
                        <span className="font-medium">{featuredEvent.location}</span>
                      </div>
                    )}

                    <span className="inline-block text-purple-600 font-medium hover:text-purple-700">
                      {t('readMore')} →
                    </span>
                  </div>
                  <div className="md:w-96">
                    <div className="h-64 md:h-full bg-gradient-to-br from-purple-200 to-pink-200 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Retreats */}
        {retreats.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">{t('sections.retreats')}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {retreats.map((event) => (
                <Link key={event.id} href={{ pathname: '/happenings/[slug]', params: { slug: event.slug } }}>
                  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <h3 className="text-xl font-semibold mb-3">{event.title[locale]}</h3>
                    <p className="text-gray-600 mb-4">{event.shortDescription[locale]}</p>
                    {event.dates && (
                      <p className="text-sm text-purple-600 font-medium">{event.dates}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Workshops */}
        {workshops.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">{t('sections.workshops')}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workshops.map((event) => (
                <Link key={event.id} href={{ pathname: '/happenings/[slug]', params: { slug: event.slug } }}>
                  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <h3 className="text-lg font-semibold mb-2">{event.title[locale]}</h3>
                    <p className="text-gray-600 text-sm">{event.shortDescription[locale]}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Regular Events */}
        {regularEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">{t('sections.regular')}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {regularEvents.map((event) => (
                <Link key={event.id} href={{ pathname: '/happenings/[slug]', params: { slug: event.slug } }}>
                  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <h3 className="text-xl font-semibold mb-3">{event.title[locale]}</h3>
                    <p className="text-gray-600 mb-4">{event.shortDescription[locale]}</p>
                    
                    <div className="space-y-1 text-sm">
                      {event.time && (
                        <div className="flex items-center gap-2">
                          <span className="text-purple-600">🕐</span>
                          <span>{event.time}</span>
                        </div>
                      )}
                      {event.instructor && (
                        <div className="flex items-center gap-2">
                          <span className="text-purple-600">👤</span>
                          <span>{event.instructor}</span>
                        </div>
                      )}
                      {event.price && (
                        <div className="flex items-center gap-2">
                          <span className="text-purple-600">💰</span>
                          <span>{event.price}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-purple-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">{t('cta.title')}</h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            {t('cta.description')}
          </p>
          <a 
            href="mailto:Yogastenungsund@gmail.com"
            className="inline-block bg-purple-600 text-white px-8 py-3 rounded-full font-medium hover:bg-purple-700 transition-colors"
          >
            {t('cta.button')}
          </a>
        </div>
      </div>
    </div>
  );
}