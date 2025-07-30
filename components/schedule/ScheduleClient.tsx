'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { useSchedule } from '@/lib/hooks/use-braincore'
import { getWeekDates, getWeekDays, formatDate, formatTime, isSameDay } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react'
import type { ScheduleSession } from '@/lib/types/braincore'
import BookingModal from '@/components/booking/BookingModal'
import { staggerContainer, staggerItem } from '@/lib/animations'

interface ScheduleClientProps {
  initialSchedule: ScheduleSession[]
  initialError: boolean | null
}

export default function ScheduleClient({ 
  initialSchedule, 
  initialError
}: ScheduleClientProps) {
  const t = useTranslations('schema')
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedSession, setSelectedSession] = useState<ScheduleSession | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const { start, end, startDate } = getWeekDates(currentWeek)
  
  // Use SWR with initial data for client-side updates
  const { schedule, isLoading, isError, mutate } = useSchedule(start, end)
  
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
  
  const handleBookingClick = (session: ScheduleSession) => {
    setSelectedSession(session)
    setIsBookingModalOpen(true)
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
        <p className="text-red-600">{t('error')}</p>
      </div>
    )
  }
  
  return (
    <>
      {selectedSession && (
        <BookingModal
          session={selectedSession}
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false)
            setSelectedSession(null)
          }}
          onBookingSuccess={() => {
            // Refresh the schedule to show updated booking status
            mutate()
          }}
        />
      )}
      
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <motion.button
            onClick={previousWeek}
            className="p-3 hover:bg-[var(--yoga-cream)] rounded-xl transition-all group"
            aria-label={t('previousWeek')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="w-5 h-5 text-[var(--yoga-stone)] group-hover:text-[var(--yoga-cyan)] transition-colors" />
          </motion.button>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {formatDate(startDate, 'MMMM yyyy')}
            </h2>
            <p className="text-sm text-[var(--yoga-stone)]">
              {t('week')} {formatDate(startDate, 'w')}
            </p>
          </div>
          
          <motion.button
            onClick={nextWeek}
            className="p-3 hover:bg-[var(--yoga-cream)] rounded-xl transition-all group"
            aria-label={t('nextWeek')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight className="w-5 h-5 text-[var(--yoga-stone)] group-hover:text-[var(--yoga-cyan)] transition-colors" />
          </motion.button>
        </div>
        
        <div className="text-center">
          <motion.button
            onClick={goToToday}
            className="text-sm text-[var(--yoga-cyan)] hover:text-[var(--yoga-blue)] transition-colors font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('today')}
          </motion.button>
        </div>
      </motion.div>
      
      {isLoading && !displaySchedule ? (
        <div className="text-center py-12">
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-7 gap-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {weekDays.map((day, index) => {
            const sessions = getSessionsForDay(day)
            const isToday = isSameDay(day, new Date())
            
            return (
              <motion.div
                key={index}
                variants={staggerItem}
                className={cn(
                  "border rounded-2xl p-4 transition-all min-h-[300px]",
                  isToday ? "border-[var(--yoga-cyan)]/30 bg-gradient-to-br from-[var(--yoga-cyan)]/5 to-[var(--yoga-blue)]/5 shadow-sm" : "border-gray-100 bg-white hover:shadow-sm"
                )}
              >
                <div className="mb-4">
                  <h3 className={cn(
                    "font-semibold text-center",
                    isToday ? "text-[var(--yoga-cyan)]" : "text-gray-800"
                  )}>
                    {formatDate(day, 'EEEE')}
                  </h3>
                  <p className={cn(
                    "text-sm text-center mt-1",
                    isToday ? "text-[var(--yoga-blue)]" : "text-gray-600"
                  )}>
                    {formatDate(day, 'd MMM')}
                  </p>
                </div>
                
                <div className="space-y-2">
                  {sessions.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      {t('noClasses')}
                    </p>
                  ) : (
                    sessions.map((session) => (
                      <SessionCard 
                        key={session.id} 
                        session={session} 
                        onBookingClick={handleBookingClick}
                      />
                    ))
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </>
  )
}

interface SessionCardProps {
  session: ScheduleSession
  onBookingClick: (session: ScheduleSession) => void
}

function SessionCard({ session, onBookingClick }: SessionCardProps) {
  const t = useTranslations('schema')
  const isFullyBooked = session.status === 'full' || session.available_spots === 0
  const isCancelled = session.status === 'cancelled'
  const isBooked = session.user_booked || false
  
  // Use available_spots from the API
  const availableSpots = session.available_spots
  
  const showAvailability = availableSpots > 0 && availableSpots <= 3 && !isBooked
  
  return (
    <motion.div
      className={cn(
        "p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group",
        isCancelled && "opacity-50 bg-gray-50 border-gray-200",
        isBooked && "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm",
        isFullyBooked && !isBooked && "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200",
        !isCancelled && !isFullyBooked && !isBooked && "bg-white hover:border-[var(--yoga-cyan)]/30 hover:shadow-lg hover-lift"
      )}
      whileHover={{ scale: !isCancelled ? 1.02 : 1 }}
      transition={{ duration: 0.2 }}
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
        <p className="text-xs text-red-600 mt-2">{t('cancelled')}</p>
      ) : isBooked ? (
        <div className="mt-2 flex items-center gap-2">
          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-xs text-green-600 font-medium">{t('booked')}</p>
        </div>
      ) : isFullyBooked ? (
        <div className="mt-2">
          <p className="text-xs text-orange-600 font-medium">{t('fullyBooked')}</p>
          <button 
            onClick={() => onBookingClick(session)}
            className="text-xs text-orange-600 hover:text-orange-800 mt-1 font-medium underline"
          >
            {t('joinWaitlist')}
          </button>
        </div>
      ) : (
        <>
          {showAvailability && (
            <p className="text-xs text-orange-600 mt-1">
              {availableSpots} {t('spotsAvailable')}
            </p>
          )}
          <button 
            onClick={() => onBookingClick(session)}
            className="text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium"
          >
            {t('bookClass')}
          </button>
        </>
      )}
    </motion.div>
  )
}