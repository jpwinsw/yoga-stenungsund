import { notFound } from 'next/navigation'
import { Locale, locales } from '@/i18n'
import { getTranslations } from 'next-intl/server'
import BookingLookupClient from './BookingLookupClient'

interface BookingLookupPageProps {
  params: Promise<{
    locale: Locale
  }>
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: BookingLookupPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'bookingLookup' })
  
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function BookingLookupPage({ params }: BookingLookupPageProps) {
  const { locale } = await params
  if (!locales.includes(locale)) {
    notFound()
  }

  return <BookingLookupClient locale={locale} />
}