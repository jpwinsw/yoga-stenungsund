import { getTranslations } from 'next-intl/server'
import { getInstructors } from '@/lib/api/braincore-server'
import TeachersClient from './TeachersClient'
import type { Instructor } from '@/lib/types/braincore'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'teachers' })
  
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function TeachersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  let instructors: Instructor[] = []
  
  try {
    instructors = await getInstructors(locale)
  } catch (error) {
    console.error('Failed to fetch instructors:', error)
  }
  
  return <TeachersClient instructors={instructors} />
}