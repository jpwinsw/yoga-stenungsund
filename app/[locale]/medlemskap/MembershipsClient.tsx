'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Link } from '@/lib/i18n/navigation'
import { MembershipPlan } from '@/lib/types/braincore'
import MembershipCard from '@/components/membership/MembershipCard'
import TermMembershipCard from '@/components/membership/TermMembershipCard'
import { Check, Sparkles, AlertCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface MembershipsClientProps {
  plans: MembershipPlan[]
}

export default function MembershipsClient({ plans }: MembershipsClientProps) {
  const t = useTranslations('membership')
  const searchParams = useSearchParams()
  const canceled = searchParams?.get('canceled')

  // Sort plans by price
  const sortedPlans = [...plans].sort((a, b) => a.price - b.price)

  return (
    <main className="min-h-screen bg-[var(--yoga-paper)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[var(--yoga-light-sage)] to-[var(--yoga-paper)] pt-32 pb-20">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl font-light text-gray-900 mb-6">{t('title')}</h1>
            <p className="text-xl text-gray-700">{t('description')}</p>
            
            {/* Show canceled payment message */}
            {canceled && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-6"
              >
                <Alert className="max-w-md mx-auto border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    {t('paymentCanceled')}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Membership Plans */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {sortedPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                {/* Popular badge */}
                {index === 1 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-[var(--yoga-cyan)] text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      {t('popular')}
                    </div>
                  </div>
                )}
                
                <div className={`h-full ${index === 1 ? 'ring-2 ring-[var(--yoga-cyan)] ring-opacity-50' : ''}`}>
                  {plan.is_term_based ? (
                    <TermMembershipCard plan={plan} featured={index === 1} />
                  ) : (
                    <MembershipCard plan={plan} featured={index === 1} />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-light text-gray-900 text-center mb-12">
              {t('benefits.title')}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {[
                'benefits.freeWorkshops',
                'benefits.priorityBooking',
                'benefits.memberEvents',
                'benefits.guestPasses',
                'benefits.studioDiscounts'
              ].map((key, index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-[var(--yoga-sage)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-[var(--yoga-sage)]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {t(`${key}.title`)}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {t(`${key}.description`)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl font-light text-gray-900 mb-6">
              {t('faq.title')}
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              {t('faq.description')}
            </p>
            <Link 
              href="/faq" 
              className="inline-flex items-center text-[var(--yoga-sage)] hover:text-[var(--yoga-sage)]/80 font-medium transition-colors"
            >
              {t('faq.link')} →
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}