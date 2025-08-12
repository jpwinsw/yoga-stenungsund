import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { Link } from '@/lib/i18n/navigation';
import { locales } from '@/i18n';
import Image from 'next/image';
import { Phone, ArrowLeft, Heart, Activity, Zap, Microscope } from 'lucide-react';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'wellbeing' });
  
  return {
    title: `${t('malins.title')} | Yoga Stenungsund`,
    description: t('malins.description'),
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function MalinsFriskvardPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'wellbeing' });

  const services = [
    { icon: Heart, key: 'cranio' },
    { icon: Activity, key: 'lymph' },
    { icon: Heart, key: 'massage' },
    { icon: Activity, key: 'kinesiology' },
    { icon: Heart, key: 'nutrition' }
  ];

  const methods = [
    { icon: Zap, key: 'frequency' },
    { icon: Microscope, key: 'hairAnalysis' },
    { icon: Microscope, key: 'bloodAnalysis' }
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
                {t('malins.title')}
              </h1>
              <p className="text-xl md:text-2xl text-[var(--yoga-purple)] mb-6">
                {t('malins.subtitle')}
              </p>
              <p className="text-lg text-gray-600 mb-8">
                {t('malins.description')}
              </p>
            </div>
            
            <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/malins-friskvard.jpg"
                alt="Malins Friskvård"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-[var(--yoga-purple)]/5 via-white to-[var(--yoga-cyan)]/5">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Traditional Services */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t('malins.services.title')}
                </h2>
                <div className="space-y-4">
                  {services.map((service) => {
                    const Icon = service.icon;
                    return (
                      <div key={service.key} className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--yoga-purple)] to-[var(--yoga-cyan)] flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-gray-700">
                          {t(`malins.services.${service.key}`)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Advanced Methods */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t('malins.methods.title')}
                </h2>
                <div className="space-y-4">
                  {methods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <div key={method.key} className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--yoga-cyan)] to-[var(--yoga-purple)] flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-gray-700">
                          {t(`malins.methods.${method.key}`)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="mt-12 bg-white rounded-3xl shadow-xl p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Malin Morander
              </h3>
              <p className="text-gray-600 mb-6">
                {t('malins.contact')}
              </p>
              <a
                href="tel:0707481808"
                className="inline-flex items-center justify-center px-8 py-3 bg-[var(--yoga-purple)] text-white rounded-full hover:bg-[var(--yoga-purple)]/90 transition-colors"
              >
                <Phone className="w-5 h-5 mr-2" />
                070-748 18 08
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}