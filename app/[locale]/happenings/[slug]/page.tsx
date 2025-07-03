import { notFound } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { happeningsEvents } from '@/lib/data/happenings';

export async function generateStaticParams() {
  return happeningsEvents.map((event) => ({
    slug: event.slug,
  }));
}

export default function HappeningDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const t = useTranslations('happenings');
  const locale = useLocale() as 'sv' | 'en';
  
  // Since we're in a server component, we need to await params
  const { slug } = params as any; // Type assertion for now
  
  const event = happeningsEvents.find(e => e.slug === slug);
  
  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link 
          href="/happenings/oversikt"
          className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6"
        >
          ← {t('backToHappenings')}
        </Link>

        {/* Event type badge */}
        <div className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm mb-4">
          {t(`types.${event.type}`)}
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-4">{event.title[locale]}</h1>

        {/* Short description */}
        <p className="text-xl text-gray-700 mb-8">
          {event.shortDescription[locale]}
        </p>

        {/* Event details */}
        <div className="bg-purple-50 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">{t('details.title')}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {event.dates && (
              <div>
                <h3 className="font-medium text-gray-600 mb-1">{t('details.dates')}</h3>
                <p className="text-gray-900">{event.dates}</p>
              </div>
            )}
            {event.time && (
              <div>
                <h3 className="font-medium text-gray-600 mb-1">{t('details.time')}</h3>
                <p className="text-gray-900">{event.time}</p>
              </div>
            )}
            {event.location && (
              <div>
                <h3 className="font-medium text-gray-600 mb-1">{t('details.location')}</h3>
                <p className="text-gray-900">{event.location}</p>
              </div>
            )}
            {event.price && (
              <div>
                <h3 className="font-medium text-gray-600 mb-1">{t('details.price')}</h3>
                <p className="text-gray-900">{event.price}</p>
              </div>
            )}
            {event.instructor && (
              <div>
                <h3 className="font-medium text-gray-600 mb-1">{t('details.instructor')}</h3>
                <p className="text-gray-900">{event.instructor}</p>
              </div>
            )}
          </div>
        </div>

        {/* Full description */}
        {event.fullDescription && (
          <div className="prose prose-lg max-w-none mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('details.description')}</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {event.fullDescription[locale]}
            </p>
          </div>
        )}

        {/* What's included */}
        {event.includes && event.includes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('details.includes')}</h2>
            <ul className="space-y-2">
              {event.includes.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-purple-600 mr-2">✓</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Booking CTA */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">{t('booking.title')}</h2>
          <p className="text-gray-700 mb-6">
            {t('booking.description')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {event.booking?.email && (
              <a 
                href={`mailto:${event.booking.email}?subject=${event.title[locale]}`}
                className="inline-block bg-purple-600 text-white px-8 py-3 rounded-full font-medium hover:bg-purple-700 transition-colors"
              >
                {t('booking.emailButton')}
              </a>
            )}
            {event.booking?.phone && (
              <a 
                href={`tel:${event.booking.phone}`}
                className="inline-block bg-white text-purple-600 px-8 py-3 rounded-full font-medium border-2 border-purple-600 hover:bg-purple-50 transition-colors"
              >
                {t('booking.phoneButton')} {event.booking.phone}
              </a>
            )}
            {event.booking?.link && (
              <Link
                href="/schema"
                className="inline-block bg-purple-600 text-white px-8 py-3 rounded-full font-medium hover:bg-purple-700 transition-colors"
              >
                {t('booking.onlineButton')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}