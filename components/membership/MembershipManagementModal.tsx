'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'
import { braincore } from '@/lib/api/braincore'
import type { CreditHistoryEntry } from '@/lib/types/braincore'
import RecoveryCreditsCard from './RecoveryCreditsCard'
import { 
  AlertCircle, 
  CheckCircle,
  PauseCircle,
  PlayCircle,
  XCircle,
  Info
} from 'lucide-react'
import { format } from 'date-fns'
import { sv, enUS } from 'date-fns/locale'


interface Subscription {
  subscription_id: number
  plan_name: string
  plan_type: string
  price: number
  status: string
  start_date?: string
  end_date?: string
  next_billing_date?: string
  current_credits?: number
  credits_used_this_period?: number
  benefits?: string[]
  pause_policy?: {
    can_pause?: boolean
    allowed?: boolean
    reason?: string
    min_duration_days?: number
    max_duration_days?: number
    max_pauses_per_year?: number
    notice_days?: number
  }
  cancellation_policy?: {
    can_cancel?: boolean
    allowed?: boolean
    notice_period_days?: number
    notice_days?: number
    refund_policy?: string
    refund_type?: string
    cancellation_fee?: number
  }
}

interface MembershipManagementModalProps {
  isOpen: boolean
  onClose: () => void
  subscription: Subscription
  onRefresh: () => void
}

export default function MembershipManagementModal({ 
  isOpen, 
  onClose, 
  subscription,
  onRefresh 
}: MembershipManagementModalProps) {
  const t = useTranslations('membership.management')
  const locale = useLocale()
  const dateLocale = locale === 'sv' ? sv : enUS
  
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [creditHistory, setCreditHistory] = useState<CreditHistoryEntry[]>([])
  const [loadingCredits, setLoadingCredits] = useState(false)

  useEffect(() => {
    const loadCredits = async () => {
      try {
        setLoadingCredits(true)
        const history = await braincore.getCreditHistory()
        setCreditHistory(history)
      } catch (error) {
        console.error('Failed to fetch credit history:', error)
      } finally {
        setLoadingCredits(false)
      }
    }

    if (isOpen && activeTab === 'credits') {
      loadCredits()
    }
  }, [isOpen, activeTab])

  const handlePauseSubscription = async () => {
    if (!confirm(t('confirmPause'))) return
    
    try {
      setLoading(true)
      await braincore.pauseSubscription(subscription.subscription_id)
      toast({
        title: t('success'),
        description: t('pauseSuccess')
      })
      onRefresh()
      onClose()
    } catch (error) {
      console.error('Failed to pause subscription:', error)
      let errorMessage = t('pauseError')
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string } } }
        errorMessage = axiosError.response?.data?.detail || errorMessage
      }
      toast({
        title: t('error'),
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResumeSubscription = async () => {
    if (!confirm(t('confirmResume'))) return
    
    try {
      setLoading(true)
      await braincore.resumeSubscription(subscription.subscription_id)
      toast({
        title: t('success'),
        description: t('resumeSuccess')
      })
      onRefresh()
      onClose()
    } catch (error) {
      console.error('Failed to resume subscription:', error)
      toast({
        title: t('error'),
        description: t('resumeError'),
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm(t('confirmCancel'))) return
    
    try {
      setLoading(true)
      await braincore.cancelSubscription(subscription.subscription_id)
      toast({
        title: t('success'),
        description: t('cancelSuccess')
      })
      onRefresh()
      onClose()
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
      toast({
        title: t('error'),
        description: t('cancelError'),
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: typeof CheckCircle }> = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      paused: { color: 'bg-yellow-100 text-yellow-800', icon: PauseCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
      expired: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
    }
    
    const config = statusConfig[status] || statusConfig.expired
    const Icon = config.icon
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {t(`status.${status}`)}
      </Badge>
    )
  }

  const isTermBased = subscription?.plan_type === 'term_based'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t('title')}
          </DialogTitle>
        </DialogHeader>

        {subscription && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
              <TabsTrigger value="credits">{t('tabs.credits')}</TabsTrigger>
              <TabsTrigger value="actions">{t('tabs.actions')}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4 min-h-[400px]">
              {/* Subscription Overview */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">{subscription.plan_name}</h3>
                  {getStatusBadge(subscription.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">{t('fields.type')}</p>
                    <p className="font-medium">{t(`planType.${subscription.plan_type}`)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">{t('fields.price')}</p>
                    <p className="font-medium">
                      {new Intl.NumberFormat('sv-SE', {
                        style: 'currency',
                        currency: 'SEK',
                        minimumFractionDigits: 0
                      }).format(subscription.price)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">{t('fields.startDate')}</p>
                    <p className="font-medium">
                      {subscription.start_date 
                        ? format(new Date(subscription.start_date), 'PPP', { locale: dateLocale })
                        : '-'
                      }
                    </p>
                  </div>

                  {subscription.end_date && (
                    <div>
                      <p className="text-sm text-gray-600">{t('fields.endDate')}</p>
                      <p className="font-medium">
                        {format(new Date(subscription.end_date), 'PPP', { locale: dateLocale })}
                      </p>
                    </div>
                  )}

                  {subscription.next_billing_date && subscription.status === 'active' && (
                    <div>
                      <p className="text-sm text-gray-600">{t('fields.nextBilling')}</p>
                      <p className="font-medium">
                        {format(new Date(subscription.next_billing_date), 'PPP', { locale: dateLocale })}
                      </p>
                    </div>
                  )}

                  {subscription.current_credits !== undefined && (
                    <div>
                      <p className="text-sm text-gray-600">{t('fields.creditsRemaining')}</p>
                      <p className="font-medium text-lg text-[var(--yoga-sage)]">
                        {subscription.current_credits}
                      </p>
                    </div>
                  )}

                  {subscription.credits_used_this_period !== undefined && (
                    <div>
                      <p className="text-sm text-gray-600">{t('fields.creditsUsed')}</p>
                      <p className="font-medium">
                        {subscription.credits_used_this_period}
                      </p>
                    </div>
                  )}
                </div>

                {/* Benefits */}
                {subscription.benefits && subscription.benefits.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-600 mb-2">{t('fields.benefits')}</p>
                    <ul className="space-y-1">
                      {subscription.benefits.map((benefit: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Recovery Credits for Term Memberships */}
              {isTermBased && (
                <RecoveryCreditsCard 
                  subscriptionId={subscription.subscription_id}
                  isTermBased={true}
                  planType={subscription.plan_type}
                />
              )}
            </TabsContent>

            <TabsContent value="credits" className="mt-4 min-h-[400px]">
              {/* Show current credit balance for punch cards and credit-based memberships */}
              {(subscription.plan_type === 'punch_card' || subscription.plan_type === 'credits') && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-blue-900">{t('fields.creditsRemaining')}</p>
                      <p className="text-3xl font-bold text-blue-600">{subscription.current_credits || 0}</p>
                    </div>
                    {subscription.credits_used_this_period !== undefined && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-blue-900">{t('fields.creditsUsed')}</p>
                        <p className="text-2xl font-semibold text-blue-600">{subscription.credits_used_this_period}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {loadingCredits ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : creditHistory.length === 0 && 
                 (!subscription.current_credits || subscription.current_credits === 0) ? (
                <div className="text-center py-8">
                  <Info className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">{t('noCreditHistory')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {creditHistory.map((transaction) => (
                    <div key={transaction.transaction_id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(transaction.created_at), 'PPp', { locale: dateLocale })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.transaction_type === 'credit' 
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {transaction.transaction_type === 'credit' ? '+' : '-'}
                            {Math.abs(transaction.amount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {t('balance')}: {transaction.balance_after}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="actions" className="mt-4 space-y-4 min-h-[400px]">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-800 font-medium">{t('actions.warning')}</p>
                  <p className="text-xs text-yellow-700 mt-1">{t('actions.warningDescription')}</p>
                </div>
              </div>

              {subscription.status === 'active' && (
                <>
                  {/* Pause Subscription */}
                  {subscription.pause_policy && (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium flex items-center gap-2">
                            <PauseCircle className="w-5 h-5 text-yellow-600" />
                            {t('actions.pause')}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {subscription.pause_policy.allowed 
                              ? t('actions.pauseDescription')
                              : subscription.pause_policy.reason || t('actions.notAvailable')
                            }
                          </p>
                          {subscription.pause_policy.allowed && subscription.pause_policy.notice_days && subscription.pause_policy.notice_days > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {t('actions.noticeRequired', { days: subscription.pause_policy.notice_days })}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePauseSubscription}
                          disabled={loading || !subscription.pause_policy.allowed}
                          className="ml-4"
                        >
                          {t('actions.pauseButton')}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Cancel Subscription */}
                  {subscription.cancellation_policy && (
                    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium flex items-center gap-2 text-red-800">
                            <XCircle className="w-5 h-5 text-red-600" />
                            {t('actions.cancel')}
                          </h4>
                          <p className="text-sm text-red-700 mt-1">
                            {subscription.cancellation_policy.allowed 
                              ? t('actions.cancelDescription')
                              : t('actions.notAvailable')
                            }
                          </p>
                          {subscription.cancellation_policy.allowed && (
                            <>
                              {subscription.cancellation_policy.notice_days && subscription.cancellation_policy.notice_days > 0 && (
                                <p className="text-xs text-red-600 mt-1">
                                  {t('actions.noticeRequired', { days: subscription.cancellation_policy.notice_days })}
                                </p>
                              )}
                              {subscription.cancellation_policy.refund_type && subscription.cancellation_policy.refund_type !== 'none' && (
                                <p className="text-xs text-green-700 mt-1">
                                  {t('actions.refundAvailable', { type: subscription.cancellation_policy.refund_type })}
                                </p>
                              )}
                              {subscription.cancellation_policy.cancellation_fee && subscription.cancellation_policy.cancellation_fee > 0 && (
                                <p className="text-xs text-red-600 mt-1">
                                  {t('actions.cancellationFee', { 
                                    fee: new Intl.NumberFormat('sv-SE', {
                                      style: 'currency',
                                      currency: 'SEK',
                                      minimumFractionDigits: 0
                                    }).format(subscription.cancellation_policy.cancellation_fee)
                                  })}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleCancelSubscription}
                          disabled={loading || !subscription.cancellation_policy.allowed}
                          className="ml-4"
                        >
                          {t('actions.cancelButton')}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {subscription.status === 'paused' && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium flex items-center gap-2">
                        <PlayCircle className="w-5 h-5 text-green-600" />
                        {t('actions.resume')}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {t('actions.resumeDescription')}
                      </p>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleResumeSubscription}
                      disabled={loading}
                      className="ml-4 bg-[var(--yoga-sage)] hover:bg-[var(--yoga-sage)]/90"
                    >
                      {t('actions.resumeButton')}
                    </Button>
                  </div>
                </div>
              )}

              {subscription.status === 'cancelled' && (
                <div className="text-center py-4">
                  <p className="text-gray-600">{t('actions.alreadyCancelled')}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}