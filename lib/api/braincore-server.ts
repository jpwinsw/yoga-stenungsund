import { cache } from 'react'
import type {
  ScheduleSession,
  Service,
  Instructor,
  MembershipPlan
} from '@/lib/types/braincore'

const BRAINCORE_API = process.env.NEXT_PUBLIC_BRAINCORE_API || 'https://api.brain-core.ai'
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || '5'

async function fetchFromBraincore<T>(endpoint: string): Promise<T> {
  const url = `${BRAINCORE_API}${endpoint}`
  console.log('Fetching from brain-core (server):', url)
  
  const response = await fetch(url, {
    next: { revalidate: 300 }, // Cache for 5 minutes
    headers: {
      'Content-Type': 'application/json',
    }
  })
  
  if (!response.ok) {
    console.error(`Failed to fetch from brain-core: ${response.status} ${response.statusText}`)
    throw new Error(`Failed to fetch from brain-core: ${response.statusText}`)
  }
  
  const data = await response.json()
  console.log('Brain-core response:', data)
  return data
}

// Use React cache to dedupe requests during a single render
export const getSchedule = cache(async (startDate: string, endDate: string): Promise<ScheduleSession[]> => {
  const response = await fetchFromBraincore<{ sessions: ScheduleSession[] }>(
    `/public/urbe/schedule/${COMPANY_ID}?start_date=${startDate}&end_date=${endDate}`
  )
  return response.sessions || []
})

export const getServices = cache(async (): Promise<Service[]> => {
  return fetchFromBraincore(`/public/urbe/services/${COMPANY_ID}`)
})

export const getInstructors = cache(async (): Promise<Instructor[]> => {
  return fetchFromBraincore(`/public/urbe/instructors/${COMPANY_ID}`)
})

export const getMembershipPlans = cache(async (): Promise<MembershipPlan[]> => {
  return fetchFromBraincore(`/public/urbe/memberships/${COMPANY_ID}`)
})

// Get service by ID
export const getServiceById = cache(async (id: number): Promise<Service | undefined> => {
  const services = await getServices()
  return services.find(service => service.id === id)
})

// Get instructor by ID  
export const getInstructorById = cache(async (id: number): Promise<Instructor | undefined> => {
  const instructors = await getInstructors()
  return instructors.find(instructor => instructor.id === id)
})