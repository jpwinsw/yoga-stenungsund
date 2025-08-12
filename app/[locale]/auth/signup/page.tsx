import { notFound } from 'next/navigation'
import { Locale, locales } from '@/i18n'
import { getTranslations } from 'next-intl/server'
import SignupPageClient from './SignupPageClient'

interface SignupPageProps {
  params: Promise<{
    locale: Locale
  }>
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: SignupPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'member.auth.signup' })
  
  return {
    title: t('title'),
    description: t('title'),
  }
}

export default async function SignupPage({ params }: SignupPageProps) {
  const { locale } = await params
  if (!locales.includes(locale)) {
    notFound()
  }

  return <SignupPageClient locale={locale} />
}