'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { useSchedule } from '@/lib/hooks/use-braincore'
import { getWeekDates, getWeekDays, formatDate, formatTime, isSameDay } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Users, 
  Sparkles,
  Heart,
  Zap,
  Flower2,
  Sun,
  Moon,
  Grid3X3,
  List,
  CalendarDays
} from 'lucide-react'
import type { ScheduleSession } from '@/lib/types/braincore'
import BookingModal from '@/components/booking/BookingModal'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { Button } from '@/components/ui/button'
import { MotionButton } from '@/components/ui/motion-button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ScheduleClientV2Props {
  initialSchedule: ScheduleSession[]
  initialError: boolean | null
  classFilter?: string
}

interface ViewProps {
  weekDays: Date[]
  getSessionsForDay: (day: Date) => ScheduleSession[]
  handleBookingClick: (session: ScheduleSession) => void
}

// Class type configuration with icons and colors
const classTypes = {
  'Vinyasa Flow': { icon: Zap, color: 'from-[var(--yoga-cyan)] to-[var(--yoga-blue)]', emoji: '🌊' },
  'Hatha Yoga': { icon: Sun, color: 'from-amber-400 to-orange-500', emoji: '☀️' },
  'Yin Yoga': { icon: Moon, color: 'from-purple-400 to-pink-500', emoji: '🌙' },
  'Power Yoga': { icon: Zap, color: 'from-red-400 to-pink-500', emoji: '⚡' },
  'Restorative': { icon: Heart, color: 'from-pink-400 to-rose-400', emoji: '💗' },
  'Meditation': { icon: Flower2, color: 'from-indigo-400 to-purple-500', emoji: '🧘' },
  'Beginner': { icon: Sparkles, color: 'from-green-400 to-teal-500', emoji: '✨' }
} as const

// Time slots for the day (6 AM to 8 PM)
const timeSlots = Array.from({ length: 15 }, (_, i) => {
  const hour = i + 6
  return {
    time: `${hour}:00`,
    label: hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`
  }
})

function getClassTypeConfig(className: string) {
  const normalizedName = className.toLowerCase()
  const typeKey = Object.keys(classTypes).find(key => 
    normalizedName.includes(key.toLowerCase())
  ) as keyof typeof classTypes | undefined
  
  return typeKey ? classTypes[typeKey] : classTypes['Vinyasa Flow']
}

function getTimeOfDayGreeting(hour: number) {
  if (hour < 12) return { text: 'Morning Practice', icon: Sun }
  if (hour < 17) return { text: 'Afternoon Flow', icon: Sun }
  return { text: 'Evening Relaxation', icon: Moon }
}

export default function ScheduleClientV2({ 
  initialSchedule, 
  initialError,
  classFilter 
}: ScheduleClientV2Props) {
  const t = useTranslations('schema')
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedSession, setSelectedSession] = useState<ScheduleSession | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>('grid')
  const [isNavigating, setIsNavigating] = useState(false)
  const { start, end, startDate } = getWeekDates(currentWeek)
  
  const { schedule, isLoading, isError, mutate } = useSchedule(start, end)
  
  const displaySchedule = schedule || initialSchedule
  const hasError = isError || initialError
  
  const weekDays = getWeekDays(startDate)
  
  const previousWeek = () => {
    setIsNavigating(true)
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentWeek(newDate)
    // Reset navigating state after a short delay
    setTimeout(() => setIsNavigating(false), 300)
  }
  
  const nextWeek = () => {
    setIsNavigating(true)
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentWeek(newDate)
    // Reset navigating state after a short delay
    setTimeout(() => setIsNavigating(false), 300)
  }
  
  const goToToday = () => {
    setIsNavigating(true)
    setCurrentWeek(new Date())
    // Reset navigating state after a short delay
    setTimeout(() => setIsNavigating(false), 300)
  }
  
  const handleBookingClick = (session: ScheduleSession) => {
    setSelectedSession(session)
    setIsBookingModalOpen(true)
  }
  
  const getSessionsForDay = (date: Date) => {
    if (!displaySchedule) return []
    let sessions = displaySchedule.filter(session => 
      isSameDay(new Date(session.start_time), date)
    )
    
    // Apply class filter if provided
    if (classFilter) {
      sessions = sessions.filter(session => {
        const className = (session.title || session.service_template_name).toLowerCase()
        return className.includes(classFilter.toLowerCase())
      })
    }
    
    return sessions.sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
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
            mutate()
          }}
        />
      )}
      
      {/* Class filter notification */}
      {classFilter && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-[var(--yoga-cream)] rounded-xl flex items-center justify-between"
        >
          <p className="text-sm text-[var(--yoga-stone)]">
            {t('filteringBy')}: <span className="font-medium capitalize">{classFilter}</span>
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/schema'}
            className="text-xs"
          >
            {t('clearFilter')}
          </Button>
        </motion.div>
      )}
      
      {/* Header with week navigation */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          {/* Week Navigation */}
          <div className="flex items-center gap-4 bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
            <MotionButton
              variant="ghost"
              size="icon"
              onClick={previousWeek}
              className="rounded-xl"
            >
              <ChevronLeft className="w-5 h-5" />
            </MotionButton>
            
            <div className="text-center px-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {formatDate(startDate, 'MMMM yyyy')}
              </h2>
              <p className="text-sm text-[var(--yoga-stone)]">
                {t('week')} {formatDate(startDate, 'w')}
              </p>
            </div>
            
            <MotionButton
              variant="ghost"
              size="icon"
              onClick={nextWeek}
              className="rounded-xl"
            >
              <ChevronRight className="w-5 h-5" />
            </MotionButton>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-2">
            <Button
              variant="link"
              size="sm"
              onClick={goToToday}
              className="text-[var(--yoga-cyan)]"
            >
              {t('today')}
            </Button>
            
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list' | 'timeline')}>
              <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                <TabsTrigger value="grid" className="gap-2">
                  <Grid3X3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Grid</span>
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-2">
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">List</span>
                </TabsTrigger>
                <TabsTrigger value="timeline" className="gap-2">
                  <CalendarDays className="w-4 h-4" />
                  <span className="hidden sm:inline">Timeline</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </motion.div>

      {/* Schedule Content */}
      {(isLoading || isNavigating) ? (
        <LoadingSkeleton viewMode={viewMode} />
      ) : hasError ? (
        <ErrorState />
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === 'grid' && (
            <GridView 
              weekDays={weekDays}
              getSessionsForDay={getSessionsForDay}
              handleBookingClick={handleBookingClick}
            />
          )}
          {viewMode === 'list' && (
            <ListView 
              weekDays={weekDays}
              getSessionsForDay={getSessionsForDay}
              handleBookingClick={handleBookingClick}
            />
          )}
          {viewMode === 'timeline' && (
            <TimelineView 
              weekDays={weekDays}
              getSessionsForDay={getSessionsForDay}
              handleBookingClick={handleBookingClick}
            />
          )}
        </AnimatePresence>
      )}
    </>
  )
}

// Enhanced Session Card Component
function SessionCard({ 
  session, 
  onBookingClick,
  variant = 'default'
}: { 
  session: ScheduleSession
  onBookingClick: (session: ScheduleSession) => void
  variant?: 'default' | 'compact' | 'timeline'
}) {
  const t = useTranslations('schema')
  const classConfig = getClassTypeConfig(session.title || session.service_template_name)
  const Icon = classConfig.icon
  const startTime = new Date(session.start_time)
  const timeOfDay = getTimeOfDayGreeting(startTime.getHours())
  
  const isFullyBooked = session.status === 'full' || session.available_spots === 0
  const isCancelled = session.status === 'cancelled'
  const isBooked = session.user_booked || false
  const spotsPercentage = ((session.capacity - session.available_spots) / session.capacity) * 100

  if (variant === 'compact') {
    return (
      <motion.div
        onClick={() => !isCancelled && onBookingClick(session)}
        className={cn(
          "relative p-4 rounded-xl transition-all cursor-pointer group overflow-hidden bg-white",
          isCancelled && "opacity-50",
          !isCancelled && "hover:shadow-lg"
        )}
        whileHover={{ scale: !isCancelled ? 1.03 : 1 }}
        whileTap={{ scale: !isCancelled ? 0.98 : 1 }}
      >
        {/* Background gradient */}
        <div className={cn(
          "absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity",
          `bg-gradient-to-br ${classConfig.color}`
        )} />
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              `bg-gradient-to-br ${classConfig.color}`
            )}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-semibold text-sm text-gray-800 leading-tight">
              {session.title || session.service_template_name}
            </h4>
          </div>
          
          <div className="space-y-1 text-xs text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatTime(session.start_time)}</span>
            </div>
            {session.instructor_name && (
              <div className="truncate">
                {session.instructor_name}
              </div>
            )}
          </div>
          
          {/* Status indicator */}
          <div className="space-y-2">
            {isCancelled ? (
              <span className="text-xs text-red-600 font-medium">{t('cancelled')}</span>
            ) : isBooked ? (
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xs text-green-600 font-medium">{t('booked')}</span>
              </div>
            ) : isFullyBooked ? (
              <span className="text-xs text-orange-600 font-medium">{t('fullyBooked')}</span>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {session.available_spots} {t('spotsAvailable')}
                  </span>
                </div>
                <motion.div 
                  className="text-xs font-medium text-[var(--yoga-cyan)] opacity-0 group-hover:opacity-100 transition-opacity text-right"
                  initial={{ x: -10 }}
                  animate={{ x: 0 }}
                >
                  {t('bookClass')} →
                </motion.div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  if (variant === 'timeline') {
    return (
      <motion.div
        onClick={() => !isCancelled && onBookingClick(session)}
        className={cn(
          "relative overflow-hidden rounded-xl transition-all cursor-pointer group h-full min-h-[60px]",
          isCancelled && "opacity-50"
        )}
        whileHover={{ scale: !isCancelled ? 1.02 : 1 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        {/* Background Gradient */}
        <div className={cn(
          "absolute inset-0 opacity-90",
          `bg-gradient-to-br ${classConfig.color}`
        )} />
        
        {/* Content */}
        <div className="relative z-10 p-3 text-white h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-4 h-4" />
              <h4 className="font-semibold text-sm leading-tight">
                {session.title || session.service_template_name}
              </h4>
            </div>
            
            <div className="text-xs opacity-90 space-y-1">
              <div>{formatTime(session.start_time)} - {formatTime(session.end_time)}</div>
              {session.instructor_name && (
                <div className="truncate">{session.instructor_name}</div>
              )}
            </div>
          </div>
          
          {/* Status */}
          {!isCancelled && (
            <div className="flex items-center justify-between text-xs mt-2">
              <span className="opacity-90">{session.available_spots} spots</span>
              {isBooked && (
                <span className="bg-white/20 px-2 py-1 rounded-full">✓</span>
              )}
            </div>
          )}
          
          {isCancelled && (
            <div className="text-xs text-red-200 mt-2">{t('cancelled')}</div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      onClick={() => !isCancelled && onBookingClick(session)}
      className={cn(
        "relative overflow-hidden rounded-2xl transition-all cursor-pointer group",
        isCancelled && "opacity-50"
      )}
      whileHover={{ scale: !isCancelled ? 1.02 : 1 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Background Gradient */}
      <div className={cn(
        "absolute inset-0 opacity-90",
        `bg-gradient-to-br ${classConfig.color}`
      )} />
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full lotus-pattern" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 p-6 text-white">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-lg">
                {session.title || session.service_template_name}
              </h4>
              <p className="text-sm opacity-90">
                {timeOfDay.text}
              </p>
            </div>
          </div>
          {isCancelled && (
            <Badge variant="destructive" className="bg-red-500/20 text-white border-0">
              {t('cancelled')}
            </Badge>
          )}
        </div>
        
        {/* Time & Location */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <span>{formatTime(session.start_time)} - {formatTime(session.end_time)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{session.resource_name}</span>
          </div>
          {session.instructor_name && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4" />
              <span>{session.instructor_name}</span>
            </div>
          )}
        </div>
        
        {/* Capacity Bar */}
        {!isCancelled && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{session.bookings} / {session.capacity} {t('participants')}</span>
              {isBooked && (
                <Badge className="bg-white/20 text-white border-0">
                  ✓ {t('booked')}
                </Badge>
              )}
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-white/60"
                initial={{ width: 0 }}
                animate={{ width: `${spotsPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
        
        {/* Hover Action */}
        {!isCancelled && !isBooked && (
          <motion.div
            className="absolute inset-x-0 bottom-0 bg-black/20 backdrop-blur p-4 translate-y-full group-hover:translate-y-0 transition-transform"
          >
            <Button 
              className="w-full bg-white text-gray-900 hover:bg-gray-100"
              size="sm"
            >
              {isFullyBooked ? t('joinWaitlist') : t('bookClass')}
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// Grid View Component
function GridView({ weekDays, getSessionsForDay, handleBookingClick }: ViewProps) {
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-7 gap-4"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {weekDays.map((day: Date, index: number) => {
        const sessions = getSessionsForDay(day)
        const isToday = isSameDay(day, new Date())
        
        return (
          <motion.div
            key={index}
            variants={staggerItem}
            className={cn(
              "min-h-[450px] rounded-2xl transition-all relative overflow-hidden",
              isToday ? "shadow-lg" : "shadow-sm"
            )}
          >
            {/* Background */}
            <div className={cn(
              "absolute inset-0",
              isToday 
                ? "bg-gradient-to-br from-[var(--yoga-cyan)]/10 via-[var(--yoga-blue)]/5 to-transparent" 
                : "bg-gradient-to-br from-gray-50 to-white"
            )} />
            
            {/* Header */}
            <div className={cn(
              "relative z-10 p-4 pb-3 text-center border-b",
              isToday ? "border-[var(--yoga-cyan)]/20 bg-white/50" : "border-gray-100"
            )}>
              <h3 className={cn(
                "font-semibold text-lg",
                isToday ? "text-[var(--yoga-cyan)]" : "text-gray-800"
              )}>
                {formatDate(day, 'EEEE')}
              </h3>
              <p className={cn(
                "text-sm",
                isToday ? "text-[var(--yoga-blue)]" : "text-gray-600"
              )}>
                {formatDate(day, 'd MMM')}
              </p>
              {isToday && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-block mt-2"
                >
                  <Badge className="bg-[var(--yoga-cyan)] text-white border-0 shadow-sm">
                    Today
                  </Badge>
                </motion.div>
              )}
            </div>
            
            {/* Sessions */}
            <div className="relative z-10 p-3 space-y-2 overflow-y-auto max-h-[350px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {sessions.length === 0 ? (
                <EmptyDayState dayIndex={index} />
              ) : (
                sessions.map((session: ScheduleSession) => (
                  <SessionCard 
                    key={session.id} 
                    session={session} 
                    onBookingClick={handleBookingClick}
                    variant="compact"
                  />
                ))
              )}
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

// List View Component
function ListView({ weekDays, getSessionsForDay, handleBookingClick }: ViewProps) {
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {weekDays.map((day: Date, index: number) => {
        const sessions = getSessionsForDay(day)
        const isToday = isSameDay(day, new Date())
        
        if (sessions.length === 0) return null
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={cn(
              "flex items-center gap-4 mb-4",
              isToday && "text-[var(--yoga-cyan)]"
            )}>
              <h3 className="text-lg font-semibold">
                {formatDate(day, 'EEEE, d MMMM')}
              </h3>
              {isToday && (
                <Badge className="bg-[var(--yoga-cyan)] text-white">
                  Today
                </Badge>
              )}
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sessions.map((session: ScheduleSession) => (
                <SessionCard 
                  key={session.id} 
                  session={session} 
                  onBookingClick={handleBookingClick}
                />
              ))}
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

// Timeline View Component
function TimelineView({ weekDays, getSessionsForDay, handleBookingClick }: ViewProps) {
  return (
    <motion.div 
      className="overflow-x-auto pb-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="min-w-[1200px]">
        {/* Time slots header */}
        <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 mb-4">
          <div></div>
          {weekDays.map((day: Date, index: number) => (
            <div key={index} className="text-center">
              <h3 className="font-semibold text-sm">{formatDate(day, 'EEE')}</h3>
              <p className="text-xs text-gray-600">{formatDate(day, 'd MMM')}</p>
            </div>
          ))}
        </div>
        
        {/* Time grid */}
        <div className="relative">
          {timeSlots.map((slot, slotIndex) => (
            <div key={slot.time} className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 h-20 border-t border-gray-100">
              <div className="text-xs text-gray-500 pt-2">{slot.label}</div>
              {weekDays.map((day: Date, dayIndex: number) => {
                const sessions = getSessionsForDay(day).filter((session: ScheduleSession) => {
                  const hour = new Date(session.start_time).getHours()
                  return hour === slotIndex + 6
                })
                
                return (
                  <div key={dayIndex} className="relative">
                    {sessions.map((session: ScheduleSession) => {
                      const duration = (new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / (1000 * 60)
                      const height = (duration / 60) * 80 // 80px per hour
                      
                      return (
                        <div
                          key={session.id}
                          className="absolute inset-x-0 top-0 p-1"
                          style={{ height: `${height}px` }}
                        >
                          <SessionCard 
                            session={session} 
                            onBookingClick={handleBookingClick}
                            variant="timeline"
                          />
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Empty Day State Component
function EmptyDayState({ dayIndex = 0 }: { dayIndex?: number }) {
  const t = useTranslations('schema')
  const messages = [
    { 
      icon: Flower2, 
      text: t('emptyDay.restDay'), 
      subtext: t('emptyDay.restDaySubtext'), 
      color: "from-purple-400 to-pink-400" 
    },
    { 
      icon: Sun, 
      text: t('emptyDay.freeDay'), 
      subtext: t('emptyDay.freeDaySubtext'), 
      color: "from-amber-400 to-orange-400" 
    },
    { 
      icon: Heart, 
      text: t('emptyDay.noClasses'), 
      subtext: t('emptyDay.noClassesSubtext'), 
      color: "from-green-400 to-teal-400" 
    },
  ]
  // Use dayIndex to deterministically select a message
  const message = messages[dayIndex % messages.length]
  const Icon = message.icon
  
  return (
    <motion.div 
      className="text-center py-12 px-4"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className={cn(
        "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center",
        `bg-gradient-to-br ${message.color} opacity-30`
      )}>
        <Icon className="w-8 h-8 text-gray-600" />
      </div>
      <p className="text-sm text-gray-500 font-medium">{message.text}</p>
      <p className="text-xs text-gray-400 mt-1">{message.subtext}</p>
    </motion.div>
  )
}

// Loading Skeleton
function LoadingSkeleton({ viewMode }: { viewMode: string }) {
  const t = useTranslations('schema')
  
  return (
    <div className="relative">
      {/* Loading overlay with message */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="bg-white/90 rounded-2xl p-6 shadow-lg text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-[var(--yoga-cyan)] to-[var(--yoga-blue)] animate-pulse" />
          <p className="text-gray-700 font-medium">{t('loading')}</p>
          <p className="text-sm text-gray-500 mt-1">{t('loadingMessage')}</p>
        </div>
      </div>
      
      {/* Skeleton structure */}
      <div className="animate-pulse opacity-50">
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="min-h-[450px] rounded-2xl bg-gray-100">
                {/* Day header skeleton */}
                <div className="p-4 pb-3 border-b border-gray-200">
                  <div className="h-6 bg-gray-200 rounded w-24 mx-auto mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-16 mx-auto" />
                </div>
                {/* Sessions skeleton */}
                <div className="p-3 space-y-2">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="h-20 bg-gray-200 rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {viewMode === 'list' && (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="h-6 bg-gray-200 rounded w-48 mb-3" />
                <div className="space-y-2">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="h-24 bg-gray-100 rounded-2xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {viewMode === 'timeline' && (
          <div className="h-[500px] bg-gray-100 rounded-2xl" />
        )}
      </div>
    </div>
  )
}

// Error State
function ErrorState() {
  const t = useTranslations('schema')
  return (
    <motion.div 
      className="text-center py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <p className="text-gray-600">{t('error')}</p>
    </motion.div>
  )
}