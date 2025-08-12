'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Link } from '@/lib/i18n/navigation'
import { braincore } from '@/lib/api/braincore'
import type { MemberSubscription as BrainCoreMemberSubscription } from '@/lib/types/braincore'
import MembershipManagementModal from '@/components/membership/MembershipManagementModal'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  AlertCircle,
  Sparkles,
  CreditCard,
  Info,
  CheckCircle,
  XCircle,
  Users
} from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils/date'

interface Booking {
  booking_id: number
  session_id: number
  session_title: string
  session_start: string
  session_end: string
  instructor_name: string | null
  location: string | null
  status: 'confirmed' | 'pending' | 'cancelled' | 'checked_in' | 'no_show'
  booking_date: string
  confirmation_code: string
  checked_in_at: string | null
  amount_paid: number
  special_requests: string | null
}


interface WaitlistEntry {
  id: number
  position: number
  session?: {
    id: number
    service_template?: {
      name: string
    }
    start_time: string
    end_time: string
    instructor?: {
      name: string
    }
    resource?: {
      name: string
    }
  }
  created_at: string
}

export default function MyBookingsPage() {
  const t = useTranslations('my-bookings')
  const locale = useLocale()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([])
  const [subscriptions, setSubscriptions] = useState<BrainCoreMemberSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled' | 'waitlist'>('upcoming')
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [leavingWaitlistId, setLeavingWaitlistId] = useState<number | null>(null)
  const [showMembershipModal, setShowMembershipModal] = useState(false)

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [bookingsResponse, waitlistResponse, subscriptionsResponse] = await Promise.all([
        braincore.getMemberBookings(),
        braincore.getMemberWaitlist(),
        braincore.getMemberSubscriptions()
      ])
      setBookings(bookingsResponse)
      setWaitlistEntries(waitlistResponse)
      setSubscriptions(subscriptionsResponse)
    } catch (err) {
      console.error('Failed to fetch bookings:', err)
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    // Check if user is authenticated
    if (!braincore.isAuthenticated()) {
      router.push('/schema')
      return
    }

    fetchBookings()
  }, [router, fetchBookings])

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm(t('actions.confirmCancel'))) {
      return
    }

    try {
      setCancellingId(bookingId)
      await braincore.cancelBooking(bookingId)
      
      // Update local state
      setBookings(bookings.map(b => 
        b.booking_id === bookingId 
          ? { ...b, status: 'cancelled' as const }
          : b
      ))
      
      alert(t('actions.cancelSuccess'))
    } catch (err) {
      console.error('Failed to cancel booking:', err)
      alert(t('actions.cancelError'))
    } finally {
      setCancellingId(null)
    }
  }

  const handleLeaveWaitlist = async (entryId: number) => {
    if (!confirm(t('actions.confirmLeaveWaitlist'))) {
      return
    }

    try {
      setLeavingWaitlistId(entryId)
      await braincore.leaveWaitlist(entryId)
      
      // Remove from local state
      setWaitlistEntries(waitlistEntries.filter(w => w.id !== entryId))
      
      alert(t('actions.leaveWaitlistSuccess'))
    } catch (err) {
      console.error('Failed to leave waitlist:', err)
      alert(t('actions.leaveWaitlistError'))
    } finally {
      setLeavingWaitlistId(null)
    }
  }

  const filterBookings = () => {
    const now = new Date()
    
    switch (activeTab) {
      case 'upcoming':
        return bookings.filter(b => 
          new Date(b.session_start) > now && 
          b.status !== 'cancelled'
        )
      case 'past':
        return bookings.filter(b => 
          new Date(b.session_start) <= now && 
          b.status !== 'cancelled'
        )
      case 'cancelled':
        return bookings.filter(b => b.status === 'cancelled')
      case 'waitlist':
        return waitlistEntries
      default:
        return []
    }
  }

  const filteredBookings = filterBookings()
  const isWaitlistTab = activeTab === 'waitlist'

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

  if (error) {
    return (
      <div className="min-h-screen pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchBookings}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {t('retry')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const activeSubscription = subscriptions.find(sub => sub.status === 'active')

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-[var(--yoga-cream)] to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">{t('title')}</h1>
          <p className="text-lg text-gray-600">{t('description')}</p>
        </div>

        {/* Membership Status Card */}
        {activeSubscription && (
          <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--yoga-cyan)] to-[var(--yoga-purple)] rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{activeSubscription.plan_name}</h2>
                  <p className="text-sm text-gray-500">{t('membership.activeStatus')}</p>
                </div>
              </div>
              {activeSubscription.current_credits !== undefined && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-[var(--yoga-cyan)]">
                    {activeSubscription.current_credits}
                  </p>
                  <p className="text-sm text-gray-500">{t('membership.creditsRemaining')}</p>
                </div>
              )}
              <button
                onClick={() => setShowMembershipModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--yoga-purple)] hover:bg-purple-50 rounded-lg transition-colors font-medium"
              >
                <CreditCard className="w-4 h-4" />
                {t('membership.manage')}
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-xl shadow-sm bg-white p-1 border border-gray-100">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'upcoming'
                  ? 'bg-gradient-to-r from-[var(--yoga-purple)] to-purple-700 text-white shadow-sm'
                  : 'text-gray-600 hover:text-[var(--yoga-purple)] hover:bg-purple-50'
              }`}
            >
              {t('upcoming')}
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'past'
                  ? 'bg-gradient-to-r from-[var(--yoga-purple)] to-purple-700 text-white shadow-sm'
                  : 'text-gray-600 hover:text-[var(--yoga-purple)] hover:bg-purple-50'
              }`}
            >
              {t('past')}
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'cancelled'
                  ? 'bg-gradient-to-r from-[var(--yoga-purple)] to-purple-700 text-white shadow-sm'
                  : 'text-gray-600 hover:text-[var(--yoga-purple)] hover:bg-purple-50'
              }`}
            >
              {t('cancelled')}
            </button>
            <button
              onClick={() => setActiveTab('waitlist')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'waitlist'
                  ? 'bg-gradient-to-r from-[var(--yoga-purple)] to-purple-700 text-white shadow-sm'
                  : 'text-gray-600 hover:text-[var(--yoga-purple)] hover:bg-purple-50'
              }`}
            >
              {t('waitlist')}
            </button>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {isWaitlistTab ? <Users className="w-8 h-8 text-gray-400" /> : <Calendar className="w-8 h-8 text-gray-400" />}
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isWaitlistTab ? t('noWaitlistEntries') : t('noBookings')}
            </p>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              {isWaitlistTab ? t('noWaitlistDescription') : t('noBookingsDescription')}
            </p>
            <Link
              href="/schema"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--yoga-purple)] to-purple-700 text-white rounded-xl hover:shadow-lg transition-all font-medium"
            >
              <Calendar className="w-5 h-5" />
              {t('bookClass')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={isWaitlistTab ? (booking as WaitlistEntry).id : (booking as Booking).booking_id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">
                      {isWaitlistTab ? (booking as WaitlistEntry).session?.service_template?.name : (booking as Booking).session_title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {isWaitlistTab 
                        ? `${t('details.waitlistPosition')}: #${(booking as WaitlistEntry).position}`
                        : `${t('details.bookingReference')}: ${(booking as Booking).confirmation_code}`
                      }
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                    isWaitlistTab ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                    (booking as Booking).status === 'confirmed' ? 'bg-green-50 text-green-700 border border-green-200' :
                    (booking as Booking).status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-200' :
                    (booking as Booking).status === 'checked_in' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    'bg-gray-50 text-gray-700 border border-gray-200'
                  }`}>
                    {isWaitlistTab ? <Info className="w-3.5 h-3.5" /> : 
                     (booking as Booking).status === 'confirmed' ? <CheckCircle className="w-3.5 h-3.5" /> :
                     (booking as Booking).status === 'cancelled' ? <XCircle className="w-3.5 h-3.5" /> :
                     (booking as Booking).status === 'checked_in' ? <CheckCircle className="w-3.5 h-3.5" /> : null
                    }
                    {isWaitlistTab ? t('status.waitlisted') : t(`status.${(booking as Booking).status}`)}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {isWaitlistTab 
                          ? ((booking as WaitlistEntry).session?.start_time ? formatDate(new Date((booking as WaitlistEntry).session!.start_time), 'EEEE d MMMM yyyy', locale) : '-')
                          : ((booking as Booking).session_start ? formatDate(new Date((booking as Booking).session_start), 'EEEE d MMMM yyyy', locale) : '-')
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        {isWaitlistTab
                          ? ((booking as WaitlistEntry).session?.start_time && (booking as WaitlistEntry).session?.end_time 
                              ? `${formatTime((booking as WaitlistEntry).session!.start_time)} - ${formatTime((booking as WaitlistEntry).session!.end_time)}`
                              : '-'
                            )
                          : ((booking as Booking).session_start && (booking as Booking).session_end 
                              ? `${formatTime((booking as Booking).session_start)} - ${formatTime((booking as Booking).session_end)}`
                              : '-'
                            )
                        }
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {(isWaitlistTab ? (booking as WaitlistEntry).session?.instructor?.name : (booking as Booking).instructor_name) && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{isWaitlistTab ? (booking as WaitlistEntry).session?.instructor?.name : (booking as Booking).instructor_name}</span>
                      </div>
                    )}
                    {(isWaitlistTab ? (booking as WaitlistEntry).session?.resource?.name : (booking as Booking).location) && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{isWaitlistTab ? (booking as WaitlistEntry).session?.resource?.name : (booking as Booking).location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {isWaitlistTab ? (
                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleLeaveWaitlist((booking as WaitlistEntry).id)}
                      disabled={leavingWaitlistId === (booking as WaitlistEntry).id}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 font-medium text-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      {leavingWaitlistId === (booking as WaitlistEntry).id ? t('actions.leaving') : t('actions.leaveWaitlist')}
                    </button>
                  </div>
                ) : (
                  activeTab === 'upcoming' && (booking as Booking).status === 'confirmed' && (
                    <div className="flex justify-end pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleCancelBooking((booking as Booking).booking_id)}
                        disabled={cancellingId === (booking as Booking).booking_id}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 font-medium text-sm"
                      >
                        <XCircle className="w-4 h-4" />
                        {cancellingId === (booking as Booking).booking_id ? t('actions.cancelling') : t('actions.cancel')}
                      </button>
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        )}

        {/* Membership Management Modal */}
        {activeSubscription && (
          <MembershipManagementModal
            isOpen={showMembershipModal}
            onClose={() => setShowMembershipModal(false)}
            subscription={{
              ...activeSubscription,
              status: activeSubscription.status as 'active' | 'paused' | 'cancelled' | 'expired'
            }}
            onRefresh={fetchBookings}
          />
        )}
      </div>
    </div>
  )
}