'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import type { Instructor } from '@/lib/types/braincore'

interface TeachersClientProps {
  instructors: Instructor[] | { instructors: Instructor[] }
}

export default function TeachersClient({ instructors: instructorsData }: TeachersClientProps) {
  const t = useTranslations('teachers')
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null)
  
  // Handle both array and object with instructors key
  const instructorsRaw = Array.isArray(instructorsData) 
    ? instructorsData 
    : instructorsData?.instructors || []
  
  // Transform API response to match our Instructor type
  const instructors: Instructor[] = instructorsRaw.map((i: Instructor) => ({
    id: i.id,
    name: i.name || '',
    bio: i.bio,
    image_url: i.image_url
  }))

  return (
    <main className="min-h-screen bg-[var(--yoga-paper)]">
      {/* Hero Section */}
      <section className="bg-[var(--yoga-light-sage)] py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl font-light text-gray-900 mb-4">{t('title')}</h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">{t('subtitle')}</p>
          </motion.div>
        </div>
      </section>

      {/* Teachers Grid */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {instructors.map((instructor: Instructor, index: number) => (
              <motion.div
                key={instructor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedInstructor(instructor)}
              >
                <div className="relative h-64 bg-[var(--yoga-cream)]">
                  {instructor.image_url ? (
                    <Image
                      src={instructor.image_url}
                      alt={instructor.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-[var(--yoga-sage)] flex items-center justify-center">
                        <span className="text-4xl font-light text-white">
                          {instructor.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    {instructor.name}
                  </h3>
                  {instructor.bio && (
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {instructor.bio}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--yoga-cyan)] font-medium">
                      {t('viewSchedule')} →
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {instructors.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No instructors available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[var(--yoga-cream)] py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-light text-gray-900 mb-4">{t('cta.title')}</h2>
            <p className="text-lg text-gray-700 mb-8">{t('cta.description')}</p>
            <Link href="/schema">
              <Button 
                size="lg"
                className="bg-[var(--yoga-sage)] hover:bg-[var(--yoga-deep-sage)] text-white"
              >
                {t('cta.button')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Instructor Modal */}
      {selectedInstructor && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
          onClick={() => setSelectedInstructor(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <button
                onClick={() => setSelectedInstructor(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white transition-colors z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="relative h-80 bg-[var(--yoga-cream)]">
                {selectedInstructor.image_url ? (
                  <Image
                    src={selectedInstructor.image_url}
                    alt={selectedInstructor.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-40 h-40 rounded-full bg-[var(--yoga-sage)] flex items-center justify-center">
                      <span className="text-5xl font-light text-white">
                        {selectedInstructor.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-8">
                <h2 className="text-3xl font-light text-gray-900 mb-4">
                  {selectedInstructor.name}
                </h2>
                
                {selectedInstructor.bio && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('philosophy')}</h3>
                    <p className="text-gray-600 whitespace-pre-line">{selectedInstructor.bio}</p>
                  </div>
                )}
                
                <div className="mt-8 flex gap-4">
                  <Link href="/schema" className="flex-1">
                    <Button 
                      className="w-full bg-[var(--yoga-sage)] hover:bg-[var(--yoga-deep-sage)] text-white"
                    >
                      {t('viewSchedule')}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedInstructor(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </main>
  )
}