import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { Link } from '@/lib/i18n/navigation';
import { locales } from '@/i18n';
import Image from 'next/image';
import { Phone, ArrowLeft, Sparkles, Heart, Flower2, Music } from 'lucide-react';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'wellbeing' });
  
  return {
    title: `${t('restorative.title')} | Yoga Stenungsund`,
    description: t('restorative.description'),
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RestorativePage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'wellbeing' });

  const includes = [
    { icon: Heart, key: 'touch' },
    { icon: Flower2, key: 'oils' },
    { icon: Sparkles, key: 'pressure' },
    { icon: Music, key: 'sound' }
  ];

  return (
    <div className="min-h-screen">
      {/* Back Navigation */}
      <div className="container mx-auto px-6 lg:px-12 pt-24">
        <Link
          href="/valbefinnande"
          className="inline-flex items-center text-gray-600 hover:text-[var(--yoga-purple)] transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t('cta.viewAll')}
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative pt-8 pb-16 lg:pb-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                {t('restorative.title')}
              </h1>
              <p className="text-xl md:text-2xl text-[var(--yoga-purple)] mb-6">
                {t('restorative.subtitle')}
              </p>
              <p className="text-lg text-gray-600 mb-8 italic">
                &quot;{t('restorative.description')}&quot;
              </p>
            </div>
            
            <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/restorative-therapy.jpg"
                alt="Restorative Therapy"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-[var(--yoga-purple)]/5 via-white to-[var(--yoga-cyan)]/5">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* What's Included */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t('restorative.includes.title')}
                </h2>
                <div className="space-y-4">
                  {includes.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.key} className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--yoga-purple)] to-[var(--yoga-cyan)] flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-gray-700">
                          {t(`restorative.includes.${item.key}`)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* For Who */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t('restorative.forWho.title')}
                </h2>
                <div className="space-y-4">
                  {['rest', 'stress', 'burnout'].map((key) => (
                    <div key={key} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-[var(--yoga-cyan)] mt-2"></div>
                      <span className="text-gray-700">
                        {t(`restorative.forWho.${key}`)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking Section */}
            <div className="mt-12 bg-white rounded-3xl shadow-xl p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Annika Valton
              </h3>
              <p className="text-gray-600 mb-6">
                {t('restorative.booking')}
              </p>
              <a
                href="sms:0707146301"
                className="inline-flex items-center justify-center px-8 py-3 bg-[var(--yoga-purple)] text-white rounded-full hover:bg-[var(--yoga-purple)]/90 transition-colors"
              >
                <Phone className="w-5 h-5 mr-2" />
                SMS: 070-714 63 01
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}