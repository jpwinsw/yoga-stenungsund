import { getTranslations } from 'next-intl/server'
import { getSchedule } from '@/lib/api/braincore-server'
import { getWeekDates } from '@/lib/utils/date'
import ScheduleClient from '@/components/schedule/ScheduleClient'
import type { ScheduleSession } from '@/lib/types/braincore'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'schedule' })
  
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function SchedulePage() {
  const t = await getTranslations('schedule')
  
  // Get current week dates for initial data
  const { start, end } = getWeekDates(new Date())
  
  let initialSchedule: ScheduleSession[] = []
  let error = null
  
  try {
    const data = await getSchedule(start, end)
    // Ensure we have an array
    initialSchedule = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Failed to fetch initial schedule:', e)
    error = true
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">{t('title')}</h1>
      
      <ScheduleClient 
        initialSchedule={initialSchedule}
        initialError={error}
        translations={{
          previousWeek: t('previousWeek'),
          nextWeek: t('nextWeek'),
          week: t('week'),
          today: t('today'),
          loading: t('loading'),
          error: t('error'),
          noClasses: t('noClasses'),
          cancelled: t('cancelled'),
          fullyBooked: t('fullyBooked'),
          bookClass: t('bookClass'),
          spotsAvailable: t('spotsAvailable'),
        }}
      />
    </div>
  )
}