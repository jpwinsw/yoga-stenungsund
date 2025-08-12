import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import NextLink from 'next/link';
import { locales } from '@/i18n';
import { Phone, Mail, Heart, Sparkles, Flower2, Star } from 'lucide-react';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'wellbeing' });
  
  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const treatments = [
  {
    id: 'optimum',
    href: '/valbefinnande/optimum-metoden',
    icon: Heart,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'ptYoga',
    href: '/valbefinnande/pt-yoga',
    icon: Sparkles,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'restorative',
    href: '/valbefinnande/restorative',
    icon: Flower2,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'facial',
    href: '/valbefinnande/ansiktsmassage',
    icon: Star,
    color: 'from-orange-500 to-amber-500'
  },
  {
    id: 'malins',
    href: '/valbefinnande/malins-friskvard',
    icon: Heart,
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'recommendations',
    href: '/valbefinnande/rekommenderar',
    icon: Sparkles,
    color: 'from-pink-500 to-rose-500'
  }
];

export default async function WellbeingPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'wellbeing' });

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
              {t('hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-4">
              {t('hero.subtitle')}
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('hero.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Treatments Grid */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('intro.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('intro.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {treatments.map((treatment) => {
              const Icon = treatment.icon;
              return (
                <NextLink
                  key={treatment.id}
                  href={treatment.href}
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${treatment.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  <div className="p-8">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${treatment.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[var(--yoga-purple)] transition-colors">
                      {t(`${treatment.id}.title`)}
                    </h3>
                    
                    <p className="text-gray-600 mb-4">
                      {t(`${treatment.id}.subtitle`)}
                    </p>
                    
                    <p className="text-gray-500 text-sm line-clamp-3">
                      {t(`${treatment.id}.description`)}
                    </p>
                    
                    <div className="mt-6 flex items-center text-[var(--yoga-purple)] font-medium">
                      <span>{t('cta.learnMore')}</span>
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

      {/* Contact Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-[var(--yoga-purple)]/5 via-white to-[var(--yoga-cyan)]/5">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                {t('booking.title')}
              </h2>
              <p className="text-gray-600 mb-8 text-center">
                {t('booking.description')}
              </p>
              
              <div className="border-t pt-8">
                <p className="text-sm text-gray-500 mb-4 text-center">{t('booking.general')}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="tel:+46739123976"
                    className="inline-flex items-center justify-center px-6 py-3 bg-[var(--yoga-purple)] text-white rounded-full hover:bg-[var(--yoga-purple)]/90 transition-colors"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    {t('booking.phone')}
                  </a>
                  <a
                    href="mailto:Yogastenungsund@gmail.com"
                    className="inline-flex items-center justify-center px-6 py-3 bg-[var(--yoga-cyan)] text-white rounded-full hover:bg-[var(--yoga-cyan)]/90 transition-colors"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    {t('booking.email')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}