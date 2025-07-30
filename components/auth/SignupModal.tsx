'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react'
import { braincore } from '@/lib/api/braincore'
import type { SignupRequest } from '@/lib/types/braincore'
import axios from 'axios'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  onSwitchToLogin: () => void
}

export default function SignupModal({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToLogin
}: SignupModalProps) {
  const t = useTranslations('member.auth.signup')
  const [formData, setFormData] = useState<SignupRequest & { confirmPassword: string }>({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const passwordRequirements = {
    minLength: formData.password.length >= 8,
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordMismatch'))
      return
    }

    if (!acceptedTerms) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const signupData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone
      }
      await braincore.signup(signupData)
      
      // Auto-login after signup
      await braincore.login({
        email: formData.email,
        password: formData.password
      })
      
      onSuccess()
    } catch (err) {
      console.error('Signup error:', err)
      
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          setError(t('emailExists'))
        } else if (err.response?.data?.message) {
          setError(err.response.data.message)
        } else {
          setError(t('networkError'))
        }
      } else {
        setError(t('networkError'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('firstName')}
                </label>
                <Input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('lastName')}
                </label>
                <Input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('email')}
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                {t('phone')}
              </label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t('phonePlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('password')}
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              {/* Password Requirements */}
              <div className="mt-2 text-sm">
                <p className="text-gray-600 mb-1">{t('passwordRequirements')}</p>
                <div className={`flex items-center gap-1 ${passwordRequirements.minLength ? 'text-[var(--yoga-cyan)]' : 'text-gray-400'}`}>
                  {passwordRequirements.minLength ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-current" />
                  )}
                  <span>{t('minLength')}</span>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                {t('confirmPassword')}
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                {t('termsAgreement')}{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700">
                  {t('privacyPolicy')}
                </a>
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !acceptedTerms}
              className="w-full"
            >
              {isLoading ? t('signingUp') : t('signUp')}
            </Button>
          </form>

        {/* Switch to Login */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t('haveAccount')}{' '}
            <Button
              onClick={onSwitchToLogin}
              variant="link"
              className="p-0 h-auto font-medium"
            >
              {t('login')}
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}