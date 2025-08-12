import { getTranslations } from 'next-intl/server'
import { locales } from '@/i18n'
import ContactClient from './ContactClient'
import { getCompanySettings } from '@/lib/api/company-settings'

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contact' })
  
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function ContactPage() {
  const companySettings = await getCompanySettings()
  
  return <ContactClient companySettings={companySettings || undefined} />
}