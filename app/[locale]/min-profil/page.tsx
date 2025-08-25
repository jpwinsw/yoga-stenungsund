'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { braincore } from '@/lib/api/braincore'
import { useAuth } from '@/lib/contexts/AuthContext'
import AuthGuard from '@/components/auth/AuthGuard'
import type { MemberProfile, MemberSubscription } from '@/lib/types/braincore'
import MembershipManagementModal from '@/components/membership/MembershipManagementModal'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  CreditCard, 
  Sparkles,
  Edit,
  Save,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

export default function MyProfilePage() {
  const t = useTranslations('my-profile')
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [subscriptions, setSubscriptions] = useState<MemberSubscription[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    country: ''
  })
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showMembershipModal, setShowMembershipModal] = useState(false)

  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch profile and subscriptions in parallel
      const [profileData, subscriptionsData] = await Promise.all([
        braincore.getMemberProfile(),
        braincore.getMemberSubscriptions()
      ])
      
      setProfile(profileData)
      setSubscriptions(subscriptionsData)
      
      // Initialize edit form with current data
      setEditForm({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        city: profileData.city || '',
        country: profileData.country || ''
      })
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      setError(t('error.loading'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfileData()
    }
  }, [fetchProfileData, isAuthenticated])

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      setError(null)
      
      await braincore.updateMemberProfile(editForm)
      
      // Update local state
      if (profile) {
        setProfile({
          ...profile,
          ...editForm
        })
      }
      
      setIsEditing(false)
      setSuccessMessage(t('success.profileUpdated'))
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('Failed to update profile:', err)
      setError(t('error.updating'))
    } finally {
      setSaving(false)
    }
  }

  const getActiveSubscription = () => {
    return subscriptions.find(sub => sub.status === 'active')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-500">{t('loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchProfileData}
              className="px-4 py-2 bg-[var(--yoga-purple)] text-white rounded-lg hover:bg-purple-700"
            >
              {t('retry')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const activeSubscription = getActiveSubscription()

  return (
    <AuthGuard>
      <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-[var(--yoga-cream)] to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">{t('title')}</h1>
          <p className="text-lg text-gray-600">{t('subtitle')}</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <User className="w-6 h-6 text-[var(--yoga-purple)]" />
                {t('personalInfo.title')}
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--yoga-purple)] hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  {t('actions.edit')}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      // Reset form to original values
                      if (profile) {
                        setEditForm({
                          first_name: profile.first_name || '',
                          last_name: profile.last_name || '',
                          phone: profile.phone || '',
                          address: profile.address || '',
                          city: profile.city || '',
                          country: profile.country || ''
                        })
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    {t('actions.cancel')}
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[var(--yoga-purple)] text-white hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? t('actions.saving') : t('actions.save')}
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('personalInfo.firstName')}
                    </label>
                    <input
                      type="text"
                      value={editForm.first_name}
                      onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--yoga-purple)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('personalInfo.lastName')}
                    </label>
                    <input
                      type="text"
                      value={editForm.last_name}
                      onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--yoga-purple)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('personalInfo.phone')}
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--yoga-purple)]"
                    placeholder="+46 70 123 45 67"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('personalInfo.address')}
                  </label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--yoga-purple)]"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('personalInfo.city')}
                    </label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--yoga-purple)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('personalInfo.country')}
                    </label>
                    <input
                      type="text"
                      value={editForm.country}
                      onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--yoga-purple)]"
                      placeholder="Sverige"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">{t('personalInfo.name')}</p>
                    <p className="font-medium">{profile?.first_name} {profile?.last_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">{t('personalInfo.email')}</p>
                    <p className="font-medium">{profile?.email}</p>
                  </div>
                </div>
                {profile?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">{t('personalInfo.phone')}</p>
                      <p className="font-medium">{profile.phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">{t('personalInfo.memberSince')}</p>
                    <p className="font-medium">{profile && formatDate(profile.created_at)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Membership Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-[var(--yoga-cyan)]" />
              {t('membership.title')}
            </h2>

            {activeSubscription ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">{t('membership.plan')}</p>
                  <p className="font-semibold text-lg text-[var(--yoga-purple)]">
                    {activeSubscription.plan_name}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">{t('membership.status')}</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {t(`membership.statusTypes.${activeSubscription.status}`)}
                  </span>
                </div>

                {activeSubscription.current_credits !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">{t('membership.credits')}</p>
                    <p className="font-semibold text-2xl text-[var(--yoga-cyan)]">
                      {activeSubscription.current_credits}
                      {activeSubscription.credits_used_this_period !== undefined && (
                        <span className="text-sm text-gray-500 font-normal ml-2">
                          ({activeSubscription.credits_used_this_period} {t('membership.creditsUsed')})
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {activeSubscription.next_billing_date && (
                  <div>
                    <p className="text-sm text-gray-500">{t('membership.nextBilling')}</p>
                    <p className="font-medium">{formatDate(activeSubscription.next_billing_date)}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <button
                    onClick={() => setShowMembershipModal(true)}
                    className="text-sm text-[var(--yoga-purple)] hover:text-purple-700 font-medium"
                  >
                    {t('membership.manage')} →
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">{t('membership.noActive')}</p>
                <Link
                  href="/medlemskap"
                  className="inline-flex items-center px-4 py-2 bg-[var(--yoga-purple)] text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {t('membership.explore')}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-4">{t('quickActions.title')}</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              href="/schema"
              className="text-center p-4 rounded-lg border border-gray-200 hover:border-[var(--yoga-purple)] hover:bg-purple-50 transition-all"
            >
              <Calendar className="w-8 h-8 mx-auto mb-2 text-[var(--yoga-purple)]" />
              <p className="font-medium">{t('quickActions.bookClass')}</p>
            </Link>
            <Link
              href="/mina-bokningar"
              className="text-center p-4 rounded-lg border border-gray-200 hover:border-[var(--yoga-cyan)] hover:bg-cyan-50 transition-all"
            >
              <Calendar className="w-8 h-8 mx-auto mb-2 text-[var(--yoga-cyan)]" />
              <p className="font-medium">{t('quickActions.viewBookings')}</p>
            </Link>
            <Link
              href="/medlemskap"
              className="text-center p-4 rounded-lg border border-gray-200 hover:border-[var(--yoga-sage)] hover:bg-green-50 transition-all"
            >
              <CreditCard className="w-8 h-8 mx-auto mb-2 text-[var(--yoga-sage)]" />
              <p className="font-medium">{t('quickActions.changeMembership')}</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Membership Management Modal */}
      {activeSubscription && (
        <MembershipManagementModal
          isOpen={showMembershipModal}
          onClose={() => setShowMembershipModal(false)}
          subscription={activeSubscription}
          onRefresh={fetchProfileData}
        />
      )}
      </div>
    </AuthGuard>
  )
}