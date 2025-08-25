'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useTranslations } from 'next-intl'
import { AlertCircle, LogIn } from 'lucide-react'
import LoginModal from './LoginModal'
import SignupModal from './SignupModal'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export default function AuthGuard({ 
  children, 
  requireAuth = true 
}: AuthGuardProps) {
  const pathname = usePathname()
  const { isAuthenticated, isLoading } = useAuth()
  const t = useTranslations('auth')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [showSessionExpiredNotice, setShowSessionExpiredNotice] = useState(false)

  useEffect(() => {
    // Check if we were redirected due to session expiry
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('sessionExpired') === 'true') {
        setShowSessionExpiredNotice(true)
        setShowLoginModal(true)
        
        // Clean up URL
        urlParams.delete('sessionExpired')
        urlParams.delete('returnUrl')
        const newUrl = urlParams.toString() ? `?${urlParams.toString()}` : ''
        window.history.replaceState({}, '', `${pathname}${newUrl}`)
      }
    }
  }, [pathname])

  useEffect(() => {
    if (!isLoading && !isAuthenticated && requireAuth) {
      // Show login modal instead of redirecting
      setShowLoginModal(true)
    }
  }, [isAuthenticated, isLoading, requireAuth])

  const handleLoginSuccess = () => {
    setShowLoginModal(false)
    setShowSessionExpiredNotice(false)
    // Reload the page to fetch fresh data with authentication
    window.location.reload()
  }

  const handleSignupSuccess = () => {
    setShowSignupModal(false)
    setShowLoginModal(true)
  }

  const switchToSignup = () => {
    setShowLoginModal(false)
    setShowSignupModal(true)
  }

  const switchToLogin = () => {
    setShowSignupModal(false)
    setShowLoginModal(true)
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    )
  }

  // If authentication is required and user is not authenticated, show error state with login prompt
  if (requireAuth && !isAuthenticated) {
    return (
      <>
        <div className="min-h-screen pt-20 pb-16">
          <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              {showSessionExpiredNotice && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <p className="font-medium">{t('sessionExpired.title')}</p>
                  </div>
                  <p className="text-sm text-yellow-700">{t('sessionExpired.message')}</p>
                </div>
              )}
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <LogIn className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('authRequired.title')}</h2>
                <p className="text-gray-600 mb-6">{t('authRequired.message')}</p>
                
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[var(--yoga-purple)] to-purple-700 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  {t('authRequired.loginButton')}
                </button>
                
                <p className="mt-4 text-sm text-gray-600">
                  {t('authRequired.noAccount')}{' '}
                  <button
                    onClick={() => setShowSignupModal(true)}
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    {t('authRequired.signupLink')}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={handleLoginSuccess}
          onSwitchToSignup={switchToSignup}
        />

        <SignupModal
          isOpen={showSignupModal}
          onClose={() => setShowSignupModal(false)}
          onSuccess={handleSignupSuccess}
          onSwitchToLogin={switchToLogin}
        />
      </>
    )
  }

  // User is authenticated or auth is not required, render children
  return <>{children}</>
}