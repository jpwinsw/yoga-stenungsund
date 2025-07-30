'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/button'

export default function AboutClient() {
  const t = useTranslations('about')

  const values = [
    { key: 'community', icon: '🤝' },
    { key: 'authenticity', icon: '🧘' },
    { key: 'growth', icon: '🌱' },
    { key: 'mindfulness', icon: '🕉️' }
  ]

  return (
    <main className="min-h-screen bg-[var(--yoga-paper)]">
      {/* Hero Section */}
      <section className="bg-[var(--yoga-light-sage)] py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl font-light text-gray-900 mb-4">{t('title')}</h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">{t('subtitle')}</p>
          </motion.div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-light text-gray-900 mb-6">{t('intro.title')}</h2>
            <p className="text-lg text-gray-700 leading-relaxed">{t('intro.description')}</p>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl font-light text-gray-900 text-center mb-12"
          >
            {t('values.title')}
          </motion.h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {t(`values.${value.key}.title`)}
                </h3>
                <p className="text-gray-600">
                  {t(`values.${value.key}.description`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Studio Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-light text-gray-900 mb-6">{t('studio.title')}</h2>
              <p className="text-lg text-gray-700 mb-6">{t('studio.description')}</p>
              <ul className="space-y-3">
                {(t.raw('studio.features') as string[]).map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-[var(--yoga-cyan)] mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative h-96 bg-[var(--yoga-cream)] rounded-lg overflow-hidden"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-32 h-32 text-[var(--yoga-sage)] opacity-20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M15,12L10,12V11C10,9.34 11.34,8 13,8C14.66,8 16,9.34 16,11V12C16,12.55 15.55,13 15,13M11,15C11,13.34 12.34,12 14,12C15.66,12 17,13.34 17,15V16C17,17.66 15.66,19 14,19C12.34,19 11,17.66 11,16V15Z"/>
                </svg>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="bg-[var(--yoga-light-sage)] py-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-light text-gray-900 mb-6">{t('journey.title')}</h2>
            <p className="text-lg text-gray-700">{t('journey.description')}</p>
          </motion.div>
          
          <div className="space-y-6">
            {(t.raw('journey.milestones') as string[]).map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center"
              >
                <div className="w-4 h-4 bg-[var(--yoga-cyan)] rounded-full mr-4 flex-shrink-0" />
                <p className="text-gray-700">{milestone}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-light text-gray-900 mb-4">{t('cta.title')}</h2>
            <p className="text-lg text-gray-700 mb-8">{t('cta.description')}</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/larare">
                <Button 
                  size="lg"
                  className="bg-[var(--yoga-sage)] hover:bg-[var(--yoga-deep-sage)] text-white"
                >
                  {t('cta.buttons.teachers')}
                </Button>
              </Link>
              <Link href="/schema">
                <Button 
                  size="lg"
                  variant="outline"
                >
                  {t('cta.buttons.schedule')}
                </Button>
              </Link>
              <Link href="/kontakt">
                <Button 
                  size="lg"
                  variant="outline"
                >
                  {t('cta.buttons.contact')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}