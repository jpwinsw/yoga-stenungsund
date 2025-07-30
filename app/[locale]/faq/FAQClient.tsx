'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/button'

export default function FAQClient() {
  const t = useTranslations('faq')
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id)
    } else {
      newOpenItems.add(id)
    }
    setOpenItems(newOpenItems)
  }

  const categories = ['general', 'booking', 'pricing', 'studio']

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

      {/* FAQ Categories */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          {categories.map((category, categoryIndex) => {
            const questions = t.raw(`categories.${category}.questions`) as Array<{
              question: string
              answer: string
            }>
            
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                className="mb-12"
              >
                <h2 className="text-2xl font-light text-gray-900 mb-6">
                  {t(`categories.${category}.title`)}
                </h2>
                
                <div className="space-y-4">
                  {questions.map((item, index) => {
                    const itemId = `${category}-${index}`
                    const isOpen = openItems.has(itemId)
                    
                    return (
                      <div
                        key={itemId}
                        className="bg-white rounded-lg shadow-sm overflow-hidden"
                      >
                        <button
                          onClick={() => toggleItem(itemId)}
                          className="w-full px-6 py-4 text-left flex items-start justify-between hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-gray-900 font-medium pr-4">
                            {item.question}
                          </span>
                          <motion.svg
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </motion.svg>
                        </button>
                        
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-4 text-gray-600">
                                {item.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-[var(--yoga-cream)] py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-light text-gray-900 mb-4">{t('contact.title')}</h2>
            <p className="text-lg text-gray-700 mb-8">{t('contact.description')}</p>
            <Link href="/kontakt">
              <Button 
                size="lg"
                className="bg-[var(--yoga-sage)] hover:bg-[var(--yoga-deep-sage)] text-white"
              >
                {t('contact.button')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}