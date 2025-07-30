'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { braincore } from '@/lib/api/braincore'
import type { LoginRequest } from '@/lib/types/braincore'
import axios from 'axios'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  onSwitchToSignup: () => void
}

export default function LoginModal({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToSignup
}: LoginModalProps) {
  const t = useTranslations('member.auth.login')
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await braincore.login(formData)
      onSuccess()
    } catch (err) {
      console.error('Login error:', err)
      
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError(t('invalidCredentials'))
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
      <DialogContent className="sm:max-w-md">
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

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
            </div>

            <div className="text-right">
              <Button
                type="button"
                variant="link"
                className="text-sm p-0 h-auto"
              >
                {t('forgotPassword')}
              </Button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? t('loggingIn') : t('login')}
            </Button>
          </form>

        {/* Switch to Signup */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t('noAccount')}{' '}
            <Button
              onClick={onSwitchToSignup}
              variant="link"
              className="p-0 h-auto font-medium"
            >
              {t('signUp')}
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}