'use client'

import { useState } from 'react'
import { useSchedule } from '@/lib/hooks/use-braincore'
import { getWeekDates, getWeekDays, formatDate, formatTime, isSameDay } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react'
import type { ScheduleSession } from '@/lib/types/braincore'

interface ScheduleClientProps {
  initialSchedule: ScheduleSession[]
  initialError: boolean | null
  translations: {
    previousWeek: string
    nextWeek: string
    week: string
    today: string
    loading: string
    error: string
    noClasses: string
    cancelled: string
    fullyBooked: string
    bookClass: string
    spotsAvailable: string
  }
}

export default function ScheduleClient({ 
  initialSchedule, 
  initialError,
  translations: t 
}: ScheduleClientProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const { start, end, startDate } = getWeekDates(currentWeek)
  
  // Use SWR with initial data for client-side updates
  const { schedule, isLoading, isError } = useSchedule(start, end)
  
  // Use initial data if available, otherwise use SWR data
  const displaySchedule = schedule || initialSchedule
  const hasError = isError || initialError
  
  const weekDays = getWeekDays(startDate)
  
  const previousWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentWeek(newDate)
  }
  
  const nextWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentWeek(newDate)
  }
  
  const goToToday = () => {
    setCurrentWeek(new Date())
  }
  
  const getSessionsForDay = (date: Date): ScheduleSession[] => {
    if (!displaySchedule) return []
    // Ensure displaySchedule is an array
    const scheduleArray = Array.isArray(displaySchedule) ? displaySchedule : []
    return scheduleArray.filter(session => isSameDay(session.start_time, date))
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  }
  
  if (hasError) {
    return (
      <div className="text-center">
        <p className="text-red-600">{t.error}</p>
      </div>
    )
  }
  
  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={previousWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={t.previousWeek}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold">
              {formatDate(startDate, 'MMMM yyyy')}
            </h2>
            <p className="text-sm text-gray-600">
              {t.week} {formatDate(startDate, 'w')}
            </p>
          </div>
          
          <button
            onClick={nextWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={t.nextWeek}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="text-center">
          <button
            onClick={goToToday}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            {t.today}
          </button>
        </div>
      </div>
      
      {isLoading && !displaySchedule ? (
        <div className="text-center py-12">
          <p className="text-gray-600">{t.loading}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDays.map((day, index) => {
            const sessions = getSessionsForDay(day)
            const isToday = isSameDay(day, new Date())
            
            return (
              <div
                key={index}
                className={cn(
                  "border rounded-lg p-4",
                  isToday && "border-blue-500 bg-blue-50"
                )}
              >
                <div className="mb-3">
                  <h3 className="font-semibold text-center">
                    {formatDate(day, 'EEEE')}
                  </h3>
                  <p className="text-sm text-gray-600 text-center">
                    {formatDate(day, 'd MMM')}
                  </p>
                </div>
                
                <div className="space-y-2">
                  {sessions.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      {t.noClasses}
                    </p>
                  ) : (
                    sessions.map((session) => (
                      <SessionCard 
                        key={session.id} 
                        session={session} 
                        translations={t}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

interface SessionCardProps {
  session: ScheduleSession
  translations: {
    cancelled: string
    fullyBooked: string
    bookClass: string
    spotsAvailable: string
  }
}

function SessionCard({ session, translations: t }: SessionCardProps) {
  const isFullyBooked = session.status === 'full' || session.available_spots === 0
  const isCancelled = session.status === 'cancelled'
  
  // Use available_spots from the API
  const availableSpots = session.available_spots
  
  const showAvailability = availableSpots > 0 && availableSpots <= 3
  
  return (
    <div
      className={cn(
        "p-3 rounded-md border transition-all hover:shadow-md cursor-pointer",
        isCancelled && "opacity-50 bg-gray-100",
        isFullyBooked && "bg-orange-50 border-orange-300",
        !isCancelled && !isFullyBooked && "bg-white hover:border-blue-300"
      )}
    >
      <div className="mb-1">
        <h4 className={cn(
          "font-medium text-sm",
          isCancelled && "line-through"
        )}>
          {session.title || session.service_template_name}
        </h4>
        <p className="text-xs text-gray-600">{session.instructor_name}</p>
      </div>
      
      <div className="space-y-1 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{formatTime(session.start_time)} - {formatTime(session.end_time)}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>{session.resource_name}</span>
        </div>
      </div>
      
      {isCancelled ? (
        <p className="text-xs text-red-600 mt-2">{t.cancelled}</p>
      ) : isFullyBooked ? (
        <p className="text-xs text-orange-600 mt-2 font-medium">{t.fullyBooked}</p>
      ) : (
        <>
          {showAvailability && (
            <p className="text-xs text-orange-600 mt-1">
              {availableSpots} {t.spotsAvailable}
            </p>
          )}
          <button className="text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium">
            {t.bookClass}
          </button>
        </>
      )}
    </div>
  )
}