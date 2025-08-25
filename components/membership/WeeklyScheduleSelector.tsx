'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { format, addDays, isSameDay } from 'date-fns'
import { sv, enUS } from 'date-fns/locale'
import { useLocale } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import { ScheduleSession } from '@/lib/types/braincore'
import { 
  Clock, 
  Users, 
  Sparkles,
  Heart,
  Zap,
  Flower2,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle,
  Info,
  Calendar
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'

interface WeeklyScheduleSelectorProps {
  weekStart: Date
  sessions: ScheduleSession[]
  selectedSessions: number[]
  onSelectionChange: (sessions: number[]) => void
  requiredSessions: number
  weekNumber?: number
  loading?: boolean
  error?: string | null
}

// Class type configuration with icons and colors (matching schedule)
const classTypes = {
  'Vinyasa Flow': { icon: Zap, color: 'from-[var(--yoga-cyan)] to-[var(--yoga-blue)]', emoji: '🌊' },
  'Hatha Yoga': { icon: Sun, color: 'from-amber-400 to-orange-500', emoji: '☀️' },
  'Yin Yoga': { icon: Moon, color: 'from-purple-400 to-pink-500', emoji: '🌙' },
  'Power Yoga': { icon: Zap, color: 'from-red-400 to-pink-500', emoji: '⚡' },
  'Restorative': { icon: Heart, color: 'from-pink-400 to-rose-400', emoji: '💗' },
  'Meditation': { icon: Flower2, color: 'from-indigo-400 to-purple-500', emoji: '🧘' },
  'Beginner': { icon: Sparkles, color: 'from-green-400 to-teal-500', emoji: '✨' }
} as const

function getClassTypeConfig(className: string) {
  const normalizedName = className.toLowerCase()
  const typeKey = Object.keys(classTypes).find(key => 
    normalizedName.includes(key.toLowerCase())
  ) as keyof typeof classTypes | undefined
  
  return typeKey ? classTypes[typeKey] : classTypes['Vinyasa Flow']
}

export default function WeeklyScheduleSelector({
  weekStart,
  sessions,
  selectedSessions,
  onSelectionChange,
  requiredSessions,
  weekNumber = 1,
  loading = false,
  error = null
}: WeeklyScheduleSelectorProps) {
  const t = useTranslations('membership.weeklySchedule')
  const locale = useLocale()
  const dateLocale = locale === 'sv' ? sv : enUS
  
  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  
  // Group sessions by day
  const getSessionsForDay = (date: Date) => {
    return sessions
      .filter(session => isSameDay(new Date(session.start_time), date))
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  }
  
  const handleSessionToggle = (sessionId: number) => {
    if (selectedSessions.includes(sessionId)) {
      // Deselect
      onSelectionChange(selectedSessions.filter(id => id !== sessionId))
    } else {
      // Select if not at limit
      if (selectedSessions.length < requiredSessions) {
        onSelectionChange([...selectedSessions, sessionId])
      }
    }
  }
  
  const selectionProgress = (selectedSessions.length / requiredSessions) * 100
  const isComplete = selectedSessions.length === requiredSessions
  const needsMore = requiredSessions - selectedSessions.length
  
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-20 bg-gray-200 rounded-xl mb-4" />
          <div className="grid grid-cols-7 gap-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header with instructions and progress */}
      <div className="bg-gradient-to-r from-[var(--yoga-light-sage)]/30 to-[var(--yoga-cream)]/30 rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[var(--yoga-sage)]" />
              {weekNumber === 1 
                ? t('scheduleWeek1Title') 
                : t('scheduleWeekN', { week: weekNumber })}
            </h3>
            <p className="text-sm text-gray-600">
              {isComplete 
                ? t('selectionComplete') 
                : t('selectionInstructions', { count: requiredSessions })}
            </p>
          </div>
          
          {/* Selection counter */}
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl transition-all",
            isComplete 
              ? "bg-green-100 text-green-700" 
              : "bg-white text-gray-700 shadow-sm"
          )}>
            {isComplete ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Info className="w-5 h-5 text-[var(--yoga-sage)]" />
            )}
            <span className="font-semibold">
              {selectedSessions.length} / {requiredSessions}
            </span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="space-y-2">
          <Progress 
            value={selectionProgress} 
            className="h-2"
          />
          <div className="h-5">  {/* Fixed height container */}
            {!isComplete && (
              <p className="text-xs text-gray-500">
                {t('selectMore', { count: needsMore })}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Tips for first-time users */}
      {weekNumber === 1 && (
        <Alert className="bg-blue-50 border-blue-200">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>{t('smartTipTitle')}</strong> {t('smartTipDescription')}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Mobile: Grouped list view, Desktop: Weekly grid */}
      <div className="block sm:hidden space-y-4">
        {/* Mobile list view - group sessions by day */}
        {weekDays.map((day, dayIndex) => {
          const daySessions = getSessionsForDay(day)
          if (daySessions.length === 0) return null
          
          const isToday = isSameDay(day, new Date())
          const dayName = format(day, 'EEEE, MMM d', { locale: dateLocale })
          
          return (
            <div key={dayIndex} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className={cn(
                "px-4 py-2 border-b font-medium text-sm",
                isToday ? "bg-[var(--yoga-sage)]/10" : "bg-gray-50"
              )}>
                {dayName}
                {isToday && (
                  <Badge className="ml-2 bg-[var(--yoga-sage)] text-white text-xs">
                    {t('today')}
                  </Badge>
                )}
              </div>
              <div className="divide-y divide-gray-100">
                {daySessions.map(session => {
                  const isSelected = selectedSessions.includes(session.id)
                  const isDisabled = !isSelected && selectedSessions.length >= requiredSessions
                  const classConfig = getClassTypeConfig(session.title || session.service_template_name)
                  const Icon = classConfig.icon
                  const isFull = session.available_spots === 0
                  
                  return (
                    <button
                      key={session.id}
                      onClick={() => !isFull && !isDisabled && handleSessionToggle(session.id)}
                      disabled={isFull || isDisabled}
                      className={cn(
                        "w-full flex items-center gap-3 transition-all border-l-4",
                        isSelected
                          ? "bg-[var(--yoga-sage)]/10 border-[var(--yoga-sage)] pl-3 pr-3 py-2.5"
                          : isFull
                          ? "bg-gray-50 opacity-60 border-transparent pl-3 pr-3 py-2.5"
                          : isDisabled
                          ? "opacity-50 border-transparent pl-3 pr-3 py-2.5"
                          : "hover:bg-gray-50 active:bg-gray-100 border-transparent pl-3 pr-3 py-2.5"
                      )}
                    >
                      {/* Icon */}
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                        `bg-gradient-to-br ${classConfig.color}`
                      )}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      
                      {/* Content - horizontal layout */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="font-medium text-sm truncate flex-1">
                            {session.title || session.service_template_name}
                          </div>
                          <div className="text-xs text-gray-500 shrink-0 tabular-nums">
                            {format(new Date(session.start_time), 'HH:mm')}-{format(new Date(session.end_time), 'HH:mm')}
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <div className="text-xs font-medium text-gray-600 truncate flex-1">
                            {session.instructor_name || '—'}
                          </div>
                          <div className="text-xs shrink-0 tabular-nums min-w-[60px] text-right">
                            {isFull ? (
                              <span className="text-red-600 font-semibold">{t('full')}</span>
                            ) : (
                              <span className="text-gray-500">{session.available_spots} {t('spots')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Selection indicator */}
                      <div className="shrink-0">
                        {isSelected ? (
                          <CheckCircle2 className="w-5 h-5 text-[var(--yoga-sage)]" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Desktop grid view - hidden on mobile */}
      <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 lg:gap-3">
        {weekDays.map((day, dayIndex) => {
          const daySessions = getSessionsForDay(day)
          const isToday = isSameDay(day, new Date())
          const dayName = format(day, 'EEE', { locale: dateLocale })
          const dayDate = format(day, 'd', { locale: dateLocale })
          
          return (
            <motion.div
              key={dayIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dayIndex * 0.05 }}
              className={cn(
                "bg-white rounded-xl border-2 transition-all relative overflow-hidden",
                isToday ? "border-[var(--yoga-sage)]/30" : "border-gray-100"
              )}
            >
              {/* Day header */}
              <div className={cn(
                "p-2 sm:p-3 border-b",
                isToday 
                  ? "bg-gradient-to-r from-[var(--yoga-sage)]/10 to-[var(--yoga-cyan)]/10" 
                  : "bg-gray-50"
              )}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs sm:text-sm">{dayName}</div>
                    <div className="text-[10px] sm:text-xs text-gray-500">{dayDate}</div>
                  </div>
                  {isToday && (
                    <Badge className="bg-[var(--yoga-sage)] text-white text-[10px] sm:text-xs px-1 sm:px-2">
                      {t('today')}
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Sessions for the day */}
              <div className="p-2 space-y-2 min-h-[150px] sm:min-h-[200px] lg:min-h-[300px] max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] overflow-y-auto">
                {daySessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Moon className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">{t('noClasses')}</p>
                  </div>
                ) : (
                  daySessions.map(session => {
                    const isSelected = selectedSessions.includes(session.id)
                    const isDisabled = !isSelected && selectedSessions.length >= requiredSessions
                    const classConfig = getClassTypeConfig(session.title || session.service_template_name)
                    const Icon = classConfig.icon
                    const isFull = session.available_spots === 0
                    const isLowSpots = session.available_spots > 0 && session.available_spots <= 3
                    
                    return (
                      <motion.button
                        key={session.id}
                        onClick={() => !isFull && !isDisabled && handleSessionToggle(session.id)}
                        disabled={isFull || isDisabled}
                        whileHover={!isFull && !isDisabled ? { scale: 1.02 } : {}}
                        whileTap={!isFull && !isDisabled ? { scale: 0.98 } : {}}
                        className={cn(
                          "w-full text-left p-2 sm:p-3 rounded-lg transition-all relative overflow-hidden group",
                          isSelected 
                            ? "bg-gradient-to-r from-[var(--yoga-sage)]/20 to-[var(--yoga-cyan)]/20 ring-2 ring-[var(--yoga-sage)]" 
                            : isFull
                            ? "bg-gray-100 opacity-60 cursor-not-allowed"
                            : isDisabled
                            ? "bg-gray-50 opacity-50 cursor-not-allowed"
                            : "bg-white hover:bg-gray-50 border border-gray-200"
                        )}
                      >
                        {/* Selection indicator */}
                        {isSelected && (
                          <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--yoga-sage)]" />
                          </div>
                        )}
                        
                        {/* Class type icon and gradient */}
                        <div className={cn(
                          "absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity",
                          `bg-gradient-to-br ${classConfig.color}`
                        )} />
                        
                        {/* Content */}
                        <div className="relative z-10">
                          <div className="flex items-center gap-1 sm:gap-2 mb-1">
                            <div className={cn(
                              "w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center shrink-0",
                              `bg-gradient-to-br ${classConfig.color}`
                            )}>
                              <Icon className="w-3 h-3 text-white" />
                            </div>
                            <span className="font-medium text-[10px] sm:text-xs line-clamp-1">
                              {session.title || session.service_template_name}
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-[10px] sm:text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{format(new Date(session.start_time), 'HH:mm')}</span>
                            </div>
                            
                            {session.instructor_name && (
                              <div className="truncate text-[10px] sm:text-xs">
                                {session.instructor_name}
                              </div>
                            )}
                            
                            {/* Availability indicator */}
                            <div className="flex items-center gap-1">
                              {isFull ? (
                                <span className="text-red-600 font-medium">{t('full')}</span>
                              ) : isLowSpots ? (
                                <span className="text-orange-600 font-medium">
                                  {t('lowSpots', { count: session.available_spots })}
                                </span>
                              ) : (
                                <>
                                  <Users className="w-3 h-3" />
                                  <span>{t('spotsAvailable', { count: session.available_spots })}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    )
                  })
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
      
      {/* Help text - fixed height to prevent jumping */}
      <div className="h-10 flex items-center justify-center">
        <div className="text-center text-sm text-gray-500">
          {isComplete ? (
            <p className="text-green-600 font-medium">
              ✓ {t('readyToContinue')}
            </p>
          ) : (
            <p>{t('varietyTip')}</p>
          )}
        </div>
      </div>
    </div>
  )
}