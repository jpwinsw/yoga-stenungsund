import { getTranslations } from 'next-intl/server'
import { locales } from '@/lib/i18n/navigation'
import BeginnersClient from './BeginnersClient'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'beginners' })
  
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function BeginnersPage() {
  return <BeginnersClient />
}