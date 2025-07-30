import { getTranslations } from 'next-intl/server';
import { getMembershipPlans } from '@/lib/api/braincore-server';
import { locales } from '@/i18n';
import MembershipsClient from './MembershipsClient';
import type { MembershipPlan } from '@/lib/types/braincore';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'membership' })
  
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function MembershipPage() {
  let plans: MembershipPlan[] = []
  
  try {
    plans = await getMembershipPlans()
  } catch (error) {
    console.error('Failed to fetch membership plans:', error)
  }

  return <MembershipsClient plans={plans} />
}