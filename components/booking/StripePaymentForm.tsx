'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { loadStripe, Stripe } from '@stripe/stripe-js'
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { CreditCard, Lock } from 'lucide-react'

interface StripePaymentFormProps {
  amount: number
  currency?: string
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
  publishableKey: string
  clientSecret: string
}

// Separate component for the payment form content
function PaymentForm({ 
  amount, 
  currency = 'sek',
  onSuccess,
  onError 
}: Omit<StripePaymentFormProps, 'sessionId' | 'companyId' | 'publishableKey' | 'clientSecret'>) {
  const t = useTranslations('schema.booking')
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-success`,
        },
        redirect: 'if_required',
      })

      if (error) {
        setErrorMessage(error.message || t('paymentError'))
        onError(error.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id)
      }
    } catch (err) {
      console.error('Payment error:', err)
      const message = t('paymentError')
      setErrorMessage(message)
      onError(message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{t('totalAmount')}</span>
          <span className="text-lg font-semibold">
            {amount} {currency.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <PaymentElement 
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                address: {
                  country: 'SE',
                }
              }
            }
          }}
        />
      </div>

      {errorMessage && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}

      <div className="space-y-4">
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              {t('processingPayment')}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              {t('payNow')} {amount} {currency.toUpperCase()}
            </span>
          )}
        </Button>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Lock className="w-3 h-3" />
          <span>{t('securePayment')}</span>
        </div>
      </div>
    </form>
  )
}

export default function StripePaymentForm({
  amount,
  currency = 'sek',
  onSuccess,
  onError,
  publishableKey,
  clientSecret,
}: StripePaymentFormProps) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null)

  useEffect(() => {
    if (publishableKey) {
      setStripePromise(loadStripe(publishableKey))
    }
  }, [publishableKey])

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#000000',
      },
    },
  }

  if (!stripePromise || !clientSecret) {
    return <div className="animate-pulse h-40 bg-gray-100 rounded-lg" />
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm
        amount={amount}
        currency={currency}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  )
}