'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { 
  Instagram, 
  Facebook, 
  Linkedin, 
  Youtube, 
  Globe, 
  Award, 
  Calendar, 
  Languages, 
  Star,
  Play
} from 'lucide-react'
import type { Instructor } from '@/lib/types/braincore'
import { getOptimalImageUrl, getImageSizes } from '@/lib/utils/image-variants'

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
    image_url: i.photo_url || i.image_url,  // Use photo_url first, fallback to image_url
    photo_url: i.photo_url,
    certifications: i.certifications,
    specialties: i.specialties,
    years_experience: i.years_experience,
    teaching_philosophy: i.teaching_philosophy,
    professional_background: i.professional_background,
    languages_spoken: i.languages_spoken,
    social_media: i.social_media,
    media: i.media,
    testimonials: i.testimonials,
    featured_services: i.featured_services,
    style_tags: i.style_tags
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
                  {getOptimalImageUrl(instructor, 'instructor-card', ['instructor-card-mobile']) ? (
                    <Image
                      src={getOptimalImageUrl(instructor, 'instructor-card', ['instructor-card-mobile'])!}
                      alt={instructor.name}
                      fill
                      className="object-cover"
                      sizes={getImageSizes('card')}
                      priority={index < 3} // Prioritize first 3 images
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
                  
                  {/* Years of Experience */}
                  {instructor.years_experience && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>{instructor.years_experience} years experience</span>
                    </div>
                  )}
                  
                  {/* Specialties */}
                  {instructor.specialties && instructor.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {instructor.specialties.slice(0, 3).map((specialty, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {typeof specialty === 'string' ? specialty : specialty.display_name}
                        </Badge>
                      ))}
                      {instructor.specialties.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{instructor.specialties.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {instructor.bio && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {instructor.bio}
                    </p>
                  )}
                  
                  {/* Certifications Preview */}
                  {instructor.certifications && instructor.certifications.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <Award className="w-3 h-3" />
                      <span>
                        {typeof instructor.certifications[0] === 'string' 
                          ? instructor.certifications[0] 
                          : instructor.certifications[0].display_name}
                      </span>
                      {instructor.certifications.length > 1 && (
                        <span>+{instructor.certifications.length - 1} more</span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--yoga-cyan)] font-medium">
                      View Full Profile →
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
                {getOptimalImageUrl(selectedInstructor, 'instructor-detail', ['instructor-header', 'instructor-detail-2x']) ? (
                  <Image
                    src={getOptimalImageUrl(selectedInstructor, 'instructor-detail', ['instructor-header', 'instructor-detail-2x'])!}
                    alt={selectedInstructor.name}
                    fill
                    className="object-cover"
                    sizes={getImageSizes('detail')}
                    priority={true}
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
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-3xl font-light text-gray-900 mb-2">
                      {selectedInstructor.name}
                    </h2>
                    
                    {/* Experience and Languages */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {selectedInstructor.years_experience && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{selectedInstructor.years_experience} years experience</span>
                        </div>
                      )}
                      {selectedInstructor.languages_spoken && selectedInstructor.languages_spoken.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Languages className="w-4 h-4" />
                          <span>{selectedInstructor.languages_spoken.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Social Media Links */}
                  {selectedInstructor.social_media && (
                    <div className="flex gap-2">
                      {selectedInstructor.social_media.instagram && (
                        <a href={`https://instagram.com/${selectedInstructor.social_media.instagram.replace('@', '')}`} 
                           target="_blank" rel="noopener noreferrer"
                           className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                          <Instagram className="w-5 h-5" />
                        </a>
                      )}
                      {selectedInstructor.social_media.facebook && (
                        <a href={selectedInstructor.social_media.facebook} 
                           target="_blank" rel="noopener noreferrer"
                           className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                          <Facebook className="w-5 h-5" />
                        </a>
                      )}
                      {selectedInstructor.social_media.linkedin && (
                        <a href={selectedInstructor.social_media.linkedin} 
                           target="_blank" rel="noopener noreferrer"
                           className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                          <Linkedin className="w-5 h-5" />
                        </a>
                      )}
                      {selectedInstructor.social_media.youtube && (
                        <a href={selectedInstructor.social_media.youtube} 
                           target="_blank" rel="noopener noreferrer"
                           className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                          <Youtube className="w-5 h-5" />
                        </a>
                      )}
                      {selectedInstructor.social_media.website && (
                        <a href={selectedInstructor.social_media.website} 
                           target="_blank" rel="noopener noreferrer"
                           className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                          <Globe className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Specialties and Style Tags */}
                <div className="mb-6">
                  {selectedInstructor.specialties && selectedInstructor.specialties.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedInstructor.specialties.map((specialty, idx) => (
                          <Badge key={idx} className="bg-[var(--yoga-sage)]/10 text-[var(--yoga-deep-sage)]">
                            {typeof specialty === 'string' ? specialty : specialty.display_name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedInstructor.style_tags && selectedInstructor.style_tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Teaching Style</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedInstructor.style_tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline">
                            {typeof tag === 'string' ? tag : tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Certifications */}
                {selectedInstructor.certifications && selectedInstructor.certifications.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Certifications
                    </h3>
                    <ul className="space-y-1">
                      {selectedInstructor.certifications.map((cert, idx) => (
                        <li key={idx} className="text-gray-600 flex items-start gap-2">
                          <span className="text-[var(--yoga-sage)] mt-1">•</span>
                          <span>{typeof cert === 'string' ? cert : cert.display_name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Bio */}
                {selectedInstructor.bio && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">About</h3>
                    <p className="text-gray-600 whitespace-pre-line">{selectedInstructor.bio}</p>
                  </div>
                )}
                
                {/* Teaching Philosophy */}
                {selectedInstructor.teaching_philosophy && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Teaching Philosophy</h3>
                    <p className="text-gray-600 whitespace-pre-line">{selectedInstructor.teaching_philosophy}</p>
                  </div>
                )}
                
                {/* Professional Background */}
                {selectedInstructor.professional_background && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Background</h3>
                    <p className="text-gray-600 whitespace-pre-line">{selectedInstructor.professional_background}</p>
                  </div>
                )}
                
                {/* Video Introduction */}
                {selectedInstructor.media?.video_introduction && (
                  <div className="mb-6">
                    <a href={selectedInstructor.media.video_introduction} 
                       target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                      <Play className="w-5 h-5" />
                      <span>Watch Introduction Video</span>
                    </a>
                  </div>
                )}
                
                {/* Testimonials */}
                {selectedInstructor.testimonials && selectedInstructor.testimonials.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      Student Testimonials
                    </h3>
                    <div className="space-y-4">
                      {selectedInstructor.testimonials.slice(0, 3).map((testimonial, idx) => (
                        <div key={idx} className="border-l-2 border-[var(--yoga-sage)] pl-4">
                          <p className="text-gray-600 italic mb-2">&ldquo;{testimonial.text}&rdquo;</p>
                          <p className="text-sm text-gray-500">
                            — {testimonial.author}
                            {testimonial.date && <span className="ml-2">({testimonial.date})</span>}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-8 flex gap-4">
                  <Link href="/schema" className="flex-1">
                    <Button 
                      className="w-full bg-[var(--yoga-sage)] hover:bg-[var(--yoga-deep-sage)] text-white"
                    >
                      View Classes & Schedule
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