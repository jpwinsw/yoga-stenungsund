'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Calendar, MapPin, User, Mail, CheckCircle, XCircle } from 'lucide-react'
import { useBraincore } from '@/lib/hooks/useBraincore'
import { format } from 'date-fns'
import { sv, enUS } from 'date-fns/locale'
import { Locale } from '@/i18n'
import { toast } from 'sonner'

interface GuestBooking {
  id: number
  confirmation_code: string
  session_id: number
  status: string
  created_at: string
  session: {
    id: number
    start_time: string
    end_time: string
    service_template: {
      name: string
      description?: string
    }
    instructor?: {
      first_name: string
      last_name: string
    }
    resource?: {
      name: string
    }
  }
}

function BookingLookupContent({ locale }: { locale: Locale }) {
  const t = useTranslations('bookingLookup')
  const searchParams = useSearchParams()
  const braincore = useBraincore()
  
  const [confirmationCode, setConfirmationCode] = useState(searchParams.get('code') || '')
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [booking, setBooking] = useState<GuestBooking | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cancellingBooking, setCancellingBooking] = useState(false)
  const [showSignupPrompt, setShowSignupPrompt] = useState(false)

  const dateLocale = locale === 'sv' ? sv : enUS

  useEffect(() => {
    // Auto-lookup if both params are in URL
    if (searchParams.get('code') && searchParams.get('email')) {
      handleLookup()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLookup = async () => {
    if (!confirmationCode || !email) {
      setError(t('errors.missingInfo'))
      return
    }

    setLoading(true)
    setError(null)
    setBooking(null)

    try {
      const response = await fetch('/api/braincore/guest/booking-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          confirmation_code: confirmationCode,
          email: email
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t('errors.lookupFailed'))
      }

      const data = await response.json()
      setBooking(data)
      
      // Show signup prompt for guest bookings
      if (!braincore.isAuthenticated()) {
        setShowSignupPrompt(true)
      }
    } catch (err: unknown) {
      setError((err as Error).message || t('errors.lookupFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async () => {
    if (!booking) return

    setCancellingBooking(true)
    try {
      const response = await fetch(`/api/braincore/guest/bookings/${booking.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          confirmation_code: confirmationCode,
          email: email
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t('errors.cancelFailed'))
      }

      toast.success(t('bookingCancelled'))
      setBooking(null)
      setConfirmationCode('')
      setEmail('')
    } catch (err: unknown) {
      toast.error((err as Error).message || t('errors.cancelFailed'))
    } finally {
      setCancellingBooking(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'PPP p', { locale: dateLocale })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {!booking && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">{t('confirmationCode')}</Label>
                <Input
                  id="code"
                  type="text"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  placeholder={t('codePlaceholder')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleLookup} 
                disabled={loading || !confirmationCode || !email}
                className="w-full"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? t('searching') : t('lookupBooking')}
              </Button>
            </div>
          )}

          {booking && (
            <div className="space-y-6">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {t('bookingFound')}
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-semibold">{booking.session.service_template.name}</p>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(booking.session.start_time)}
                    </p>
                  </div>
                </div>

                {booking.session.instructor && (
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <p className="text-sm">
                      {t('instructor')}: {booking.session.instructor.first_name} {booking.session.instructor.last_name}
                    </p>
                  </div>
                )}

                {booking.session.resource && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <p className="text-sm">
                      {t('location')}: {booking.session.resource.name}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <p className="text-sm">{t('confirmationCode')}: {booking.confirmation_code}</p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">{t('status')}: 
                    <span className={`ml-2 font-semibold ${
                      booking.status === 'confirmed' ? 'text-green-600' : 
                      booking.status === 'cancelled' ? 'text-red-600' : 
                      'text-yellow-600'
                    }`}>
                      {t(`statuses.${booking.status}`)}
                    </span>
                  </p>
                </div>
              </div>

              {showSignupPrompt && booking.status === 'confirmed' && (
                <Alert className="bg-[var(--yoga-sage)]/10 border-[var(--yoga-sage)]/20">
                  <AlertDescription>
                    <p className="font-semibold mb-2">{t('createAccount.title')}</p>
                    <ul className="text-sm space-y-1 mb-3">
                      <li>• {t('createAccount.benefit1')}</li>
                      <li>• {t('createAccount.benefit2')}</li>
                      <li>• {t('createAccount.benefit3')}</li>
                    </ul>
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        onClick={() => window.location.href = `/${locale}/auth/signup?email=${encodeURIComponent(email)}`}
                      >
                        {t('createAccount.button')}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setShowSignupPrompt(false)}
                      >
                        {t('createAccount.later')}
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                {booking.status === 'confirmed' && (
                  <Button 
                    variant="destructive"
                    onClick={handleCancelBooking}
                    disabled={cancellingBooking}
                  >
                    {cancellingBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {cancellingBooking ? t('cancelling') : t('cancelBooking')}
                  </Button>
                )}
                
                <Button 
                  variant="outline"
                  onClick={() => {
                    setBooking(null)
                    setConfirmationCode('')
                    setEmail('')
                    setError(null)
                  }}
                >
                  {t('newLookup')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function BookingLookupClient({ locale }: { locale: Locale }) {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    }>
      <BookingLookupContent locale={locale} />
    </Suspense>
  )
}