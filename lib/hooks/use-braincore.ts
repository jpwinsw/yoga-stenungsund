import useSWR from 'swr'
import { braincore } from '@/lib/api/braincore'
import type {
  ScheduleSession,
  Service,
  Instructor,
  MembershipPlan
} from '@/lib/types/braincore'

export function useSchedule(startDate: string, endDate: string) {
  const { data, error, isLoading, mutate } = useSWR<ScheduleSession[]>(
    ['schedule', startDate, endDate],
    () => braincore.getSchedule(startDate, endDate),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 60000, // Refresh every minute
    }
  )

  return {
    schedule: data || [],
    isLoading,
    isError: error,
    mutate
  }
}

export function useServices() {
  const { data, error, isLoading, mutate } = useSWR<Service[]>(
    'services',
    () => braincore.getServices(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    services: data || [],
    isLoading,
    isError: error,
    mutate
  }
}

export function useInstructors() {
  const { data, error, isLoading, mutate } = useSWR<Instructor[]>(
    'instructors',
    () => braincore.getInstructors(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    instructors: data || [],
    isLoading,
    isError: error,
    mutate
  }
}

export function useMembershipPlans() {
  const { data, error, isLoading, mutate } = useSWR<MembershipPlan[]>(
    'membership-plans',
    () => braincore.getMembershipPlans(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    membershipPlans: data || [],
    isLoading,
    isError: error,
    mutate
  }
}