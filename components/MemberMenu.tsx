'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { braincore } from '@/lib/api/braincore'
import { User, LogOut, Calendar } from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'
import LoginModal from './auth/LoginModal'
import SignupModal from './auth/SignupModal'

interface MemberMenuProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function MemberMenu({ isOpen, onToggle }: MemberMenuProps = {}) {
  const t = useTranslations('member')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [member, setMember] = useState<{ first_name: string; last_name: string } | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const isDropdownOpen = isOpen !== undefined ? isOpen : showMenu
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)

  useEffect(() => {
    // Check authentication status on mount and after auth changes
    const checkAuth = () => {
      const authenticated = braincore.isAuthenticated()
      setIsAuthenticated(authenticated)
      if (authenticated) {
        const memberData = braincore.getMember()
        setMember(memberData)
      } else {
        setMember(null)
      }
    }
    
    checkAuth()
    
    // Listen for storage changes (login/logout in other tabs)
    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [])

  const handleLogout = () => {
    braincore.logout()
    setIsAuthenticated(false)
    setMember(null)
    setShowMenu(false)
  }

  const handleAuthSuccess = () => {
    setShowLoginModal(false)
    setShowSignupModal(false)
    
    // Update authentication status
    const authenticated = braincore.isAuthenticated()
    setIsAuthenticated(authenticated)
    if (authenticated) {
      const memberData = braincore.getMember()
      setMember(memberData)
    }
  }

  if (isAuthenticated && member) {
    return (
      <>
        <div className="relative">
          <button
            onClick={() => onToggle ? onToggle() : setShowMenu(!showMenu)}
            className="text-gray-700 hover:text-[var(--yoga-sage)] transition-colors flex items-center gap-1 font-medium text-[15px]"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{member.first_name}</span>
            <svg className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 transition-all duration-200 z-50 overflow-hidden ${
            isDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}>
            <div className="py-2">
              <Link
                href="/mina-bokningar"
                className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[var(--yoga-cyan)]/10 hover:to-[var(--yoga-purple)]/10 hover:text-[var(--yoga-purple)] transition-all"
                onClick={() => !onToggle && setShowMenu(false)}
              >
                <Calendar className="w-4 h-4" />
                {t('myBookings')}
              </Link>
              <Link
                href="/min-profil"
                className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[var(--yoga-cyan)]/10 hover:to-[var(--yoga-purple)]/10 hover:text-[var(--yoga-purple)] transition-all"
                onClick={() => !onToggle && setShowMenu(false)}
              >
                <User className="w-4 h-4" />
                {t('myProfile')}
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