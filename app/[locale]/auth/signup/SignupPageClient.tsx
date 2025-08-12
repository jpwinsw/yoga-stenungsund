'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Locale } from '@/i18n'
import SignupModal from '@/components/auth/SignupModal'
import LoginModal from '@/components/auth/LoginModal'
import { useBraincore } from '@/lib/hooks/useBraincore'

interface SignupPageClientProps {
  locale: Locale
}

function SignupPageContent({ locale }: SignupPageClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const braincore = useBraincore()
  const [showSignupModal, setShowSignupModal] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)
  
  // Extract prefill data from URL params
  const prefillData = {
    email: searchParams.get('email') || undefined,
    firstName: searchParams.get('firstName') || undefined,
    lastName: searchParams.get('lastName') || undefined,
    phone: searchParams.get('phone') || undefined,
  }

  // If already authenticated, redirect to home or bookings
  useEffect(() => {
    if (braincore.isAuthenticated()) {
      router.push(`/${locale}/mina-bokningar`)
    }
  }, [braincore, router, locale])

  const handleSignupSuccess = () => {
    // After successful signup, redirect to bookings or return URL
    const returnUrl = searchParams.get('returnUrl') || `/${locale}/mina-bokningar`
    router.push(returnUrl)
  }

  const handleClose = () => {
    // When closing modal, go back or to home
    const returnUrl = searchParams.get('returnUrl') || `/${locale}`
    router.push(returnUrl)
  }

  return (
    <>
      <SignupModal
        isOpen={showSignupModal}
        onClose={handleClose}
        onSuccess={handleSignupSuccess}
        onSwitchToLogin={() => {
          setShowSignupModal(false)
          setShowLoginModal(true)
        }}
        prefillData={prefillData}
      />
      
      <LoginModal
        isOpen={showLoginModal}
        onClose={handleClose}
        onSuccess={handleSignupSuccess}
        onSwitchToSignup={() => {
          setShowLoginModal(false)
          setShowSignupModal(true)
        }}
      />
    </>
  )
}

export default function SignupPageClient({ locale }: SignupPageClientProps) {
  return (
    <Suspense fallback={<div />}>
      <SignupPageContent locale={locale} />
    </Suspense>
  )
}