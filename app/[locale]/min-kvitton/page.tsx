'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { braincore } from '@/lib/api/braincore'
import { useAuth } from '@/lib/contexts/AuthContext'
import AuthGuard from '@/components/auth/AuthGuard'
import type { BookingReceipt, SubscriptionReceipt } from '@/lib/types/braincore'
import { 
  Receipt, 
  Download,
  FileText,
  Calendar,
  CreditCard,
  AlertCircle,
  Loader2
} from 'lucide-react'

type CombinedReceipt = {
  id: string
  type: 'booking' | 'subscription'
  date: string
  amount: number
  currency: string
  description: string
  documentNumber: string | null
  pdfAvailable: boolean
  status: string
}

export default function MyReceiptsPage() {
  const t = useTranslations('receipts')
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [receipts, setReceipts] = useState<CombinedReceipt[]>([])
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'booking' | 'subscription'>('all')

  const fetchReceipts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch both booking and subscription receipts in parallel
      const [bookingReceipts, subscriptionReceipts] = await Promise.all([
        braincore.getMemberBookingReceipts().catch(() => [] as BookingReceipt[]),
        braincore.getMemberSubscriptionReceipts().catch(() => [] as SubscriptionReceipt[])
      ])

      // Combine and format receipts
      const combined: CombinedReceipt[] = []

      // Add booking receipts
      bookingReceipts.forEach(receipt => {
        if (receipt.receipt?.pdf_available) {
          combined.push({
            id: `booking-${receipt.booking_id}`,
            type: 'booking',
            date: receipt.payment_date || receipt.booking_date,
            amount: receipt.amount,
            currency: receipt.currency,
            description: t('bookingReceipt', { code: receipt.confirmation_code }),
            documentNumber: receipt.receipt.document_number,
            pdfAvailable: true,
            status: receipt.payment_status
          })
        }
      })

      // Add subscription receipts
      subscriptionReceipts.forEach(receipt => {
        if (receipt.receipt?.pdf_available) {
          combined.push({
            id: `subscription-${receipt.subscription_id}-${receipt.payment_date}`,
            type: 'subscription',
            date: receipt.payment_date || receipt.start_date,
            amount: receipt.amount,
            currency: receipt.currency,
            description: t('subscriptionReceipt', { period: receipt.billing_period }),
            documentNumber: receipt.receipt.document_number,
            pdfAvailable: true,
            status: 'paid'
          })
        }
      })

      // Sort by date (newest first)
      combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      setReceipts(combined)
    } catch (err) {
      console.error('Failed to fetch receipts:', err)
      setError(t('fetchError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (isAuthenticated) {
      fetchReceipts()
    }
  }, [fetchReceipts, isAuthenticated])

  const handleDownloadReceipt = async (documentNumber: string, receiptId: string) => {
    if (!documentNumber) return
    
    try {
      setDownloadingId(receiptId)
      const blob = await braincore.downloadReceiptPDF(documentNumber)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `kvitto_${documentNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download receipt:', err)
      alert(t('downloadError'))
    } finally {
      setDownloadingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const filteredReceipts = receipts.filter(receipt => {
    if (filter === 'all') return true
    return receipt.type === filter
  })

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-[var(--yoga-cream)] to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--yoga-purple)]" />
            <p className="text-gray-500 mt-4">{t('loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-[var(--yoga-cream)] to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">{t('title')}</h1>
          <p className="text-lg text-gray-600">{t('subtitle')}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-[var(--yoga-purple)] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t('filter.all')} ({receipts.length})
            </button>
            <button
              onClick={() => setFilter('booking')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                filter === 'booking'
                  ? 'bg-[var(--yoga-purple)] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t('filter.bookings')} ({receipts.filter(r => r.type === 'booking').length})
            </button>
            <button
              onClick={() => setFilter('subscription')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                filter === 'subscription'
                  ? 'bg-[var(--yoga-purple)] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t('filter.subscriptions')} ({receipts.filter(r => r.type === 'subscription').length})
            </button>
          </div>
        </div>

        {/* Receipts List */}
        {filteredReceipts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t('noReceipts')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReceipts.map((receipt) => (
              <div
                key={receipt.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      receipt.type === 'booking' 
                        ? 'bg-[var(--yoga-cyan)]/10' 
                        : 'bg-[var(--yoga-purple)]/10'
                    }`}>
                      {receipt.type === 'booking' ? (
                        <Calendar className={`w-6 h-6 text-[var(--yoga-cyan)]`} />
                      ) : (
                        <CreditCard className={`w-6 h-6 text-[var(--yoga-purple)]`} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{receipt.description}</h3>
                      <p className="text-sm text-gray-500 mt-1">{formatDate(receipt.date)}</p>
                      {receipt.documentNumber && (
                        <p className="text-xs text-gray-400 mt-1">
                          {t('documentNumber')}: {receipt.documentNumber}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-lg text-gray-900">
                        {formatAmount(receipt.amount, receipt.currency)}
                      </p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {t('paid')}
                      </span>
                    </div>
                    
                    {receipt.pdfAvailable && receipt.documentNumber && (
                      <button
                        onClick={() => handleDownloadReceipt(receipt.documentNumber!, receipt.id)}
                        disabled={downloadingId === receipt.id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        {downloadingId === receipt.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t('downloading')}
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            {t('download')}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">{t('info.title')}</h3>
              <p className="text-sm text-blue-700">{t('info.description')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AuthGuard>
  )
}