import { getTranslations } from 'next-intl/server'
import { getServices, getSchedule } from '@/lib/api/braincore-server'
import type { Service } from '@/lib/types/braincore'
import ClassesClient from './ClassesClient'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'classes' })
  
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function ClassesPage() {
  let services: Service[] = []
  const classInstructors: Record<string, string[]> = {}
  
  try {
    services = await getServices()
    
    // Fetch schedule from today to one year ahead to get all instructors
    const today = new Date()
    const oneYearLater = new Date(today)
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1)
    
    const schedule = await getSchedule(
      today.toISOString().split('T')[0],
      oneYearLater.toISOString().split('T')[0]
    )
    
    // Aggregate instructors by service/class name
    schedule.forEach(session => {
      if (session.instructor_name && session.service_template_name) {
        const serviceName = session.service_template_name
        
        if (!classInstructors[serviceName]) {
          classInstructors[serviceName] = []
        }
        if (!classInstructors[serviceName].includes(session.instructor_name)) {
          classInstructors[serviceName].push(session.instructor_name)
        }
      }
    })
  } catch (error) {
    console.error('Failed to fetch data:', error)
  }
  
  return <ClassesClient initialServices={services} classInstructors={classInstructors} />
}