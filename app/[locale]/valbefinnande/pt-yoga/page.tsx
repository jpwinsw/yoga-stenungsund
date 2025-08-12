import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { Link } from '@/lib/i18n/navigation';
import { locales } from '@/i18n';
import Image from 'next/image';
import { Phone, Mail, Activity, Heart, Brain, Wind, ArrowLeft } from 'lucide-react';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'wellbeing' });
  
  return {
    title: `${t('ptYoga.title')} | Yoga Stenungsund`,
    description: t('ptYoga.description'),
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function PTYogaPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'wellbeing' });

  const benefits = [
    { icon: Activity, key: 'mobility' },
    { icon: Heart, key: 'strength' },
    { icon: Brain, key: 'technique' },
    { icon: Wind, key: 'breathing' }
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
                {t('ptYoga.title')}
              </h1>
              <p className="text-xl md:text-2xl text-[var(--yoga-cyan)] mb-6">
                {t('ptYoga.subtitle')}
              </p>
              <p className="text-lg text-gray-600 mb-8">
                {t('ptYoga.description')}
              </p>
              
              <div className="bg-gradient-to-br from-[var(--yoga-purple)]/5 to-[var(--yoga-cyan)]/5 rounded-2xl p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {t('ptYoga.benefits.title')}
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {benefits.map((benefit) => {
                    const Icon = benefit.icon;
                    return (
                      <div key={benefit.key} className="flex items-start gap-3">
                        <Icon className="w-6 h-6 text-[var(--yoga-cyan)] mt-0.5" />
                        <span className="text-gray-700">
                          {t(`ptYoga.benefits.${benefit.key}`)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/pt-yoga-sara.jpg"
                alt="PT-Yoga with Sara"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Sara Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-[var(--yoga-cyan)]/5 via-white to-[var(--yoga-purple)]/5">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Om Sara
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {t('ptYoga.about')}
              </p>
              
              <div className="border-t pt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {t('cta.contact')}
                </h3>
                <div className="space-y-4 mb-8">
                  <a
                    href="tel:0703162331"
                    className="flex items-center gap-3 text-gray-700 hover:text-[var(--yoga-purple)] transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    <span>070-316 23 31</span>
                  </a>
                  <a
                    href="mailto:sara.s.bergstrom@gmail.com"
                    className="flex items-center gap-3 text-gray-700 hover:text-[var(--yoga-purple)] transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    <span>sara.s.bergstrom@gmail.com</span>
                  </a>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="tel:0703162331"
                    className="inline-flex items-center justify-center px-8 py-3 bg-[var(--yoga-cyan)] text-white rounded-full hover:bg-[var(--yoga-cyan)]/90 transition-colors"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    {t('cta.bookSession')}
                  </a>
                  <a
                    href="mailto:sara.s.bergstrom@gmail.com"
                    className="inline-flex items-center justify-center px-8 py-3 border-2 border-[var(--yoga-cyan)] text-[var(--yoga-cyan)] rounded-full hover:bg-[var(--yoga-cyan)]/10 transition-colors"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Skicka e-post
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