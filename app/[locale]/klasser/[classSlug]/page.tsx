import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { getServices, getSchedule } from '@/lib/api/braincore-server'
import type { Service, ScheduleSession } from '@/lib/types/braincore'
import { locales } from '@/i18n'
import ClassDetailClient from './ClassDetailClient'

// Utility function to create URL-friendly slugs from service names
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export async function generateStaticParams() {
  try {
    // Get all services from the backend
    const services = await getServices()
    const params: { locale: string; classSlug: string }[] = []
    
    // Generate params for each service and locale combination
    services.forEach(service => {
      const slug = createSlug(service.name)
      if (slug) {
        locales.forEach(locale => {
          params.push({ locale, classSlug: slug })
        })
      }
    })
    
    return params
  } catch (error) {
    console.error('Failed to generate static params for class pages:', error)
    return []
  }
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string; classSlug: string }> 
}) {
  const { locale, classSlug } = await params
  
  try {
    // Find the service that matches this slug
    const services = await getServices(locale)
    const matchedService = services.find(service => 
      createSlug(service.name) === classSlug
    )
    
    if (!matchedService) {
      return {
        title: 'Class Not Found - Yoga Stenungsund'
      }
    }
    
    const className = matchedService.name
    const classDescription = matchedService.description || ''
    
    // Get base URL based on locale
    const baseUrl = locale === 'en' ? 'https://yogastenungsund.se/en/classes' : 'https://yogastenungsund.se/klasser'
    
    return {
      title: `${className} - Yoga Stenungsund`,
      description: classDescription,
      openGraph: {
        title: `${className} - Yoga Stenungsund`,
        description: classDescription,
        type: 'website',
        url: `${baseUrl}/${classSlug}`,
        siteName: 'Yoga Stenungsund',
        images: [
          {
            url: matchedService.image_url || 'https://yogastenungsund.se/yoga_poses/yin_yoga_pose.jpg',
            width: 1200,
            height: 630,
            alt: className
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title: `${className} - Yoga Stenungsund`,
        description: classDescription,
        images: [matchedService.image_url || 'https://yogastenungsund.se/yoga_poses/yin_yoga_pose.jpg']
      }
    }
  } catch (error) {
    console.error('Failed to generate metadata for class page:', error)
    return {
      title: 'Class - Yoga Stenungsund'
    }
  }
}

export default async function ClassDetailPage({ 
  params 
}: { 
  params: Promise<{ locale: string; classSlug: string }> 
}) {
  const { locale, classSlug } = await params
  
  let services: Service[] = []
  let matchedService: Service | null = null
  let relatedSchedule: ScheduleSession[] = []
  
  try {
    // Fetch all services
    services = await getServices(locale)
    
    // Find the service that matches this slug
    matchedService = services.find(service => 
      createSlug(service.name) === classSlug
    ) || null
    
    if (!matchedService) {
      notFound()
    }
    
    // Get related schedule for the next 3 months
    const today = new Date()
    const threeMonthsLater = new Date(today)
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3)
    
    const schedule = await getSchedule(
      today.toISOString().split('T')[0],
      threeMonthsLater.toISOString().split('T')[0],
      locale
    )
    
    // Filter schedule to only include sessions for this specific service
    relatedSchedule = schedule.filter(session => 
      session.service_template_name === matchedService?.name ||
      session.service_template_id === matchedService?.id
    )
    
  } catch (error) {
    console.error('Failed to fetch class data:', error)
    notFound()
  }
  
  // Get translations for the client component
  const t = await getTranslations({ locale, namespace: 'klasser' })
  const tCommon = await getTranslations({ locale, namespace: 'common' })
  
  // Prepare translations object to pass to client
  const translations = {
    intensity: t('intensity'),
    instructors: t('instructors'),
    readMore: t('readMore'),
    viewSchedule: t('viewSchedule'),
    levels: {
      beginner: t('levels.beginner'),
      intermediate: t('levels.intermediate'),
      advanced: t('levels.advanced'),
      all: t('levels.all')
    },
    nav: {
      home: tCommon('navigation.home')
    }
  }
  
  return (
    <ClassDetailClient 
      service={matchedService}
      relatedSchedule={relatedSchedule}
      locale={locale}
      translations={translations}
    />
  )
}