import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { Link } from '@/lib/i18n/navigation';
import { happeningsEvents } from '@/lib/data/happenings';
import { locales } from '@/i18n';
import { ArrowLeft, Calendar, Clock, MapPin, Users, CreditCard, Phone, Mail, CheckCircle } from 'lucide-react';

export async function generateStaticParams() {
  const params = [];
  for (const locale of locales) {
    for (const event of happeningsEvents) {
      params.push({ locale, slug: event.slug });
    }
  }
  return params;
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string; locale: string }> 
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'happenings' });
  const typedLocale = locale as 'sv' | 'en';
  
  const event = happeningsEvents.find(e => e.slug === slug);
  if (!event) return {};
  
  return {
    title: `${event.title[typedLocale]} | ${t('metaTitle')}`,
    description: event.shortDescription[typedLocale],
  };
}

export default async function HappeningDetailPage({
  params
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const t = await getTranslations('happenings');
  const typedLocale = locale as 'sv' | 'en';
  
  const event = happeningsEvents.find(e => e.slug === slug);
  
  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Back Navigation */}
      <div className="container mx-auto px-6 lg:px-12 pt-24">
        <Link
          href="/happenings/oversikt"
          className="inline-flex items-center text-gray-600 hover:text-[var(--yoga-purple)] transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t('backToHappenings')}
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative pt-8 pb-16 lg:pb-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="inline-flex items-center gap-2 text-sm text-[var(--yoga-purple)] font-medium mb-4">
                <span className="w-2 h-2 bg-[var(--yoga-purple)] rounded-full"></span>
                {t(`types.${event.type}`)}
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                {event.title[typedLocale]}
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-700 mb-8">
                {event.shortDescription[typedLocale]}
              </p>
              
              {/* Key Details */}
              <div className="space-y-4">
                {event.dates && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-[var(--yoga-cyan)]" />
                    <div>
                      <p className="text-sm text-gray-500">{t('details.dates')}</p>
                      <p className="text-gray-900 font-medium">{event.dates}</p>
                    </div>
                  </div>
                )}
                
                {event.time && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-[var(--yoga-cyan)]" />
                    <div>
                      <p className="text-sm text-gray-500">{t('details.time')}</p>
                      <p className="text-gray-900 font-medium">{event.time}</p>
                    </div>
                  </div>
                )}
                
                {event.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-[var(--yoga-cyan)]" />
                    <div>
                      <p className="text-sm text-gray-500">{t('details.location')}</p>
                      <p className="text-gray-900 font-medium">{event.location}</p>
                    </div>
                  </div>
                )}
                
                {event.price && (
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-[var(--yoga-cyan)]" />
                    <div>
                      <p className="text-sm text-gray-500">{t('details.price')}</p>
                      <p className="text-gray-900 font-medium">{event.price}</p>
                    </div>
                  </div>
                )}
                
                {event.instructor && (
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-[var(--yoga-cyan)]" />
                    <div>
                      <p className="text-sm text-gray-500">{t('details.instructor')}</p>
                      <p className="text-gray-900 font-medium">{event.instructor}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Visual placeholder */}
            <div className="relative h-[400px] lg:h-[500px] bg-gradient-to-br from-[var(--yoga-purple)]/20 to-[var(--yoga-cyan)]/20 rounded-3xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-[var(--yoga-purple)] to-[var(--yoga-cyan)] rounded-full flex items-center justify-center">
                  <Calendar className="w-16 h-16 text-white" />
                </div>
                <p className="text-[var(--yoga-purple)] font-semibold text-lg">
                  {event.type === 'retreat' ? t('types.retreat') : 
                   event.type === 'workshop' ? t('types.workshop') : 
                   t('types.regular')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description Section */}
      {event.fullDescription && (
        <section className="py-16 lg:py-24 bg-gradient-to-br from-[var(--yoga-purple)]/5 via-white to-[var(--yoga-cyan)]/5">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {t('details.description')}
                </h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {event.fullDescription[typedLocale]}
                  </p>
                </div>

                {/* What's Included */}
                {event.includes && event.includes.length > 0 && (
                  <div className="mt-12 pt-8 border-t">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      {t('details.includes')}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {event.includes.map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[var(--yoga-cyan)] mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Booking Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-[var(--yoga-purple)]/10 to-[var(--yoga-cyan)]/10 rounded-3xl p-8 lg:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                {t('booking.title')}
              </h2>
              <p className="text-gray-600 mb-8 text-center text-lg">
                {t('booking.description')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {event.booking?.email && (
                  <a
                    href={`mailto:${event.booking.email}?subject=${event.title[typedLocale]}`}
                    className="inline-flex items-center justify-center px-6 py-3 bg-[var(--yoga-purple)] text-white rounded-full hover:bg-[var(--yoga-purple)]/90 transition-colors font-semibold"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    {t('booking.emailButton')}
                  </a>
                )}
                
                {event.booking?.phone && (
                  <a
                    href={`tel:${event.booking.phone}`}
                    className="inline-flex items-center justify-center px-6 py-3 bg-white text-[var(--yoga-purple)] rounded-full hover:bg-gray-50 transition-colors font-semibold border-2 border-[var(--yoga-purple)]"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    {event.booking.phone}
                  </a>
                )}
                
                {event.booking?.link && (
                  <Link
                    href="/schema"
                    className="inline-flex items-center justify-center px-6 py-3 bg-[var(--yoga-cyan)] text-white rounded-full hover:bg-[var(--yoga-cyan)]/90 transition-colors font-semibold"
                  >
                    {t('booking.onlineButton')}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}