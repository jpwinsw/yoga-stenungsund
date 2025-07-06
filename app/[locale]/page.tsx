import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';

export default function Home() {
  const t = useTranslations('home');

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            {t('hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-2">
            {t('hero.subtitle')}
          </p>
          <p className="text-lg text-gray-600 mb-4 max-w-2xl mx-auto">
            {t('hero.description')}
          </p>
          <p className="text-xl italic text-purple-700 mb-8 max-w-2xl mx-auto">
            {t('hero.tagline')}
          </p>
          <Link
            href="/klasser"
            className="inline-block bg-purple-600 text-white px-8 py-3 rounded-full font-medium hover:bg-purple-700 transition-colors"
          >
            {t('hero.cta')}
          </Link>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            {t('intro.title')}
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            {t('intro.description')}
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Object.entries(t.raw('intro.features')).map(([key, feature]) => (
              <div key={key} className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">{(feature as { title: string; description: string }).title}</h3>
                <p className="text-gray-600">{(feature as { title: string; description: string }).description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-purple-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {t('cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/schema"
              className="inline-block bg-purple-600 text-white px-8 py-3 rounded-full font-medium hover:bg-purple-700 transition-colors"
            >
              {t('cta.button')}
            </Link>
            <Link
              href="/nyborjare"
              className="inline-block bg-white text-purple-600 px-8 py-3 rounded-full font-medium border-2 border-purple-600 hover:bg-purple-50 transition-colors"
            >
              {t('cta.trial')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}