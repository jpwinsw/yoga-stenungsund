'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Clock, Users, Zap, Heart, Moon, Sun, ChevronRight, Wind, Flower2 } from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/button'
import { fadeInUp, staggerContainer } from '@/lib/animations'
import { cn } from '@/lib/utils/cn'
import type { Service } from '@/lib/types/braincore'


// Refined color mapping for our design system
const classConfig = {
  'vinyasa': {
    icon: Zap,
    iconColor: 'text-[var(--yoga-cyan)]',
    bgColor: 'bg-[var(--yoga-cream)]',
  },
  'hatha': {
    icon: Sun,
    iconColor: 'text-[var(--yoga-stone)]',
    bgColor: 'bg-[var(--yoga-sand)]/50',
  },
  'yin': {
    icon: Moon,
    iconColor: 'text-[var(--yoga-purple)]/70',
    bgColor: 'bg-[var(--yoga-cream)]',
  },
  'ashtanga': {
    icon: Wind,
    iconColor: 'text-[var(--yoga-earth)]',
    bgColor: 'bg-[var(--yoga-sand)]/30',
  },
  'power': {
    icon: Zap,
    iconColor: 'text-[var(--yoga-pink)]/80',
    bgColor: 'bg-[var(--yoga-cream)]',
  },
  'prenatal': {
    icon: Heart,
    iconColor: 'text-[var(--yoga-pink)]/60',
    bgColor: 'bg-[var(--yoga-cream)]',
  },
  'restorative': {
    icon: Flower2,
    iconColor: 'text-[var(--yoga-sage)]/80',
    bgColor: 'bg-[var(--yoga-sand)]/40',
  },
  'meditation': {
    icon: Flower2,
    iconColor: 'text-[var(--yoga-purple)]/60',
    bgColor: 'bg-[var(--yoga-cream)]',
  },
  'default': {
    icon: Sun,
    iconColor: 'text-[var(--yoga-stone)]',
    bgColor: 'bg-[var(--yoga-cream)]',
  }
} as const

// Helper function to get class configuration
function getClassConfig(serviceName: string) {
  const normalizedName = serviceName.toLowerCase()
  
  for (const [key, config] of Object.entries(classConfig)) {
    if (normalizedName.includes(key)) {
      return config
    }
  }
  
  return classConfig.default
}

// Helper to estimate intensity based on class name or difficulty level
function getIntensity(service: Service): number {
  // First check if service has difficulty level
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
  if (name.includes('prenatal')) return 2
  return 3
}

// Helper to get level based on difficulty or name
function getLevel(service: Service): string {
  if (service.difficulty_level) {
    switch (service.difficulty_level) {
      case 'beginner': return 'beginner'
      case 'intermediate': return 'intermediate'
      case 'advanced': return 'advanced'
      case 'all_levels': return 'all'
    }
  }
  
  const name = service.name.toLowerCase()
  if (name.includes('beginner') || name.includes('nybörjare')) return 'beginner'
  if (name.includes('advanced') || name.includes('avancerad')) return 'advanced'
  if (name.includes('prenatal')) return 'special'
  if (name.includes('all') || name.includes('alla')) return 'all'
  return 'intermediate'
}

// Helper to get instructor list for a service
function getInstructorsForService(service: Service, classInstructors: Record<string, string[]>): string[] {
  // First try exact match with service name
  if (classInstructors[service.name]) {
    return classInstructors[service.name]
  }
  
  // Then try to find by partial match
  const serviceName = service.name.toLowerCase()
  for (const [className, instructors] of Object.entries(classInstructors)) {
    if (className.toLowerCase().includes(serviceName) || serviceName.includes(className.toLowerCase())) {
      return instructors
    }
  }
  
  return []
}


interface ClassesClientProps {
  initialServices: Service[]
  classInstructors: Record<string, string[]>
}

export default function ClassesClient({ initialServices, classInstructors }: ClassesClientProps) {
  const t = useTranslations('classes')
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 lg:py-24 bg-gradient-to-b from-[var(--yoga-cream)]/50 to-white">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--yoga-stone)] mb-4">
              {t('overline')}
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-6">
              {t('title')}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {t('description')}
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Classes Grid */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {/* Show services from API with our refined design */}
            {initialServices.length > 0 ? (
              initialServices.map((service) => {
                const config = getClassConfig(service.name)
                const Icon = config.icon
                const level = getLevel(service)
                const intensity = getIntensity(service)
                const instructors = getInstructorsForService(service, classInstructors)
                
                return (
                  <motion.div
                    key={service.id}
                    variants={fadeInUp}
                    className="group"
                  >
                    <Link href="/schema" className="block h-full">
                      <div className="h-full border border-gray-100 rounded-3xl p-8 hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden group-hover:border-gray-200">
                        {/* Subtle hover effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white to-[var(--yoga-cream)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Icon with muted colors */}
                        <div className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-105",
                          config.bgColor
                        )}>
                          <Icon className={cn("w-8 h-8 transition-colors", config.iconColor)} />
                        </div>
                        
                        {/* Content */}
                        <h3 className="text-2xl font-light mb-3">
                          {service.name}
                        </h3>
                        
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          {service.description || ''}
                        </p>
                        
                        {/* Meta info */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>60 min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{t(`levels.${level}`)}</span>
                          </div>
                        </div>
                        
                        {/* Intensity indicator - refined */}
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-sm text-gray-500">{t('intensity')}:</span>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                  i < intensity 
                                    ? "bg-[var(--yoga-stone)]" 
                                    : "bg-gray-200"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                        
                        {/* Instructors */}
                        {instructors.length > 0 && (
                          <div className="mb-6">
                            <p className="text-xs text-gray-500 mb-2">{t('instructors')}:</p>
                            <div className="flex flex-wrap gap-2">
                              {instructors.map((instructor, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-3 py-1 bg-[var(--yoga-sand)]/30 rounded-full text-[var(--yoga-stone)]"
                                >
                                  {instructor}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      
                      {/* View schedule link - subtle */}
                      <div className="flex items-center text-[var(--yoga-stone)] group-hover:text-[var(--yoga-cyan)] transition-colors">
                        <span className="text-sm font-medium">{t('viewSchedule')}</span>
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                  </motion.div>
                )
              })
            ) : (
              // Fallback to show something if no services from API
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">No classes available at the moment.</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>
      
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
              {t('cta.title')}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {t('cta.description')}
            </p>
            <Link href="/schema" className="inline-block">
              <Button size="lg" className="px-8 py-4">
                {t('cta.button')}
                <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}