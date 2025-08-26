'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Clock, 
  CheckCircle, 
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  Star,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function BeginnersClient() {
  const t = useTranslations('beginners')
  
  const whatToExpectSteps = [
    {
      icon: <Clock className="w-5 h-5" />,
      title: t('whatToExpect.firstClass.title'),
      description: t('whatToExpect.firstClass.description')
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: t('whatToExpect.during.title'),
      description: t('whatToExpect.during.description')
    },
    {
      icon: <Star className="w-5 h-5" />,
      title: t('whatToExpect.after.title'),
      description: t('whatToExpect.after.description')
    }
  ]
  
  const recommendedClasses = [
    {
      icon: <Sun className="w-6 h-6" />,
      title: t('recommendedClasses.hatha.title'),
      description: t('recommendedClasses.hatha.description'),
      link: '/schema?class=hatha'
    },
    {
      icon: <Moon className="w-6 h-6" />,
      title: t('recommendedClasses.yinYoga.title'),
      description: t('recommendedClasses.yinYoga.description'),
      link: '/schema?class=yin'
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: t('recommendedClasses.beginnerFlow.title'),
      description: t('recommendedClasses.beginnerFlow.description'),
      link: '/schema?class=beginner-flow'
    }
  ]
  
  const faqItems = [
    {
      question: t('faq.flexibility.question'),
      answer: t('faq.flexibility.answer')
    },
    {
      question: t('faq.comparison.question'),
      answer: t('faq.comparison.answer')
    },
    {
      question: t('faq.frequency.question'),
      answer: t('faq.frequency.answer')
    }
  ]

  return (
    <div className="pt-20 lg:pt-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--yoga-cream)] to-white">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--yoga-cyan)] rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--yoga-purple)] rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 lg:px-12 py-16 lg:py-24 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl lg:text-5xl font-light mb-6 text-gray-900">
              {t('title')}
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-8">
              {t('subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/schema">
                <Button size="lg" className="px-8 py-4 text-base">
                  {t('cta.buttons.schedule')}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/kontakt">
                <Button variant="outline" size="lg" className="px-8 py-4 text-base">
                  {t('cta.buttons.contact')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl lg:text-4xl font-light mb-6 text-gray-900"
            >
              {t('intro.title')}
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-gray-600 leading-relaxed"
            >
              {t('intro.description')}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* What to Expect Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-light mb-4 text-gray-900">
              {t('whatToExpect.title')}
            </h2>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {whatToExpectSteps.map((step, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--yoga-cyan)]/20 to-[var(--yoga-purple)]/20 rounded-full flex items-center justify-center mb-6 text-[var(--yoga-purple)]">
                  {step.icon}
                </div>
                <h3 className="text-xl font-medium mb-3 text-gray-900">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Preparation Section */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-light mb-4 text-gray-900">
              {t('preparation.title')}
            </h2>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-[var(--yoga-cream)] rounded-2xl p-8"
            >
              <h3 className="text-xl font-medium mb-6 text-gray-900">
                {t('preparation.whatToBring.title')}
              </h3>
              <ul className="space-y-3">
                {[0, 1, 2, 3].map((index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[var(--yoga-cyan)] mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      {t(`preparation.whatToBring.items.${index}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-[var(--yoga-sand)] rounded-2xl p-8"
            >
              <h3 className="text-xl font-medium mb-6 text-gray-900">
                {t('preparation.tips.title')}
              </h3>
              <ul className="space-y-3">
                {[0, 1, 2, 3].map((index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[var(--yoga-purple)] mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      {t(`preparation.tips.items.${index}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Recommended Classes Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-light mb-4 text-gray-900">
              {t('recommendedClasses.title')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('recommendedClasses.description')}
            </p>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {recommendedClasses.map((classType, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group"
              >
                <Link href="/schema" className="block">
                  <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 h-full group-hover:-translate-y-1">
                    <div className="w-14 h-14 bg-gradient-to-br from-[var(--yoga-cyan)] to-[var(--yoga-purple)] rounded-full flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
                      {classType.icon}
                    </div>
                    <h3 className="text-xl font-medium mb-3 text-gray-900 group-hover:text-[var(--yoga-purple)] transition-colors">
                      {classType.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{classType.description}</p>
                    <div className="flex items-center text-[var(--yoga-cyan)] group-hover:text-[var(--yoga-purple)] transition-colors">
                      <span className="text-sm font-medium">{t('cta.buttons.schedule')}</span>
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-light mb-12 text-center text-gray-900">
              {t('faq.title')}
            </h2>
            
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-white rounded-xl border border-gray-200 px-6 data-[state=open]:shadow-sm transition-all"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <span className="text-lg font-medium text-gray-900">
                      {item.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pb-6">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-[var(--yoga-cream)] to-[var(--yoga-sand)]">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="relative">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-6xl text-[var(--yoga-purple)]/20">
                &ldquo;
              </div>
              <blockquote className="text-xl lg:text-2xl font-light text-gray-800 italic mb-6 relative z-10">
                {t('testimonial.text')}
              </blockquote>
              <cite className="text-gray-600 not-italic">
                — {t('testimonial.author')}
              </cite>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trial Offer Section */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-[var(--yoga-cyan)] to-[var(--yoga-purple)] rounded-3xl p-12 lg:p-16 text-center text-white"
          >
            <h2 className="text-3xl lg:text-4xl font-light mb-4">
              {t('trialOffer.title')}
            </h2>
            <p className="text-2xl lg:text-3xl font-medium mb-2">
              {t('trialOffer.description')}
            </p>
            <p className="text-lg opacity-90 mb-8">
              {t('trialOffer.details')}
            </p>
            <Link href="/kontakt">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-[var(--yoga-purple)] hover:bg-gray-100 px-8 py-4 text-base font-medium"
              >
                {t('trialOffer.cta')}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-light mb-6 text-gray-900">
              {t('cta.title')}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {t('cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/schema">
                <Button size="lg" className="px-8 py-4 text-base">
                  {t('cta.buttons.schedule')}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/kontakt">
                <Button variant="outline" size="lg" className="px-8 py-4 text-base">
                  {t('cta.buttons.contact')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}