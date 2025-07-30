'use client'

import { Check } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

export default function BookingSuccessPage() {
  const t = useTranslations('bookingSuccess')
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-[var(--yoga-cyan)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-[var(--yoga-cyan)]" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">{t('title')}</h1>
        <p className="text-gray-600 mb-6">
          {t('message')}
        </p>
        
        <div className="space-y-3">
          <Link href="/schema">
            <Button className="w-full">
              {t('backToSchedule')}
            </Button>
          </Link>
          
          <Link href="/mina-sidor">
            <Button variant="outline" className="w-full">
              {t('viewBookings')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}