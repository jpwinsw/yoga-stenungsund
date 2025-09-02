'use client'

import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { ArrowRight, Calendar, Flower2, Wind, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { fadeInUp, staggerContainer } from '@/lib/animations';

interface HomeClientProps {
  companySettings?: {
    name?: string;
    tagline?: string;
    content?: {
      heroTitle?: string;
      heroSubtitle?: string;
      heroDescription?: string;
    };
  };
}

export default function HomeClient({ companySettings }: HomeClientProps) {
  const t = useTranslations('home');
  
  // Use company settings if available, otherwise fall back to translations
  const heroTitle = companySettings?.content?.heroTitle || t('hero.title');
  const heroSubtitle = companySettings?.content?.heroSubtitle || t('hero.subtitle');
  const companyName = companySettings?.name || 'Yoga Stenungsund';

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Clean and Modern */}
      <section className="relative min-h-[85vh] flex items-center">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left side - Content */}
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {/* Overline */}
              <motion.p 
                className="text-sm uppercase tracking-[0.2em] text-[var(--yoga-stone)] mb-4"
                variants={fadeInUp}
              >
                {companyName}
              </motion.p>
              
              {/* Main heading */}
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light leading-[1.1] mb-6"
                variants={fadeInUp}
              >
                <span className="text-gray-900">{heroTitle}</span>
              </motion.h1>
              
              {/* Subheading */}
              <motion.p 
                className="text-xl md:text-2xl text-gray-600 mb-10 font-light"
                variants={fadeInUp}
              >
                {heroSubtitle}
              </motion.p>
              
              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                variants={fadeInUp}
              >
                <Link href="/schema" className="inline-block">
                  <Button
                    size="lg"
                    className="px-8 py-4 text-base"
                  >
                    {t('hero.cta')}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/nyborjare" className="inline-block">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-4 text-base"
                  >
                    {t('hero.trial')}
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            
            {/* Right side - Image */}
            <motion.div 
              className="relative aspect-[4/5] lg:aspect-[3/4] lg:max-w-[500px] lg:ml-auto overflow-hidden"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 1, 
                ease: [0.25, 0.1, 0.25, 1],
                delay: 0.3 
              }}
            >
              <motion.div
                className="relative w-full h-full"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <motion.img
                  src="/start.png"
                  alt="Yoga Stenungsund"
                  className="w-full h-full object-cover"
                  initial={{ scale: 1.15 }}
                  animate={{ scale: 1.05 }}
                  transition={{ 
                    duration: 1.2,
                    ease: [0.25, 0.1, 0.25, 1],
                    delay: 0.4
                  }}
                />
                
                {/* Gradient fade edges */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Top fade */}
                  <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/40 to-transparent" />
                  {/* Bottom fade */}
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/40 to-transparent" />
                  {/* Left fade */}
                  <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white/40 to-transparent" />
                  {/* Right fade */}
                  <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white/40 to-transparent" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            className="grid md:grid-cols-2 gap-16 items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-light mb-6">
                  {t('features.title')}
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {t('features.description')}
                </p>
              </div>
              
              <div className="space-y-6">
                {[
                  { icon: Wind, key: 'feature1' },
                  { icon: Sun, key: 'feature2' },
                  { icon: Moon, key: 'feature3' },
                  { icon: Calendar, key: 'feature4' }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.key}
                    className="flex gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--yoga-cyan)]/10 flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-[var(--yoga-cyan)]" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">{t(`features.${feature.key}.title`)}</h3>
                      <p className="text-gray-600">{t(`features.${feature.key}.description`)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <motion.div
                className="aspect-square rounded-full overflow-hidden"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="w-full h-full bg-gradient-to-br from-[var(--yoga-sage)]/20 to-[var(--yoga-cyan)]/20" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-white to-[var(--yoga-cream)]/30">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-light mb-6">
              {t('cta.title')}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {t('cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/schema">
                <Button size="lg" className="px-8">
                  <Calendar className="mr-2 w-4 h-4" />
                  {t('cta.schedule')}
                </Button>
              </Link>
              <Link href="/nyborjare">
                <Button variant="outline" size="lg" className="px-8">
                  {t('cta.trial')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.blockquote
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <Flower2 className="w-8 h-8 text-[var(--yoga-sage)] mx-auto mb-6" />
            <p className="text-2xl md:text-3xl font-light italic text-gray-700 mb-4">
              {t('quote.text')}
            </p>
            <cite className="text-gray-500 not-italic">
              {t('quote.author')}
            </cite>
          </motion.blockquote>
        </div>
      </section>
    </div>
  );
}