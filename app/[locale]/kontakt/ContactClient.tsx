'use client'

import { useTranslations } from 'next-intl'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import { Card } from '@/components/ui/card'

interface ContactClientProps {
  companySettings?: {
    name?: string
    contact?: {
      phone?: string
      email?: string
      address?: string
      address2?: string
      city?: string
      zipCode?: string
      country?: string
    }
    social?: {
      facebook?: string
      instagram?: string
      youtube?: string
    }
    openingHours?: {
      monday?: { open?: string; close?: string }
      tuesday?: { open?: string; close?: string }
      wednesday?: { open?: string; close?: string }
      thursday?: { open?: string; close?: string }
      friday?: { open?: string; close?: string }
      saturday?: { open?: string; close?: string }
      sunday?: { open?: string; close?: string }
    }
  }
}

export default function ContactClient({ companySettings }: ContactClientProps) {
  const t = useTranslations('contact')
  
  // Use company settings or fallback values
  const contact = companySettings?.contact || {}
  const social = companySettings?.social || {}
  
  // Default values for Yoga Stenungsund - Selins väg 5, Stora Höga
  const phone = contact.phone || '+46 303 123 45'
  const email = contact.email || 'info@yogastenungsund.se'
  const address = contact.address || 'Selins väg 5'
  const city = contact.city || 'Stora Höga'
  const zipCode = contact.zipCode || '444 94'
  
  // Generate Google Maps embed URL using coordinates or address
  const mapQuery = encodeURIComponent(`${address}, ${zipCode} ${city}, Sweden`)
  const mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${mapQuery}&zoom=15`
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[var(--yoga-cream)]/30">
      {/* Hero Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="text-center mb-16"
          >
            <motion.h1 
              className="text-4xl md:text-5xl font-light mb-6"
              variants={fadeInUp}
            >
              {t('title')}
            </motion.h1>
            <motion.p 
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              {t('subtitle')}
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 h-full">
                <h2 className="text-2xl font-light mb-8">{t('contactInfo')}</h2>
                
                <div className="space-y-6">
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-[var(--yoga-cyan)] mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1">{t('visitUs')}</p>
                      <p className="text-gray-600">
                        {address}<br />
                        {zipCode} {city}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <Phone className="w-5 h-5 text-[var(--yoga-cyan)] mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1">{t('callUs')}</p>
                      <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-gray-600 hover:text-[var(--yoga-cyan)] transition-colors">
                        {phone}
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <Mail className="w-5 h-5 text-[var(--yoga-cyan)] mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-1">{t('emailUs')}</p>
                      <a href={`mailto:${email}`} className="text-gray-600 hover:text-[var(--yoga-cyan)] transition-colors">
                        {email}
                      </a>
                    </div>
                  </div>

                  {/* Opening Hours */}
                  <div className="flex items-start gap-4">
                    <Clock className="w-5 h-5 text-[var(--yoga-cyan)] mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium mb-2">{t('openingHours')}</p>
                      <div className="text-gray-600 space-y-1">
                        {companySettings?.openingHours ? (
                          <>
                            {companySettings.openingHours.monday?.open && (
                              <p>{t('days.monday')}: {companySettings.openingHours.monday.open} - {companySettings.openingHours.monday.close}</p>
                            )}
                            {companySettings.openingHours.tuesday?.open && (
                              <p>{t('days.tuesday')}: {companySettings.openingHours.tuesday.open} - {companySettings.openingHours.tuesday.close}</p>
                            )}
                            {companySettings.openingHours.wednesday?.open && (
                              <p>{t('days.wednesday')}: {companySettings.openingHours.wednesday.open} - {companySettings.openingHours.wednesday.close}</p>
                            )}
                            {companySettings.openingHours.thursday?.open && (
                              <p>{t('days.thursday')}: {companySettings.openingHours.thursday.open} - {companySettings.openingHours.thursday.close}</p>
                            )}
                            {companySettings.openingHours.friday?.open && (
                              <p>{t('days.friday')}: {companySettings.openingHours.friday.open} - {companySettings.openingHours.friday.close}</p>
                            )}
                            {companySettings.openingHours.saturday?.open && (
                              <p>{t('days.saturday')}: {companySettings.openingHours.saturday.open} - {companySettings.openingHours.saturday.close}</p>
                            )}
                            {companySettings.openingHours.sunday?.open && (
                              <p>{t('days.sunday')}: {companySettings.openingHours.sunday.open} - {companySettings.openingHours.sunday.close}</p>
                            )}
                          </>
                        ) : (
                          <>
                            <p>{t('weekdays')}: 06:00 - 21:00</p>
                            <p>{t('saturday')}: 08:00 - 17:00</p>
                            <p>{t('sunday')}: 09:00 - 16:00</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Social Media */}
                  {(social.facebook || social.instagram || social.youtube) && (
                    <div className="pt-6 border-t">
                      <p className="font-medium mb-4">{t('followUs')}</p>
                      <div className="flex gap-4">
                        {social.facebook && (
                          <a 
                            href={social.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[var(--yoga-cyan)]/10 transition-colors"
                            aria-label="Facebook"
                          >
                            <FaFacebook className="w-5 h-5" />
                          </a>
                        )}
                        {social.instagram && (
                          <a 
                            href={social.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[var(--yoga-cyan)]/10 transition-colors"
                            aria-label="Instagram"
                          >
                            <FaInstagram className="w-5 h-5" />
                          </a>
                        )}
                        {social.youtube && (
                          <a 
                            href={social.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[var(--yoga-cyan)]/10 transition-colors"
                            aria-label="YouTube"
                          >
                            <FaYoutube className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 h-full">
                <h2 className="text-2xl font-light mb-8">{t('sendMessage')}</h2>
                
                <form className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      {t('form.name')}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--yoga-cyan)] focus:border-transparent"
                      placeholder={t('form.namePlaceholder')}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      {t('form.email')}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--yoga-cyan)] focus:border-transparent"
                      placeholder={t('form.emailPlaceholder')}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2">
                      {t('form.phone')}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--yoga-cyan)] focus:border-transparent"
                      placeholder={t('form.phonePlaceholder')}
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                      {t('form.subject')}
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--yoga-cyan)] focus:border-transparent"
                    >
                      <option value="">{t('form.selectSubject')}</option>
                      <option value="general">{t('form.subjects.general')}</option>
                      <option value="membership">{t('form.subjects.membership')}</option>
                      <option value="classes">{t('form.subjects.classes')}</option>
                      <option value="private">{t('form.subjects.private')}</option>
                      <option value="corporate">{t('form.subjects.corporate')}</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      {t('form.message')}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--yoga-cyan)] focus:border-transparent resize-none"
                      placeholder={t('form.messagePlaceholder')}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-6 text-white bg-[var(--yoga-cyan)] rounded-lg hover:bg-[var(--yoga-cyan)]/90 transition-colors"
                  >
                    {t('form.send')}
                  </button>
                </form>
              </Card>
            </motion.div>
          </div>

          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16"
          >
            <Card className="p-2 overflow-hidden">
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Yoga Stenungsund Location"
                className="rounded-lg"
              />
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  )
}