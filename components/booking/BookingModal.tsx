'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, MapPin, User } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils/date'
import { braincore } from '@/lib/api/braincore'
import type { ScheduleSession, BookingOptions } from '@/lib/types/braincore'
import axios from 'axios'
import LoginModal from '@/components/auth/LoginModal'
import SignupModal from '@/components/auth/SignupModal'
import StripePaymentForm from './StripePaymentForm'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface BookingModalProps {
  session: ScheduleSession
  isOpen: boolean
  onClose: () => void
  onBookingSuccess?: () => void
}

export default function BookingModal({ 
  session, 
  isOpen, 
  onClose,
  onBookingSuccess
}: BookingModalProps) {
  const t = useTranslations('schema.booking')
  const locale = useLocale()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingReference, setBookingReference] = useState<string | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [showGuestForm, setShowGuestForm] = useState(false)
  const [guestData, setGuestData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  })
  const [showWaitlistOption, setShowWaitlistOption] = useState(false)
  const [waitlistSuccess, setWaitlistSuccess] = useState(false)
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentIntent, setPaymentIntent] = useState<{
    client_secret: string
    publishable_key: string
    amount: number
  } | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [bookingData, setBookingData] = useState<{
    session_id: number
    contact_id?: number
    guest_info?: {
      first_name: string
      last_name: string
      email: string
      phone?: string
    }
  } | null>(null)
  const [pendingBookingId, setPendingBookingId] = useState<number | null>(null)
  const [bookingOptions, setBookingOptions] = useState<BookingOptions | null>(null)
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [showCreditConfirmation, setShowCreditConfirmation] = useState(false)
  const [creditsRequired, setCreditsRequired] = useState<number>(0)
  const [hasAutoBooked, setHasAutoBooked] = useState(false)
  
  const startDate = new Date(session.start_time)
  const endDate = new Date(session.end_time)
  const durationMinutes = Math.floor((endDate.getTime() - startDate.getTime()) / 1000 / 60)
  
  // Fetch booking options when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset all states
      setLoadingOptions(true)
      setError(null)
      setBookingSuccess(false)
      setBookingReference(null)
      setShowLoginModal(false)
      setShowSignupModal(false)
      setShowGuestForm(false)
      setShowWaitlistOption(false)
      setWaitlistSuccess(false)
      setWaitlistPosition(null)
      setShowPayment(false)
      setPaymentIntent(null)
      setBookingData(null)
      setPendingBookingId(null)
      setShowCreditConfirmation(false)
      setCreditsRequired(0)
      setHasAutoBooked(false)
      
      braincore.getBookingOptions(session.id, locale)
        .then((options) => {
          setBookingOptions(options)
          
          // Check if session is full
          if (options.availability && options.availability.available_spots === 0) {
            setShowWaitlistOption(true)
          }
        })
        .catch((err) => {
          console.error('Error fetching booking options:', err)
          setError('Failed to load booking options')
        })
        .finally(() => {
          setLoadingOptions(false)
        })
    }
  }, [isOpen, session.id, locale])
  
  const handleProceedToPayment = useCallback(async () => {
    // Check authentication status again to get fresh value
    if (!braincore.isAuthenticated()) {
      setShowLoginModal(true)
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const member = braincore.getMember()
      if (!member) {
        setError('Member data not found. Please log in again.')
        return
      }
      
      // Create booking data
      const bookingData = {
        session_id: session.id,
        contact_id: member.contact_id,
      }
      
      // Attempt to create booking
      const bookingResponse = await braincore.createBooking(bookingData)
      
      // Check if payment is required
      if (bookingResponse.payment_required && bookingResponse.payment_amount) {
        // Store booking data and booking ID for after payment
        setBookingData(bookingData)
        if (bookingResponse.booking_id) {
          setPendingBookingId(bookingResponse.booking_id)
        }
        
        // Create payment intent
        // For drop-in bookings (when payment is required), treat as guest payment
        const paymentData = {
          company_id: parseInt(process.env.NEXT_PUBLIC_COMPANY_ID || '5'),
          amount: bookingResponse.payment_amount * 100, // Convert to öre/cents
          currency: 'sek',
          description: `Booking for ${session.service_template_name}`,
          entity_type: 'service_booking',
          entity_id: bookingResponse.booking_id,  // Use the booking ID, not session ID
          customer_email: member.email,
          customer_name: `${member.first_name} ${member.last_name}`,
          is_guest: true  // Treat drop-in as guest payment even for members
        }
        
        const paymentIntentResponse = await braincore.createPaymentIntent(paymentData)
        
        setPaymentIntent({
          client_secret: paymentIntentResponse.client_secret,
          publishable_key: paymentIntentResponse.publishable_key,
          amount: bookingResponse.payment_amount
        })
        setShowPayment(true)
      } else {
        // Booking was successful (covered by membership)
        setBookingSuccess(true)
        setBookingReference(bookingResponse.confirmation_code)
        // Call the success callback to refresh schedule
        if (onBookingSuccess) {
          onBookingSuccess()
        }
      }
      
    } catch (err) {
      console.error('Booking error:', err)
      
      let errorMessage: string | null = null
      
      if (axios.isAxiosError(err)) {
        console.error('Error response:', err.response?.data)
        errorMessage = err.response?.data?.error || 
                      err.response?.data?.detail || 
                      err.response?.data?.message || 
                      null
      }
      
      // Map backend error messages to translation keys
      const errorMap: Record<string, string> = {
        'Session is full': 'errors.sessionFull',
        'Session not found': 'errors.sessionNotFound',
        'Already booked': 'errors.alreadyBooked',
        'Booking not allowed': 'errors.bookingNotAllowed',
        'Invalid session': 'errors.invalidSession',
        'Member not found': 'errors.memberNotFound',
        'Contact ID not found': 'errors.contactIdNotFound',
        'No active membership found for this contact': 'errors.noActiveMembership',
        'No valid membership or credits available for this booking': 'errors.noCreditsAvailable',
        'Drop-in bookings are not available for this session. Please purchase a membership.': 'errors.dropInNotAvailable'
      }
      
      // If already booked, show success state instead of error
      if (errorMessage === 'Already booked') {
        setBookingSuccess(true)
        setBookingReference(t('alreadyBookedReference'))
        // Call the success callback to refresh schedule
        if (onBookingSuccess) {
          onBookingSuccess()
        }
        return
      }
      
      // Check if session is full
      if (errorMessage === 'Session is full' && session.available_spots === 0) {
        setShowWaitlistOption(true)
        setError(null)
      } else if (errorMessage && errorMap[errorMessage]) {
        // Use translation if available
        setError(t(errorMap[errorMessage]))
      } else if (errorMessage) {
        // Show original error if no translation available
        setError(errorMessage)
      } else {
        // Generic error message
        setError(t('bookingError'))
      }
    } finally {
      setIsLoading(false)
    }
  }, [session, t, onBookingSuccess])
  
  const handleAuthSuccess = () => {
    setShowLoginModal(false)
    setShowSignupModal(false)
    
    // If we already have a successful booking (guest who just signed up), don't book again
    if (bookingSuccess && bookingReference) {
      // Just close the modal - they already have their booking
      onClose()
      return
    }
    
    // Otherwise proceed with payment/booking after successful auth
    // Use setTimeout to ensure state updates and auth token is set
    setTimeout(() => {
      handleProceedToPayment()
    }, 100)
  }
  
  // Handle auto-booking for unlimited memberships and credit confirmation
  useEffect(() => {
    if (!bookingOptions || loadingOptions || hasAutoBooked) return
    
    // Check if member has valid membership
    if (bookingOptions.booking_options && bookingOptions.booking_options.length === 1 && 
        bookingOptions.booking_options[0].action === 'book_with_membership') {
      
      const option = bookingOptions.booking_options[0]
      
      if (option.credits_required) {
        // Credit-based membership - show confirmation
        setCreditsRequired(option.credits_required)
        setShowCreditConfirmation(true)
      } else if (!isLoading && !bookingSuccess && !error) {
        // Unlimited membership - auto-book
        setHasAutoBooked(true)
        handleProceedToPayment()
      }
    }
  }, [bookingOptions, loadingOptions, hasAutoBooked, isLoading, bookingSuccess, error, handleProceedToPayment])

  const handleCreditBooking = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const member = braincore.getMember()
      if (!member) {
        setError('Member data not found. Please log in again.')
        return
      }
      
      // Create booking data with credit usage flag
      const bookingData = {
        session_id: session.id,
        contact_id: member.contact_id,
        use_credits: true // This tells the backend to use credits instead of payment
      }
      
      // Create the booking using credits
      const bookingResponse = await braincore.createBooking(bookingData)
      
      // Booking was successful with credits
      setBookingSuccess(true)
      setBookingReference(bookingResponse.confirmation_code)
      setShowCreditConfirmation(false)
      
      // Call the success callback to refresh schedule
      if (onBookingSuccess) {
        onBookingSuccess()
      }
      
    } catch (err) {
      console.error('Credit booking error:', err)
      
      let errorMessage: string | null = null
      
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.error || 
                      err.response?.data?.detail || 
                      err.response?.data?.message || 
                      null
      }
      
      // Map backend error messages to translation keys
      const errorMap: Record<string, string> = {
        'Insufficient credits': 'errors.insufficientCredits',
        'Session is full': 'errors.sessionFull',
        'Session not found': 'errors.sessionNotFound',
        'Already booked': 'errors.alreadyBooked',
        'Booking window closed': 'errors.bookingWindowClosed',
        'Member not found': 'errors.memberNotFound'
      }
      
      if (errorMessage && errorMap[errorMessage]) {
        setError(t(errorMap[errorMessage]))
      } else if (errorMessage) {
        setError(errorMessage)
      } else {
        setError(t('bookingError'))
      }
      
      setShowCreditConfirmation(false)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handlePaymentSuccess = async (paymentIntentId: string) => {
    console.log('handlePaymentSuccess called with:', paymentIntentId, 'pendingBookingId:', pendingBookingId)
    try {
      if (!pendingBookingId) {
        throw new Error('No pending booking ID available')
      }
      
      // Confirm the booking payment
      console.log('Confirming booking payment for booking:', pendingBookingId)
      const response = await braincore.confirmBookingPayment(pendingBookingId, paymentIntentId)
      console.log('Booking payment confirmation response:', response)
      
      setBookingSuccess(true)
      setBookingReference(response.confirmation_code)
      setShowPayment(false)
      // Call the success callback to refresh schedule
      if (onBookingSuccess) {
        onBookingSuccess()
      }
    } catch (err) {
      console.error('Booking payment confirmation error:', err)
      setError(t('bookingError'))
      setShowPayment(false)
    }
  }
  
  const handlePaymentError = (error: string) => {
    setError(error)
    setShowPayment(false)
  }
  
  const handleJoinWaitlist = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const member = braincore.getMember()
      if (!member) {
        setError('Member data not found. Please log in again.')
        return
      }
      
      const bookingData = {
        session_id: session.id,
        contact_id: member.contact_id,
        join_waitlist: true
      }
      
      const response = await braincore.createBooking(bookingData)
      
      if (response.status === 'waitlisted' && response.session_details?.waitlist_position) {
        setWaitlistSuccess(true)
        setWaitlistPosition(response.session_details.waitlist_position)
        
        // Check if already on waitlist
        if (response.session_details.already_on_waitlist) {
          setError(t('alreadyOnWaitlist'))
        }
      }
    } catch (err) {
      console.error('Waitlist error:', err)
      setError(t('waitlistError'))
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleGuestProceedToPayment = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Create guest booking
      const bookingData = {
        session_id: session.id,
        guest_info: {
          first_name: guestData.first_name,
          last_name: guestData.last_name,
          email: guestData.email,
          phone: guestData.phone
        }
      }
      
      // Attempt to create booking
      const bookingResponse = await braincore.createBooking(bookingData)
      
      // Check if payment is required (it should be for guest drop-in)
      if (bookingResponse.payment_required && bookingResponse.payment_amount) {
        // Store booking data and booking ID for after payment
        setBookingData(bookingData)
        if (bookingResponse.booking_id) {
          setPendingBookingId(bookingResponse.booking_id)
        }
        
        // Create payment intent for guest
        const paymentData = {
          company_id: parseInt(process.env.NEXT_PUBLIC_COMPANY_ID || '5'),
          amount: bookingResponse.payment_amount * 100, // Convert to öre/cents
          currency: 'sek',
          description: `Guest booking for ${session.service_template_name}`,
          entity_type: 'service_booking',
          entity_id: bookingResponse.booking_id,  // Use the booking ID, not session ID
          customer_email: guestData.email,
          customer_name: `${guestData.first_name} ${guestData.last_name}`,
          is_guest: true
        }
        
        const paymentIntentResponse = await braincore.createPaymentIntent(paymentData)
        
        setPaymentIntent({
          client_secret: paymentIntentResponse.client_secret,
          publishable_key: paymentIntentResponse.publishable_key,
          amount: bookingResponse.payment_amount
        })
        setShowPayment(true)
        setShowGuestForm(false)
      } else {
        // This shouldn't happen for guest bookings, but handle it
        setBookingSuccess(true)
        setBookingReference(bookingResponse.confirmation_code)
      }
      
    } catch (err) {
      console.error('Guest booking error:', err)
      
      let errorMessage: string | null = null
      
      if (axios.isAxiosError(err)) {
        console.error('Error response:', err.response?.data)
        errorMessage = err.response?.data?.error || 
                      err.response?.data?.detail || 
                      err.response?.data?.message || 
                      null
      }
      
      // Map backend error messages to translation keys
      const errorMap: Record<string, string> = {
        'Session is full': 'errors.sessionFull',
        'Session not found': 'errors.sessionNotFound',
        'Already booked': 'errors.alreadyBooked',
        'Booking not allowed': 'errors.bookingNotAllowed',
        'Invalid session': 'errors.invalidSession'
      }
      
      // Check if session is full
      if (errorMessage === 'Session is full' && session.available_spots === 0) {
        // For guests, we don't support waitlist yet
        setError(t('errors.sessionFull'))
      } else if (errorMessage && errorMap[errorMessage]) {
        // Use translation if available
        setError(t(errorMap[errorMessage]))
      } else if (errorMessage) {
        // Show original error if no translation available
        setError(errorMessage)
      } else {
        // Generic error message
        setError(t('bookingError'))
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
          </DialogHeader>
          
          {showPayment && paymentIntent ? (
            /* Payment State */
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('payment')}</h3>
              
              {/* Class Info Summary */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <div className="font-medium">{session.service_template_name}</div>
                <div>{formatDate(startDate, 'EEEE, MMMM d')} • {formatTime(session.start_time)}</div>
              </div>
              
              <StripePaymentForm
                amount={paymentIntent.amount}
                currency="sek"
                publishableKey={paymentIntent.publishable_key}
                clientSecret={paymentIntent.client_secret}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                guestEmail={guestData.email || (braincore.getMember()?.email)}
                customerName={guestData.first_name && guestData.last_name ? 
                  `${guestData.first_name} ${guestData.last_name}` : 
                  braincore.getMember() ? 
                    `${braincore.getMember()?.first_name} ${braincore.getMember()?.last_name}` : 
                    undefined}
              />
              
              <Button
                variant="outline"
                onClick={() => {
                  setShowPayment(false)
                  setPaymentIntent(null)
                  setError(null)
                }}
                className="w-full"
              >
                {t('back')}
              </Button>
            </div>
          ) : bookingSuccess || waitlistSuccess ? (
            /* Success State */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[var(--yoga-cyan)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[var(--yoga-cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {waitlistSuccess ? t('waitlistSuccess') : t('bookingSuccess')}
              </h3>
              <p className="text-gray-600 mb-2">
                {waitlistSuccess && waitlistPosition ? (
                  <>
                    {t('waitlistPosition')}: <span className="font-mono">#{waitlistPosition}</span>
                  </>
                ) : (
                  <>
                    {t('bookingReference')}: <span className="font-mono">{bookingReference}</span>
                  </>
                )}
              </p>
              {!waitlistSuccess && (guestData.email || braincore.getMember()?.email) && (
                <p className="text-sm text-gray-500 mb-4">
                  {t('confirmationEmailSent', { email: guestData.email || braincore.getMember()?.email || '' })}
                </p>
              )}
              {waitlistSuccess && (
                <p className="text-sm text-gray-500 mb-4">{t('waitlistInfo')}</p>
              )}
              
              {/* Account creation prompt for guests */}
              {!waitlistSuccess && guestData.email && !braincore.isAuthenticated() && (
                <div className="bg-[var(--yoga-sage)]/10 border border-[var(--yoga-sage)]/20 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{t('createAccountPrompt.title')}</h4>
                  <ul className="text-sm text-gray-600 space-y-1 mb-3">
                    <li>• {t('createAccountPrompt.benefit1')}</li>
                    <li>• {t('createAccountPrompt.benefit2')}</li>
                    <li>• {t('createAccountPrompt.benefit3')}</li>
                    <li>• {t('createAccountPrompt.benefit4')}</li>
                  </ul>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowSignupModal(true)
                        // Pre-fill the signup form with guest data
                        setBookingSuccess(false)
                      }}
                      className="flex-1"
                    >
                      {t('createAccountPrompt.createAccount')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className="flex-1"
                    >
                      {t('createAccountPrompt.continueLater')}
                    </Button>
                  </div>
                </div>
              )}
              
              {!guestData.email && (
                <Button
                  onClick={onClose}
                  className="px-6"
                >
                  {t('backToSchedule')}
                </Button>
              )}
            </div>
          ) : showWaitlistOption ? (
            /* Waitlist Option */
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-yellow-800 font-medium">{t('errors.sessionFull')}</p>
                <p className="text-yellow-700 text-sm mt-1">{t('waitlistConfirmation')}</p>
              </div>
              
              {/* Class Info */}
              <div className="space-y-3 text-sm">
                <h3 className="text-lg font-semibold">{session.service_template_name}</h3>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{formatDate(startDate, 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{formatTime(session.start_time)} - {formatTime(session.end_time)}</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">{t('waitlistInfo')}</p>
              
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowWaitlistOption(false)
                    setError(null)
                  }}
                  className="flex-1"
                >
                  {t('back')}
                </Button>
                <Button
                  onClick={handleJoinWaitlist}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? t('joiningWaitlist') : t('joinWaitlist')}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Class Info */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold">{session.service_template_name}</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{formatDate(startDate, 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{formatTime(session.start_time)} - {formatTime(session.end_time)} ({durationMinutes} min)</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>{session.instructor_name}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{session.resource_name}</span>
                  </div>
                </div>
              </div>
              
              {/* Availability */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm">
                  <span className="font-medium">{t('availableSpots')}:</span> {session.available_spots}
                </p>
              </div>
              
              {/* Loading Options */}
              {loadingOptions && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <p className="text-sm text-gray-600 mt-2">Loading booking options...</p>
                </div>
              )}
              
              {/* Booking Options */}
              {!loadingOptions && bookingOptions && (
                <>
                  {/* Check if user already has a booking */}
                  {bookingOptions.booking_options && bookingOptions.booking_options.length === 1 && 
                   bookingOptions.booking_options[0].type === 'already_booked' ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-[var(--yoga-cyan)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-[var(--yoga-cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{t('alreadyBooked')}</h3>
                      <p className="text-gray-600 mb-4">{t('alreadyBookedMessage')}</p>
                      <Button
                        onClick={onClose}
                        className="px-6"
                      >
                        {t('close')}
                      </Button>
                    </div>
                  ) : /* If member has valid membership, handle based on type */
                  bookingOptions.booking_options && bookingOptions.booking_options.length === 1 && 
                   bookingOptions.booking_options[0].action === 'book_with_membership' ? (
                    <>
                      {/* Check if it's credit-based or unlimited */}
                      {bookingOptions.booking_options[0].credits_required ? (
                        /* Credit-based membership - show confirmation */
                        showCreditConfirmation ? (
                          <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h4 className="font-medium text-blue-900 mb-2">{t('confirmCreditUsage')}</h4>
                              <p className="text-blue-800">
                                {t('creditUsageMessage', { 
                                  credits: creditsRequired,
                                  remaining: (bookingOptions.user_info?.available_credits || 0) - creditsRequired
                                })}
                              </p>
                            </div>
                            <div className="flex gap-3">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setShowCreditConfirmation(false)
                                  onClose()
                                }}
                                className="flex-1"
                              >
                                {t('cancel')}
                              </Button>
                              <Button
                                onClick={handleCreditBooking}
                                disabled={isLoading}
                                className="flex-1"
                              >
                                {isLoading ? t('booking') : t('useCredits')}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          /* Auto-show credit confirmation */
                          <div className="text-center py-4">
                            <p className="text-sm text-gray-600">{t('loading')}</p>
                          </div>
                        )
                      ) : (
                        /* Unlimited membership - auto-proceed */
                        <div className="text-center py-4">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                          <p className="text-sm text-gray-600 mt-2">{t('booking')}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="border-t pt-4 mb-6">
                      <h4 className="font-medium mb-3">{t('bookingOptions')}</h4>
                      <div className="space-y-3">
                        {bookingOptions.booking_options && bookingOptions.booking_options.map((option, index) => (
                          <div key={index} className="border rounded-lg p-4 hover:border-gray-400 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium">{option.title}</h5>
                                <p className="text-sm text-gray-600">{option.description}</p>
                                {option.credits_required && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    {t('creditsRequired')}: {option.credits_required}
                                  </p>
                                )}
                              </div>
                              {option.price && (
                                <span className="font-medium">{option.price} {option.currency}</span>
                              )}
                            </div>
                            <Button
                              onClick={() => {
                                if (option.action === 'login') {
                                  setShowLoginModal(true)
                                } else if (option.action === 'book_with_membership') {
                                  handleProceedToPayment()
                                } else if (option.action === 'book_drop_in') {
                                  // For drop-in bookings, always proceed with drop-in flow
                                  // The backend will handle it correctly whether authenticated or not
                                  handleProceedToPayment()
                                } else if (option.action === 'view_memberships') {
                                  // Close modal and navigate to memberships page
                                  onClose()
                                  router.push('/memberships')
                                }
                              }}
                              disabled={!option.available || isLoading}
                              className="w-full mt-3"
                              variant={option.type === 'membership' ? 'default' : 'outline'}
                            >
                              {option.type === 'member_login' ? t('loginNow') : 
                               option.type === 'drop_in' && !braincore.isAuthenticated() ? t('continueAsGuest') :
                               t('selectOption')}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}
              
              {/* Guest Form - shown when drop-in is selected for non-authenticated users */}
              {showGuestForm ? (
                /* Guest Form */
                <div className="space-y-4">
                  <h4 className="font-medium">{t('guestInfo')}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('firstName')}
                      </label>
                      <Input
                        type="text"
                        value={guestData.first_name}
                        onChange={(e) => setGuestData(prev => ({ ...prev, first_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('lastName')}
                      </label>
                      <Input
                        type="text"
                        value={guestData.last_name}
                        onChange={(e) => setGuestData(prev => ({ ...prev, last_name: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('email')}
                    </label>
                    <Input
                      type="email"
                      value={guestData.email}
                      onChange={(e) => setGuestData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('phone')}
                    </label>
                    <Input
                      type="tel"
                      value={guestData.phone}
                      onChange={(e) => setGuestData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowGuestForm(false)}
                      className="flex-1"
                    >
                      {t('back')}
                    </Button>
                    <Button
                      onClick={handleGuestProceedToPayment}
                      disabled={isLoading || session.available_spots === 0 || !guestData.first_name || !guestData.last_name || !guestData.email}
                      className="flex-1"
                    >
                      {isLoading ? t('preparingPayment') : t('proceedToPayment')}
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Auth Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleAuthSuccess}
        onSwitchToSignup={() => {
          setShowLoginModal(false)
          setShowSignupModal(true)
        }}
      />
      
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSuccess={handleAuthSuccess}
        onSwitchToLogin={() => {
          setShowSignupModal(false)
          setShowLoginModal(true)
        }}
        prefillData={guestData.email ? {
          email: guestData.email,
          firstName: guestData.first_name,
          lastName: guestData.last_name,
          phone: guestData.phone
        } : undefined}
      />
    </>
  )
}