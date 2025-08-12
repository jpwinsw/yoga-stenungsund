import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { Link } from '@/lib/i18n/navigation';
import { locales } from '@/i18n';
import Image from 'next/image';
import { Phone, ArrowLeft, Clock, Sparkles, Heart, Eye, Smile } from 'lucide-react';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'wellbeing' });
  
  return {
    title: `${t('facial.title')} | Yoga Stenungsund`,
    description: t('facial.description'),
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function FacialMassagePage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'wellbeing' });

  const benefits = [
    { icon: Sparkles, key: 'tension' },
    { icon: Heart, key: 'circulation' },
    { icon: Smile, key: 'glow' },
    { icon: Eye, key: 'stress' }
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
                {t('facial.title')}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-[var(--yoga-purple)]">
                  <Clock className="w-5 h-5" />
                  <span className="text-xl font-medium">{t('facial.subtitle')}</span>
                </div>
                <div className="text-xl font-bold text-[var(--yoga-cyan)]">
                  {t('facial.price')}
                </div>
              </div>
              <p className="text-lg text-gray-600 mb-8">
                {t('facial.description')}
              </p>
              
              <div className="bg-gradient-to-br from-[var(--yoga-purple)]/5 to-[var(--yoga-cyan)]/5 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {t('facial.benefits.title')}
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {benefits.map((benefit) => {
                    const Icon = benefit.icon;
                    return (
                      <div key={benefit.key} className="flex items-start gap-3">
                        <Icon className="w-6 h-6 text-[var(--yoga-purple)] mt-0.5" />
                        <span className="text-gray-700">
                          {t(`facial.benefits.${benefit.key}`)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/facial-massage.jpg"
                alt="Tibetan Facial Massage"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Ideal For Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-[var(--yoga-cyan)]/5 via-white to-[var(--yoga-purple)]/5">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                {t('facial.idealFor.title')}
              </h2>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {['tired', 'headache', 'jaw', 'eyestrain', 'rejuvenation'].map((key) => (
                  <div key={key} className="bg-gradient-to-br from-[var(--yoga-purple)]/5 to-[var(--yoga-cyan)]/5 rounded-xl p-4 text-center">
                    <span className="text-gray-700">
                      {t(`facial.idealFor.${key}`)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  {t('facial.practitioner')}
                </h3>
                <p className="text-gray-600 mb-6 text-center">
                  {t('facial.booking')}
                </p>
                <div className="text-center">
                  <a
                    href="sms:0707146301"
                    className="inline-flex items-center justify-center px-8 py-3 bg-[var(--yoga-purple)] text-white rounded-full hover:bg-[var(--yoga-purple)]/90 transition-colors"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    070-714 63 01
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