import { getTranslations } from 'next-intl/server'
import { locales } from '@/i18n'
import FAQClient from './FAQClient'

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'faq' })
  
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function FAQPage() {
  return <FAQClient />
}