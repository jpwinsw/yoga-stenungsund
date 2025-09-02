'use client'

import { motion } from 'framer-motion'
import { Clock, Users, Calendar, ChevronRight, MapPin } from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/button'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import type { Service, ScheduleSession } from '@/lib/types/braincore'
import { cn } from '@/lib/utils/cn'

// Helper to get level from service
function getLevel(service: Service): string {
  if (service.difficulty_level) {
    switch (service.difficulty_level) {
      case 'beginner': return 'beginner'
      case 'intermediate': return 'intermediate' 
      case 'advanced': return 'advanced'
      case 'all_levels': return 'all'
    }
  }
  return 'intermediate'
}

// Helper to estimate intensity based on service name or difficulty
function getIntensity(service: Service): number {
  if (service.difficulty_level) {
    switch (service.difficulty_level) {
      case 'beginner': return 2
      case 'intermediate': return 3
      case 'advanced': return 5
      case 'all_levels': return 3
    }
  }
  
  // Fallback to name-based detection
  const name = service.name.toLowerCase()
  if (name.includes('power') || name.includes('ashtanga')) return 5
  if (name.includes('vinyasa')) return 3
  if (name.includes('hatha')) return 2
  if (name.includes('yin') || name.includes('restorative')) return 1
  return 3
}

// Group schedule sessions by date
function groupSessionsByDate(sessions: ScheduleSession[]) {
  const groups: Record<string, ScheduleSession[]> = {}
  
  sessions.forEach(session => {
    const date = new Date(session.start_time).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(session)
  })
  
  // Sort sessions within each date by start time
  Object.keys(groups).forEach(date => {
    groups[date].sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    )
  })
  
  return groups
}

interface ClassDetailClientProps {
  service: Service
  relatedSchedule: ScheduleSession[]
  locale: string
  translations: {
    intensity: string
    instructors: string
    readMore: string
    viewSchedule: string
    levels: {
      beginner: string
      intermediate: string
      advanced: string
      all: string
    }
    nav: {
      home: string
    }
  }
}

export default function ClassDetailClient({ 
  service, 
  relatedSchedule, 
  locale,
  translations 
}: ClassDetailClientProps) {
  const t = translations
  const tCommon = translations
  
  const level = getLevel(service)
  const intensity = getIntensity(service)
  const groupedSessions = groupSessionsByDate(relatedSchedule.slice(0, 10)) // Show next 10 sessions
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 lg:py-24 bg-gradient-to-b from-[var(--yoga-cream)]/50 to-white">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            {/* Breadcrumb */}
            <nav className="mb-8">
              <ol className="flex items-center space-x-2 text-sm text-gray-600">
                <li>
                  <Link href="/" className="hover:text-[var(--yoga-stone)]">
                    {tCommon.nav.home}
                  </Link>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="w-4 h-4 mx-2" />
                  <Link href="/klasser" className="hover:text-[var(--yoga-stone)]">
                    {locale === 'en' ? 'Classes' : 'Klasser'}
                  </Link>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="w-4 h-4 mx-2" />
                  <span className="text-[var(--yoga-stone)]">{service.name}</span>
                </li>
              </ol>
            </nav>
            
            {/* Class Info */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-6">
              {service.name}
            </h1>
            
            {service.description && (
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                {service.description}
              </p>
            )}
            
            {/* Class Metadata */}
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--yoga-stone)]" />
                <span className="text-gray-700">{service.duration_minutes} min</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[var(--yoga-stone)]" />
                <span className="text-gray-700">{t.levels[level as keyof typeof t.levels]}</span>
              </div>
              
              {service.max_participants && (
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[var(--yoga-stone)]" />
                  <span className="text-gray-700">Max {service.max_participants} deltagare</span>
                </div>
              )}
              
              {/* Intensity indicator */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{t.intensity}:</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-2 h-2 rounded-full",
                        i < intensity 
                          ? "bg-[var(--yoga-stone)]" 
                          : "bg-gray-300"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Action Buttons in Hero */}
            <div className="flex flex-wrap gap-4 mt-8">
              <Button asChild size="lg">
                <Link href="/schema">
                  <Calendar className="w-5 h-5 mr-2" />
                  {locale === 'en' ? 'View Schedule' : 'Se schema'}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#upcoming">
                  {locale === 'en' ? 'Upcoming Sessions' : 'Kommande tillfällen'}
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Upcoming Sessions */}
      {relatedSchedule.length > 0 && (
        <section id="upcoming" className="py-20 lg:py-32">
          <div className="container mx-auto px-6 lg:px-12">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <motion.h2 
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-light mb-12 text-center"
              >
                Kommande tillfällen
              </motion.h2>
              
              <div className="max-w-4xl mx-auto space-y-8">
                {Object.entries(groupedSessions).map(([date, sessions]) => (
                  <motion.div
                    key={date}
                    variants={fadeInUp}
                    className="border border-gray-100 rounded-2xl overflow-hidden"
                  >
                    <div className="bg-[var(--yoga-cream)]/30 px-6 py-4">
                      <h3 className="text-lg font-medium">
                        {new Date(date).toLocaleDateString(locale === 'en' ? 'en-US' : 'sv-SE', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h3>
                    </div>
                    
                    <div className="divide-y divide-gray-100">
                      {sessions.map((session) => (
                        <div key={session.id} className="p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-2">
                                <div className="flex items-center gap-2 text-[var(--yoga-stone)]">
                                  <Clock className="w-4 h-4" />
                                  <span className="font-medium">
                                    {new Date(session.start_time).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                    {' - '}
                                    {new Date(session.end_time).toLocaleTimeString([], {
                                      hour: '2-digit', 
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                
                                {session.instructor_name && (
                                  <div className="text-gray-600">
                                    med {session.instructor_name}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                {session.resource_name && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{session.resource_name}</span>
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  <span>
                                    {session.available_spots} platser kvar
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <Button asChild size="sm">
                              <Link href="/schema">
                                Boka
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <motion.div 
                variants={fadeInUp}
                className="text-center mt-12"
              >
                <Button asChild variant="outline" size="lg">
                  <Link href="/schema">
                    <Calendar className="w-5 h-5 mr-2" />
                    Se alla tider i schema
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-[var(--yoga-cream)]">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-light mb-6">
              Redo att börja?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Boka din plats på {service.name} eller utforska vårt fullständiga schema.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/schema">
                  Se schema
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/klasser">
                  Alla klasser
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}