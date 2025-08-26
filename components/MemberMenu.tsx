'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/lib/contexts/AuthContext'
import { User, LogOut, Calendar, Receipt } from 'lucide-react'
import { Link, useRouter } from '@/lib/i18n/navigation'
import LoginModal from './auth/LoginModal'
import SignupModal from './auth/SignupModal'

interface MemberMenuProps {
  isOpen?: boolean;
  onToggle?: () => void;
  onCloseMobileMenu?: () => void;
  isMobileHeader?: boolean;
}

export default function MemberMenu({ isOpen, onToggle, onCloseMobileMenu, isMobileHeader = false }: MemberMenuProps = {}) {
  const t = useTranslations('member')
  const { isAuthenticated, member, logout: authLogout, refreshAuth } = useAuth()
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const isDropdownOpen = isOpen !== undefined ? isOpen : showMenu
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)

  const handleLogout = () => {
    authLogout()
    setShowMenu(false)
    onCloseMobileMenu?.()
    // Redirect to home page after logout to ensure fresh page state
    router.push('/')
    // Force a refresh to ensure all components update
    router.refresh()
  }

  const handleAuthSuccess = () => {
    setShowLoginModal(false)
    setShowSignupModal(false)
    // Refresh auth state to update navigation
    refreshAuth()
  }

  if (isAuthenticated && member) {
    return (
      <>
        <div className="relative">
          <button
            onClick={() => onToggle ? onToggle() : setShowMenu(!showMenu)}
            className={isMobileHeader 
              ? "p-2 rounded-lg hover:bg-gray-100 transition-colors"
              : "text-gray-700 hover:text-[var(--yoga-sage)] transition-colors flex items-center gap-1 font-medium text-[15px]"
            }
          >
            <User className={isMobileHeader ? "h-6 w-6 text-gray-700" : "w-4 h-4"} />
            {!isMobileHeader && (
              <>
                <span className="hidden sm:inline">{member.first_name}</span>
                <svg className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
          
          <div className={`absolute ${isMobileHeader ? 'right-0 -mr-12' : 'right-0 lg:right-0 max-lg:right-auto max-lg:left-0'} mt-2 w-48 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 transition-all duration-200 z-50 overflow-hidden ${
            isDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}>
            <div className="py-2">
              <Link
                href="/mina-bokningar"
                className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[var(--yoga-cyan)]/10 hover:to-[var(--yoga-purple)]/10 hover:text-[var(--yoga-purple)] transition-all"
                onClick={() => {
                  if (!onToggle) setShowMenu(false)
                  onCloseMobileMenu?.()
                }}
              >
                <Calendar className="w-4 h-4" />
                {t('myBookings')}
              </Link>
              <Link
                href="/min-profil"
                className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[var(--yoga-cyan)]/10 hover:to-[var(--yoga-purple)]/10 hover:text-[var(--yoga-purple)] transition-all"
                onClick={() => {
                  if (!onToggle) setShowMenu(false)
                  onCloseMobileMenu?.()
                }}
              >
                <User className="w-4 h-4" />
                {t('myProfile')}
              </Link>
              <Link
                href="/min-kvitton"
                className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[var(--yoga-cyan)]/10 hover:to-[var(--yoga-purple)]/10 hover:text-[var(--yoga-purple)] transition-all"
                onClick={() => {
                  if (!onToggle) setShowMenu(false)
                  onCloseMobileMenu?.()
                }}
              >
                <Receipt className="w-4 h-4" />
                {t('myReceipts')}
              </Link>
              <div className="border-t border-gray-100 my-2"></div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[var(--yoga-cyan)]/10 hover:to-[var(--yoga-purple)]/10 hover:text-[var(--yoga-purple)] text-left transition-all"
              >
                <LogOut className="w-4 h-4" />
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {isMobileHeader ? (
        <button
          onClick={() => setShowLoginModal(true)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={t('login')}
        >
          <User className="h-6 w-6 text-gray-700" />
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLoginModal(true)}
            className="text-gray-700 hover:text-[var(--yoga-sage)] transition-colors font-medium text-[15px]"
          >
            {t('login')}
          </button>
          <span className="text-gray-400">|</span>
          <button
            onClick={() => setShowSignupModal(true)}
            className="text-gray-700 hover:text-[var(--yoga-sage)] transition-colors font-medium text-[15px]"
          >
            {t('signup')}
          </button>
        </div>
      )}

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
      />
    </>
  )
}