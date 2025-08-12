import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { Link } from '@/lib/i18n/navigation';
import { locales } from '@/i18n';
import Image from 'next/image';
import { Phone, Mail, Users, User, Laptop, ArrowLeft } from 'lucide-react';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'wellbeing' });
  
  return {
    title: `${t('optimum.title')} | Yoga Stenungsund`,
    description: t('optimum.description'),
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function OptimumMethodPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'wellbeing' });

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
                {t('optimum.title')}
              </h1>
              <p className="text-xl md:text-2xl text-[var(--yoga-purple)] mb-6">
                {t('optimum.subtitle')}
              </p>
              <p className="text-lg text-gray-600 mb-8">
                {t('optimum.description')}
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-[var(--yoga-cyan)]" />
                  <span className="text-gray-700">{t('optimum.features.group')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-6 h-6 text-[var(--yoga-cyan)]" />
                  <span className="text-gray-700">{t('optimum.features.individual')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Laptop className="w-6 h-6 text-[var(--yoga-cyan)]" />
                  <span className="text-gray-700">{t('optimum.features.online')}</span>
                </div>
              </div>
            </div>
            
            <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/optimum-hero.jpg"
                alt="Optimum Method"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Practitioner Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-[var(--yoga-purple)]/5 via-white to-[var(--yoga-cyan)]/5">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="relative h-[300px] md:h-full">
                  <Image
                    src="/elin-sternsjo.jpg"
                    alt="Elin Sternsjö"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-8 lg:p-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {t('optimum.practitioner')}
                  </h2>
                  <p className="text-gray-600 mb-8">
                    {t('optimum.contact')}
                  </p>
                  
                  <div className="space-y-4">
                    <a
                      href="tel:0768970675"
                      className="flex items-center gap-3 text-gray-700 hover:text-[var(--yoga-purple)] transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      <span>076-897 06 75</span>
                    </a>
                    <a
                      href="mailto:sternsjoelin@gmail.com"
                      className="flex items-center gap-3 text-gray-700 hover:text-[var(--yoga-purple)] transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                      <span>sternsjoelin@gmail.com</span>
                    </a>
                  </div>
                  
                  <div className="mt-8">
                    <a
                      href="mailto:sternsjoelin@gmail.com"
                      className="inline-block px-8 py-3 bg-[var(--yoga-purple)] text-white rounded-full hover:bg-[var(--yoga-purple)]/90 transition-colors"
                    >
                      {t('cta.bookSession')}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}