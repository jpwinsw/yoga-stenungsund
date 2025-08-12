import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { Link } from '@/lib/i18n/navigation';
import { locales } from '@/i18n';
import { ArrowLeft, ShoppingBag, Shirt, Gem, Apple, ExternalLink, MapPin } from 'lucide-react';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'wellbeing' });
  
  return {
    title: `${t('recommendations.title')} | Yoga Stenungsund`,
    description: t('recommendations.description'),
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RecommendationsPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'wellbeing' });

  const categories = [
    { icon: Apple, key: 'food', color: 'from-green-500 to-emerald-500' },
    { icon: ShoppingBag, key: 'mats', color: 'from-purple-500 to-pink-500' },
    { icon: Shirt, key: 'clothing', color: 'from-blue-500 to-cyan-500' },
    { icon: Gem, key: 'jewelry', color: 'from-amber-500 to-orange-500' }
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
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              {t('recommendations.title')}
            </h1>
            <p className="text-xl md:text-2xl text-[var(--yoga-purple)] mb-6">
              {t('recommendations.subtitle')}
            </p>
            <p className="text-lg text-gray-600 mb-8">
              {t('recommendations.description')}
            </p>
            <p className="text-gray-500">
              {t('recommendations.intro')}
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-[var(--yoga-purple)]/5 via-white to-[var(--yoga-cyan)]/5">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              {t('recommendations.categories.heading')}
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <div
                    key={category.key}
                    className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow"
                  >
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {t(`recommendations.categories.${category.key}`)}
                    </h3>
                  </div>
                );
              })}
            </div>

            {/* Product Recommendations */}
            <div className="space-y-12">
              {/* Food */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Apple className="w-8 h-8 text-green-500" />
                  <h2 className="text-2xl font-bold text-gray-900">{t('recommendations.categories.food')}</h2>
                </div>
                <div className="space-y-4">
                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-bold text-lg text-gray-900">{t('recommendations.products.curcuma.name')}</h3>
                    <p className="text-gray-600 mb-2">{t('recommendations.products.curcuma.description')}</p>
                    <a href="https://www.curcuma.se/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[var(--yoga-purple)] hover:text-[var(--yoga-purple)]/80 transition-colors">
                      {t('recommendations.products.curcuma.link')}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Yoga Mats */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <ShoppingBag className="w-8 h-8 text-purple-500" />
                  <h2 className="text-2xl font-bold text-gray-900">{t('recommendations.categories.mats')}</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h3 className="font-bold text-lg text-gray-900">{t('recommendations.products.ooo.name')}</h3>
                    <p className="text-gray-600 mb-2">{t('recommendations.products.ooo.description')}</p>
                    <p className="text-sm text-gray-500 mb-3">{t('recommendations.products.ooo.detail')}</p>
                    <a href="https://oooyogamatta.se/shop-yogamatta/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[var(--yoga-purple)] hover:text-[var(--yoga-purple)]/80 transition-colors">
                      {t('recommendations.products.ooo.link')}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h3 className="font-bold text-lg text-gray-900">{t('recommendations.products.vackraliv.name')}</h3>
                    <p className="text-gray-600 mb-2">{t('recommendations.products.vackraliv.description')}</p>
                    <p className="text-sm text-gray-500 mb-3">{t('recommendations.products.vackraliv.detail')}</p>
                    <a href="https://www.vackraliv.se/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[var(--yoga-purple)] hover:text-[var(--yoga-purple)]/80 transition-colors">
                      {t('recommendations.products.vackraliv.link')}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Yoga Clothing */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Shirt className="w-8 h-8 text-blue-500" />
                  <h2 className="text-2xl font-bold text-gray-900">{t('recommendations.categories.clothing')}</h2>
                </div>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-lg text-gray-900">{t('recommendations.products.vackralivClothing.name')}</h3>
                    <p className="text-gray-600 mb-2">{t('recommendations.products.vackralivClothing.description')}</p>
                    <p className="text-sm text-gray-500 mb-3">{t('recommendations.products.vackralivClothing.detail')}</p>
                    <a href="https://www.vackraliv.se/produkt-kategori/vl-news-be-you/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[var(--yoga-purple)] hover:text-[var(--yoga-purple)]/80 transition-colors">
                      {t('recommendations.products.vackralivClothing.link')}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Jewelry */}
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Gem className="w-8 h-8 text-amber-500" />
                  <h2 className="text-2xl font-bold text-gray-900">{t('recommendations.categories.jewelry')}</h2>
                </div>
                <div className="space-y-4">
                  <div className="border-l-4 border-amber-500 pl-4">
                    <h3 className="font-bold text-lg text-gray-900">{t('recommendations.products.mykarma.name')}</h3>
                    <p className="text-gray-600 mb-2">{t('recommendations.products.mykarma.description')}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{t('recommendations.products.mykarma.local')}</span>
                    </div>
                    <a href="https://www.mykarma.se/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[var(--yoga-purple)] hover:text-[var(--yoga-purple)]/80 transition-colors">
                      {t('recommendations.products.mykarma.link')}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Material Tips */}
              <div className="bg-gradient-to-br from-[var(--yoga-purple)]/10 to-[var(--yoga-cyan)]/10 rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t('recommendations.materials.title')}</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🎋</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{t('recommendations.materials.bamboo.name')}</h3>
                    <p className="text-sm text-gray-600">{t('recommendations.materials.bamboo.description')}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🐑</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{t('recommendations.materials.wool.name')}</h3>
                    <p className="text-sm text-gray-600">{t('recommendations.materials.wool.description')}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{t('recommendations.materials.avoid.name')}</h3>
                    <p className="text-sm text-gray-600">{t('recommendations.materials.avoid.description')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote Section */}
            <div className="mt-16 text-center">
              <blockquote className="text-2xl text-gray-600 italic">
                &quot;{t('recommendations.quote')}&quot;
              </blockquote>
              <p className="mt-4 text-gray-500">- {t('recommendations.team')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}