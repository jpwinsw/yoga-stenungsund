import { getTranslations } from 'next-intl/server'
import { getSchedule } from '@/lib/api/braincore-server'
import { getWeekDates } from '@/lib/utils/date'
import ScheduleClientV2 from '@/components/schedule/ScheduleClientV2'
import type { ScheduleSession } from '@/lib/types/braincore'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'schema' })
  
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ class?: string }> }) {
  const t = await getTranslations('schema')
  const params = await searchParams
  
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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold gradient-yoga-text mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-600">
            {t('metaDescription')}
          </p>
        </div>
        
        <ScheduleClientV2 
          initialSchedule={initialSchedule}
          initialError={error}
          classFilter={params.class}
        />
      </div>
    </div>
  )
}