'use client'

import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { ArrowRight, Calendar, Flower2, Wind, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { fadeInUp, staggerContainer } from '@/lib/animations';

export default function Home() {
  const t = useTranslations('home');

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Refined and Minimal */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          {/* Subtle gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-[var(--yoga-cream)]/30 to-white" />
          
          {/* Organic shape decoration */}
          <motion.div
            className="absolute -top-40 -right-40 w-[600px] h-[600px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[var(--yoga-cyan)]/5 to-transparent blur-3xl" />
          </motion.div>
          
          {/* Zen circle decoration */}
          <motion.div
            className="absolute bottom-20 left-20 w-32 h-32"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div className="w-full h-full rounded-full border-2 border-[var(--yoga-stone)]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--yoga-cyan)] rounded-full" />
          </motion.div>
        </div>
        
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div 
            className="max-w-4xl"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* Overline */}
            <motion.p 
              className="text-sm uppercase tracking-[0.2em] text-[var(--yoga-stone)] mb-6"
              variants={fadeInUp}
            >
              Yoga Stenungsund
            </motion.p>
            
            {/* Main heading */}
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-light leading-[1.1] mb-8"
              variants={fadeInUp}
            >
              <span className="text-gray-900">{t('hero.title')}</span>
            </motion.h1>
            
            {/* Subheading */}
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 mb-12 font-light max-w-2xl"
              variants={fadeInUp}
            >
              {t('hero.subtitle')}
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
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-light mb-6 text-gray-900">
                {t('intro.title')}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                {t('intro.description')}
              </p>
              
              {/* Feature list */}
              <div className="space-y-4">
                {Object.entries(t.raw('intro.features')).map(([key, feature], index) => {
                  const icons = [Flower2, Wind, Sun, Moon];
                  const Icon = icons[index % icons.length];
                  
                  return (
                    <motion.div 
                      key={key}
                      className="flex gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className="w-12 h-12 rounded-full bg-[var(--yoga-cream)] flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-[var(--yoga-stone)]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">
                          {(feature as { title: string; description: string }).title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {(feature as { title: string; description: string }).description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
            
            {/* Right visual */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {/* Placeholder for image or abstract visual */}
              <div className="aspect-[4/5] bg-gradient-to-br from-[var(--yoga-cream)] to-[var(--yoga-sand)] rounded-3xl relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 rounded-full border-2 border-[var(--yoga-stone)]/20">
                    <div className="w-full h-full flex items-center justify-center">
                      <Flower2 className="w-32 h-32 text-[var(--yoga-stone)]/20" />
                    </div>
                  </div>
                </div>
                {/* Decorative dots */}
                <div className="absolute top-8 right-8 w-2 h-2 bg-[var(--yoga-cyan)] rounded-full" />
                <div className="absolute top-16 right-12 w-2 h-2 bg-[var(--yoga-purple)] rounded-full" />
                <div className="absolute bottom-8 left-8 w-2 h-2 bg-[var(--yoga-pink)] rounded-full" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section - Clean and Minimal */}
      <section className="py-20 lg:py-32 bg-[var(--yoga-cream)]">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-light mb-6 text-gray-900">
              {t('cta.title')}
            </h2>
            <p className="text-lg text-gray-600 mb-12">
              {t('cta.description')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/schema" className="inline-block">
                <Button
                  size="lg"
                  className="px-8 py-4"
                >
                  <Calendar className="mr-2 w-4 h-4" />
                  {t('cta.button')}
                </Button>
              </Link>
              <Link href="/nyborjare" className="inline-block">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4"
                >
                  {t('cta.trial')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Quote Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.blockquote 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <p className="text-2xl md:text-3xl font-light text-gray-700 italic leading-relaxed mb-6">
              &ldquo;{t('quote.text')}&rdquo;
            </p>
            <cite className="text-sm text-gray-500 not-italic">— {t('quote.author')}</cite>
          </motion.blockquote>
        </div>
      </section>
    </div>
  );
}